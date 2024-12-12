// itemEffects.js

const itemEffects = {
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
    }
};

export default itemEffects;
