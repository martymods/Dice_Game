// itemEffects.js

// Make all functions globally accessible
window.itemEffects = {
    // Effect for Loaded Dice
    loadedDiceEffect: (roll, currentBet) => {
        if (roll === 2) return Math.floor(currentBet * 0.2); // 20% bonus for rolling a 2
        if (roll === 3) return Math.floor(currentBet * 0.3); // 30% bonus for rolling a 3
        return 0;
    },

    // Effect for Forged Papers
    forgedPapersEffect: (inventory) => {
        const allies = [
            { name: 'Street Rat 🐀', count: 1, description: 'A cunning street ally.' },
            { name: 'Pigeon 🕊️', count: 1, description: 'A swift messenger ally.' },
            { name: 'Tortoise 🐢', count: 1, description: 'A slow but steady ally.' }
        ];
    
        allies.forEach(ally => {
            const existing = inventory.find(item => item.name === ally.name);
            if (!existing) {
                // Add the ally only if it doesn't already exist
                inventory.push({ ...ally });
            }
        });
    
        return inventory;
    },

    // Effect for Old Gang Leader’s Blade
    gangLeaderBladeEffect: (inventory) => {
        const duplicates = inventory.reduce((acc, item) => {
            if (item.name === 'Old Gang Leader’s Blade 🔪') acc += item.count - 1;
            return acc;
        }, 0);
        return Math.max(9 - duplicates, 0); // Generates 9 DreamCoins, minus 1 per duplicate blade
    },

    // Effect for Neighborhood OG's Manual
    ogManualEffect: (inventory, rollBonus) => {
        const targetAllies = ['Thief', 'Loan Shark', 'Hustler', 'Informant'];
        const bonus = inventory.reduce((acc, item) => {
            if (targetAllies.includes(item.name.split(' ')[0])) acc += rollBonus;
            return acc;
        }, 0);
        return bonus; // Bonus for relevant allies
    },

    // Effect for Barrel of Hustlers
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

    // Effect for Big Dreamer’s Bomb
    bigDreamersBombEffect: (itemsList) => {
        return itemsList.filter(item => item.name.includes('hustle') || item.description.includes('hustle')).slice(0, 9);
    },

    // Effect for Pigeon Coop
    pigeonCoopEffect: (inventory, payout) => {
        const targetSymbols = ['Pigeon', 'Rat', 'Street Snitch'];
        const multiplier = 1.5;
        const bonus = inventory.reduce((acc, item) => {
            if (targetSymbols.includes(item.name.split(' ')[0])) acc += payout * (multiplier - 1);
            return acc;
        }, 0);
        return bonus;
    },

    // Effect for Black Cat Amulet
    blackCatAmuletEffect: (roll) => {
        return roll === 9 ? 9 : 0; // +9 DreamCoins for rolling a 9
    },

    // Effect for Street Pepper
    streetPepperEffect: (destroyedCount) => {
        return destroyedCount; // +1 DreamCoin per destroyed hustler
    },

    // Effect for Street Adoption Papers
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

    // Effect for Brown Pay Bump
    brownPayBumpEffect: (hustlersAdded) => {
        return hustlersAdded * 10; // $10 per hustler added
    },

    // Effect for Unmarked Bills
    unmarkedBillsEffect: () => {
        return 100; // Reward $100 instantly
    },

    // Effect for Pocket Burner
    pocketBurnerEffect: (torchedCount) => {
        return torchedCount * 10; // $10 per torched item or hustler
    },

    // Effect for Big Symbol Stash
    bigSymbolStashEffect: (itemsList) => {
        const hustlers = Array(4).fill({ name: 'Hustler', count: 1 });
        const randomItems = itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);
        return { hustlers, randomItems };
    },

    // Effect for Lucky Black Cat
    luckyBlackCatEffect: (roll) => {
        return roll % 3 === 0 ? 90 : 0; // $90 for rolls that are multiples of 3
    },

    // Effect for Corrupted Cufflinks
    corruptedCufflinksEffect: (inventory) => {
        const destructionChance = 0.1; // 10% chance
        if (Math.random() < destructionChance) {
            const destroyedItem = inventory.pop();
            console.log('Destroyed item:', destroyedItem);
        }
        return 30; // $30 per roll
    },

    // Effect for Hustler’s Degree
    hustlersDegreeEffect: (hustlerCount) => {
        return hustlerCount * 10; // $10 per hustler
    },

    // Effect for Booster Deck
    boosterDeckEffect: (itemsList) => {
        const common = itemsList.filter(item => item.rarity === 'Common').slice(0, 4);
        const uncommon = itemsList.filter(item => item.rarity === 'Uncommon').slice(0, 3);
        const rare = itemsList.filter(item => item.rarity === 'Rare').slice(0, 1);
        return { common, uncommon, rare };
    },

    // Effect for Rusty Revolver
    rustyRevolverEffect: (inventory) => {
        const hustler = inventory.find(item => item.name.includes('Hustler'));
        if (hustler) {
            inventory = inventory.filter(item => item !== hustler);
            return { inventory, reward: 150 };
        }
        return { inventory, reward: 0 };
    }
};

// Effect for Shady Deal Contract
window.itemEffects.shadyDealContractEffect = (hustlers, multiplier) => {
    return hustlers.reduce((total, hustler) => total + (hustler.payout * multiplier), 0);
};

// Effect for Urban Jungle
window.itemEffects.urbanJungleEffect = (animals, payout) => {
    const animalList = ['Cat', 'Dog', 'Crow', 'Snake'];
    const total = animals.filter(animal => animalList.includes(animal.type))
        .reduce((sum, animal) => sum + payout * 0.2, 0);
    return total;
};

// Effect for Crime Syndicate
window.itemEffects.crimeSyndicateEffect = (hustlers, payout) => {
    return hustlers.filter(hustler => hustler.type === 'criminal').length * payout * 0.5;
};

// Effect for High Roller’s Jacket
window.itemEffects.highRollersJacketEffect = (inventory) => {
    return inventory.filter(item => item.rarity === 'Common').length * 3;
};

// Effect for Dice Master’s Gloves
window.itemEffects.diceMastersGlovesEffect = (rolls, rerollCost) => {
    const rerolled = rolls.map(roll => Math.max(roll, 6)); // Guarantees maximum value after reroll
    return { rerolled, cost: rerollCost };
};

// Effect for Haunted Die
window.itemEffects.hauntedDieEffect = (roll) => {
    const isWin = Math.random() > 0.5;
    return isWin ? roll * 2 : roll - 2;
};

// Effect for Lucky Horseshoe
window.itemEffects.luckyHorseshoeEffect = (criticalChance) => {
    const isCritical = Math.random() < criticalChance;
    return isCritical ? 1.5 : 1;
};

// Effect for Golden Dice
window.itemEffects.goldPlatedDiceEffect = (roll, threshold) => {
    return roll > threshold ? 3 : 0;
};

// Effect for Loan Shark’s Ledger
window.itemEffects.loanSharksLedgerEffect = (currentBalance, borrowAmount) => {
    return {
        borrowed: borrowAmount,
        costPerTurn: Math.max(borrowAmount * 0.1, 1),
        updatedBalance: currentBalance + borrowAmount
    };
};

// Effect for Street Food Vendor
window.itemEffects.streetFoodVendorEffect = (roll) => {
    return roll % 2 === 1 ? roll * 5 : 0;
};

