// Import Modules
import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats, updateWinStreak, resetWinStreak } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects, updateHustlerUI } from './modules/hustlers.js';
import { updateUI, showItemPopup } from './modules/ui.js';

// Fire Status
let winStreak = 0; // Current winning streak
let playerHasPurchased = false; // Tracks if player bought from the shop
let onFire = false; // Determines if the dice are "on fire"
let fireSound; // Sound effect for "on fire"
let hustlerInventory = []; // Player's hustlers

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    // Initialize game mode
    if (urlParams.has('stats')) {
        displayStats();
    } else if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.log('No specific game mode detected. Defaulting to Main Menu.');
    }

    initializeModals();
});

// Helper to format time
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

// Helper to show a flash effect
function flashScreen(color) {
    const body = document.body;
    const originalColor = getComputedStyle(body).backgroundColor;

    body.style.transition = 'background-color 0.2s ease';
    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.transition = 'background-color 0.5s ease';
        body.style.backgroundColor = originalColor;
    }, 200);
}

// Helper to play a sound
function playSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);
    audio.play().catch(err => console.error('Audio play error:', err));
}

// Helper to get random items
function getRandomItems(list, count) {
    return list.sort(() => Math.random() - 0.5).slice(0, count);
}
// Add a hustler to inventory
function addHustlerToInventory(hustler) {
    if (hustlerInventory.length >= 5) {
        alert('You can only hold 5 Hustlers at a time. Discard one to make space.');
        return;
    }
    hustlerInventory.push(hustler);
    updateHustlerInventoryUI();
}

// Apply effects of active hustlers
function applyHustlerEffects(roll1, roll2) {
    let multiplier = 1;
    let cashBonus = 0;

    hustlerInventory.forEach(hustler => {
        if (hustler.name === 'Joker') multiplier += 2;
        if (hustler.name === 'Greedy Joker' && roll1 + roll2 > 6) cashBonus += 5;
        if (hustler.name === 'Wrathful Joker' && roll1 + roll2 < 4) multiplier += 3;
    });

    return { multiplier, cashBonus };
}

