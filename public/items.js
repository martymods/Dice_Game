const availableItems = [
    { name: 'Loaded Dice 🎲', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3, giving you an edge against other players.' },
    { name: 'Forged Papers 📜', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.' },
    { name: 'Old Gang Leader’s Blade 🔪', rarity: 'Very Rare', cost: 200, description: 'Yields +9 coins each spin. Loses 1 DreamCoin for each duplicate symbol.' },
    { name: 'Neighborhood OG\'s Manual 📘', rarity: 'Rare', cost: 150, description: 'Boosts payouts for specific symbols like Thief, Loan Shark, Hustler, Informant.' },
    { name: 'Barrel of Hustlers 🛢️', rarity: 'Uncommon', cost: 180, description: 'Destroy to add 7 Street Hustlers to your crew.' },
    { name: 'Big Dreamer’s Bomb 💣', rarity: 'Uncommon', cost: 250, description: 'Destroy this item to choose 4 hustle-based symbols to add.' },
    { name: 'Pigeon Coop 🐦', rarity: 'Common', cost: 80, description: 'Boosts payouts for Pigeons, Rats, and Street Snitches.' },
    { name: 'Black Cat Amulet 🐈‍⬛', rarity: 'Uncommon', cost: 120, description: 'Grants +9 DreamCoins whenever you gain a multiple of 13.' },
    { name: 'Street Pepper 🌶️', rarity: 'Common', cost: 30, description: 'Yields DreamCoins +1 whenever a hustle is destroyed.' },
    { name: 'Marked Suits ♠️♥️', rarity: 'Common', cost: 90, description: 'After 7 rounds, destroy this to add a Club and Spade to your deck, rigged for payout.' },
    { name: "Counterfeit Ace", rarity: "Common", description: "Clubs and Spades give $1 more when paired with Diamonds and Hearts. Diamonds and Hearts give $1 more when near Clubs and Spades.", cost: 50 },
    { name: "Street Adoption Papers", rarity: "Common", description: "Burn this contract and recruit 3 hustlers to your crew.", cost: 100 },
    { name: "Street Aviary", rarity: "Common", description: "Magpie, Chick, Goose, Owl, Street Chicken, Crow, and Dove bring in an extra $1.", cost: 80 },
    { name: "Brown Pay Bump", rarity: "Common", description: "Earn $1 every time you add a hustler to your operation.", cost: 70 },
    { name: "Unmarked Bills", rarity: "Common", description: "Burn to instantly add $5.", cost: 30 },
    { name: "Pocket Burner", rarity: "Common", description: "Earn $1 every time you torch a hustler or a piece of gear.", cost: 60 },
    { name: "Duffel of Dwarves", rarity: "Uncommon", description: "Smash it open to summon seven beer-guzzling Dwarves to your crew.", cost: 120 },
    { name: "Big Symbol Stash", rarity: "Uncommon", description: "Pop it open to select 4 hustlers or items for your operation.", cost: 150 },
    { name: "Lucky Black Cat", rarity: "Uncommon", description: "Scores $9 anytime you land on a multiple of 13. Cats earn double payouts.", cost: 200 },
    { name: "Sticky Fingers", rarity: "Uncommon", description: "Every roll steals $1 from an opponent's total in multiplayer mode.", cost: 100 },
    { name: "Corrupted Cufflinks", rarity: "Uncommon", description: "If equipped, grants $3 but adds a chance to randomly destroy items in your inventory.", cost: 140 },
    { name: "Hustler's Degree", rarity: "Rare", description: "Boosts payouts by $1 for various hustlers.", cost: 250 },
    { name: "Booster Deck", rarity: "Rare", description: "Crack it open to pick 4 common, 3 uncommon, and 1 rare hustler or item.", cost: 300 },
    { name: "Rusty Revolver", rarity: "Rare", description: "Shoots 1 random hustler, removing them from the game, and nets $15.", cost: 220 },
    { name: "Shady Deal Contract", rarity: "Rare", description: "Destroy this to double the payout of all hustlers for the next 5 rolls.", cost: 280 },
    { name: "Urban Jungle", rarity: "Rare", description: "Boosts the payout of animal hustlers (Cat, Dog, Crow, etc.) by $2 per roll.", cost: 260 },
    { name: "Ancient Switchblade", rarity: "Very Rare", description: "Nets $9 per roll. Loses $1 for every repeat hustler in your squad. Can't drop below $0.", cost: 500 },
    { name: "Collector’s Charm", rarity: "Very Rare", description: "Doubles the payouts of all rare and very rare hustlers and items in your squad.", cost: 550 },
    { name: "Dice Collector’s Safe", rarity: "Very Rare", description: "Grants $15 but prevents you from acquiring more dice.", cost: 600 },
    { name: "High Roller’s Jacket", rarity: "Very Rare", description: "Triples the effect of all common items in your inventory.", cost: 700 },
    { name: "Dice Coder’s Toolkit", rarity: "Very Rare", description: "Instantly creates a custom dice with up to 3 faces of your choosing.", cost: 800 }
  
    
];
// Export the items array for use in app.js
if (typeof module !== "undefined") {
    module.exports = items;
  }