// Effect for Pawn Shop Clerk
window.itemEffects.pawnShopClerkEffect = (inventory) => {
    const converted = inventory.slice(0, 1).map(item => ({
        type: 'cash',
        value: item.value + 50
    }));
    return converted;
};

// Effect for Snake Oil Salesman
window.itemEffects.snakeOilSalesmanEffect = (inventory, perItemBonus) => {
    const commonItems = inventory.filter(item => item.rarity === 'Common');
    return commonItems.length * perItemBonus;
};

// Effect for Lucky Scoundrel
window.itemEffects.luckyScoundrelEffect = (roll) => {
    return roll === 3 || roll === 7 ? roll * 20 : 0;
};

// Effect for Pickpocket
window.itemEffects.pickpocketEffect = (opponentRoll) => {
    return opponentRoll > 5 ? 20 : 0; // Gains $20 when an opponent rolls higher than 5
};

// Effect for Gold-Toothed Grin
window.itemEffects.goldToothedGrinEffect = (hustlerValue) => {
    return hustlerValue < 30 ? hustlerValue * 2 : 0; // Doubles payouts for hustlers valued below $30
};

// Effect for Dirty Cop
window.itemEffects.dirtyCopEffect = (hustlers) => {
    const criminalHustler = hustlers.find(hustler => hustler.type === 'criminal');
    if (criminalHustler) {
        hustlers = hustlers.filter(hustler => hustler !== criminalHustler);
        return { hustlers, reward: 60 }; // Destroys a criminal hustler and collects $60
    }
    return { hustlers, reward: 0 };
};

// Effect for Gambler’s Token
window.itemEffects.gamblersTokenEffect = (roll) => {
    return roll * 20; // Adds $20 per roll
};

// Effect for Dumpster Diver
window.itemEffects.dumpsterDiverEffect = (destroyedItems) => {
    return destroyedItems.length; // Generates $10 per destroyed item
};

// Effect for Getaway Driver
window.itemEffects.getawayDriverEffect = (criminalHustlersRemoved) => {
    return criminalHustlersRemoved * 60; // Collects $60 per criminal hustler that flees
};

// Effect for Counterfeit Coin
window.itemEffects.counterfeitCoinEffect = (payouts) => {
    return payouts * 0.9 + 1000; // Adds $1000 but reduces payouts by 10%
};

// Effect for Grifter
window.itemEffects.grifterEffect = (opponents, multiplayer) => {
    return multiplayer ? opponents.length * 2 : 0; // Steals $2 per opponent in multiplayer
};

// Effect for Lucky Horseshoe
window.itemEffects.luckyHorseshoeEffect = (roll, criticalChance) => {
    return Math.random() < criticalChance ? roll * 1.1 : roll; // Increases critical success chance by 10%
};

// Effect for Gold-Plated Dice
window.itemEffects.goldPlatedDiceEffect = (roll) => {
    return roll > 6 ? roll + 3 : roll; // Adds $3 to rolls over 6
};

// Effect for Haunted Die
window.itemEffects.hauntedDieEffect = (roll) => {
    return Math.random() > 0.5 ? roll * 2 : roll - 2; // 50% chance to double payout or lose $2
};

// Effect for Snake Oil Salesman
window.itemEffects.snakeOilSalesmanEffect = (commonItems) => {
    return commonItems.length * 2; // Grants $2 per common item
};

// Effect for Insider Trader
window.itemEffects.insiderTraderEffect = (sequence) => {
    return sequence ? sequence.length * 2 : 0; // Doubles payouts when rolling a sequence (e.g., 1, 2, 3)
};

// Effect for Pawn Shop Clerk
window.itemEffects.pawnShopClerkEffect = (diceConverted) => {
    return diceConverted * 50; // Converts one dice into $50 every 3 turns
};

// Effect for Street Food Vendor
window.itemEffects.streetFoodVendorEffect = (roll) => {
    return roll % 2 === 1 ? 5 : 0; // Grants $5 for every odd number rolled
};

// Effect for Loan Officer
window.itemEffects.loanOfficerEffect = (loanSharks) => {
    return loanSharks.length * 10; // Adds $10 per Loan Shark in play
};

// Effect for Hustler
window.itemEffects.hustlerEffect = (roll) => {
    return roll * 2; // Provides a 2x multiplier for every roll
};

// Effect for Greedy Hustler
window.itemEffects.greedyHustlerEffect = (roll) => {
    return roll > 6 ? roll + 5 : 0; // Adds $5 for rolls above 6
};

// Effect for Wrathful Hustler
window.itemEffects.wrathfulHustlerEffect = (roll) => {
    return roll < 4 ? roll * 3 : 0; // Provides a 3x multiplier for rolls under 4
};

// Effect for Jolly Hustler
window.itemEffects.jollyHustlerEffect = (rolls) => {
    const isMatching = rolls[0] === rolls[1];
    return isMatching ? rolls[0] * 5 : 0; // Provides a 5x multiplier if two dice match
};

// Effect for Sly Hustler
window.itemEffects.slyHustlerEffect = (roll) => {
    return roll > 8 ? 50 : 0; // Grants $50 for rolls above 8
};

// Effect for Loyalty Card
window.itemEffects.loyaltyCardEffect = (consecutiveRolls) => {
    return consecutiveRolls >= 3 ? consecutiveRolls * 4 : 0; // Provides a 4x multiplier after 3 rolls without rerolling
};

// Effect for Steel Hustler
window.itemEffects.steelHustlerEffect = (hustlers) => {
    return hustlers.length * 0.5; // Provides a 0.5x multiplier for each hustler in play
};

// Effect for Abstract Hustler
window.itemEffects.abstractHustlerEffect = (inventory) => {
    const hustlerCount = inventory.filter(item => item.type === 'Hustler').length;
    return hustlerCount * 2; // Provides a 2x multiplier for each Hustler in inventory
};

// Effect for Even Steven
window.itemEffects.evenStevenEffect = (roll) => {
    return roll % 2 === 0 ? roll * 3 : 0; // Provides a 3x multiplier for even rolls
};

// Effect for Odd Todd
window.itemEffects.oddToddEffect = (roll) => {
    return roll % 2 !== 0 ? roll * 3 : 0; // Provides a 3x multiplier for odd rolls
};

// Effect for Lucky Roller
window.itemEffects.luckyRollerEffect = () => {
    return Math.floor(Math.random() * 23); // Multiplier changes randomly between 0x and 23x each roll
};

// Effect for Extra Roll King
window.itemEffects.extraRollKingEffect = () => {
    return 1; // Grants +1 extra roll during each rent due phase
};

// Effect for Pattern Hustler
window.itemEffects.patternHustlerEffect = (roll) => {
    const validPatterns = [2, 3, 5, 8];
    return validPatterns.includes(roll) ? roll * 8 : 0; // Provides an 8x multiplier for specific rolls
};

// Effect for Faceless Hustler
window.itemEffects.facelessHustlerEffect = (previousRoll, currentRoll) => {
    return previousRoll === currentRoll ? 50 : 0; // Grants $50 if the same number is rolled twice in a row
};

// Effect for Green Hustler
window.itemEffects.greenHustlerEffect = (isBetting, missedBets) => {
    return isBetting ? -missedBets : missedBets; // Gains a 1x multiplier for avoiding bets, loses 1x for missed bets
};

