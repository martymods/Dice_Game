// Import modules and initialize variables
import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats, updateWinStreak, resetWinStreak } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects, updateHustlerUI } from './modules/hustlers.js';
import { updateUI, showItemPopup } from './modules/ui.js';

let winStreak = 0; // Track current winning streak
let playerHasPurchased = false; // Track shop purchases
let onFire = false; // "On fire" streak state
let fireSound; // Fire sound effect instance

document.addEventListener('DOMContentLoaded', () => {
    // Check URL parameters to determine game mode
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (urlParams.has('stats')) {
        displayStats();
    } else if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.log('Defaulting to Main Menu.');
    }

    setupCombinationsModal(); // Initialize modal functionality
});

/**
 * Initialize Single Player mode
 */
async function setupSinglePlayer() {
    loadStats();
    console.log('Single Player mode active.');

    let balance = 300; // Starting balance
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let items = [];
    let hustlerInventory = [];
    let dreamCoins = 0;
    let gameStartTime = Date.now();

    // Increment games played and save stats
    playerStats.gamesPlayed++;
    saveStats();

    // DOM Elements
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const rentStatus = document.getElementById('rent-status');
    const gameStatus = document.getElementById('gameStatus');
    const bettingStatus = document.getElementById('betting-status');
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');
    const gameOverContainer = document.getElementById('gameOverContainer');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');

    // Ensure all required elements are present
    const requiredElements = [
        rollButton, betButton, quitButton, rentStatus, gameStatus,
        bettingStatus, popup, itemList, gameOverContainer,
        bet25Button, bet50Button, bet100Button
    ];

    requiredElements.forEach((el, index) => {
        if (!el) {
            console.error(`Missing required element: Element ${index + 1}`);
            alert('A required element is missing. Please check the HTML.');
            return;
        }
    });

    // Add event listeners
    rollButton.addEventListener('click', () => handleRollDice(balance, rent, maxTurns, turns, hustlerInventory));
    betButton.addEventListener('click', handlePlaceBet);
    quitButton.addEventListener('click', quitGame);
    bet25Button.addEventListener('click', () => setBet(balance * 0.25));
    bet50Button.addEventListener('click', () => setBet(balance * 0.5));
    bet100Button.addEventListener('click', () => setBet(balance));
}

/**
 * Helper: Set the player's bet amount
 */
function setBet(amount) {
    if (amount <= 0) {
        alert('Invalid bet amount.');
        return;
    }

    currentBet = Math.min(balance, Math.floor(amount));
    updateUI(balance, currentBet, rent, maxTurns, turns);
}

/**
 * Handle rolling the dice
 */
function handleRollDice(balance, rent, maxTurns, turns, hustlerInventory) {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    playDiceSound();
    animateDice(() => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        const { multiplier, cashBonus } = applyHustlerEffects(dice1, dice2, hustlerInventory);
        let winnings = 0;

        if (sum === 7 || sum === 11) {
            // Winning roll
            winnings = currentBet * 2 * multiplier + cashBonus;
            balance += winnings;
            updateWinStreak();
            gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            showWinningAmount(winnings);
        } else if (sum === 2 || sum === 3 || sum === 12) {
            // Losing roll
            balance -= currentBet;
            resetWinStreak();
            gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            showLosingAmount(currentBet);
        } else {
            // Neutral roll
            balance += cashBonus;
            gameStatus.textContent = `Roll: ${sum}. Multiplier: ${multiplier}x. Bonus: $${cashBonus}`;
        }

        currentBet = 0;
        updateUIAfterRoll(balance, rent, maxTurns, turns);
    });
}

// Continue Part 2 (ETH Integration)...

let balance = 300;
let currentBet = 0;
let turns = 0;
let rent = 400;
let maxTurns = 6;
let progression = 1;
let items = [];
let dreamCoins = 0; // Player's DreamCoin balance
let hustlerInventory = [];
let gameStartTime = Date.now();
const maxHustlers = 5;

// MetaMask setup
let provider, signer;

// Ensure global accessibility for certain elements/functions
window.playerStats = playerStats;
window.loadStats = loadStats;
window.saveStats = saveStats;
window.connectMetaMask = connectMetaMask;
window.placeBet = placeBet;
window.startSinglePlayer = startSinglePlayer;

document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (urlParams.has('stats')) {
        displayStats();
    } else if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.log('Defaulting to Main Menu.');
    }

    setupCombinationsModal();
    restoreWalletConnection();
}

