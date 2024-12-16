let isSinglePlayer = false; // Initialize globally

// Declare global variables for game state
let balance = 300; // Starting balance
let currentBet = 0;
let turns = 0;
let rent = 400;
let maxTurns = 6;
let progression = 1;
let items = []; // Inventory for single-player
let dreamCoins = 0; // New DreamCoin balance
let gameStartTime = Date.now();

// Ensure playerStats and related functions are globally accessible
if (!window.playerStats) {
    window.playerStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        evictions: 0,
        monthsUnlocked: 0,
        totalMoneyWon: 0,
        totalMoneyLost: 0,
        hustlersRecruited: 0,
        totalTimePlayed: 0,
        currentWinStreak: 0,
        longestWinStreak: 0,
        totalDaysPassed: 0
    };

    window.loadStats = function () {
        const savedStats = localStorage.getItem('playerStats');
        if (savedStats) {
            Object.assign(window.playerStats, JSON.parse(savedStats));
        }
    };

    window.saveStats = function () {
        localStorage.setItem('playerStats', JSON.stringify(window.playerStats));
    };

    window.displayStats = function () {
        window.loadStats();
        const statsList = document.getElementById('stats-list');
        if (statsList) {
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
        } else {
            console.error('Stats list element is missing.');
        }
    };

    window.formatTime = function (seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    };

    // Load stats from localStorage
    loadStats();
}

// Increment gamesPlayed and save stats
playerStats.gamesPlayed++;
saveStats();
// Ensure the required items are accessible globally
window.itemEffects = window.itemEffects || {};

// Define the startSinglePlayer function globally
function startSinglePlayer() {
    window.location.href = 'game.html?singlePlayer=true';
}
window.startSinglePlayer = startSinglePlayer;

// Ensure global functions for menu navigation
window.showCreateGame = function () {
    alert("Host Game feature is not implemented yet.");
};

window.showJoinGame = function () {
    alert("Join Game feature is not implemented yet.");
};