// Effect for Square Hustler
window.itemEffects.squareHustlerEffect = (roll) => {
    const perfectSquares = [4, 9, 16];
    return perfectSquares.includes(roll) ? 40 : 0; // Grants $40 if the dice sum to a perfect square
};

// Effect for Smiley Face Buffoon
window.itemEffects.smileyFaceBuffoonEffect = (rolls) => {
    return rolls[0] === rolls[1] ? rolls[0] * 2 : 0; // Provides a 2x multiplier for matching dice rolls
};

// Effect for Superposition Hustler
window.itemEffects.superpositionHustlerEffect = (doublesCount) => {
    return doublesCount > 0 ? doublesCount * 10 : 0; // Triggers a rare item drop for each double rolled
};

// Effect for Shortcut Hustler
window.itemEffects.shortcutHustlerEffect = (roll) => {
    return roll >= 4 && roll <= 7 ? 15 : 0; // Grants $15 for rolls between 4 and 7
};

// Effect for Juggler
window.itemEffects.jugglerEffect = (diceCount) => {
    return diceCount > 2 ? diceCount * 5 : 0; // Grants $5 for each additional die after two
};

// Effect for Photograph Hustler
window.itemEffects.photographHustlerEffect = (firstRoll) => {
    return firstRoll * 2; // Doubles the value of the first roll in each phase
};

// Effect for Dumpster Diver
window.itemEffects.dumpsterDiverEffect = (destroyedItems) => {
    return destroyedItems.length * 20; // Grants $20 for every destroyed item during the phase
};

// Effect for Rocket Booster
window.itemEffects.rocketBoosterEffect = (doublesRolled) => {
    return doublesRolled * 50; // Grants $50 for every double rolled cumulatively over the game
};

// Effect for Cursed Hustler
window.itemEffects.cursedHustlerEffect = (bet) => {
    return Math.random() > 0.5 ? bet * 2 : -bet; // 50/50 chance to double or lose the current bet
};

// Effect for Getaway Driver
window.itemEffects.getawayDriverEffect = (removedHustlers) => {
    return removedHustlers * 100; // Grants $100 for each hustler removed from the crew
};

// Effect for The Trio
window.itemEffects.theTrioEffect = (rollSum) => {
    return rollSum === 3 ? 3 : 0; // Grants a 3x multiplier if the sum of dice equals 3
};

// Effect for Snake Oil Salesman
window.itemEffects.snakeOilSalesmanEffect = (destroyedItems) => {
    return destroyedItems.length * 30; // Grants $30 for each destroyed common item
};

// Effect for Crime Syndicate
window.itemEffects.crimeSyndicateEffect = (criminalHustlers) => {
    return criminalHustlers.length * 2; // Doubles payouts for all criminal hustlers in play
};

// Effect for Dice Master
window.itemEffects.diceMasterEffect = (rentPhase, guaranteedValue) => {
    return rentPhase === true ? guaranteedValue : 0; // Grants a custom guaranteed die face per rent phase
};

// Effect for Glass Ball
window.itemEffects.glassBallEffect = (rareDestroyed) => {
    return rareDestroyed * 0.5; // Grants a 0.5x multiplier for every rare item destroyed
};

// Effect for Collector’s Charm
window.itemEffects.collectorsCharmEffect = (rareItems, veryRareItems) => {
    return (rareItems.length + veryRareItems.length) * 2; // Doubles the payouts of all rare and very rare items
};

// Effect for Onyx Agate
window.itemEffects.onyxAgateEffect = (primeDice) => {
    return primeDice.length * 1; // Grants a +1x multiplier for each die showing a prime number
};

// Effect for Back Alley Bookie
window.itemEffects.backAlleyBookieEffect = (betsPlaced) => {
    return betsPlaced * 300; // Increases winnings by $300 for every bet placed in a rent cycle
};

// Effect for Street Magician
window.itemEffects.streetMagicianEffect = (diceRoll) => {
    return diceRoll < 3 ? 50 : 0; // Grants $50 and re-rolls any roll below 3 once per phase
};

// Effect for Pawn Broker
window.itemEffects.pawnBrokerEffect = (itemValue) => {
    return itemValue * 1.2; // Sell any item for +20% more than its value
};

// Effect for Black Market Dealer
window.itemEffects.blackMarketDealerEffect = (rareItemsCost, veryRareItemsCost) => {
    return {
        rare: rareItemsCost * 0.85, // Reduces the cost of rare items by 15%
        veryRare: veryRareItemsCost * 0.85 // Reduces the cost of very rare items by 15%
    };
};

// Effect for Street Food Vendor
window.itemEffects.streetFoodVendorEffect = (oddRolls) => {
    return oddRolls * 5; // Grants $5 for every odd number rolled in a rent phase
};

// Effect for Fake ID Maker
window.itemEffects.fakeIDMakerEffect = (losingRolls) => {
    return losingRolls > 0 ? losingRolls * 10 : 0; // Allows rerolls for losing dice, grants $10 per reroll
};

// Effect for Loan Shark
window.itemEffects.loanSharkEffect = (immediatePayout, deductionPerRoll) => {
    return {
        payout: immediatePayout, // Adds $100 immediately
        costPerRoll: deductionPerRoll // Deducts $20 per roll until repaid
    };
};

// Effect for Pickpocket
window.itemEffects.pickpocketEffect = (opponentRoll) => {
    return opponentRoll > 5 ? 10 : 0; // Steals $10 from an opponent on every roll above 5
};

// Effect for Bouncer
window.itemEffects.bouncerEffect = (penaltyProtection) => {
    return penaltyProtection ? 1 : 0; // Blocks one penalty from a failed roll per rent phase
};

// Effect for Counterfeit Artist
window.itemEffects.counterfeitArtistEffect = (itemPurchasedValue) => {
    return itemPurchasedValue * 2; // Doubles the effect of the first item purchased during a rent phase
};

// Effect for Shady Accountant
window.itemEffects.shadyAccountantEffect = (itemCount) => {
    return itemCount >= 5 ? 50 : 0; // Grants $50 at the end of each rent phase if you own at least 5 items
};

// Effect for Graffiti Artist
window.itemEffects.graffitiArtistEffect = (consecutiveOddRolls) => {
    return consecutiveOddRolls * 20; // Grants $20 for each consecutive odd roll (max 3 rolls)
};

// Effect for Fence
window.itemEffects.fenceEffect = (destroyedItems) => {
    return destroyedItems * 30; // Grants $30 for each destroyed item during the rent phase
};

// Effect for Street Racer
window.itemEffects.streetRacerEffect = (diceValues) => {
    const highRolls = diceValues.filter(value => value > 5);
    return highRolls.length === 2 ? 100 : 0; // Grants $100 if both dice show a number greater than 5
};

// Effect for Con Artist
window.itemEffects.conArtistEffect = (inventory, opponentInventory) => {
    if (opponentInventory.length > 0) {
        const randomItem = opponentInventory.pop();
        inventory.push(randomItem); // Swaps one item from your inventory with a random item from an opponent
    }
    return inventory;
};

// Effect for Street Preacher
window.itemEffects.streetPreacherEffect = (roll) => {
    return roll === 6 ? 10 : 0; // Grants $10 for each 6 rolled during the rent phase
};

// Effect for Pigeon Trainer
window.itemEffects.pigeonTrainerEffect = (pigeons) => {
    return pigeons.length * 5; // Grants $5 per pigeon-themed hustler in your crew
};

