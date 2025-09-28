// itemEffects.js
// Centralised item effect manager used by the single-player game logic.

import { itemsList } from './items.js';

const RARITY_BASE_MULTIPLIER = {
    Common: 0.01,
    Uncommon: 0.016,
    Rare: 0.022,
    'Very Rare': 0.03,
    Legendary: 0.038,
};

const COST_MULTIPLIER_SCALE = 0.00004;
const COST_MULTIPLIER_CAP = 0.05;

const TAG_LABELS = {
    dice: 'dice rig',
    luck: 'luck charm',
    reroll: 'reroll tech',
    hustler: 'hustler crew',
    crew: 'crew support',
    animal: 'animal asset',
    habitat: 'habitat upgrade',
    urban: 'urban booster',
    criminal: 'criminal asset',
    law: 'law shield',
    finance: 'finance booster',
    interest: 'interest engine',
    shop: 'shopfront perk',
    destruction: 'destruction tool',
    salvage: 'salvage crew',
    smuggling: 'smuggling ring',
    travel: 'transport link',
    weapon: 'weapon cache',
    knowledge: 'knowledge manual',
    support: 'support staff',
    token: 'token charm',
    certificate: 'certification',
    tech: 'tech mod',
    hacker: 'hacking rig',
    splicer: 'dice splicer',
    implant: 'hackdie implant',
    streak: 'streak engine',
    fire: 'fire boost',
    rent: 'rent relief',
    arcane: 'arcane trick',
    dream: 'dream relic',
    'rarity-common': 'common set',
    'rarity-uncommon': 'uncommon set',
    'rarity-rare': 'rare set',
    'rarity-very-rare': 'very rare set',
    'rarity-legendary': 'legendary set',
};

const TAG_SYNERGY_RULES = {
    dice: { perOther: 0.006, synergy: { luck: 0.004, reroll: 0.004, splicer: 0.005, implant: 0.004 } },
    luck: { perOther: 0.005, synergy: { dice: 0.004, token: 0.003, streak: 0.004 } },
    reroll: { perOther: 0.004, synergy: { dice: 0.006, luck: 0.003 } },
    hustler: { perOther: 0.007, synergy: { crew: 0.006, finance: 0.004, support: 0.003 } },
    crew: { perOther: 0.006, synergy: { hustler: 0.006, finance: 0.003, knowledge: 0.002 } },
    animal: { perOther: 0.006, synergy: { habitat: 0.01, urban: 0.004 } },
    habitat: { perOther: 0.004, synergy: { animal: 0.01 } },
    urban: { perOther: 0.003, synergy: { hustler: 0.004, crew: 0.003, animal: 0.003 } },
    criminal: { perOther: 0.007, synergy: { law: 0.004, smuggling: 0.005, weapon: 0.004 } },
    law: { perOther: 0.004, synergy: { criminal: 0.004, finance: 0.003 } },
    finance: { perOther: 0.005, synergy: { shop: 0.004, interest: 0.005, hustler: 0.003 } },
    interest: { perOther: 0.004, synergy: { finance: 0.006 } },
    shop: { perOther: 0.003, synergy: { finance: 0.004, certificate: 0.003 } },
    destruction: { perOther: 0.005, synergy: { salvage: 0.006, finance: 0.003 } },
    salvage: { perOther: 0.004, synergy: { destruction: 0.007 } },
    smuggling: { perOther: 0.005, synergy: { travel: 0.005, criminal: 0.005 } },
    travel: { perOther: 0.004, synergy: { smuggling: 0.004, urban: 0.003 } },
    weapon: { perOther: 0.004, synergy: { criminal: 0.004, crew: 0.002 } },
    knowledge: { perOther: 0.004, synergy: { crew: 0.003, finance: 0.002 } },
    support: { perOther: 0.003, synergy: { crew: 0.003, hustler: 0.002 } },
    token: { perOther: 0.003, synergy: { luck: 0.004, certificate: 0.003 } },
    certificate: { perOther: 0.003, synergy: { finance: 0.003, shop: 0.003, dice: 0.002 } },
    tech: { perOther: 0.005, synergy: { hacker: 0.005, implant: 0.004 } },
    hacker: { perOther: 0.005, synergy: { tech: 0.005, implant: 0.003 } },
    splicer: { perOther: 0.006, synergy: { dice: 0.005, tech: 0.003 } },
    implant: { perOther: 0.006, synergy: { dice: 0.006, streak: 0.004 } },
    streak: { perOther: 0.005, synergy: { luck: 0.005, fire: 0.004 } },
    fire: { perOther: 0.003, synergy: { streak: 0.005 } },
    rent: { perOther: 0.004, synergy: { finance: 0.004 } },
    arcane: { perOther: 0.004, synergy: { luck: 0.003, knowledge: 0.003 } },
    dream: { perOther: 0.004, synergy: { luck: 0.003, finance: 0.003 } },
    'rarity-common': { perOther: 0.0015, synergy: { 'rarity-uncommon': 0.001 } },
    'rarity-uncommon': { perOther: 0.002, synergy: { 'rarity-rare': 0.0015 } },
    'rarity-rare': { perOther: 0.0025, synergy: { 'rarity-very-rare': 0.002 } },
    'rarity-very-rare': { perOther: 0.003, synergy: { 'rarity-rare': 0.002, 'rarity-legendary': 0.003 } },
    'rarity-legendary': { perOther: 0.004, synergy: { 'rarity-very-rare': 0.003 } },
};