// Update hustler inventory UI
function updateHustlerInventoryUI() {
    const hustlerList = document.getElementById('hustler-list');
    const hustlerEffectElement = document.getElementById('hustler-effects');
    const hustlerCountElement = document.getElementById('hustler-count');
    const maxHustlers = 5;

    hustlerList.innerHTML = '';
    hustlerInventory.forEach((hustler, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${hustler.name} (${hustler.description}) 
                        <button onclick="discardHustler(${index})">Discard</button>`;
        hustlerList.appendChild(li);
    });

    hustlerEffectElement.textContent = hustlerInventory.map(hustler => hustler.effect).join(', ') || 'None';
    hustlerCountElement.textContent = `Max Hustlers: ${hustlerInventory.length}/${maxHustlers}`;
}

// Discard a hustler from inventory
function discardHustler(index) {
    hustlerInventory.splice(index, 1);
    updateHustlerInventoryUI();
}
// Open the shop
function openShop() {
    playerHasPurchased = false;
    renderShop();
}

// Render shop items
function renderShop() {
    const shopArea = document.getElementById("shop-area");
    const shopItems = document.getElementById("shop-items");
    shopItems.innerHTML = '';

    const randomHustlers = getRandomItems(
        window.itemsList.filter(item => item.type === "hustler"),
        3
    );

    const randomItems = getRandomItems(
        window.itemsList.filter(item => item.type === "item"),
        3
    );

    [...randomHustlers, ...randomItems].forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("shop-item");
        itemElement.textContent = `${item.name} - $${item.cost}`;
        itemElement.onclick = () => handlePurchase(item);
        shopItems.appendChild(itemElement);
    });

    shopArea.style.display = "block";
}

// Handle item purchase
function handlePurchase(item) {
    if (playerHasPurchased) {
        alert('You can only purchase one item or hustler per shop visit!');
        return;
    }

    if (balance >= item.cost) {
        balance -= item.cost;
        alert(`You purchased ${item.name}!`);
        addItemToInventory(item);
        playerHasPurchased = true;

        const shopContainer = document.getElementById('shop-container');
        shopContainer.style.display = 'none';
        updateUI();
    } else {
        alert('Not enough money to make this purchase.');
    }
}

// Add item to inventory
function addItemToInventory(item) {
    if (item.type === 'hustler') {
        hustlerInventory.push(item);
    } else {
        items.push(item);
    }
}
// Handle rolling the dice
function handleRollDice() {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    const gameContainer = document.getElementById('game-container');
    const diceContainer = document.getElementById('dice-container');
    gameContainer.classList.add('dimmed');
    diceContainer.classList.add('dimmed-dice');

    playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    const { multiplier, cashBonus } = applyHustlerEffects(dice1, dice2);

    animateDice(dice1, dice2, () => {
        playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);

        let winnings = 0;
        if (sum === 7 || sum === 11) {
            winnings = currentBet * 2 * multiplier + cashBonus;
            balance += winnings;
            gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            playSound("/sounds/Winner_0.ogg");
            flashScreen('gold');
            showWinningAmount(winnings);
            playerStats.totalMoneyWon += winnings;
            saveStats();

            winStreak++;
            if (winStreak >= 3 && !onFire) activateOnFire();
        } else if (sum === 2 || sum === 3 || sum === 12) {
            balance -= currentBet;
            gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            playSound("/sounds/Loser_0.ogg");
            flashScreen('red');
            showLosingAmount(currentBet);

            playerStats.totalMoneyLost += currentBet;
            saveStats();
            winStreak = 0;
            if (onFire) deactivateOnFire();
        } else {
            balance += cashBonus;
            gameStatus.textContent = `Roll: ${sum}. Multiplier: ${multiplier}x. Bonus: $${cashBonus}`;
        }

        currentBet = 0;
        updateUIAfterRoll();

        setTimeout(() => {
            gameContainer.classList.remove('dimmed');
            diceContainer.classList.remove('dimmed-dice');
        }, 1000);
    });
}

// Activate "on fire" mode
function activateOnFire() {
    onFire = true;
    playSound("/sounds/FireIgnite0.ogg");
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');
    dice1Element.src = '/images/DiceFire1.gif';
    dice2Element.src = '/images/DiceFire2.gif';

    dice1Element.classList.add('dice-fire');
    dice2Element.classList.add('dice-fire');

    fireSound = new Audio('/sounds/FireBurn0.ogg');
    fireSound.loop = true;
    fireSound.play().catch(err => console.error('Error playing fire burn sound:', err));

    gameStatus.textContent = "🔥 You're on fire! All winnings are doubled! 🔥";
}

// Deactivate "on fire" mode
function deactivateOnFire() {
    onFire = false;
    playSound("/sounds/FireEnd0.ogg");
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');
    dice1Element.src = '/images/dice1.png';
    dice2Element.src = '/images/dice2.png';

    dice1Element.classList.remove('dice-fire');
    dice2Element.classList.remove('dice-fire');

    if (fireSound) {
        fireSound.pause();
        fireSound = null;
    }

    gameStatus.textContent = "🔥 Fire has ended. Good luck! 🔥";
}
// Update the UI
function updateUI() {
    document.getElementById('betting-status').textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    document.getElementById('rent-status').textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;

    const activeEffects = hustlerInventory.map(hustler => hustler.effect).join(', ');
    const effectElement = document.getElementById('hustler-effects');
    effectElement.textContent = activeEffects || 'None';
}

// Place a bet
function handlePlaceBet() {
    playSound("/sounds/UI_Click1.ogg");

    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert('Invalid bet amount.');
    } else {
        currentBet = betAmount;
        updateUI();
    }
}

// Set bet percentages
function setBet(amount) {
    if (amount > balance) amount = balance;
    currentBet = Math.floor(amount);
    updateUI();
}

// Add event listeners for percentage buttons
document.getElementById('bet25Button').addEventListener('click', () => {
    playSound('/sounds/UI_Click1.ogg');
    setBet(balance * 0.25);
});

document.getElementById('bet50Button').addEventListener('click', () => {
    playSound('/sounds/UI_Click1.ogg');
    setBet(balance * 0.5);
});

document.getElementById('bet100Button').addEventListener('click', () => {
    playSound('/sounds/UI_Click1.ogg');
    setBet(balance);
});
// Update UI and handle roll progression
function updateUIAfterRoll() {
    updateUI();
    turns++;

    const rentPaidStatements = [
        "Well done! You paid the rent. But success has its price—the rent just went up!",
        "Congratulations on keeping up! I knew you could handle more, so I raised the rent!",
        "Impressive! You’ve survived another month. Let’s see if you can handle next month’s new rent.",
        "Good job paying the rent! But comfort is costly—your rent just increased.",
        "You did it! The rent’s paid. Now let’s see how you handle my latest adjustment.",
    ];

    const voiceClips = [
        "/sounds/Lord_voice_0.ogg",
        "/sounds/Lord_voice_1.ogg",
        "/sounds/Lord_voice_2.ogg",
    ];

    const rollsRemaining = maxTurns - turns;
    if (rollsRemaining > 0) {
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsRemaining} rolls`;
    } else {
        if (balance >= rent) {
            balance -= rent;
            rent *= progression <= 9 ? 4 : 5;
            maxTurns++;
            progression++;
            turns = 0;

            playerStats.totalDaysPassed += 30;
            playerStats.monthsUnlocked = Math.max(playerStats.monthsUnlocked, progression);
            saveStats();

            const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
            playSound(randomClip);

            const randomStatement = rentPaidStatements[Math.floor(Math.random() * rentPaidStatements.length)];
            alert(randomStatement);

            openShop();
        } else {
            handleGameOver();
        }
    }

    if (balance <= 0) {
        handleGameOver();
    }
}
// Handle game over scenario
function handleGameOver() {
    const gameEndTime = Date.now();
    const timePlayed = Math.floor((gameEndTime - gameStartTime) / 1000);
    playerStats.totalTimePlayed += timePlayed;
    playerStats.evictions++;
    playerStats.currentWinStreak = 0;
    saveStats();

    flashScreen('red');
    playSound('/sounds/Death0.ogg');

    const gameOverContainer = document.getElementById('gameOverContainer');
    gameOverContainer.style.display = 'block';

    hideGameUI();
}

// Hide main game UI on game over
function hideGameUI() {
    document.getElementById('rollButton').style.display = 'none';
    document.getElementById('betButton').style.display = 'none';
    document.getElementById('bet25Button').style.display = 'none';
    document.getElementById('bet50Button').style.display = 'none';
    document.getElementById('bet100Button').style.display = 'none';
    document.getElementById('betting-status').style.display = 'none';
    document.getElementById('rent-status').style.display = 'none';
    document.getElementById('inventory-list').style.display = 'none';
}

// Handle game win
function handleGameWin() {
    playerStats.gamesWon++;
    playerStats.currentWinStreak++;
    playerStats.longestWinStreak = Math.max(playerStats.longestWinStreak, playerStats.currentWinStreak);
    saveStats();
}
// Toggle shop visibility
function toggleShop(open) {
    const shopArea = document.getElementById("shop-area");
    shopArea.classList.toggle("active", open);
}

// Close the shop after purchase
document.getElementById('saveMoneyButton').addEventListener('click', () => {
    toggleShop(false);
});
let provider;
let signer;

// Connect to MetaMask
export async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected wallet:", address);

        localStorage.setItem("connectedWallet", address);
        alert(`Connected wallet: ${address}`);
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}

// Place a bet using ETH
export async function placeBet(betAmountETH) {
    if (!signer) {
        alert("Please connect your MetaMask wallet first.");
        return;
    }

    const betAmount = parseFloat(betAmountETH);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Invalid bet amount.");
        return;
    }

    const transaction = await signer.sendTransaction({
        to: "0x5638c9f84361a7430b29a63216f0af0914399eA2",
        value: ethers.utils.parseEther(betAmount.toString()),
    });

    console.log("Transaction successful:", transaction);
    alert("Bet placed successfully!");
}