// Effect for Ruthless Collector
window.itemEffects.ruthlessCollectorEffect = (duplicates) => {
    return duplicates * 100; // Automatically destroys duplicates and grants $100 for each one
};

// Effect for Smuggler
window.itemEffects.smugglerEffect = (itemsPurchased) => {
    return itemsPurchased * 50; // Grants $50 for every item purchased during the rent phase
};

// Effect for Street Dealer
window.itemEffects.streetDealerEffect = (destroyedItems) => {
    return destroyedItems * 100; // Doubles payouts for items destroyed during a rent phase
};

// Effect for Illegal Fireworks
window.itemEffects.illegalFireworksEffect = (roll) => {
    return roll >= 8 ? 30 : 0; // Grants $30 whenever you roll an 8 or higher
};

// Effect for Fixer
window.itemEffects.fixerEffect = (brokenItems) => {
    const repairedItems = brokenItems.map(item => ({ ...item, repaired: true }));
    return repairedItems.length; // Repairs broken items, restoring their effects
};

// Effect for Hustler’s Union
window.itemEffects.hustlersUnionEffect = (hustlers) => {
    return hustlers.length * 20; // Increases payouts of all hustlers in play by $20 each roll
};

// Effect for Shady Landlord
window.itemEffects.shadyLandlordEffect = (rentPaid) => {
    return rentPaid ? 100 : 0; // Grants $100 every time rent is paid but increases the rent amount by 10%
};

// Effect for Snake Charmer
window.itemEffects.snakeCharmerEffect = (diceRoll) => {
    return diceRoll === 2 ? 10 : 0; // Grants $10 for every 2 rolled on the dice during a rent phase
};

// Effect for Card Counter
window.itemEffects.cardCounterEffect = (criticalRolls) => {
    return criticalRolls * 15; // Increases critical success chance by 15%
};

// Effect for Dice Forger
window.itemEffects.diceForgerEffect = (selectedDie) => {
    return selectedDie; // Allows you to choose the result of one die roll per rent phase
};

// Effect for Money Mule
window.itemEffects.moneyMuleEffect = (newItems) => {
    return newItems.length * 50; // Grants $50 every time an item is added to your inventory
};

// Effect for Undercover Cop
window.itemEffects.undercoverCopEffect = (criminalHustlers) => {
    return criminalHustlers.length > 0 ? 200 : 0; // Destroys a criminal-themed hustler in play and grants $200
};

// Effect for Street Philosopher
window.itemEffects.streetPhilosopherEffect = (rerolls) => {
    return rerolls * 20; // Grants $20 every time you reroll dice during a phase
};

// Effect for Fast-Talker
window.itemEffects.fastTalkerEffect = (hustlerCost) => {
    return hustlerCost * 0.9; // Reduces the cost of hustlers by 10% during a rent phase
};

// Effect for Mad Inventor
window.itemEffects.madInventorEffect = (rareItemCreated) => {
    return rareItemCreated ? 1 : 0; // Creates a custom rare item every rent phase
};

// Effect for Shady Lawyer
window.itemEffects.shadyLawyerEffect = (rollResult, penalties) => {
    return penalties === 0 && rollResult > 0 ? 50 : 0; // Grants $50 every time you win a roll and nullifies penalties for losing once per phase
};

// Effect for Street Scam Artist
window.itemEffects.streetScamArtistEffect = (oddRolls) => {
    return Math.min(oddRolls, 5) * 10; // Grants $10 per odd roll during the rent phase, up to 5 rolls
};

// Effect for Blackmail Specialist
window.itemEffects.blackmailSpecialistEffect = (destroyedRivalHustlers) => {
    return destroyedRivalHustlers * 100; // Grants $100 every time a rival hustler is destroyed
};

// Effect for Street Gambler
window.itemEffects.streetGamblerEffect = (consecutiveHighRolls) => {
    return consecutiveHighRolls > 1 ? consecutiveHighRolls * 20 : 0; // Doubles payouts for consecutive rolls above 6
};

// Effect for Fast Cash Courier
window.itemEffects.fastCashCourierEffect = (lowRolls) => {
    return lowRolls * 20; // Grants $20 for every roll under 3 during the rent phase
};

// Effect for Shady Pawnshop Owner
window.itemEffects.shadyPawnshopOwnerEffect = (hustlersTraded) => {
    return hustlersTraded * 50; // Allows you to trade a hustler for $50 during the rent phase
};

// Effect for Illegal Loan Dealer
window.itemEffects.illegalLoanDealerEffect = (initialLoan, deductionRounds) => {
    return {
        payout: initialLoan, // Grants $200 upfront
        costPerRound: Math.floor(initialLoan / deductionRounds), // Deducts an amount over the next few rounds
    };
};

// Effect for Fake Lotto Vendor
window.itemEffects.fakeLottoVendorEffect = (roll) => {
    return roll >= 7 ? 50 : 0; // Grants $50 when you roll a 7 or higher during the rent phase
};

// Effect for Dice Shark
window.itemEffects.diceSharkEffect = (roll, duration) => {
    return roll + (duration * 1); // Adds a +1 modifier to every roll for a specified duration
};

// Effect for Street Muscle
window.itemEffects.streetMuscleEffect = (penaltyProtected) => {
    return penaltyProtected ? 1 : 0; // Prevents penalties for one failed roll per rent phase
};

// Effect for Hustler in Disguise
window.itemEffects.hustlerInDisguiseEffect = (highestRankedHustler) => {
    return highestRankedHustler ? highestRankedHustler.effect * 1 : 0; // Mimics the effect of the highest-ranked hustler in your crew
};

// Effect for Insurance Fraud Expert
window.itemEffects.insuranceFraudExpertEffect = (lostRolls) => {
    return lostRolls >= 3 ? 300 : 0; // Grants $300 if you lose 3 rolls in a single rent phase
};

// Effect for Counterfeiter
window.itemEffects.counterfeiterEffect = (selectedItem) => {
    return selectedItem ? selectedItem.value * 2 : 0; // Doubles payouts for one item of your choice per rent phase
};

// Effect for Street Snitch
window.itemEffects.streetSnitchEffect = (criminalHustlers) => {
    return criminalHustlers.length * 10; // Grants $10 per criminal-themed hustler in your crew each phase
};

// Effect for Underground Mechanic
window.itemEffects.undergroundMechanicEffect = (brokenItems) => {
    const repaired = brokenItems.map(item => ({ ...item, repaired: true }));
    return repaired.length > 0 ? repaired.length * 50 : 0; // Repairs broken items and grants $50 per repair
};

// Effect for Offshore Investor
window.itemEffects.offshoreInvestorEffect = (inventory) => {
    return inventory.length * 100; // Grants $100 for every item in your inventory at the start of each phase
};

// Effect for Silent Partner
window.itemEffects.silentPartnerEffect = (uniqueHustlers) => {
    return uniqueHustlers.length * 30; // Adds $30 per roll for every unique hustler in your crew
};

// Effect for Dice Dealer
window.itemEffects.diceDealerEffect = (rolledDoubles) => {
    return rolledDoubles ? 25 : 0; // Grants $25 whenever you roll a double
};

// Effect for Midnight Courier
window.itemEffects.midnightCourierEffect = (longPhases) => {
    return longPhases > 10 ? 50 : 0; // Adds $50 every time a rent phase exceeds 10 rolls
};

