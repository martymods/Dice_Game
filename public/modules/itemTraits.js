const TRAIT_DESCRIPTIONS = {
    SevenHeaven: 'Adds +0.50x multiplier per stack when the dice total is exactly 7.',
    ElevenEdge: 'Adds $50 per stack when the dice total is 11.',
    SnakeEyesTax: 'Subtracts $20 per stack on snake eyes (sum of 2).',
    CrapOutCurse: 'Reduces winnings by -0.25x per stack on sums of 3 or 12.',
    WinBooster: 'Adds +0.10x multiplier per stack on winning rolls.',
    LossSiphon: 'Pays out $15 per stack when you lose a roll.',
    AnimalPack: 'Pays $5 per stack on every roll, representing animal upkeep.',
    BlingChain: 'Pays $1 per stack every resolve plus $5 per stack on doubles.',
    CriminalRing: 'Adds +0.05x multiplier per stack when the sum is above 6.',
    PrimeSight: 'Adds +0.15x multiplier per stack when the sum is prime (2, 3, 5, 7, 11).',
    EvenFlow: 'Pays $10 per stack on even totals.',
    OddJob: 'Pays $10 per stack on odd totals.',
    HighRoller: 'Adds +0.20x multiplier per stack on sums of 10 or higher.',
    LowBall: 'Adds +0.20x multiplier per stack on sums of 4 or lower.',
    DoubleVision: 'Pays $25 per stack whenever doubles are rolled.',
    RerollToken: 'Grants a reroll token per stack after each resolve.',
    DestroyCash: 'Pays $20 per stack when an item is destroyed.',
    StealOnResolve: 'Adds $15 per stack after each resolve (steals in multiplayer, bonus in solo).',
    RiskyInterest: 'Pays interest based on current balance but charges $10 per stack on losses.',
    ItemDevourer: 'Adds +0.10x multiplier per stack on every resolve.',
    GlassJackpot: 'Adds +0.75x multiplier per stack on wins but risks breaking afterwards.',
    CommonCountBoost: 'Pays $1 per stack for every Common item you currently own.',
    SequenceBonus: 'Adds +0.30x multiplier per stack when the dice show consecutive numbers.',
    LastTurnBoom: 'Adds +1.00x multiplier per stack every 10th roll.',
    StreakWin: 'Adds +0.50x multiplier per stack while on a 3+ win streak.',
    StreakLoseRelief: 'Pays $50 per stack after two consecutive losses.',
    HighCostHighGain: 'Adds +0.25x multiplier per stack on sums of 9 or higher.',
    OpponentHurt: 'Pays $25 per stack when an opponent loses (solo fallback: bonus cash).',
    PredictMatch: 'Pays $50 per stack when your prediction matches the dice total.',
    JackpotNine: 'Pays $9000 per stack on a total of 9.',
    ShopAddict: 'Every third purchased item adds +0.10x multiplier per stack on the next resolve.',
    SacrificeEngine: '20% chance to consume a Common item after resolve and grant $100 per stack.',
    DebtBond: 'Front-loads cash but subtracts $20 per stack for the next five resolves.',
};

const mapping = new Map();

function assignTrait(names, traits) {
    if (!Array.isArray(names)) return;
    names.forEach(name => {
        if (!mapping.has(name)) {
            mapping.set(name, []);
        }
        const list = mapping.get(name);
        traits.forEach(trait => {
            if (!list.includes(trait)) {
                list.push(trait);
            }
        });
    });
}