window.viewLeaderboard = function () {
    alert("Leaderboard feature is not implemented yet.");
};
document.addEventListener('DOMContentLoaded', () => {
    const inventoryButton = document.getElementById('inventoryButton');
    const inventoryModal = document.getElementById('inventoryModal');
    const closeInventoryButton = document.getElementById('closeInventoryButton');
    const inventoryItems = document.getElementById('inventoryItems');
    const urlParams = new URLSearchParams(window.location.search);
    isSinglePlayer = urlParams.has('singlePlayer'); // Update global variable

    // Inventory functionality
    if (inventoryButton && inventoryModal && closeInventoryButton && inventoryItems) {
        console.log('Inventory elements found. Adding event listeners.');

        inventoryModal.style.display = 'none'; // Ensure inventory starts closed

        inventoryButton.addEventListener('click', () => {
            populateInventory();
            inventoryModal.style.display = 'block'; // Show modal
        });

        closeInventoryButton.addEventListener('click', () => {
            inventoryModal.style.display = 'none'; // Hide modal
        });

        function populateInventory() {
            if (!window.items || window.items.length === 0) {
                console.warn('No items to display in the inventory.');
                return;
            }
            inventoryItems.innerHTML = ''; // Clear existing items
            window.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.name} (${item.description})`;
                inventoryItems.appendChild(listItem);
            });
        }
    } else {
        console.warn('One or more required inventory elements are missing in the DOM.');
    }

    // Determine game mode
    const isStatsView = urlParams.has('stats');

    if (isStatsView) {
        displayStats();
    } else if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.log('Main menu mode detected.');
    }
});
function setupSinglePlayer() {
    console.log('Single Player mode active.');

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    if (rollButton && betButton && quitButton) {
        rollButton.addEventListener('click', handleRollDice);
        betButton.addEventListener('click', handlePlaceBet);
        quitButton.addEventListener('click', quitGame);
        console.log('Single Player setup completed.');
    } else {
        console.error('Required game buttons are missing.');
    }

    // Ensure necessary elements exist
    const requiredElementIds = [
        'rollButton',
        'betButton',
        'quitButton',
        'betting-status',
        'gameStatus',
        'rent-status',
        'inventoryItems',
        'buy-item-container',
        'item-list',
        'gameOverContainer',
        'bet25Button',
        'bet50Button',
        'bet100Button'
    ];

    const missingElements = requiredElementIds.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error(`One or more required elements are missing in the DOM: ${missingElements.join(', ')}`);
    } else {
        console.log('All required elements are present.');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    if (rollButton && betButton && quitButton && bettingStatus && rentStatus && bet25Button && bet50Button && bet100Button) {
        rollButton.addEventListener('click', handleRollDice);
        betButton.addEventListener('click', handlePlaceBet);
        quitButton.addEventListener('click', quitGame);
        bet25Button.addEventListener('click', () => setBet(balance * 0.25));
        bet50Button.addEventListener('click', () => setBet(balance * 0.5));
        bet100Button.addEventListener('click', () => setBet(balance));
        console.log('All Single Player buttons are configured.');
    } else {
        console.error('One or more required elements are missing in the DOM.');
    }
});
function setBet(amount) {
    if (amount > balance) amount = balance;
    currentBet = Math.floor(amount);
    updateUI();
}

function handleRollDice() {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg"], true);

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    animateDice(dice1, dice2, () => {
        playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg"]);
        let rollBonus = 0;

        items.forEach(item => {
            if (item.name === 'Loaded Dice 🎲') {
                rollBonus += itemEffects.loadedDiceEffect(sum, currentBet);
            }
        });

        if (sum === 7 || sum === 11) {
            const winnings = currentBet * 2 + rollBonus;
            balance += winnings;
            gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            flashScreen('gold');
            showWinningAmount(winnings);
        } else if (sum === 2 || sum === 3 || sum === 12) {
            gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            flashScreen('red');
            showLosingAmount(currentBet);
        } else {
            balance += rollBonus;
            gameStatus.textContent = `Roll: ${sum}`;
        }

        currentBet = 0;
        updateUI();
    });
}

function handlePlaceBet() {
    playSound("/sounds/UI_Click1.ogg");
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Invalid bet amount.');
        return;
    }
    if (betAmount > balance) {
        alert('Bet amount exceeds balance.');
        return;
    }

    currentBet = betAmount;
    balance -= currentBet;
    updateUI();
}

function quitGame() {
    window.location.href = '/';
}
function updateUI() {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus && rentStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
    } else {
        console.error("One or more required elements (bettingStatus, rentStatus) are missing in the DOM.");
    }

    updateBackgroundImage();
}

function updateBackgroundImage() {
    const rollsRemaining = maxTurns - turns;
    if (rollsRemaining === maxTurns) {
        document.body.style.backgroundImage = "url('/images/LandLord0.png')";
    } else if (rollsRemaining <= maxTurns / 2 && rollsRemaining > 2) {
        document.body.style.backgroundImage = "url('/images/LandLord1.png')";
    } else if (rollsRemaining <= 2) {
        document.body.style.backgroundImage = "url('/images/LandLord2.png')";
    }
}

function flashScreen(color) {
    const body = document.body;
    const originalBackgroundColor = getComputedStyle(body).backgroundColor;

    body.style.transition = 'background-color 0.2s ease';
    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.transition = 'background-color 0.5s ease';
        body.style.backgroundColor = originalBackgroundColor;
    }, 200);
}

function animateDice(dice1, dice2, callback) {
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');

    if (!dice1Element || !dice2Element) {
        console.error('Dice elements are missing in the DOM.');
        return;
    }

    let counter = 0;
    const interval = setInterval(() => {
        dice1Element.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
        dice2Element.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
        counter++;

        if (counter >= 10) {
            clearInterval(interval);
            dice1Element.src = `/images/dice${dice1}.png`;
            dice2Element.src = `/images/dice${dice2}.png`;
            callback();
        }
    }, 100);
}
document.addEventListener('DOMContentLoaded', () => {
    const inventoryButton = document.getElementById('inventoryButton');
    const inventoryModal = document.getElementById('inventoryModal');
    const closeInventoryButton = document.getElementById('closeInventoryButton');
    const inventoryItems = document.getElementById('inventoryItems');

    if (inventoryButton && inventoryModal && closeInventoryButton && inventoryItems) {
        inventoryModal.style.display = 'none'; // Ensure the inventory is closed by default

        inventoryButton.addEventListener('click', () => {
            populateInventory();
            inventoryModal.style.display = 'block';
        });

        closeInventoryButton.addEventListener('click', () => {
            inventoryModal.style.display = 'none';
        });

        function populateInventory() {
            if (!window.items || window.items.length === 0) {
                console.warn('No items to display in the inventory.');
                return;
            }
            inventoryItems.innerHTML = '';
            window.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.name} (${item.description})`;
                inventoryItems.appendChild(listItem);
            });
        }
    } else {
        console.warn('One or more required inventory elements are missing in the DOM.');
    }
});
function handleGameOver() {
    const gameOverContainer = document.getElementById('gameOverContainer');
    if (!gameOverContainer) {
        console.error('Game Over container element is missing.');
        return;
    }

    flashScreen('red');
    const deathSound = new Audio('/sounds/Death0.ogg');
    deathSound.play().catch(err => console.error('Death sound error:', err));

    gameOverContainer.style.display = 'block';
}

function handleGameWin() {
    playerStats.gamesWon++;
    playerStats.currentWinStreak++;
    playerStats.longestWinStreak = Math.max(playerStats.longestWinStreak, playerStats.currentWinStreak);
    saveStats();
}
function playSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);
    audio.play().catch(err => console.error('Audio play error:', err));
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

function trackMoneyWon(amount) {
    playerStats.totalMoneyWon += amount;
    saveStats();
}

function trackMoneyLost(amount) {
    playerStats.totalMoneyLost += amount;
    saveStats();
}

function logMissingElements(elementIds) {
    const missingElements = elementIds.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error(`Missing DOM elements: ${missingElements.join(', ')}`);
    }
    return missingElements;
}

    }
});
