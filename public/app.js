// Import modules and initialize variables
import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats, updateWinStreak, resetWinStreak } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects, updateHustlerUI } from './modules/hustlers.js';
import { updateUI, showItemPopup } from './modules/ui.js';

let winStreak = 0;
let playerHasPurchased = false;
let onFire = false;
let fireSound;
let balance = 300;
let currentBet = 0;
let turns = 0;
let rent = 400;
let maxTurns = 6;
let progression = 1;
let items = [];
let hustlerInventory = [];
let gameStartTime = Date.now();
const maxHustlers = 5;
let provider, signer;

// MetaMask setup
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

// Restore wallet connection
function restoreWalletConnection() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
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
});

// Setup Single Player mode
function setupSinglePlayer() {
    loadStats();
    console.log('Single Player mode active.');

    setupEventListeners();
    updateUI();
}

function startSinglePlayer() {
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';

    const transitionSound = new Audio('/sounds/transitionSFX0.ogg');
    transitionSound.play().catch(err => console.error('Error playing transition sound:', err));

    setTimeout(() => {
        window.location.href = 'game.html?singlePlayer=true';
    }, 2000);
}

// Make globally accessible
window.startSinglePlayer = startSinglePlayer;


// Add event listeners
function setupEventListeners() {
    document.getElementById('rollButton').addEventListener('click', handleRollDice);
    document.getElementById('betButton').addEventListener('click', handlePlaceBet);
    document.getElementById('bet25Button').addEventListener('click', () => setBet(balance * 0.25));
    document.getElementById('bet50Button').addEventListener('click', () => setBet(balance * 0.5));
    document.getElementById('bet100Button').addEventListener('click', () => setBet(balance));
    document.getElementById('quitButton').addEventListener('click', quitGame);
}

// Handle rolling the dice
function handleRollDice() {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    playDiceSound();
    animateDice(() => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        const { multiplier, cashBonus } = applyHustlerEffects(dice1, dice2);

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

// Handle winning and losing rolls
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

// Handle placing a bet
function handlePlaceBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert('Invalid bet amount.');
    } else {
        currentBet = betAmount;
        updateUI();
    }
}

// Update UI after a roll
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

// Open and render the shop
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

// Helper functions
function flashScreen(color) {
    const body = document.body;
    const originalBackground = body.style.backgroundColor;

    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.backgroundColor = originalBackground;
    }, 500);
}

function updateUI() {
    document.getElementById('betting-status').textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    document.getElementById('rent-status').textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;

    const hustlerEffects = hustlerInventory.map(hustler => hustler.effect).join(', ');
    const hustlerEffectElement = document.getElementById('hustler-effects');
    if (hustlerEffectElement) {
        hustlerEffectElement.textContent = hustlerEffects
            ? `Active Hustler Effects: ${hustlerEffects}`
            : 'Active Hustler Effects: None';
    }

    updateBackgroundImage();
}


function setBet(amount) {
    currentBet = Math.min(amount, balance);
    updateUI();
}

function getRandomItems(list, count) {
    return list.sort(() => 0.5 - Math.random()).slice(0, count);
}

function handleGameOver() {
    flashScreen('red');
    alert('Game Over! Better luck next time.');
    document.getElementById('gameOverContainer').style.display = 'block';
}
