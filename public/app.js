// Import Modules
import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects } from './modules/hustlers.js';

// Global Variables
let winStreak = 0;
let onFire = false;
let playerHasPurchased = false;
let hustlerInventory = [];
let fireSound = null;
let balance = 300; // Starting balance
let currentBet = 0;
let rent = 400;
let maxTurns = 6;
let turns = 0;
let progression = 1;

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('singlePlayer')) {
        setupSinglePlayer();
    } else if (urlParams.has('stats')) {
        displayStats();
    }
    initializeModals();
});

// Helper Functions
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

function playSound(sounds, randomize = false) {
    const sound = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;
    new Audio(sound).play().catch(err => console.error('Audio play error:', err));
}

function flashScreen(color) {
    const body = document.body;
    const originalColor = getComputedStyle(body).backgroundColor;
    body.style.transition = 'background-color 0.2s ease';
    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.backgroundColor = originalColor;
    }, 200);
}

// UI Updates
function updateUI() {
    document.getElementById('betting-status').textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    document.getElementById('rent-status').textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
    document.getElementById('hustler-effects').textContent = hustlerInventory.map(h => h.effect).join(', ') || 'None';
}

// Dice Roll Logic
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
        if ([7, 11].includes(sum)) {
            winnings = currentBet * 2 * multiplier + cashBonus;
            balance += winnings;
            flashScreen('gold');
            playSound("/sounds/Winner_0.ogg");
            winStreak++;
            if (winStreak >= 3 && !onFire) activateOnFire();
        } else if ([2, 3, 12].includes(sum)) {
            balance -= currentBet;
            flashScreen('red');
            playSound("/sounds/Loser_0.ogg");
            winStreak = 0;
            if (onFire) deactivateOnFire();
        } else {
            balance += cashBonus;
        }

        currentBet = 0;
        updateUI();
        checkRentProgression();
    });
}

// Fire Mode
function activateOnFire() {
    onFire = true;
    playSound("/sounds/FireIgnite0.ogg");
    fireSound = new Audio('/sounds/FireBurn0.ogg');
    fireSound.loop = true;
    fireSound.play();
    document.getElementById('dice1').src = '/images/DiceFire1.gif';
    document.getElementById('dice2').src = '/images/DiceFire2.gif';
}

function deactivateOnFire() {
    onFire = false;
    if (fireSound) fireSound.pause();
    document.getElementById('dice1').src = '/images/dice1.png';
    document.getElementById('dice2').src = '/images/dice2.png';
}

// Rent Progression
function checkRentProgression() {
    turns++;
    if (turns >= maxTurns) {
        if (balance >= rent) {
            balance -= rent;
            rent *= progression <= 9 ? 4 : 5;
            maxTurns++;
            progression++;
            turns = 0;
            alert("Rent paid! New rent: $" + rent);
            openShop();
        } else {
            handleGameOver();
        }
    }
    if (balance <= 0) handleGameOver();
}

// Game Over
function handleGameOver() {
    playSound('/sounds/Death0.ogg');
    alert('Game Over! You have been evicted.');
    document.getElementById('gameOverContainer').style.display = 'block';
    hideGameUI();
}

function hideGameUI() {
    document.querySelectorAll('#rollButton, #betButton, #bet25Button, #bet50Button, #bet100Button')
        .forEach(el => el.style.display = 'none');
}

// Shop Logic
function openShop() {
    playerHasPurchased = false;
    renderShop();
}

function renderShop() {
    const shopArea = document.getElementById("shop-area");
    shopArea.innerHTML = ''; // Clear previous items
    getRandomItems(window.itemsList, 6).forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.textContent = `${item.name} - $${item.cost}`;
        itemEl.onclick = () => handlePurchase(item);
        shopArea.appendChild(itemEl);
    });
    shopArea.style.display = "block";
}

function handlePurchase(item) {
    if (playerHasPurchased) {
        alert("Only one purchase per visit.");
        return;
    }
    if (balance >= item.cost) {
        balance -= item.cost;
        playerHasPurchased = true;
        alert(`Purchased: ${item.name}`);
        updateUI();
    } else {
        alert("Not enough balance.");
    }
}

// Continue to next message for **Part 2**, where I'll include wallet logic, hustler inventory management, and more!
// MetaMask Connection
let provider;
let signer;

export async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        provider = new ethers.providers.Web3Provider(window.ethereum);
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

// Place Bet with ETH
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

    try {
        const transaction = await signer.sendTransaction({
            to: "0x5638c9f84361a7430b29a63216f0af0914399eA2", // Replace with your wallet address
            value: ethers.utils.parseEther(betAmount.toString())
        });
        console.log("Transaction successful:", transaction);
        alert("Bet placed successfully!");
    } catch (error) {
        console.error("Transaction error:", error);
        alert("Failed to place bet. Please try again.");
    }
}

// Restore Wallet Connection on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
        console.log(`Restoring connection to wallet: ${savedWallet}`);
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    }
});

// Hustler Management
function addHustlerToInventory(hustler) {
    if (hustlerInventory.length >= 5) {
        alert("You can only hold 5 Hustlers at a time.");
        return;
    }
    hustlerInventory.push(hustler);
    updateHustlerInventoryUI();
}

function discardHustler(index) {
    hustlerInventory.splice(index, 1);
    updateHustlerInventoryUI();
}

function updateHustlerInventoryUI() {
    const hustlerList = document.getElementById("hustler-list");
    hustlerList.innerHTML = ''; // Clear existing
    hustlerInventory.forEach((hustler, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${hustler.name} (${hustler.description})
            <button onclick="discardHustler(${index})">Discard</button>`;
        hustlerList.appendChild(li);
    });

    const hustlerEffectElement = document.getElementById("hustler-effects");
    hustlerEffectElement.textContent = hustlerInventory.map(h => h.effect).join(", ") || "None";

    const hustlerCountElement = document.getElementById("hustler-count");
    hustlerCountElement.textContent = `Max Hustlers: ${hustlerInventory.length}/5`;
}

function displayStats() {
    loadStats();
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = `
        <ul>
            <li>Games Played: ${playerStats.gamesPlayed}</li>
            <li>Games Won: ${playerStats.gamesWon}</li>
            <li>Times Evicted: ${playerStats.evictions}</li>
            <li>Months Unlocked: ${playerStats.monthsUnlocked}/12</li>
            <li>Total Money Won: $${playerStats.totalMoneyWon.toLocaleString()}</li>
            <li>Total Money Lost: $${playerStats.totalMoneyLost.toLocaleString()}</li>
            <li>Hustlers Recruited: ${playerStats.hustlersRecruited}</li>
            <li>Total Time Played: ${formatTime(playerStats.totalTimePlayed)}</li>
            <li>Current Winning Streak: ${playerStats.currentWinStreak}</li>
            <li>Longest Winning Streak: ${playerStats.longestWinStreak}</li>
            <li>Total Days Passed: ${playerStats.totalDaysPassed}</li>
        </ul>
    `;
}

function saveStats() {
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
}

function loadStats() {
    const savedStats = localStorage.getItem("playerStats");
    if (savedStats) {
        Object.assign(playerStats, JSON.parse(savedStats));
    }
}