function setupCombinationsModal() {
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    if (showCombinationsButton && combinationsModal && closeCombinationsButton) {
        showCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'flex';
        });

        closeCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'none';
        });

        combinationsModal.addEventListener('click', (event) => {
            if (event.target === combinationsModal) {
                combinationsModal.style.display = 'none';
            }
        });
    } else {
        console.error('Combination modal elements are missing.');
    }
}

function setupSinglePlayer() {
    loadStats();
    console.log('Single Player mode active.');

    setupEventListeners();
    updateUI();
}

function setupEventListeners() {
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const quitButton = document.getElementById('quitButton');

    rollButton.addEventListener('click', handleRollDice);
    betButton.addEventListener('click', handlePlaceBet);
    bet25Button.addEventListener('click', () => setBet(balance * 0.25));
    bet50Button.addEventListener('click', () => setBet(balance * 0.5));
    bet100Button.addEventListener('click', () => setBet(balance));
    quitButton.addEventListener('click', quitGame);
}

function handleRollDice() {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    const { multiplier, cashBonus } = applyHustlerEffects(dice1, dice2);

    animateDice(dice1, dice2, () => {
        let winnings = 0;

        if (sum === 7 || sum === 11) {
            winnings = currentBet * 2 * multiplier + cashBonus;
            balance += winnings;
            updateWinStreak(true);
            handleWinningRoll(winnings, sum);
        } else if (sum === 2 || sum === 3 || sum === 12) {
            balance -= currentBet;
            updateWinStreak(false);
            handleLosingRoll(sum);
        } else {
            balance += cashBonus;
            document.getElementById('gameStatus').textContent = `Roll: ${sum}. Multiplier: ${multiplier}x. Bonus: $${cashBonus}`;
        }

        currentBet = 0;
        updateUIAfterRoll();
    });
}

function handleWinningRoll(winnings, sum) {
    document.getElementById('gameStatus').textContent = `You win! 🎉 Roll: ${sum}`;
    flashScreen('gold');
    showWinningAmount(winnings);
}

function handleLosingRoll(sum) {
    document.getElementById('gameStatus').textContent = `You lose! 💔 Roll: ${sum}`;
    flashScreen('red');
    showLosingAmount(currentBet);
}

function handlePlaceBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert('Invalid bet amount.');
    } else {
        currentBet = betAmount;
        updateUI();
    }
}

function openShop() {
    playerHasPurchased = false;
    renderShop();
}

function renderShop() {
    const shopItems = document.getElementById("shop-items");
    shopItems.innerHTML = "";

    const randomItems = getRandomItems(window.itemsList, 6);

    randomItems.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("shop-item");
        itemElement.textContent = `${item.name} - $${item.cost}`;
        itemElement.onclick = () => handlePurchase(item);
        shopItems.appendChild(itemElement);
    });

    toggleShop(true);
}

function toggleShop(open) {
    const shopArea = document.getElementById("shop-area");
    shopArea.style.display = open ? 'block' : 'none';
}

function handlePurchase(item) {
    if (playerHasPurchased) {
        alert('You can only purchase one item per shop visit!');
        return;
    }

    if (balance >= item.cost) {
        balance -= item.cost;
        items.push(item);
        alert(`You purchased ${item.name}!`);
        playerHasPurchased = true;
        toggleShop(false);
        updateUI();
    } else {
        alert('Not enough money to purchase this item.');
    }
}

function updateUIAfterRoll() {
    updateUI();
    turns++;

    if (turns >= maxTurns) {
        if (balance >= rent) {
            balance -= rent;
            rent *= 2;
            maxTurns++;
            turns = 0;
            openShop();
        } else {
            handleGameOver();
        }
    }

    if (balance <= 0) {
        handleGameOver();
    }
}

function handleGameOver() {
    flashScreen('red');
    alert('Game Over! Better luck next time.');
    document.getElementById('gameOverContainer').style.display = 'block';
}

function flashScreen(color) {
    const body = document.body;
    const originalBackground = body.style.backgroundColor;

    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.backgroundColor = originalBackground;
    }, 500);
}

function setBet(amount) {
    currentBet = Math.min(amount, balance);
    updateUI();
}

function getRandomItems(list, count) {
    return list.sort(() => 0.5 - Math.random()).slice(0, count);
}

function updateUI() {
    document.getElementById('betting-status').textContent = `Balance: $${balance} | Bet: $${currentBet}`;
    document.getElementById('rent-status').textContent = `Rent Due: $${rent} in ${maxTurns - turns} rolls`;
}

// MetaMask Integration
async function connectMetaMask() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const accounts = await provider.send('eth_requestAccounts', []);
        console.log(`Connected wallet: ${accounts[0]}`);
    } else {
        alert('MetaMask is not installed.');
    }
}

function restoreWalletConnection() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    }
}