// Effect for Warehouse Thief
window.itemEffects.warehouseThiefEffect = (itemsPurchased) => {
    return itemsPurchased * 20; // Grants $20 per item purchased during a phase
};

// Effect for Skimmer
window.itemEffects.skimmerEffect = (opponents) => {
    return opponents.length * 15; // Steals $15 from opponents on every roll in multiplayer mode
};

// Effect for Dumpster Scavenger
window.itemEffects.dumpsterScavengerEffect = (destroyedItems) => {
    return destroyedItems.length * 5; // Grants $5 for each destroyed item or hustler during a rent phase
};

// Effect for Roulette Hustler
window.itemEffects.rouletteHustlerEffect = (roll) => {
    return roll === 5 || roll === 9 ? 30 : 0; // Grants $30 whenever your roll lands on a 5 or a 9
};

// Effect for Charity Hustler
window.itemEffects.charityHustlerEffect = (evenRolls) => {
    return evenRolls * 10; // Adds $10 for every even-numbered roll
};

// Effect for Street Chemist
window.itemEffects.streetChemistEffect = (thirdRoll) => {
    return thirdRoll ? thirdRoll * 2 : 0; // Doubles payouts for every third roll during a rent phase
};

// Effect for Underground King
window.itemEffects.undergroundKingEffect = (startOfPhase) => {
    return startOfPhase ? 300 : 0; // Adds $300 at the start of every rent phase but increases rent by $50
};

// Effect for Puppet Master
window.itemEffects.puppetMasterEffect = (consecutiveWins) => {
    return consecutiveWins >= 3 ? 100 : 0; // Grants $100 if you win 3 consecutive rolls during a rent phase
};

// Effect for Backdoor Hacker
window.itemEffects.backdoorHackerEffect = (destroyedItems, freeRerolls) => {
    return destroyedItems * 200 + freeRerolls * 10; // Adds $200 per destroyed item and $10 per free reroll
};

// Effect for Street Charmer
window.itemEffects.streetCharmerEffect = (roll) => {
    return roll === 2 || roll === 8 ? 20 : 0; // Grants $20 for every roll that includes a 2 or 8
};

// Effect for Shakedown Specialist
window.itemEffects.shakedownSpecialistEffect = (rivalLosses) => {
    return rivalLosses * 50; // Grants $50 every time a rival loses a hustler
};

// Effect for Lucky Scoundrel
window.itemEffects.luckyScoundrelEffect = (roll) => {
    return roll === 3 || roll === 7 ? 20 : 0; // Grants $20 whenever you roll a 3 or 7
};

// Effect for Illegal Arms Dealer
window.itemEffects.illegalArmsDealerEffect = (destroyedCriminals) => {
    return destroyedCriminals * 400; // Adds $400 per destroyed criminal hustler during the rent phase
};

// Effect for High-Stakes Broker
window.itemEffects.highStakesBrokerEffect = (highRolls) => {
    return highRolls > 8 ? highRolls * 3 : 0; // Triples payouts for all rolls above 8 in a single rent phase
};

// Effect for Corner Lookout
window.itemEffects.cornerLookoutEffect = (lowRolls) => {
    return lowRolls < 4 ? 10 : 0; // Grants $10 for every roll that lands below 4 during the rent phase
};

// Effect for Bodega Schemer
window.itemEffects.bodegaSchemerEffect = (finalRoll) => {
    return finalRoll ? finalRoll * 2 : 0; // Doubles payouts for all rolls on the last turn of a rent phase
};

// Effect for Card Counter
window.itemEffects.cardCounterEffect = (oddSequence) => {
    return oddSequence.length >= 3 ? 75 : 0; // Grants $75 if you roll three consecutive odd numbers in a phase
};

// Effect for Street Fortune Teller
window.itemEffects.streetFortuneTellerEffect = (roll) => {
    return roll === 7 || roll === 11 ? 15 : 0; // Adds $15 whenever you roll a 7 or 11 during the rent phase
};

// Effect for Pawned Off
window.itemEffects.pawnedOffEffect = (destroyedItems) => {
    return destroyedItems * 50; // Grants $50 when any item in your inventory is destroyed
};

// Effect for Fake Charity Organizer
window.itemEffects.fakeCharityOrganizerEffect = (payoutsReduced) => {
    return payoutsReduced >= 3 ? 150 : 0; // Grants $150 upfront but reduces payouts by $10 for the next 3 rolls
};

// Effect for Illegal Street Vendor
window.itemEffects.illegalStreetVendorEffect = (divisibleRoll) => {
    return divisibleRoll % 3 === 0 ? 25 : 0; // Grants $25 whenever you roll a number divisible by 3
};

// Effect for The Fence
window.itemEffects.theFenceEffect = (destroyedHustlers) => {
    return destroyedHustlers * 50; // Doubles payouts from destroyed hustlers during a rent phase
};

// Effect for Side Hustle Manager
window.itemEffects.sideHustleManagerEffect = (activeItems) => {
    return activeItems * 50; // Grants $50 for every active item in your inventory
};

// Effect for Late Night Gambler
window.itemEffects.lateNightGamblerEffect = (roll) => {
    return roll === 12 ? roll * 3 : 0; // Triples payouts if the total roll equals 12 during the rent phase
};

// Effect for Shifty Collector
window.itemEffects.shiftyCollectorEffect = (collectedPayouts) => {
    return collectedPayouts >= 5 ? 30 : 0; // Grants $30 every time you collect payouts from 5 or more hustlers in a phase
};

// Effect for Street Lawyer
window.itemEffects.streetLawyerEffect = (failedRolls) => {
    return failedRolls === 0 ? 1 : 0; // Cancels penalties for failed rolls during a single rent phase
};

// Effect for Smuggler
window.itemEffects.smugglerEffect = (newHustlers) => {
    return newHustlers * 75; // Grants $75 for each new hustler added to your crew during the rent phase
};

// Effect for Two-Timing Hustler
window.itemEffects.twoTimingHustlerEffect = (firstRollPayout) => {
    return firstRollPayout * 2; // Doubles payouts for the first roll of every rent phase
};

// Effect for Street DJ
window.itemEffects.streetDJEffect = (fiveRollBonus) => {
    return fiveRollBonus * 25; // Grants $25 per 5 rolls when the total exceeds 6
};

// Effect for Fake Bail Bondsman
window.itemEffects.fakeBailBondsmanEffect = (destroyedCriminals) => {
    return destroyedCriminals * 100; // Grants $100 for every destroyed criminal hustler
};

// Effect for Pickpocket Apprentice
window.itemEffects.pickpocketApprenticeEffect = (oddRollSteals) => {
    return oddRollSteals * 15; // Steals $15 from opponents on every odd-numbered roll
};

// Effect for Pawn King
window.itemEffects.pawnKingEffect = (hustlerPayouts) => {
    return hustlerPayouts * 3; // Triples payouts for all hustlers in play for one rent phase
};

// Effect for Urban Scavenger
window.itemEffects.urbanScavengerEffect = (destroyedItems) => {
    return destroyedItems * 5; // Adds $5 for every destroyed item during a single rent phase
};

// Effect for Rooftop Courier
window.itemEffects.rooftopCourierEffect = (highRollCount) => {
    return highRollCount * 40; // Adds $40 for every 4 rolls above 7 in a phase
};

// Effect for Alleyway Hustler
window.itemEffects.alleywayHustlerEffect = (exactFiveRoll) => {
    return exactFiveRoll ? 20 : 0; // Adds $20 to the payout if the roll lands exactly on 5
};

