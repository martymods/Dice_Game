// itemEffects.js
// Centralised item effect manager used by the single-player game logic.

import { itemsList } from './items.js';

/**
 * Creates a manager that keeps track of purchased item effects and exposes
 * helper utilities for the game loop.
 *
 * @param {Object} context
 * @param {(amount: number, options?: { track?: boolean, source?: string }) => void} context.adjustBalance
 *        Function used to mutate the player's balance.
 * @param {(item: object, options?: { silent?: boolean }) => void} context.awardBonusItem
 *        Function used to add a bonus item to the inventory without deducting cost.
 * @param {(message: string, type?: string) => void} context.showMessage
 *        Function for displaying in-game toast/overlay messages.
 */
export function createItemEffectsManager(context) {
    const state = {
        passiveIncomePerRoll: 0,
        winMultiplierBonus: 0,
        multiplierBonus: 1,
        flatMultiplierBonus: 0,
        loadedDice: false,
        summaries: [],
        rollCallbacks: [],
        winCallbacks: [],
        rentCallbacks: [],
    };

    /**
     * Applies an item's effect to the manager state.
     * @param {object} item - The purchased item definition.
     * @returns {string} - A short summary describing the applied effect.
     */
    function applyItemEffect(item) {
        const definition = itemEffectDefinitions[item.name] || defaultEffect;
        const result = definition({ item, state, context });

        let summary = '';
        if (typeof result === 'string') {
            summary = result;
        } else if (result && typeof result === 'object') {
            if (typeof result.summary === 'string') {
                summary = result.summary;
            }

            if (typeof result.multiplier === 'number') {
                state.multiplierBonus *= result.multiplier;
            }

            if (typeof result.multiplierBonus === 'number') {
                state.multiplierBonus *= result.multiplierBonus;
            }

            if (typeof result.flatMultiplierBonus === 'number') {
                state.flatMultiplierBonus += result.flatMultiplierBonus;
            }

            if (typeof result.winMultiplierBonus === 'number') {
                state.winMultiplierBonus += result.winMultiplierBonus;
            }
        }

        if (summary) {
            state.summaries.push({ name: item.name, summary });
        }
        return summary;
    }

    /**
     * Executes roll based bonuses and returns the combined reward.
     * @param {object} rollContext - { dice1, dice2, sum }
     * @returns {number}
     */
    function applyRollBonuses(rollContext) {
        return state.rollCallbacks.reduce((total, callback) => {
            const value = Number(callback(rollContext)) || 0;
            return total + value;
        }, 0);
    }

    /**
     * Calculates additional winnings after a successful roll.
     * @param {object} winContext - { baseWinnings, sum, dice1, dice2 }
     * @returns {number}
     */
    function applyWinBonuses(winContext) {
        let extra = 0;
        if (state.winMultiplierBonus !== 0) {
            extra += winContext.baseWinnings * state.winMultiplierBonus;
        }
        extra += state.winCallbacks.reduce((total, callback) => {
            const value = Number(callback(winContext)) || 0;
            return total + value;
        }, 0);
        return extra;
    }

    /**
     * Executes callbacks when rent is paid.
     */
    function handleRentPaid(contextData) {
        state.rentCallbacks.forEach(callback => {
            try {
                callback(contextData);
            } catch (err) {
                console.error('Rent callback error:', err);
            }
        });
    }

    function shouldForceReroll(sum) {
        return state.loadedDice && sum < 7;
    }

    function getPassiveIncome() {
        return state.passiveIncomePerRoll;
    }

    function getSummaries() {
        return state.summaries.slice();
    }

    function getEffectiveMultiplier(baseMultiplier = 1) {
        let effective = Number.isFinite(baseMultiplier) ? baseMultiplier : 1;

        if (typeof state.multiplierBonus === 'number' && Number.isFinite(state.multiplierBonus)) {
            effective *= state.multiplierBonus;
        }

        if (typeof state.winMultiplierBonus === 'number' && Number.isFinite(state.winMultiplierBonus)) {
            effective *= 1 + state.winMultiplierBonus;
        }

        if (typeof state.flatMultiplierBonus === 'number' && Number.isFinite(state.flatMultiplierBonus)) {
            effective += state.flatMultiplierBonus;
        }

        return Number.isFinite(effective) ? effective : baseMultiplier;
    }

    return {
        applyItemEffect,
        applyRollBonuses,
        applyWinBonuses,
        handleRentPaid,
        shouldForceReroll,
        getPassiveIncome,
        getSummaries,
        getEffectiveMultiplier,
        state,
    };
}

// ---------------------------------------------------------------------------
// Item effect implementations
// ---------------------------------------------------------------------------

const itemEffectDefinitions = {
    'Loaded Dice': ({ state }) => {
        state.loadedDice = true;
        return 'Grants a reroll when you land below 7.';
    },

    'Forged Papers': ({ context }) => {
        const grantedItems = [];
        for (let i = 0; i < 3; i++) {
            const randomItem = getRandomItem();
            if (randomItem) {
                grantedItems.push(randomItem.name);
                context.awardBonusItem(randomItem, { silent: true });
            }
        }
        if (grantedItems.length) {
            context.showMessage(`Forged Papers recruited: ${grantedItems.join(', ')}.`, 'bonus');
        }
        return 'Immediately recruits three random allies to your stash.';
    },

    "Old Gang Leaders Blade": ({ state, context }) => {
        state.passiveIncomePerRoll += 9;
        context.showMessage('The blade hums with power. +$9 every roll!', 'bonus');
        return 'Adds $9 passive income on every roll.';
    },

    "Neighborhood OGs Manual": ({ state }) => {
        state.winMultiplierBonus += 0.05;
        return 'Win payouts boosted by 5%.';
    },

    'Lucky Black Cat': ({ state }) => {
        state.rollCallbacks.push(({ sum }) => (sum === 9 ? 9 : 0));
        return 'Awards $9 whenever you roll a total of nine.';
    },

    'Rusty Revolver': ({ context }) => {
        context.adjustBalance(150, { source: 'Rusty Revolver' });
        return 'Gives a $150 payout on purchase.';
    },

    'Gamblers Token': ({ state }) => {
        state.passiveIncomePerRoll += 2;
        state.rollCallbacks.push(() => (Math.random() < 0.1 ? -2 : 0));
        return 'Adds $2 each roll but risks losing $2 occasionally.';
    },

    'Brown Pay Bump': ({ state }) => {
        state.passiveIncomePerRoll += 4;
        return 'The crew kicks back an extra $4 per roll.';
    },

    'Gold-Plated Dice': ({ state }) => {
        state.rollCallbacks.push(({ sum }) => (sum > 6 ? 3 : 0));
        return 'Adds $3 whenever you roll above six.';
    },

    'Lucky Horseshoe': ({ state }) => {
        state.winCallbacks.push(() => 3);
        return 'Adds a flat $3 bonus to winning rolls.';
    },
};

function defaultEffect({ item, state }) {
    const passiveBonus = Math.max(1, Math.round(item.cost * 0.02));
    state.passiveIncomePerRoll += passiveBonus;
    return `Generates $${passiveBonus} passive income every roll.`;
}

function cloneData(item) {
    if (typeof structuredClone === 'function') {
        return structuredClone(item);
    }
    return JSON.parse(JSON.stringify(item));
}

function getRandomItem() {
    if (!itemsList || !itemsList.length) return null;
    return cloneData(itemsList[Math.floor(Math.random() * itemsList.length)]);
}

