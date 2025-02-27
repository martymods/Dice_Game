// itemEffects.js

import { itemsList } from './items.js';

// Apply purchased item effects
export function applyPurchasedItemEffects(purchasedItems) {
    if (!Array.isArray(purchasedItems)) {
        console.error('purchasedItems is not an array.');
        return;
    }

    purchasedItems.forEach(item => {
        const effect = window.itemEffects[item.name];
        if (typeof effect === 'function') {
            try {
                effect(); // Call the effect function
                console.log(`Effect applied for item: ${item.name}`);
            } catch (err) {
                console.error(`Error applying effect for item: ${item.name}`, err);
            }
        } else {
            console.warn(`No effect defined for item: ${item.name}`);
        }
    });
}

// Make all functions globally accessible
window.itemEffects = {};

// Add placeholder functions for missing items
const addPlaceholderEffect = (name) => {
    const effectFunctionName = name.replace(/[^\w]/g, '').toLowerCase() + 'Effect';
    window.itemEffects[effectFunctionName] = () => {
        console.warn(`Placeholder effect triggered for item: ${name}`);
    };
};

// Add effect functions for specific items
window.itemEffects['Loaded Dice'] = () => {
    console.log('Effect applied: Loaded Dice');
    const originalRollFunction = window.rollDice;
    window.rollDice = () => {
        const { dice1, dice2 } = originalRollFunction();
        const sum = dice1 + dice2;
        if (sum === 7 || sum === 11) {
            const winnings = window.currentBet * 2;
            window.updateBalance(window.balance + winnings);
            console.log(`Loaded Dice activated: Won $${winnings}`);
        }
        return { dice1, dice2 };
    };
};

window.itemEffects['Forged Papers'] = () => {
    console.log('Effect applied: Forged Papers');
    for (let i = 0; i < 3; i++) {
        const randomItem = itemsList[Math.floor(Math.random() * itemsList.length)];
        window.addToPurchasedItems(randomItem);
        console.log(`Forged Papers added item: ${randomItem.name}`);
    }
};

window.itemEffects['Old Gang Leaders Blade'] = () => {
    console.log('Effect applied: Old Gang Leaders Blade');
    const originalPlaceBet = window.placeBet;
    window.placeBet = (betAmount) => {
        const earnings = betAmount * 0.1;
        window.updateBalance(window.balance + earnings);
        console.log(`Old Gang Leader's Blade added $${earnings} to balance.`);
        originalPlaceBet(betAmount);
    };
};

window.itemEffects['Neighborhood OGs Manual'] = () => {
    console.log('Effect applied: Neighborhood OGs Manual');
    const originalPayoutFunction = window.calculateItemPayout;
    window.calculateItemPayout = (item) => {
        const basePayout = originalPayoutFunction(item);
        const boostedPayout = basePayout * 1.05;
        console.log(`Neighborhood OG's Manual boosted payout for ${item.name}: $${boostedPayout}`);
        return boostedPayout;
    };
};