// Effect for Fake Casino Dealer
window.itemEffects.fakeCasinoDealerEffect = (consecutiveWins) => {
    return consecutiveWins >= 3 ? 75 : 0; // Grants $75 whenever you win three consecutive rolls
};

// Effect for Blackout Expert
window.itemEffects.blackoutExpertEffect = (penaltyHidden) => {
    return penaltyHidden ? 100 : 0; // Hides all penalties for one failed roll per rent phase and grants $100
};

// Effect for Street Economist
window.itemEffects.streetEconomistEffect = (totalRolls) => {
    return totalRolls > 15 ? 100 : 0; // Grants $100 whenever total rolls exceed 15 in a phase
};

// Effect for Junk Trader
window.itemEffects.junkTraderEffect = (commonItemsDestroyed) => {
    return commonItemsDestroyed * 20; // Adds $20 per destroyed common item during the rent phase
};

// Effect for Dice Manipulator
window.itemEffects.diceManipulatorEffect = (freeReroll) => {
    return freeReroll ? 1 : 0; // Allows one roll to be re-rolled during every rent phase
};

// Effect for Street Artist
window.itemEffects.streetArtistEffect = (hustlerCount) => {
    return hustlerCount * 10; // Grants $10 for every hustler in your crew
};

// Effect for Night Market Dealer
window.itemEffects.nightMarketDealerEffect = (oddPhaseRolls) => {
    return oddPhaseRolls * 2; // Doubles payouts for all rolls on odd-numbered phases
};

// Effect for Gangland Accountant
window.itemEffects.ganglandAccountantEffect = (hustlersInCrew) => {
    return hustlersInCrew.length >= 3 ? hustlersInCrew.length * 50 : 0; // Grants $150 for every 3 hustlers in your crew
};

// Effect for Fake Landlord
window.itemEffects.fakeLandlordEffect = (rentEnd) => {
    return rentEnd ? 100 : 0; // Collects $100 at the end of every rent phase
};

// Effect for Sly Saboteur
window.itemEffects.slySaboteurEffect = (destroyedRivalHustlers) => {
    return destroyedRivalHustlers * 75; // Grants $75 for every destroyed hustler in the opponent’s crew
};

// Effect for Fast Talker
window.itemEffects.fastTalkerEffect = (highRoll) => {
    return highRoll > 10 ? 15 : 0; // Adds $15 to the payout if the total roll exceeds 10
};

// Effect for Corner Hustler
window.itemEffects.cornerHustlerEffect = (destroyedItems, failedRolls) => {
    return (destroyedItems * 5) + (failedRolls * 10); // Grants $5 per destroyed item and $10 for every failed roll
};

// Effect for Back Alley Mechanic
window.itemEffects.backAlleyMechanicEffect = (brokenItems) => {
    return brokenItems.length * 50; // Repairs one item and grants $50
};

// Effect for The Enforcer
window.itemEffects.theEnforcerEffect = (penaltyPrevention) => {
    return penaltyPrevention ? 300 : 0; // Prevents penalties for failed rolls for one rent phase and adds $300
};

// Effect for Shifty Gambler
window.itemEffects.shiftyGamblerEffect = (lowRolls) => {
    return lowRolls < 4 ? lowRolls * 2 : 0; // Doubles payouts for rolls below 4 during a rent phase
};

// Effect for Dice Whiz
window.itemEffects.diceWhizEffect = (predictedRoll, actualRoll) => {
    return predictedRoll === actualRoll ? 50 : 0; // Adds $50 if your roll matches a number you predict each phase
};

// Certificates

// itemEffects.js (Certificates)

// Effect for Shady Hustler's Endorsement
window.itemEffects.shadyHustlersEndorsementEffect = (shopSlots) => {
    return shopSlots + 1; // Adds +1 item slot in the shop (to 4 slots)
};

// Effect for Kingpin's Approval
window.itemEffects.kingpinsApprovalEffect = (shopSlots) => {
    return shopSlots + 1; // Adds +1 item slot in the shop (to 5 slots) and restocks empty slots
};

// Effect for Underworld Deal
window.itemEffects.underworldDealEffect = (itemPrices) => {
    return itemPrices.map(price => price * 0.75); // All items in the shop are 25% cheaper
};

// Effect for Black Market Bonanza
window.itemEffects.blackMarketBonanzaEffect = (itemPrices) => {
    return itemPrices.map(price => price * 0.5); // All items in the shop are 50% cheaper, reduces resale value of hustlers
};

// Effect for Loaded Pouch
window.itemEffects.loadedPouchEffect = (consumableSlots) => {
    return consumableSlots + 1; // Adds +1 slot for consumables
};

// Effect for Hidden Vault
window.itemEffects.hiddenVaultEffect = (shopItems) => {
    return shopItems.concat('Rare High-Value Items'); // Allows rare, high-value items to appear in the shop
};

// Effect for Street Smart Diploma
window.itemEffects.streetSmartDiplomaEffect = (extraRolls) => {
    return extraRolls + 1; // Gain +1 additional roll per turn
};

// Effect for Mastermind Badge
window.itemEffects.mastermindBadgeEffect = (extraRolls) => {
    return extraRolls + 2; // Gain +2 extra rolls per turn
};

// Effect for Dice Whisperer's Permit
window.itemEffects.diceWhisperersPermitEffect = (rollPayoutMultiplier) => {
    return rollPayoutMultiplier * 1.5; // Dice rolls above 7 grant 1.5x payouts
};

// Effect for Dice Master's Seal
window.itemEffects.diceMastersSealEffect = (rollPayoutMultiplier) => {
    return rollPayoutMultiplier * 2; // Dice rolls above 5 grant double payouts
};

// Effect for Shady Banker's Promise
window.itemEffects.shadyBankersPromiseEffect = (interestEarned, maxCap) => {
    return Math.min(interestEarned + 150, maxCap); // Earn interest on unspent money, capped at $150 per turn
};

// Effect for Loan Shark's Favors
window.itemEffects.loanSharksFavorsEffect = (interestEarned, maxCap) => {
    return Math.min(interestEarned + 300, maxCap); // Earn interest on unspent money, capped at $300 per turn
};

// Effect for Trickster's Pact
window.itemEffects.trickstersPactEffect = (losingRolls) => {
    return losingRolls > 0 ? losingRolls - 1 : 0; // Allows you to reroll a losing dice once per turn
};

// Effect for Illusionist's Gambit
window.itemEffects.illusionistsGambitEffect = (losingRolls) => {
    return 0; // Allows rerolls for all dice in a losing roll
};

// Effect for Blank Certificate
window.itemEffects.blankCertificateEffect = () => {
    return 0; // A placeholder with no immediate effects
};

// Effect for Antimatter Permit
window.itemEffects.antimatterPermitEffect = (diceSlots) => {
    return diceSlots + 1; // Grants an additional dice slot for rolling
};

// Effect for Fixer's Permit
window.itemEffects.fixersPermitEffect = (brokenItems) => {
    return brokenItems > 0 ? 1 : 0; // Repairs one broken item after each rent phase
};

// Effect for Underworld Mechanic
window.itemEffects.underworldMechanicEffect = (brokenItems) => {
    return brokenItems; // Repairs all broken items after each rent phase
};