const SET_BONUSES = [
    { description: 'Dice control circuit', tags: ['dice', 'luck', 'reroll'], bonus: 0.03, repeatable: true },
    { description: 'Urban menagerie', tags: ['animal', 'habitat', 'urban'], bonus: 0.035 },
    { description: 'Crew payroll pipeline', tags: ['hustler', 'crew', 'finance'], bonus: 0.04 },
    { description: 'Black market triangle', tags: ['criminal', 'smuggling', 'weapon'], bonus: 0.03 },
    { description: 'Recycling racket', tags: ['destruction', 'salvage', 'finance'], bonus: 0.025 },
    { description: 'Cyber rig', tags: ['tech', 'hacker', 'implant'], bonus: 0.035 },
    { description: 'Licensing bureau', tags: ['certificate', 'shop', 'finance'], bonus: 0.02 },
    { description: 'Hot streak trifecta', tags: ['streak', 'luck', 'fire'], bonus: 0.03 },
    { description: 'Rent relief coalition', tags: ['rent', 'finance', 'crew'], bonus: 0.02 },
];

function formatPercent(value) {
    if (!Number.isFinite(value) || value === 0) {
        return '0%';
    }
    const percent = value * 100;
    if (Math.abs(percent) >= 1) {
        return `${percent.toFixed(1)}%`;
    }
    return `${percent.toFixed(2)}%`;
}

function getItemKey(item) {
    return `${item.name}#${item.cost}`;
}

function mergeTags(...groups) {
    const set = new Set();
    groups.filter(Boolean).forEach(group => {
        if (Array.isArray(group)) {
            group.forEach(tag => {
                if (tag) {
                    set.add(tag);
                }
            });
        } else if (typeof group === 'string') {
            set.add(group);
        }
    });
    return Array.from(set);
}

