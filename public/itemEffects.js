// itemEffects.js

// Make all functions globally accessible
window.itemEffects = {
    // Passive bonus for Loaded Dice
    loadedDiceEffect: (roll, currentBet) => {
        if (roll === 2) return Math.floor(currentBet * 0.2); // 20% bonus for rolling a 2
        if (roll === 3) return Math.floor(currentBet * 0.3); // 30% bonus for rolling a 3
        return 0;
    },

    // Add allies for Forged Papers
    forgedPapersEffect: (inventory) => {
        const allies = [
            { name: 'Street Rat 🐀', count: 1 },
            { name: 'Pigeon 🕊️', count: 1 },
            { name: 'Tortoise 🐢', count: 1 }
        ];
        allies.forEach(ally => {
            const existing = inventory.find(item => item.name === ally.name);
            if (existing) {
                existing.count += ally.count;
            } else {
                inventory.push(ally);
            }
        });
        return inventory;
    },

    // Add DreamCoin generation for Old Gang Leader’s Blade
    gangLeaderBladeEffect: (inventory) => {
        const duplicates = inventory.reduce((acc, item) => {
            if (item.name === 'Old Gang Leader’s Blade 🔪') acc += item.count - 1;
            return acc;
        }, 0);
        return Math.max(9 - duplicates, 0); // Generates 9 DreamCoins, minus 1 per duplicate blade
    },

    // Bonus for allies with Neighborhood OG's Manual
    ogManualEffect: (inventory, rollBonus) => {
        const targetAllies = ['Thief', 'Loan Shark', 'Hustler', 'Informant'];
        const bonus = inventory.reduce((acc, item) => {
            if (targetAllies.includes(item.name.split(' ')[0])) acc += rollBonus;
            return acc;
        }, 0);
        return bonus; // Bonus for relevant allies
    },

    // Add Street Hustlers for Barrel of Hustlers
    barrelOfHustlersEffect: (inventory) => {
        const hustlers = Array(7).fill({ name: 'Street Hustler 🧢', count: 1 });
        hustlers.forEach(hustler => {
            const existing = inventory.find(item => item.name === hustler.name);
            if (existing) {
                existing.count += hustler.count;
            } else {
                inventory.push(hustler);
            }
        });
        return inventory;
    },

    // Big Dreamer’s Bomb - Show Hustle-Based Items
    bigDreamersBombEffect: (itemsList) => {
        return itemsList.filter(item => item.name.includes('hustle') || item.description.includes('hustle')).slice(0, 9);
    },

    // Boost Payouts for Pigeon Coop
    pigeonCoopEffect: (inventory, payout) => {
        const targetSymbols = ['Pigeon', 'Rat', 'Street Snitch'];
        const multiplier = 1.5;
        const bonus = inventory.reduce((acc, item) => {
            if (targetSymbols.includes(item.name.split(' ')[0])) acc += payout * (multiplier - 1);
            return acc;
        }, 0);
        return bonus;
    },

    // Reward DreamCoins for Black Cat Amulet
    blackCatAmuletEffect: (roll) => {
        return roll === 9 ? 9 : 0; // +9 DreamCoins for rolling a 9
    },

    // Reward DreamCoins for Street Pepper
    streetPepperEffect: (destroyedCount) => {
        return destroyedCount; // +1 DreamCoin per destroyed hustler
    },

    // Add Hustlers for Street Adoption Papers
    streetAdoptionEffect: (inventory) => {
        const hustlers = [
            { name: 'Street Turtle 🐢', count: 1 },
            { name: 'Slow Joe 🐌', count: 1 },
            { name: 'Alley Cat 🐈', count: 1 }
        ];
        hustlers.forEach(hustler => {
            const existing = inventory.find(item => item.name === hustler.name);
            if (existing) {
                existing.count += hustler.count;
            } else {
                inventory.push(hustler);
            }
        });
        return inventory;
    },

    // Reward $10 per Hustler Added for Brown Pay Bump
    brownPayBumpEffect: (hustlersAdded) => {
        return hustlersAdded * 10; // $10 per hustler added
    },

    // Instant $100 for Unmarked Bills
    unmarkedBillsEffect: () => {
        return 100; // Reward $100 instantly
    },

    // Reward $10 per item/hustler torched for Pocket Burner
    pocketBurnerEffect: (torchedCount) => {
        return torchedCount * 10; // $10 per torched item or hustler
    },

    // Big Symbol Stash Effect
    bigSymbolStashEffect: (itemsList) => {
        const hustlers = Array(4).fill({ name: 'Hustler', count: 1 });
        const randomItems = itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);
        return { hustlers, randomItems };
    },

    // Reward $90 for Lucky Black Cat on multiples of 3
    luckyBlackCatEffect: (roll) => {
        return roll % 3 === 0 ? 90 : 0; // $90 for rolls that are multiples of 3
    },

    // Grant $30 per roll for Corrupted Cufflinks with chance of item destruction
    corruptedCufflinksEffect: (inventory) => {
        const destructionChance = 0.1; // 10% chance
        if (Math.random() < destructionChance) {
            const destroyedItem = inventory.pop();
            console.log('Destroyed item:', destroyedItem);
        }
        return 30; // $30 per roll
    },

    // Boost Hustler Payouts by $10 for Hustler’s Degree
    hustlersDegreeEffect: (hustlerCount) => {
        return hustlerCount * 10; // $10 per hustler
    },

    // Booster Deck Effect
    boosterDeckEffect: (itemsList) => {
        const common = itemsList.filter(item => item.rarity === 'Common').slice(0, 4);
        const uncommon = itemsList.filter(item => item.rarity === 'Uncommon').slice(0, 3);
        const rare = itemsList.filter(item => item.rarity === 'Rare').slice(0, 1);
        return { common, uncommon, rare };
    },

    // Destroy Hustler for Rusty Revolver
    rustyRevolverEffect: (inventory) => {
        const hustler = inventory.find(item => item.name.includes('Hustler'));
        if (hustler) {
            inventory = inventory.filter(item => item !== hustler);
            return { inventory, reward: 150 };
        }
        return { inventory, reward: 0 };
    }
};

export default itemEffects;