// Effect for Lucky Charm
window.itemEffects.luckyCharmEffect = (doubleRollChance) => {
    return doubleRollChance + 0.05; // Grants a +5% chance to roll doubles
};

// Effect for Gambler's Talisman
window.itemEffects.gamblersTalismanEffect = (doubleRollChance) => {
    return doubleRollChance + 0.1; // Grants a +10% chance to roll doubles and doubles payouts for doubles
};

// Effect for Blackout Certificate
window.itemEffects.blackoutCertificateEffect = (penaltyNegation) => {
    return penaltyNegation + 1; // Negates penalties from one failed roll per rent phase
};

// Effect for Eclipse License
window.itemEffects.eclipseLicenseEffect = (penaltyNegation) => {
    return Infinity; // Negates penalties from all failed rolls in one rent phase
};

// Effect for Shakedown Approval
window.itemEffects.shakedownApprovalEffect = (opponentPenalties) => {
    return opponentPenalties * 10; // Earns $10 for every opponent penalty
};

// Effect for Mob Boss Favor
window.itemEffects.mobBossFavorEffect = (opponentPenalties) => {
    return opponentPenalties * 50; // Earns $50 for every opponent penalty
};
// Effect for Street Deal Voucher
window.itemEffects.streetDealVoucherEffect = (destroyedItemsPayout) => {
    return destroyedItemsPayout * 1.5; // Increases payouts from destroyed items by 50%
};

// Effect for Black Market Pass
window.itemEffects.blackMarketPassEffect = (destroyedItemsPayout) => {
    return destroyedItemsPayout * 2; // Doubles payouts from destroyed items
};

// Effect for Underground Agreement
window.itemEffects.undergroundAgreementEffect = (commonItemsPurchased) => {
    return commonItemsPurchased * 10; // Gain $10 for every common item purchased
};

// Effect for Smuggler's Certification
window.itemEffects.smugglersCertificationEffect = (itemsPurchased) => {
    return itemsPurchased * 50; // Gain $50 for every item purchased
};

// Effect for Fence's Pass
window.itemEffects.fencesPassEffect = (itemCost) => {
    return itemCost * 0.9; // Reduces cost of items by 10%
};

// Effect for Con Artist's Credential
window.itemEffects.conArtistsCredentialEffect = (itemCost) => {
    return itemCost * 0.75; // Reduces cost of items by 25%
};

// Effect for Hot Streak Token
window.itemEffects.hotStreakTokenEffect = (payout, consecutiveWins) => {
    return consecutiveWins >= 3 ? payout * 1.1 : payout; // Increases payouts by 10% after 3 consecutive wins
};

// Effect for Blazing Streak Emblem
window.itemEffects.blazingStreakEmblemEffect = (payout, consecutiveWins) => {
    return consecutiveWins >= 3 ? payout * 1.2 : payout; // Increases payouts by 20% after 3 consecutive wins
};

// Effect for Landlord's Loophole
window.itemEffects.landlordsLoopholeEffect = (rentIncrease) => {
    return rentIncrease * 0.9; // Reduces rent increases by 10% for the next 3 phases
};

// Effect for Tenant Alliance Charter
window.itemEffects.tenantAllianceCharterEffect = (rentIncrease) => {
    return rentIncrease * 0.75; // Reduces rent increases by 25% for the entire run
};

// Effect for Dice Hoarder's Permit
window.itemEffects.diceHoardersPermitEffect = (diceSlots) => {
    return diceSlots + 1; // Gain +1 extra dice slot
};

// Effect for Dice Mogul's License
window.itemEffects.diceMogulsLicenseEffect = (diceSlots) => {
    return diceSlots + 2; // Gain +2 extra dice slots
};

// Effect for Streetwise Scroll
window.itemEffects.streetwiseScrollEffect = (payout) => {
    return payout * 1.05; // Increase all payouts by 5%
};

// Effect for Master Hustler's Codex
window.itemEffects.masterHustlersCodexEffect = (payout) => {
    return payout * 1.15; // Increase all payouts by 15%
};

// Effect for Shady Landlord Pass
window.itemEffects.shadyLandlordPassEffect = () => {
    return 500; // Gain $500 each time rent is paid
};

// Effect for Corrupt Landlord's Seal
window.itemEffects.corruptLandlordsSealEffect = () => {
    return 1150; // Gain $1150 each time rent is paid
};

// Effect for Loaded Connections
window.itemEffects.loadedConnectionsEffect = (itemsSold) => {
    return itemsSold * 200; // Gain $200 for every item sold
};

// Effect for Underground Syndicate Chain
window.itemEffects.undergroundSyndicateChainEffect = (itemsSold) => {
    return itemsSold * 500; // Gain $500 for every item sold
};

// Effect for Double Down Permit
window.itemEffects.doubleDownPermitEffect = (roll, threshold) => {
    return roll >= threshold ? roll * 2 : 0; // Doubles payouts on dice rolls of 10 or higher
};

// Effect for High Roller's Emblem
window.itemEffects.highRollersEmblemEffect = (roll, threshold) => {
    return roll >= threshold ? roll * 3 : 0; // Triples payouts on dice rolls of 10 or higher
};

// Effect for Quick Cash Token
window.itemEffects.quickCashTokenEffect = (oddRolls) => {
    return oddRolls * 5; // Grants $5 for every odd-numbered roll
};

// Effect for Fast Fortune License
window.itemEffects.fastFortuneLicenseEffect = (oddRolls) => {
    return oddRolls * 15; // Grants $15 for every odd-numbered roll
};

// Effect for Neighborhood Hustler's Pass
window.itemEffects.neighborhoodHustlersPassEffect = (animalItemPayout) => {
    return animalItemPayout + 100; // Boosts payouts for animal-themed items by $100
};

// Effect for Urban Jungle Seal
window.itemEffects.urbanJungleSealEffect = (animalItemPayout) => {
    return animalItemPayout + 300; // Boosts payouts for animal-themed items by $300
};

// Effect for Hustler's Reroll Certificate
window.itemEffects.hustlersRerollCertificateEffect = (rerollCount) => {
    return rerollCount + 1; // Grants one free reroll per phase
};

// Effect for Dice Manipulator's Badge
window.itemEffects.diceManipulatorsBadgeEffect = (rerollCount) => {
    return rerollCount + 2; // Grants two free rerolls per phase
};

// Effect for Splicer's Fool
window.itemEffects.splicersFoolEffect = (lastSplicer) => {
    return lastSplicer ? { ...lastSplicer } : null; // Creates a copy of the last Splicer used during this run (excluding Splicer's Fool)
};

// Effect for Magician's Splice
window.itemEffects.magiciansSpliceEffect = (diceFaces) => {
    const luckyFaces = diceFaces.slice(0, 2).map(face => ({ ...face, type: 'Lucky' }));
    return luckyFaces; // Enhances 2 selected dice faces to Lucky Faces
};

// Effect for High Splicer
window.itemEffects.highSplicerEffect = (availableSlots) => {
    return availableSlots >= 2 ? ["Bonus Face 1", "Bonus Face 2"] : []; // Adds up to 2 random bonus dice faces
};

// Effect for Empress's Edge
window.itemEffects.empresssEdgeEffect = (diceFaces) => {
    const multiplierFaces = diceFaces.slice(0, 2).map(face => ({ ...face, type: 'Multiplier' }));
    return multiplierFaces; // Enhances 2 selected dice faces to Multiplier Faces
};