function deriveTags(item) {
    const tags = new Set();
    const name = (item?.name || '').toLowerCase();
    const description = (item?.description || '').toLowerCase();
    const text = `${name} ${description}`;

    if (text.includes('dice')) tags.add('dice');
    if (text.includes('reroll') || text.includes('re-roll')) tags.add('reroll');
    if (text.includes('hustler')) tags.add('hustler');
    if (text.includes('crew') || text.includes('ally') || text.includes('recruit') || text.includes('squad') || text.includes('operation')) tags.add('crew');
    if (text.includes('animal') || text.includes('cat') || text.includes('pigeon') || text.includes('bird') || text.includes('rat') || text.includes('snake') || text.includes('dog') || text.includes('horse')) tags.add('animal');
    if (text.includes('coop') || text.includes('den') || text.includes('jungle') || text.includes('habitat') || text.includes('lair')) tags.add('habitat');
    if (text.includes('urban') || text.includes('street') || text.includes('city') || text.includes('neighborhood')) tags.add('urban');
    if (text.includes('criminal') || text.includes('crime') || text.includes('thief') || text.includes('gang') || text.includes('mob') || text.includes('smuggler') || text.includes('illegal') || text.includes('black market') || text.includes('loan shark') || text.includes('corrupt') || text.includes('fraud') || text.includes('shady')) tags.add('criminal');
    if (text.includes('lawyer') || text.includes('cop') || text.includes('police') || text.includes('law') || text.includes('bail') || text.includes('court')) tags.add('law');
    if (text.includes('loan') || text.includes('bank') || text.includes('cash') || text.includes('coin') || text.includes('money') || text.includes('payout') || text.includes('profit') || text.includes('finance') || text.includes('rich') || text.includes('value')) tags.add('finance');
    if (text.includes('interest') || text.includes('banker')) tags.add('interest');
    if (text.includes('shop') || text.includes('store') || text.includes('market') || text.includes('vendor') || text.includes('dealer') || text.includes('inventory') || text.includes('restock')) tags.add('shop');
    if (text.includes('destroy') || text.includes('burn') || text.includes('trash') || text.includes('break') || text.includes('scavenge') || text.includes('recycle') || text.includes('demolish')) tags.add('destruction');
    if (text.includes('dumpster') || text.includes('junk') || text.includes('scavenger') || text.includes('recycle') || text.includes('salvage')) tags.add('salvage');
    if (text.includes('smuggle') || text.includes('underground') || text.includes('black market') || text.includes('back alley') || text.includes('backdoor') || text.includes('syndicate')) tags.add('smuggling');
    if (text.includes('vehicle') || text.includes('driver') || text.includes('courier') || text.includes('racer') || text.includes('transport') || text.includes('ship') || text.includes('boat') || text.includes('car') || text.includes('bike')) tags.add('travel');
    if (text.includes('luck') || text.includes('lucky') || text.includes('chance') || text.includes('random') || text.includes('gamble') || text.includes('odds')) tags.add('luck');
    if (text.includes('streak') || text.includes('consecutive') || text.includes('combo') || text.includes('chain') || text.includes('hot')) tags.add('streak');
    if (text.includes('fire') || text.includes('flame')) tags.add('fire');
    if (text.includes('tech') || text.includes('computer') || text.includes('digital') || text.includes('cyber') || text.includes('mechanic')) tags.add('tech');
    if (text.includes('hacker') || text.includes('backdoor')) tags.add('hacker');
    if (text.includes('implant')) tags.add('implant');
    if (text.includes('splicer') || text.includes('splice')) tags.add('splicer');
    if (text.includes('certificate') || text.includes('permit') || text.includes('license') || text.includes('endorsement') || text.includes('seal') || text.includes('token') || text.includes('badge') || text.includes('voucher') || text.includes('charter') || text.includes('approval') || text.includes('pass')) tags.add('certificate');
    if (text.includes('token') || text.includes('talisman') || text.includes('emblem')) tags.add('token');
    if (text.includes('manual') || text.includes('book') || text.includes('guide') || text.includes('degree') || text.includes('diploma') || text.includes('codex') || text.includes('scroll')) tags.add('knowledge');
    if (text.includes('support') || text.includes('boost') || text.includes('mentor') || text.includes('manager') || text.includes('fixer')) tags.add('support');
    if (text.includes('blade') || text.includes('knife') || text.includes('sword') || text.includes('gun') || text.includes('bomb') || text.includes('weapon') || text.includes('revolver')) tags.add('weapon');
    if (text.includes('rent')) tags.add('rent');
    if (text.includes('magic') || text.includes('magician') || text.includes('wizard') || text.includes('arcane')) tags.add('arcane');
    if (text.includes('dream')) tags.add('dream');

    tags.add(`rarity-${(item?.rarity || 'Common').toLowerCase().replace(/\s+/g, '-')}`);
    return Array.from(tags);
}

function getBaseMultiplier(item) {
    const rarityBonus = RARITY_BASE_MULTIPLIER[item?.rarity] ?? RARITY_BASE_MULTIPLIER.Common;
    const costBonus = Math.min(COST_MULTIPLIER_CAP, Math.max(0, (item?.cost || 0) * COST_MULTIPLIER_SCALE));
    return rarityBonus + costBonus;
}

function describeTagSynergy(tag) {
    const rule = TAG_SYNERGY_RULES[tag];
    if (!rule) {
        return '';
    }
    const label = TAG_LABELS[tag] || tag;
    const parts = [];
    if (rule.perOther) {
        parts.push(`${formatPercent(rule.perOther)} per other ${label}`);
    }
    if (rule.synergy) {
        const synergyParts = Object.entries(rule.synergy)
            .slice(0, 2)
            .map(([partner, bonus]) => `${formatPercent(bonus)} with ${TAG_LABELS[partner] || partner}`);
        parts.push(...synergyParts);
    }
    return `${label} (${parts.join(', ')})`;
}

function buildSynergyText(tags) {
    const descriptions = tags
        .map(tag => describeTagSynergy(tag))
        .filter(Boolean);

    if (!descriptions.length) {
        return '';
    }

    return `Synergy with ${descriptions.join('; ')}.`;
}