// Add placeholder effects for all missing items
const missingItems = [ 
    'Barrel of Hustlers', 'Big Dreamers Bomb', 'Pigeon Coop', 'Black Cat Amulet',
    'Street Pepper', 'Street Adoption Papers', 'Brown Pay Bump', 'Unmarked Bills', 
    'Pocket Burner', 'Big Symbol Stash', 'Lucky Black Cat', 'Sticky Fingers',
    'Corrupted Cufflinks', 'Hustlers Degree', 'Booster Deck', 'Rusty Revolver', 
    'Shady Deal Contract', 'Urban Jungle', 'Ancient Switchblade', 'Collectors Charm',
    'High Rollers Jacket', 'Dice Coders Toolkit', 'Gold-Toothed Grin', 'Loan Officer',
    'Pawn Shop Clerk', 'Dirty Cop', 'Greedy Bartender', 'Cursed Dice', 'Gamblers Token',
    'Dumpster Diver', 'Getaway Driver', 'Dice Masters Gloves', 'Counterfeit Coin',
    'Money Launderer', 'Lucky Horseshoe', 'Gold-Plated Dice', 'Crime Syndicate', 
    'Haunted Die', 'Insider Trader', 'Snake Oil Salesman', 'Cracked Dice', 'Gutter Stash',
    'Street Gold Chain', 'Rusty Revolver', 'Gambling Addicts Coin', 'Snitchs Phone',
    'Roll Modder', 'Broken ATM', 'Crime Family Cookbook', 'Silent Alarm', 'Junkyard Jackpot',
    'One-Armed Bandit', 'Stacked Wallet', 'Loan Sharks Ledger', 'Greedy Hustler',
    'Wrathful Hustler', 'Jolly Hustler', 'Sly Hustler', 'Loyalty Card', 'Steel Hustler',
    'Abstract Hustler', 'Even Steven', 'Odd Todd', 'Lucky Roller', 'Extra Roll King',
    'Pattern Hustler', 'Faceless Hustler', 'Green Hustler', 'Square Hustler',
    'Smiley Face Buffoon', 'Superposition Hustler', 'Shortcut Hustler', 'Photograph Hustler',
    'Dumpster Diver', 'Rocket Booster', 'Cursed Hustler', 'Getaway Driver', 'The Trio',
    'Snake Oil Salesman', 'Crime Syndicate', 'Dice Master', 'Glass Ball', 'Onyx Agate',
    'Back Alley Bookie', 'Street Magician', 'Pawn Broker', 'Black Market Dealer',
    'Street Food Vendor', 'Fake ID Maker', 'Loan Shark', 'Counterfeit Artist', 'Shady Accountant',
    'Graffiti Artist', 'Street Racer', 'Con Artist', 'Street Preacher', 'Pigeon Trainer',
    'Ruthless Collector', 'Street Dealer', 'Illegal Fireworks', 'Hustler’s Union',
    'Shady Landlord', 'Snake Charmer', 'Card Counter', 'Dice Forger', 'Money Mule',
    'Undercover Cop', 'Street Philosopher', 'Fast Talker', 'Mad Inventor', 'Shady Lawyer',
    'Street Scam Artist', 'Blackmail Specialist', 'Street Gambler', 'Fast Cash Courier',
    'Shady Pawnshop Owner', 'Illegal Loan Dealer', 'Fake Lotto Vendor', 'Dice Shark',
    'Street Muscle', 'Insurance Fraud Expert', 'Street Snitch', 'Underground Mechanic',
    'Offshore Investor', 'Silent Partner', 'Dice Dealer', 'Midnight Courier', 
    'Warehouse Thief', 'Dumpster Scavenger', 'Roulette Hustler', 'Charity Hustler', 
    'Street Chemist', 'Underground King', 'Puppet Master', 'Backdoor Hacker', 
    'Street Charmer', 'Shakedown Specialist', 'Lucky Scoundrel', 'Illegal Arms Dealer',
    'High-Stakes Broker', 'Corner Lookout', 'Bodega Schemer', 'Card Counter',
    'Street Fortune Teller', 'Pawned Off', 'Fake Charity Organizer', 'Illegal Street Vendor',
    'The Fence', 'Side Hustle Manager', 'Late Night Gambler', 'Shifty Collector', 
    'Street Lawyer', 'Two-Timing Hustler', 'Street DJ', 'Fake Bail Bondsman', 
    'Pawn King', 'Urban Scavenger', 'Street Magician', 'Rooftop Courier', 'Alleyway Hustler', 
    'Fake Casino Dealer', 'Blackout Expert', 'Street Economist', 'Junk Trader',
    'Dice Manipulator', 'Street Artist', 'Night Market Dealer', 'Gangland Accountant',
    'Fake Landlord', 'Sly Saboteur', 'Fast Talker', 'Corner Hustler', 'Back Alley Mechanic',
    'The Enforcer', 'Shifty Gambler', 'Dice Whiz'
];

missingItems.forEach(item => addPlaceholderEffect(item));

// Check for missing functions in the future
itemsList.forEach(item => {
    const itemNameWithoutEmoji = item.name.split(' ')[0].toLowerCase();
    const effectFunctionName = `${itemNameWithoutEmoji}Effect`;

    if (!window.itemEffects[effectFunctionName]) {
        console.warn(`Missing effect function for item: ${item.name}`);
    }
});