assignTrait(['Loaded Dice'], ['SevenHeaven', 'ElevenEdge', 'WinBooster']);
assignTrait(['Forged Papers'], ['ShopAddict']);
assignTrait(['Old Gang Leaders Blade'], ['WinBooster']);
assignTrait(['Neighborhood OGs Manual'], ['CommonCountBoost']);
assignTrait(['Barrel of Hustlers'], ['DestroyCash']);
assignTrait(['Big Dreamers Bomb'], ['LastTurnBoom']);
assignTrait(['Pigeon Coop'], ['WinBooster']);
assignTrait(['Black Cat Amulet'], ['JackpotNine']);
assignTrait(['Street Pepper'], ['DestroyCash']);
assignTrait(['Street Adoption Papers'], ['ShopAddict']);
assignTrait(['Brown Pay Bump'], ['AnimalPack']);
assignTrait(['Unmarked Bills'], ['RiskyInterest']);
assignTrait(['Pocket Burner'], ['DestroyCash']);
assignTrait(['Big Symbol Stash'], ['SequenceBonus']);
assignTrait(['Lucky Black Cat'], ['OddJob', 'JackpotNine']);
assignTrait(['Sticky Fingers'], ['StealOnResolve']);
assignTrait(['Corrupted Cufflinks'], ['GlassJackpot']);
assignTrait(['Hustlers Degree'], ['EvenFlow']);
assignTrait(['Booster Deck'], ['SequenceBonus', 'LastTurnBoom']);
assignTrait(['Rusty Revolver'], ['DestroyCash', 'LowBall']);
assignTrait(['Shady Deal Contract'], ['StreakWin']);
assignTrait(['Urban Jungle'], ['AnimalPack', 'WinBooster']);
assignTrait(['Ancient Switchblade'], ['HighRoller']);
assignTrait(['Collectors Charm'], ['HighCostHighGain', 'GlassJackpot']);
assignTrait(['High Rollers Jacket'], ['HighRoller', 'BlingChain']);
assignTrait(['Dice Coders Toolkit'], ['PredictMatch']);
assignTrait(['Pickpocket', 'Grifter', 'Skimmer', 'Pickpocket Apprentice'], ['StealOnResolve']);
assignTrait(['Gold-Toothed Grin', 'Street Gold Chain'], ['BlingChain']);
assignTrait(['Loan Officer', 'Loan Sharks Ledger', 'Loan Shark', 'Illegal Loan Dealer'], ['DebtBond']);
assignTrait(['Pawn Shop Clerk', 'Pawn Broker', 'Shady Pawnshop Owner'], ['CommonCountBoost']);
assignTrait(['Dirty Cop', 'Undercover Cop', 'Fake Bail Bondsman'], ['OpponentHurt']);
assignTrait(['Greedy Bartender', 'Street Food Vendor', 'Fast Cash Courier', 'Street Preacher', 'Street Artist'], ['OddJob']);
assignTrait(['Cursed Dice', 'Haunted Die', 'Shifty Gambler'], ['GlassJackpot', 'LowBall']);
assignTrait(['Gamblers Token', 'Gambling Addicts Coin'], ['RiskyInterest']);
assignTrait(['Dumpster Diver', 'Dumpster Scavenger', 'Urban Scavenger', 'Junk Trader'], ['DestroyCash']);
assignTrait(['Getaway Driver'], ['HighRoller']);
assignTrait(['Dice Masters Gloves', 'Dice Manipulator', 'Hustlers Reroll Certificate', 'Dice Forger'], ['RerollToken']);
assignTrait(['Counterfeit Coin', 'Counterfeiter', 'Counterfeit Artist'], ['BlingChain', 'SnakeEyesTax']);
assignTrait(['Money Launderer', 'Money Mule'], ['RiskyInterest', 'ShopAddict']);
assignTrait(['Lucky Horseshoe', 'Card Counter'], ['DoubleVision']);
assignTrait(['Gold-Plated Dice', 'Dice Dealer'], ['HighRoller', 'DoubleVision']);
assignTrait(['Crime Syndicate', 'Street Dealer', 'Illegal Arms Dealer'], ['CriminalRing']);
assignTrait(['Insider Trader', 'Street Economist'], ['HighCostHighGain']);
assignTrait(['Snake Oil Salesman', 'Snake Charmer', 'Street Charmer'], ['PrimeSight', 'OddJob']);
assignTrait(['Cracked Dice', 'Corner Hustler'], ['LowBall', 'LossSiphon']);
assignTrait(['Gutter Stash'], ['LowBall']);
assignTrait(['Snitchs Phone', 'Street Snitch', 'Blackmail Specialist'], ['OpponentHurt']);
assignTrait(['Roll Modder', 'Dice Shark'], ['HighRoller']);
assignTrait(['Broken ATM'], ['RiskyInterest']);
assignTrait(['Crime Family Cookbook', 'Gangland Accountant'], ['CommonCountBoost']);
assignTrait(['Silent Alarm', 'Street Lawyer', 'Blackout Expert', 'The Enforcer'], ['StreakLoseRelief']);
assignTrait(['Junkyard Jackpot', 'Pawned Off'], ['DestroyCash']);
assignTrait(['One-Armed Bandit', 'Fake Casino Dealer', 'Street Gambler', 'Roulette Hustler', 'Late Night Gambler'], ['HighRoller', 'WinBooster']);
assignTrait(['Stacked Wallet', 'Side Hustle Manager'], ['CommonCountBoost']);
assignTrait(['Back Alley Bookie', 'Back Alley Bookie (📖)'], ['SevenHeaven', 'ElevenEdge']);
assignTrait(['Street Magician', 'Street Magician (🎩)'], ['SequenceBonus', 'PredictMatch']);
assignTrait(['Black Market Dealer', 'Fast Talker'], ['ShopAddict']);
assignTrait(['Fake ID Maker'], ['RerollToken', 'StreakLoseRelief']);
assignTrait(['Bouncer'], ['StreakLoseRelief']);
assignTrait(['Shady Accountant', 'Fake Landlord', 'Shady Landlord', 'Midnight Courier'], ['RiskyInterest']);
assignTrait(['Graffiti Artist', 'Street DJ', 'Rooftop Courier'], ['HighRoller']);
assignTrait(['Street Racer', 'Street Muscle'], ['HighRoller', 'StreakWin']);
assignTrait(['Con Artist'], ['StealOnResolve', 'ShopAddict']);
assignTrait(['Pigeon Trainer'], ['AnimalPack']);
assignTrait(['Ruthless Collector', 'Sly Saboteur'], ['DestroyCash', 'StealOnResolve']);
assignTrait(['Illegal Fireworks'], ['HighRoller', 'EvenFlow']);
assignTrait(['Fixer', 'Underground Mechanic', 'Back Alley Mechanic'], ['StreakLoseRelief']);
assignTrait(['Hustler’s Union', 'Hustlers Union'], ['WinBooster']);
assignTrait(['Card Counter (Rare)'], ['DoubleVision']);
assignTrait(['Street Philosopher'], ['PredictMatch']);
assignTrait(['Mad Inventor', 'Backdoor Hacker'], ['HighCostHighGain', 'RerollToken']);
assignTrait(['Shady Lawyer'], ['StreakLoseRelief', 'WinBooster']);
assignTrait(['Street Scam Artist'], ['OddJob']);
assignTrait(['Fast Cash Courier'], ['LowBall']);
assignTrait(['Fake Lotto Vendor'], ['HighRoller']);
assignTrait(['Street Chemist'], ['LastTurnBoom']);
assignTrait(['Underground King'], ['RiskyInterest', 'HighCostHighGain']);
assignTrait(['Puppet Master'], ['StreakWin']);
assignTrait(['Shakedown Specialist'], ['OpponentHurt']);
assignTrait(['Lucky Scoundrel'], ['OddJob', 'SevenHeaven']);
assignTrait(['High-Stakes Broker'], ['HighRoller', 'LastTurnBoom']);
assignTrait(['Corner Lookout'], ['LowBall']);
assignTrait(['Bodega Schemer'], ['LastTurnBoom']);
assignTrait(['Pawn King'], ['WinBooster', 'HighCostHighGain']);
assignTrait(['Alleyway Hustler', 'Even Steven', 'Odd Todd', 'Pattern Hustler', 'Smiley Face Buffoon'], ['SequenceBonus', 'OddJob']);
assignTrait(['Square Hustler'], ['EvenFlow']);
assignTrait(['Photograph Hustler'], ['WinBooster']);
assignTrait(['Superposition Hustler'], ['DoubleVision']);
assignTrait(['Shortcut Hustler', 'Juggler'], ['RerollToken']);
assignTrait(['Rocket Booster'], ['DoubleVision', 'WinBooster']);
assignTrait(['Cursed Hustler'], ['GlassJackpot']);
assignTrait(['Getaway Driver (Rare Hustler)'], ['HighRoller']);
assignTrait(['The Trio'], ['LowBall']);
assignTrait(['Dice Master'], ['PredictMatch', 'RerollToken']);
assignTrait(['Glass Ball'], ['GlassJackpot']);
assignTrait(['Onyx Agate'], ['PrimeSight']);
assignTrait(['Dice Masters Gloves'], ['RerollToken']);
assignTrait(['Rocket Booster'], ['DoubleVision', 'WinBooster']);
assignTrait(['Point Protector'], ['EvenFlow']);
assignTrait(['Street Adoption Papers'], ['ShopAddict']);
assignTrait(['Money Mule'], ['ShopAddict']);
assignTrait(['Street Food Vendor'], ['OddJob']);
assignTrait(['Street Dealer'], ['CriminalRing']);
assignTrait(['Illegal Loan Dealer'], ['DebtBond']);
assignTrait(['Loan Sharks Ledger'], ['DebtBond']);
assignTrait(['Street Adoption Papers'], ['ShopAddict']);
assignTrait(['Loan Officer'], ['DebtBond']);
assignTrait(['Street Adoption Papers'], ['ShopAddict']);

export const TRAIT_DEFINITIONS = TRAIT_DESCRIPTIONS;

export function getItemTraits(name) {
    const traits = mapping.get(name);
    return traits ? traits.slice() : [];
}

export const ITEM_TRAIT_MAPPING = mapping;

export const SPECIAL_ITEM_HANDLERS = {
    'Collectors Charm': ({ removeMatching, engine }) => {
        const removed = removeMatching(item => (item.rarity || '').toLowerCase() === 'common', 1, 'Collectors Charm tribute');
        if (removed.length) {
            engine.applyItem('Collectors Charm');
            return ['Consumes one Common item to gain an extra charm stack.'];
        }
        return ['No Common item available, so no bonus stack added.'];
    },
    'High Rollers Jacket': ({ removeMatching, engine }) => {
        const removed = removeMatching(item => (item.rarity || '').toLowerCase() === 'uncommon', 1, 'High Rollers Jacket tribute');
        if (removed.length) {
            engine.applyItem('High Rollers Jacket');
            return ['Consumes one Uncommon item to double down on the jacket power.'];
        }
        return ['No Uncommon item available, so the jacket stays at one stack.'];
    },
};

export const DEBT_BOND_TRAIT = 'DebtBond';