// Effect for Emperor's Crown
window.itemEffects.emperorsCrownEffect = (availableSlots) => {
    return availableSlots >= 2 ? ["Splicer Die 1", "Splicer Die 2"] : []; // Adds up to 2 random Splicer dice
};

// Effect for Hierophant's Blessing
window.itemEffects.hierophantsBlessingEffect = (diceFaces) => {
    const bonusFaces = diceFaces.slice(0, 2).map(face => ({ ...face, type: 'Bonus' }));
    return bonusFaces; // Enhances 2 selected dice faces to Bonus Faces
};

// Effect for Lover's Connection
window.itemEffects.loversConnectionEffect = (diceFace) => {
    return { ...diceFace, type: 'Wild' }; // Enhances 1 selected dice face into a Wild Face
};

// Effect for Chariot's Charge
window.itemEffects.chariotsChargeEffect = (diceFace) => {
    return { ...diceFace, type: 'Steel' }; // Enhances 1 selected dice face into a Steel Face
};

// Effect for Justice's Balance
window.itemEffects.justicesBalanceEffect = (diceFace) => {
    return { ...diceFace, type: 'Glass', payoutMultiplier: 2 }; // Enhances 1 selected dice face into a Glass Face with doubled payouts
};

// Effect for Hermit's Treasure
window.itemEffects.hermitsTreasureEffect = (currentRoll) => {
    return Math.min(currentRoll * 2, 5000); // Doubles money earned from the next roll (Max $5000)
};

// Effect for Wheel of Splice
window.itemEffects.wheelOfSpliceEffect = (diceFaces) => {
    const randomFace = diceFaces[Math.floor(Math.random() * diceFaces.length)];
    if (Math.random() < 0.25) {
        randomFace.type = Math.random() > 0.5 ? 'Holographic' : 'Polychrome';
    }
    return randomFace; // 1 in 4 chance to add Holographic or Polychrome effects to a random dice face
};

// Effect for Splicer's Strength
window.itemEffects.splicersStrengthEffect = (diceFaces) => {
    return diceFaces.slice(0, 2).map(face => ({ ...face, value: face.value + 1 })); // Increases the value of up to 2 selected dice faces by 1 rank
};

// Effect for Hanged Splice
window.itemEffects.hangedSpliceEffect = (diceFaces) => {
    return diceFaces.slice(0, 2).map(face => null); // Removes up to 2 selected dice faces from the set
};

// Effect for Splicer's Rebirth
window.itemEffects.splicersRebirthEffect = (fromFace, toFace) => {
    return { ...fromFace, ...toFace }; // Converts one dice face into another
};

// Effect for Temperance's Touch
window.itemEffects.temperancesTouchEffect = (hustlers) => {
    return Math.min(hustlers.reduce((total, hustler) => total + hustler.sellValue, 0), 5000); // Gives cash equal to the sell value of all current Hustlers (Max $5000)
};

// Effect for Devil's Gambit
window.itemEffects.devilsGambitEffect = (diceFace) => {
    return { ...diceFace, type: 'Gold', payoutMultiplier: 3 }; // Enhances 1 selected dice face into a Gold Face
};

// Effect for Tower's Might
window.itemEffects.towersMightEffect = (diceFace) => {
    return { ...diceFace, type: 'Stone', static: true }; // Enhances 1 selected dice face into a Stone Face, unbreakable but static
};

// Effect for Splicer's Star
window.itemEffects.splicersStarEffect = (diceFaces) => {
    return diceFaces.slice(0, 3).map(face => ({ ...face, type: 'Diamond' })); // Converts up to 3 selected dice faces into Diamond Faces
};

// Effect for Moonlit Splice
window.itemEffects.moonlitSpliceEffect = (diceFaces) => {
    return diceFaces.slice(0, 3).map(face => ({ ...face, type: 'Club' })); // Converts up to 3 selected dice faces into Club Faces
};

// Effect for Sunlit Splice
window.itemEffects.sunlitSpliceEffect = (diceFaces) => {
    return diceFaces.slice(0, 3).map(face => ({ ...face, type: 'Heart' })); // Converts up to 3 selected dice faces into Heart Faces
};

// Effect for Judgement's Gift
window.itemEffects.judgementsGiftEffect = (availableSlots) => {
    return availableSlots > 0 ? ['Bonus Dice Face'] : []; // Creates a random bonus dice face
};

// Effect for Splicer's World
window.itemEffects.splicersWorldEffect = (diceFaces) => {
    return diceFaces.slice(0, 3).map(face => ({ ...face, type: 'Spade' })); // Converts up to 3 selected dice faces into Spade Faces
};

// HackDie Implants List

// Effect for Shooter's Edge
window.itemEffects.shootersEdgeEffect = (roll) => {
    return roll === 7 || roll === 11 ? 500 : 50; // Adds $500 for rolling a 7 or 11, base bonus $50 per roll
};

// Effect for Back Alley Boost
window.itemEffects.backAlleyBoostEffect = (roll, pointNumber) => {
    return roll === pointNumber ? 150 : 100; // Adds $150 for hitting the point number, base bonus $100 per roll
};

// Effect for Underground Double
window.itemEffects.undergroundDoubleEffect = (matches) => {
    return matches * 200; // Adds $200 for each repeated hit on point numbers
};

// Effect for Triple Roll Hustle
window.itemEffects.tripleRollHustleEffect = (streak) => {
    return streak >= 3 ? (streak * 200) + (streak * 2) : 0; // Adds $200 per roll with +2 Mult for streaks of 3 successful rolls
};

// Effect for Street Shooter's Streak
window.itemEffects.streetShootersStreakEffect = (highValues) => {
    return highValues >= 3 ? 300 + (highValues * 3) : 0; // Adds $300 and +3 Mult for consecutive high values (e.g., 4, 5, 6)
};

// Effect for Flush Hustler's Cut
window.itemEffects.flushHustlersCutEffect = (matchingFaces) => {
    return matchingFaces * 150 + (matchingFaces * 2); // Boosts payouts for consecutive matching dice faces
};

// Effect for Point Protector
window.itemEffects.pointProtectorEffect = (protectedRolls) => {
    return protectedRolls * 250 + (protectedRolls * 2); // Adds $250 per successful roll with +2 Mult
};

// Effect for Corner Shot Hustler
window.itemEffects.cornerShotHustlerEffect = (criticalRolls) => {
    return criticalRolls * 300 + (criticalRolls * 3); // Maximizes payouts for repeating critical rolls
};

// Effect for Royal Shooter
window.itemEffects.royalShooterEffect = (highCombinationRolls) => {
    return highCombinationRolls * 400 + (highCombinationRolls * 4); // Adds $400 with +4 Mult for rolling high-value combinations
};

// Effect for Hustler's Dream
window.itemEffects.hustlersDreamEffect = (streak) => {
    return streak >= 5 ? (streak * 350) + (streak * 3) : 0; // Adds $350 and +3 Mult for 5 consecutive successful rolls
};

// Effect for Jackpot Roller
window.itemEffects.jackpotRollerEffect = (streak) => {
    return streak >= 3 ? (streak * 400) + (streak * 4) : 0; // Adds $400 with +4 Mult for high-value streaks
};

// Effect for Dice Master's Hustle
window.itemEffects.diceMastersHustleEffect = (criticalRolls) => {
    return criticalRolls * 500 + (criticalRolls * 3); // Adds $500 with +3 Mult for rolling exceptional values
};

