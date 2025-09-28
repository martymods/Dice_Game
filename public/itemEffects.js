// itemEffects.js
// Revised effect runtime built around stackable traits and additive modifiers.

import { itemsList } from './items.js';
import { TRAIT_DEFINITIONS, ITEM_TRAIT_MAPPING, SPECIAL_ITEM_HANDLERS, DEBT_BOND_TRAIT } from './modules/itemTraits.js';

const globalObject = typeof window !== 'undefined' ? window : globalThis;

function createEventBus() {
    const listeners = new Map();
    return {
        on(event, handler) {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event).add(handler);
            return () => listeners.get(event)?.delete(handler);
        },
        emit(event, payload) {
            const handlers = listeners.get(event);
            if (!handlers) {
                return;
            }
            [...handlers].forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`[bus:${event}]`, error);
                }
            });
        },
    };
}

function createEffectsEngine(api) {
    const TRAITS = new Map();
    const ITEM_TRAITS = new Map();
    const registers = new Map();
    const traitStacks = new Map();
    const itemStacks = new Map();

    const frame = { multiplier: 0, cash: 0 };

    function resetFrame() {
        frame.multiplier = 0;
        frame.cash = 0;
    }

    function addMult(value) {
        if (Number.isFinite(value) && value !== 0) {
            frame.multiplier += value;
        }
    }

    function addCash(value) {
        if (Number.isFinite(value) && value !== 0) {
            frame.cash += value;
        }
    }

    function collectFrameModifiers() {
        const modifiers = { totalMultiplierAdd: frame.multiplier, flatCashAdd: frame.cash };
        resetFrame();
        return modifiers;
    }

    function registerTrait(name, binder) {
        if (!TRAITS.has(name)) {
            TRAITS.set(name, binder);
        }
    }

    function ensureTraitRegistered(name) {
        if (registers.has(name)) {
            return;
        }
        const binder = TRAITS.get(name);
        if (!binder) {
            return;
        }
        const unsubs = [];
        const on = (event, handler) => {
            const off = api.bus.on(event, handler);
            unsubs.push(off);
            return off;
        };
        const context = {
            onRoll: handler => on('roll', handler),
            onPreResolve: handler => on('bet:preResolve', handler),
            onResolved: handler => on('bet:resolved', handler),
            addMult,
            addCash,
            getStack: itemName => itemStacks.get(itemName) || 0,
            traitCount: traitName => traitStacks.get(traitName) || 0,
            adjustBalance: (delta, options) => api.adjustBalance(delta, options),
            getBalance: api.getBalance,
            inventoryAPI: api.inventoryAPI,
            bus: api.bus,
            random: api.random,
            grantRerolls: api.grantRerolls,
            getRollIndex: api.getRollIndex,
            getPrediction: api.getPrediction,
            getPurchaseCounter: api.getPurchaseCounter,
            resetPurchaseCounter: api.resetPurchaseCounter,
        };
        const result = binder(context);
        if (Array.isArray(result)) {
            result.filter(Boolean).forEach(off => unsubs.push(off));
        } else if (typeof result === 'function') {
            unsubs.push(result);
        }
        registers.set(name, unsubs);
    }

    function defineItem(name, traits) {
        if (!ITEM_TRAITS.has(name)) {
            ITEM_TRAITS.set(name, []);
        }
        const list = ITEM_TRAITS.get(name);
        traits.forEach(trait => {
            if (!list.includes(trait)) {
                list.push(trait);
            }
        });
    }

    function removeTraitListenersIfNeeded(trait) {
        const count = traitStacks.get(trait) || 0;
        if (count > 0) {
            return;
        }
        const unsubs = registers.get(trait);
        if (unsubs) {
            unsubs.forEach(off => {
                try {
                    off?.();
                } catch (error) {
                    console.error(`Error cleaning trait ${trait}`, error);
                }
            });
            registers.delete(trait);
        }
    }

    function applyItem(name) {
        itemStacks.set(name, (itemStacks.get(name) || 0) + 1);
        const traits = ITEM_TRAITS.get(name) || [];
        traits.forEach(trait => {
            traitStacks.set(trait, (traitStacks.get(trait) || 0) + 1);
            ensureTraitRegistered(trait);
        });
    }

    function removeItem(name) {
        const current = itemStacks.get(name) || 0;
        if (current <= 0) {
            return;
        }
        if (current === 1) {
            itemStacks.delete(name);
        } else {
            itemStacks.set(name, current - 1);
        }
        const traits = ITEM_TRAITS.get(name) || [];
        traits.forEach(trait => {
            const existing = traitStacks.get(trait) || 0;
            const next = Math.max(0, existing - 1);
            if (next === 0) {
                traitStacks.delete(trait);
            } else {
                traitStacks.set(trait, next);
            }
            removeTraitListenersIfNeeded(trait);
        });
    }

    return {
        registerTrait,
        defineItem,
        applyItem,
        removeItem,
        collectFrameModifiers,
        getTraitsForItem: name => (ITEM_TRAITS.get(name) || []).slice(),
        traitStacks,
        itemStacks,
        bus: api.bus,
    };
}