function evaluateSets(tagCounts) {
    const active = [];

    SET_BONUSES.forEach(rule => {
        const thresholds = rule.thresholds || {};
        const counts = rule.tags.map(tag => {
            const available = tagCounts.get(tag) || 0;
            const required = thresholds[tag] || 1;
            return Math.floor(available / required);
        });

        if (rule.repeatable) {
            const repeats = Math.min(...counts);
            if (repeats >= 1) {
                const totalBonus = rule.bonus * repeats;
                const label = repeats > 1
                    ? `${rule.description} x${repeats} (+${formatPercent(totalBonus)})`
                    : `${rule.description} (+${formatPercent(rule.bonus)})`;
                active.push({ label, bonus: totalBonus });
            }
        } else if (counts.every(count => count >= 1)) {
            active.push({ label: `${rule.description} (+${formatPercent(rule.bonus)})`, bonus: rule.bonus });
        }
    });

    return active;
}

function recomputeBonuses(state) {
    let base = 0;
    state.itemRecords.forEach(record => {
        base += record.baseMultiplier;
    });

    let synergy = 0;
    const synergyBreakdown = {};
    state.tagCounts.forEach((count, tag) => {
        const rule = TAG_SYNERGY_RULES[tag];
        if (!rule || count <= 0) {
            return;
        }

        let tagBonus = 0;
        if (rule.perOther) {
            tagBonus += Math.max(0, count - 1) * rule.perOther;
        }
        if (rule.synergy) {
            Object.entries(rule.synergy).forEach(([partner, bonus]) => {
                const partnerCount = state.tagCounts.get(partner) || 0;
                if (partnerCount > 0) {
                    tagBonus += Math.min(count, partnerCount) * bonus;
                }
            });
        }

        synergyBreakdown[tag] = tagBonus;
        synergy += tagBonus;
    });

    let manual = 0;
    if (state.manualBonusSources) {
        state.manualBonusSources.forEach(value => {
            manual += value;
        });
    }

    const activeSets = evaluateSets(state.tagCounts);
    const setBonus = activeSets.reduce((total, entry) => total + entry.bonus, 0);

    state.currentBreakdown = {
        base,
        synergy,
        set: setBonus,
        manual,
        activeSets: activeSets.map(entry => entry.label),
        details: synergyBreakdown,
    };

    state.winMultiplierBonus = base + synergy + setBonus + manual;
}

function registerComboItem({ item, state, tags, baseMultiplier, passiveIncome = 0, extraSummary }) {
    const tagList = mergeTags(tags || [], deriveTags(item));
    const appliedBase = Number.isFinite(baseMultiplier) ? baseMultiplier : getBaseMultiplier(item);
    const beforeTotal = state.winMultiplierBonus || 0;
    const beforeSets = new Set(state.currentBreakdown?.activeSets || []);

    const key = getItemKey(item);
    const record = state.itemRecords.get(key) || { count: 0, baseMultiplier: 0, tags: new Set() };
    record.count += 1;
    record.baseMultiplier += appliedBase;
    tagList.forEach(tag => record.tags.add(tag));
    state.itemRecords.set(key, record);

    tagList.forEach(tag => {
        state.tagCounts.set(tag, (state.tagCounts.get(tag) || 0) + 1);
    });

    if (passiveIncome) {
        const income = Math.round(passiveIncome);
        if (income !== 0) {
            state.passiveIncomePerRoll += income;
        }
    }

    recomputeBonuses(state);

    const afterTotal = state.winMultiplierBonus || 0;
    const delta = afterTotal - beforeTotal;
    const newSets = [];
    const afterSets = new Set(state.currentBreakdown?.activeSets || []);
    afterSets.forEach(label => {
        if (!beforeSets.has(label)) {
            newSets.push(label);
        }
    });

    const summaryParts = [];
    summaryParts.push(`Adds +${formatPercent(appliedBase)} win multiplier baseline.`);
    if (passiveIncome) {
        summaryParts.push(`Passive income +$${Math.round(passiveIncome)} each roll.`);
    }

    const synergyText = buildSynergyText(tagList);
    if (synergyText) {
        summaryParts.push(synergyText);
    }

    if (extraSummary) {
        summaryParts.push(extraSummary);
    }

    summaryParts.push(`Current total boost from this pickup: +${formatPercent(delta)}.`);

    if (newSets.length) {
        summaryParts.push(`New set bonus: ${newSets.join(', ')}.`);
    }

    return summaryParts.join(' ');
}

function addManualWinBonus(state, value, source) {
    if (!Number.isFinite(value) || value === 0) {
        return 0;
    }
    if (!state.manualBonusSources) {
        state.manualBonusSources = new Map();
    }
    const current = state.manualBonusSources.get(source) || 0;
    state.manualBonusSources.set(source, current + value);
    recomputeBonuses(state);
    return value;
}

function defaultEffect({ item, state }) {
    const passiveIncome = Math.max(0, Math.round((item?.cost || 0) * 0.005));
    return registerComboItem({
        item,
        state,
        passiveIncome,
    });
}

const itemEffectDefinitions = {
    'Loaded Dice': ({ item, state }) => {
        state.loadedDice = true;
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['dice', 'luck', 'reroll', 'streak']),
            baseMultiplier: getBaseMultiplier(item) + 0.01,
            extraSummary: 'Automatically rerolls totals below 7.',
        });
    },

    'Forged Papers': ({ item, state, context }) => {
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
        const extraSummary = grantedItems.length
            ? `Bonus crew recruited: ${grantedItems.join(', ')}.`
            : 'Calls in bonus crew instantly.';
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['crew', 'hustler', 'luck']),
            extraSummary,
        });
    },

    "Old Gang Leaders Blade": ({ item, state, context }) => {
        context.showMessage('The blade hums with power. +$9 every roll!', 'bonus');
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['weapon', 'criminal', 'crew']),
            baseMultiplier: getBaseMultiplier(item) + 0.012,
            passiveIncome: 9,
            extraSummary: 'Adds $9 passive income on every roll.',
        });
    },

    "Neighborhood OGs Manual": ({ item, state }) => {
        const summary = registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['knowledge', 'crew', 'hustler']),
            extraSummary: 'Stacks harder with hustlers. Manual bonus queued (+5%).',
        });
        addManualWinBonus(state, 0.05, item.name);
        return summary;
    },

    'Lucky Black Cat': ({ item, state }) => {
        state.rollCallbacks.push(({ sum }) => (sum === 9 ? 9 : 0));
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['animal', 'luck', 'token']),
            extraSummary: 'Pays $9 whenever the roll totals nine.',
        });
    },

    'Rusty Revolver': ({ item, state, context }) => {
        const description = (item.description || '').toLowerCase();
        let payout = 150;
        if (description.includes('$150')) {
            payout = 150;
        } else if (description.includes('$15')) {
            payout = 15;
        }
        context.adjustBalance(payout, { source: 'Rusty Revolver' });
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['weapon', 'criminal']),
            extraSummary: `Immediate payout +$${payout}.`,
        });
    },

    'Gamblers Token': ({ item, state }) => {
        state.rollCallbacks.push(() => (Math.random() < 0.1 ? -2 : 0));
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['luck', 'token', 'dice']),
            passiveIncome: 2,
            extraSummary: '10% chance to lose $2 on a roll.',
        });
    },

    'Brown Pay Bump': ({ item, state }) => {
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['crew', 'finance', 'support']),
            passiveIncome: 4,
            extraSummary: 'Crew kickback adds $4 per roll.',
        });
    },

    'Gold-Plated Dice': ({ item, state }) => {
        state.rollCallbacks.push(({ sum }) => (sum > 6 ? 3 : 0));
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['dice', 'luck']),
            extraSummary: 'Adds $3 whenever you roll above six.',
        });
    },

    'Lucky Horseshoe': ({ item, state }) => {
        state.winCallbacks.push(() => 3);
        return registerComboItem({
            item,
            state,
            tags: mergeTags(deriveTags(item), ['luck', 'token', 'dice']),
            extraSummary: 'Adds $3 flat to every winning roll.',
        });
    },
};

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
        tagCounts: new Map(),
        itemRecords: new Map(),
        manualBonusSources: new Map(),
        currentBreakdown: { base: 0, synergy: 0, set: 0, manual: 0, activeSets: [], details: {} },
    };

    /**
     * Applies an item's effect to the manager state.
     * @param {object} item - The purchased item definition.
     * @returns {string} - A short summary describing the applied effect.
     */
    function applyItemEffect(item) {
        const definition = itemEffectDefinitions[item.name] || defaultEffect;
        const summary = definition({ item, state, context });
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
        const base = Number.isFinite(baseMultiplier) ? baseMultiplier : 1;
        const multiplicative = Number.isFinite(state.multiplierBonus) ? state.multiplierBonus : 1;
        const flat = Number.isFinite(state.flatMultiplierBonus) ? state.flatMultiplierBonus : 0;
        const additive = Number.isFinite(state.winMultiplierBonus) ? state.winMultiplierBonus : 0;

        let effective = base * multiplicative;
        effective += flat;
        effective *= 1 + additive;
        return Number.isFinite(effective) ? effective : base;
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