function initializeTraits(engine, api) {
    const { registerTrait } = engine;
    const isPrime = new Set([2, 3, 5, 7, 11]);

    registerTrait('SevenHeaven', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum === 7) {
            addMult(0.50 * traitCount('SevenHeaven'));
        }
    }));

    registerTrait('ElevenEdge', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum === 11) {
            addCash(50 * traitCount('ElevenEdge'));
        }
    }));

    registerTrait('SnakeEyesTax', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum === 2) {
            addCash(-20 * traitCount('SnakeEyesTax'));
        }
    }));

    registerTrait('CrapOutCurse', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum === 3 || ctx?.sum === 12) {
            addMult(-0.25 * traitCount('CrapOutCurse'));
        }
    }));

    registerTrait('WinBooster', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.outcome === 'win') {
            addMult(0.10 * traitCount('WinBooster'));
        }
    }));

    registerTrait('LossSiphon', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.outcome === 'loss') {
            addCash(15 * traitCount('LossSiphon'));
        }
    }));

    registerTrait('AnimalPack', ({ onPreResolve, addCash, traitCount }) => onPreResolve(() => {
        addCash(5 * traitCount('AnimalPack'));
    }));

    registerTrait('BlingChain', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        const stacks = traitCount('BlingChain');
        addCash(1 * stacks);
        if (ctx && ctx.dice1 === ctx.dice2) {
            addCash(5 * stacks);
        }
    }));

    registerTrait('CriminalRing', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum > 6) {
            addMult(0.05 * traitCount('CriminalRing'));
        }
    }));

    registerTrait('PrimeSight', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx && isPrime.has(ctx.sum)) {
            addMult(0.15 * traitCount('PrimeSight'));
        }
    }));

    registerTrait('EvenFlow', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum % 2 === 0) {
            addCash(10 * traitCount('EvenFlow'));
        }
    }));

    registerTrait('OddJob', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum % 2 === 1) {
            addCash(10 * traitCount('OddJob'));
        }
    }));

    registerTrait('HighRoller', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum >= 10) {
            addMult(0.20 * traitCount('HighRoller'));
        }
    }));

    registerTrait('LowBall', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum <= 4) {
            addMult(0.20 * traitCount('LowBall'));
        }
    }));

    registerTrait('DoubleVision', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx && ctx.dice1 === ctx.dice2) {
            addCash(25 * traitCount('DoubleVision'));
        }
    }));

    registerTrait('RerollToken', ({ onResolved, traitCount, grantRerolls }) => onResolved(() => {
        const count = traitCount('RerollToken');
        if (count > 0) {
            grantRerolls(count);
        }
    }));

    registerTrait('DestroyCash', ({ bus, adjustBalance, traitCount }) => bus.on('item:destroyed', () => {
        const count = traitCount('DestroyCash');
        if (count > 0) {
            adjustBalance(20 * count, { track: true });
        }
    }));

    registerTrait('StealOnResolve', ({ onResolved, adjustBalance, traitCount }) => onResolved(() => {
        const count = traitCount('StealOnResolve');
        if (count > 0) {
            adjustBalance(15 * count, { track: true });
        }
    }));

    registerTrait('RiskyInterest', ({ onResolved, onPreResolve, adjustBalance, getBalance, traitCount }) => {
        const offResolve = onResolved(() => {
            const count = traitCount('RiskyInterest');
            if (count <= 0) {
                return;
            }
            const balance = getBalance();
            const hundreds = Math.floor(balance / 100);
            if (hundreds > 0) {
                adjustBalance(2 * count * hundreds, { track: true });
            }
        });
        const offPre = onPreResolve(ctx => {
            if (ctx?.outcome === 'loss') {
                const count = traitCount('RiskyInterest');
                if (count > 0) {
                    adjustBalance(-10 * count, { track: true });
                }
            }
        });
        return [offResolve, offPre];
    });

    registerTrait('ItemDevourer', ({ onPreResolve, addMult, traitCount }) => onPreResolve(() => {
        const count = traitCount('ItemDevourer');
        if (count > 0) {
            addMult(0.10 * count);
        }
    }));

    registerTrait('GlassJackpot', ({ onPreResolve, addMult, traitCount, bus, random }) => {
        onPreResolve(ctx => {
            if (ctx?.outcome === 'win') {
                addMult(0.75 * traitCount('GlassJackpot'));
            }
        });
        return bus.on('bet:resolved', () => {
            const count = traitCount('GlassJackpot');
            if (count <= 0) {
                return;
            }
            const chance = Math.min(0.1 * count, 0.8);
            if (random() < chance) {
                bus.emit('trait:glassJackpot:break', { trait: 'GlassJackpot' });
            }
        });
    });

    registerTrait('CommonCountBoost', ({ onPreResolve, addCash, traitCount, inventoryAPI }) => onPreResolve(() => {
        const commons = inventoryAPI.countWhere(item => (item.rarity || '').toLowerCase() === 'common');
        const count = traitCount('CommonCountBoost');
        if (commons > 0 && count > 0) {
            addCash(commons * count);
        }
    }));

    registerTrait('SequenceBonus', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx && Math.abs((ctx.dice1 || 0) - (ctx.dice2 || 0)) === 1) {
            addMult(0.30 * traitCount('SequenceBonus'));
        }
    }));

    registerTrait('LastTurnBoom', ({ onPreResolve, addMult, traitCount, getRollIndex }) => onPreResolve(() => {
        const index = getRollIndex();
        if (index % 10 === 9) {
            addMult(1.0 * traitCount('LastTurnBoom'));
        }
    }));

    registerTrait('StreakWin', ({ onPreResolve, addMult, traitCount, onResolved }) => {
        let streak = 0;
        onResolved(result => {
            streak = result?.outcome === 'win' ? streak + 1 : 0;
        });
        return onPreResolve(() => {
            if (streak >= 3) {
                addMult(0.50 * traitCount('StreakWin'));
            }
        });
    });

    registerTrait('StreakLoseRelief', ({ onPreResolve, addCash, traitCount, onResolved }) => {
        const history = [];
        onResolved(result => {
            history.push(result?.outcome);
            if (history.length > 2) {
                history.shift();
            }
        });
        return onPreResolve(() => {
            if (history.length === 2 && history[0] === 'loss' && history[1] === 'loss') {
                addCash(50 * traitCount('StreakLoseRelief'));
            }
        });
    });

    registerTrait('HighCostHighGain', ({ onPreResolve, addMult, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum >= 9) {
            addMult(0.25 * traitCount('HighCostHighGain'));
        }
    }));

    registerTrait('OpponentHurt', ({ bus, adjustBalance, traitCount }) => bus.on('opponent:lose', () => {
        const count = traitCount('OpponentHurt');
        if (count > 0) {
            adjustBalance(25 * count, { track: true });
        }
    }));

    registerTrait('PredictMatch', ({ onPreResolve, addCash, traitCount, getPrediction }) => onPreResolve(ctx => {
        const predicted = getPrediction();
        if (predicted && ctx?.sum === predicted) {
            addCash(50 * traitCount('PredictMatch'));
        }
    }));

    registerTrait('JackpotNine', ({ onPreResolve, addCash, traitCount }) => onPreResolve(ctx => {
        if (ctx?.sum === 9) {
            addCash(9000 * traitCount('JackpotNine'));
        }
    }));

    registerTrait('ShopAddict', ({ onPreResolve, addMult, traitCount, getPurchaseCounter, resetPurchaseCounter }) => onPreResolve(() => {
        if (getPurchaseCounter() >= 3) {
            addMult(0.10 * traitCount('ShopAddict'));
            resetPurchaseCounter();
        }
    }));

    registerTrait('SacrificeEngine', ({ onResolved, inventoryAPI, traitCount, adjustBalance, random }) => onResolved(() => {
        if (random() < 0.20) {
            const removed = inventoryAPI.removeWhere(item => (item.rarity || '').toLowerCase() === 'common', 1, 'SacrificeEngine');
            if (removed > 0) {
                adjustBalance(100 * traitCount('SacrificeEngine'), { track: true });
            }
        }
    }));

    registerTrait('DebtBond', ({ onPreResolve, addCash, traitCount }) => {
        let remaining = 5;
        return onPreResolve(() => {
            if (remaining > 0) {
                addCash(-20 * traitCount('DebtBond'));
                remaining -= 1;
            }
        });
    });
}

function getItemByName(name) {
    return itemsList.find(entry => entry.name === name) || null;
}

function cloneItem(item) {
    if (!item) return null;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(item);
        } catch (error) {
            console.warn('structuredClone failed, falling back to JSON clone', error);
        }
    }
    return JSON.parse(JSON.stringify(item));
}

export function createItemEffectsManager(context = {}) {
    const bus = createEventBus();
    const state = {
        summaries: [],
        rollIndex: 0,
        stats: {
            wins: 0,
            losses: 0,
            neutrals: 0,
            bySum: new Map(),
            byPair: new Map(),
        },
        purchaseCounter: 0,
        predictedSum: null,
        availableRerolls: 0,
    };

    const inventory = [];

    function removeMatching(predicate, maxCount = 1, cause = 'removed') {
        const removed = [];
        for (let index = inventory.length - 1; index >= 0 && removed.length < maxCount; index--) {
            const item = inventory[index];
            if (predicate(item)) {
                inventory.splice(index, 1);
                engine.removeItem(item.name);
                bus.emit('item:destroyed', { item, cause });
                removed.push(item);
            }
        }
        return removed;
    }

    const inventoryAPI = {
        getAll: () => inventory.slice(),
        destroyOne: name => {
            const removed = removeMatching(item => item.name === name, 1, 'destroyOne');
            return removed.length ? removed[0] : null;
        },
        add: item => {
            if (item) {
                inventory.push(cloneItem(item));
            }
        },
        countWhere: predicate => {
            if (typeof predicate !== 'function') {
                return 0;
            }
            return inventory.reduce((total, item) => (predicate(item) ? total + 1 : total), 0);
        },
        removeWhere: (predicate, count = 1, cause = 'removeWhere') => removeMatching(predicate, Math.max(1, count), cause).length,
    };

    const engine = createEffectsEngine({
        bus,
        inventoryAPI,
        adjustBalance: (delta, options = {}) => {
            if (typeof context.adjustBalance === 'function') {
                return context.adjustBalance(delta, { track: true, ...options });
            }
            return undefined;
        },
        getBalance: () => (typeof context.getBalance === 'function' ? Number(context.getBalance()) || 0 : 0),
        random: () => Math.random(),
        grantRerolls: count => {
            state.availableRerolls += count;
        },
        getRollIndex: () => state.rollIndex,
        getPrediction: () => state.predictedSum,
        getPurchaseCounter: () => state.purchaseCounter,
        resetPurchaseCounter: () => {
            state.purchaseCounter = 0;
        },
    });

    initializeTraits(engine, {
        registerTrait: engine.registerTrait,
    });

    ITEM_TRAIT_MAPPING.forEach((traits, itemName) => {
        if (Array.isArray(traits) && traits.length) {
            engine.defineItem(itemName, traits);
        }
    });

    bus.on('trait:glassJackpot:break', () => {
        const removed = removeMatching(item => (ITEM_TRAIT_MAPPING.get(item.name) || []).includes('GlassJackpot'), 1, 'GlassJackpot break');
        if (removed.length) {
            const broken = removed[0];
            if (typeof context.showMessage === 'function') {
                context.showMessage(`${broken.name} shattered from the stress!`, 'warning');
            }
        }
    });

    function recordRoll({ dice1, dice2, sum }) {
        if (Number.isFinite(sum)) {
            state.stats.bySum.set(sum, (state.stats.bySum.get(sum) || 0) + 1);
        }
        if (Number.isFinite(dice1) && Number.isFinite(dice2)) {
            const key = `${dice1}-${dice2}`;
            state.stats.byPair.set(key, (state.stats.byPair.get(key) || 0) + 1);
        }
        bus.emit('roll', { dice1, dice2, sum });
    }

    function prepareResolve({ outcome, baseBet = 0, baseWinnings = 0, sum, dice1, dice2 }) {
        const contextPayload = { outcome, baseBet, baseWinnings, sum, dice1, dice2 };
        bus.emit('bet:preResolve', contextPayload);
        const modifiers = engine.collectFrameModifiers();
        let multiplierBonus = 0;
        if (outcome === 'win' && baseWinnings > 0) {
            const effective = Math.max(0, 1 + modifiers.totalMultiplierAdd);
            const adjusted = baseWinnings * effective;
            multiplierBonus = adjusted - baseWinnings;
        }
        return {
            totalMultiplierAdd: modifiers.totalMultiplierAdd,
            multiplierBonus,
            flatCashAdd: modifiers.flatCashAdd,
            totalDelta: multiplierBonus + modifiers.flatCashAdd,
        };
    }

    function finalizeResolve({ outcome = 'neutral', sum, dice1, dice2, winnings = 0, flatCashAdd = 0, balance }) {
        if (outcome === 'win') {
            state.stats.wins += 1;
        } else if (outcome === 'loss') {
            state.stats.losses += 1;
        } else {
            state.stats.neutrals += 1;
        }
        state.rollIndex += 1;
        bus.emit('bet:resolved', { outcome, sum, dice1, dice2, winnings, flatCashAdd, balance });
    }

    function applyItemEffect(item, options = {}) {
        if (!item) {
            return '';
        }
        const fullItem = cloneItem(item) || getItemByName(item.name) || item;
        const { free = false } = options;
        if (!free) {
            state.purchaseCounter += 1;
        }
        inventoryAPI.add(fullItem);
        engine.applyItem(fullItem.name);

        const traits = engine.getTraitsForItem(fullItem.name);
        let upfrontBonus = 0;
        const summaryParts = [];

        const specialHandler = SPECIAL_ITEM_HANDLERS[fullItem.name];
        if (typeof specialHandler === 'function') {
            const notes = specialHandler({ removeMatching, engine, inventoryAPI, bus });
            if (Array.isArray(notes)) {
                summaryParts.push(...notes);
            }
        }

        if (traits.includes(DEBT_BOND_TRAIT) && typeof context.adjustBalance === 'function') {
            context.adjustBalance(200, { track: true });
            upfrontBonus = 200;
        }

        traits.forEach(trait => {
            const description = TRAIT_DEFINITIONS[trait] || 'Stacks with itself for stronger rolls.';
            summaryParts.push(`${trait}: ${description}`);
        });

        if (!traits.length) {
            summaryParts.push('Adds a neutral stack with no special trait attached.');
        }

        if (upfrontBonus) {
            summaryParts.push(`Advanced $${upfrontBonus} immediately from debt financing.`);
        }

        const summary = summaryParts.join(' ');
        state.summaries.push({ name: fullItem.name, summary });
        return summary;
    }

    function getPassiveIncome() {
        return 0;
    }

    function getSummaries() {
        return state.summaries.slice();
    }

    function getEffectiveMultiplier(baseMultiplier = 1) {
        return Number.isFinite(baseMultiplier) ? baseMultiplier : 1;
    }

    function shouldForceReroll() {
        return false;
    }

    function applyRollBonuses() {
        return 0;
    }

    function handleRentPaid() {}

    function setPrediction(sum) {
        if (Number.isFinite(sum) && sum >= 2 && sum <= 12) {
            state.predictedSum = sum;
        } else {
            state.predictedSum = null;
        }
    }

    return {
        applyItemEffect,
        recordRoll,
        prepareResolve,
        finalizeResolve,
        getPassiveIncome,
        getSummaries,
        getEffectiveMultiplier,
        shouldForceReroll,
        applyRollBonuses,
        handleRentPaid,
        setPrediction,
        state,
    };
}

if (!globalObject.itemEffectsRuntime) {
    globalObject.itemEffectsRuntime = { createItemEffectsManager };
}
