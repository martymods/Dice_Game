// app.js
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
    // Get DOM elements
    const inventoryButton = document.getElementById('inventoryButton');
    const inventoryModal = document.getElementById('inventoryModal');
    const closeInventoryButton = document.getElementById('closeInventoryButton');
    const inventoryItems = document.getElementById('inventoryItems');
    const urlParams = new URLSearchParams(window.location.search);
    isSinglePlayer = urlParams.has('singlePlayer'); // Update global variable

    // Inventory functionality
    if (inventoryButton && inventoryModal && closeInventoryButton && inventoryItems) {
        console.log('Inventory elements found. Adding event listeners.');

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

    if (rollButton && betButton) {
        rollButton.addEventListener('click', handleRollDice);
        betButton.addEventListener('click', handlePlaceBet);
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

    if (rollButton && betButton && quitButton && bettingStatus && rentStatus && bet25Button && bet50Button && bet100Button) {
        rollButton.addEventListener('click', () => console.log('Roll button clicked'));
        betButton.addEventListener('click', () => console.log('Bet button clicked'));
        quitButton.addEventListener('click', () => console.log('Quit button clicked'));
        bet25Button.addEventListener('click', () => console.log('Bet 25% button clicked'));
        bet50Button.addEventListener('click', () => console.log('Bet 50% button clicked'));
        bet100Button.addEventListener('click', () => console.log('Bet 100% button clicked'));
        console.log('Single Player setup completed.');
    } else {
        console.error('One or more required elements are missing in the DOM.');
    }
});
const script = document.createElement('script');
script.src = '/items.js';
document.head.appendChild(script);

script.onload = () => {
    const requiredElements = [
        'bettingStatus',
        'rentStatus',
        'rollButton',
        'betButton',
        'quitButton',
        'bet25Button',
        'bet50Button',
        'bet100Button'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error(`One or more required elements are missing in the DOM: ${missingElements.join(', ')}`);
        return;
    }

    console.log('All required elements are present.');

    updateUI();

    rollButton.addEventListener('click', () => {
        console.log('Roll Dice button clicked.');
        // Add roll dice logic here
    });

    betButton.addEventListener('click', () => {
        console.log('Place Bet button clicked.');
        // Add betting logic here
    });

    quitButton.addEventListener('click', () => {
        console.log('Quit Game button clicked.');
        window.location.href = '/';
    });

    bet25Button.addEventListener('click', () => {
        playSound('/sounds/UI_Click1.ogg');
        setBet(balance * 0.25);
    });

    bet50Button.addEventListener('click', () => {
        playSound('/sounds/UI_Click1.ogg');
        setBet(balance * 0.5);
    });

    bet100Button.addEventListener('click', () => {
        playSound('/sounds/UI_Click1.ogg');
        setBet(balance);
    });
};
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

    playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    animateDice(dice1, dice2, () => {
        playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);

        let rollBonus = 0;

        items.forEach(item => {
            if (item.name === 'Forged Papers 📜') {
                items = itemEffects.forgedPapersEffect(items);
            }
            if (item.name === 'Loaded Dice 🎲') {
                rollBonus += itemEffects.loadedDiceEffect(sum, currentBet);
            }
            if (item.name === "Old Gang Leader’s Blade 🔪") {
                dreamCoins += itemEffects.gangLeaderBladeEffect(items);
            }
        });

        if (sum === 7 || sum === 11) {
            const winnings = currentBet * 2 + rollBonus;
            balance += winnings;
            gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            playSound("/sounds/Winner_0.ogg");
            flashScreen('gold');
            showWinningAmount(winnings);
        } else if (sum === 2 || sum === 3 || sum === 12) {
            gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            playSound("/sounds/Loser_0.ogg");
            flashScreen('red');
            showLosingAmount(currentBet);
        } else {
            balance += rollBonus;
            gameStatus.textContent = `Roll: ${sum}`;
        }

        currentBet = 0;
        updateUI();
        console.log(`Dice rolled: ${dice1}, ${dice2} (Sum: ${sum})`);
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
    console.log(`Bet placed: $${currentBet}`);
}

function quitGame() {
    window.location.href = '/';
}

function updateUI() {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus && rentStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        if (dreamCoins > 0) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
            rentStatus.innerHTML += ` <img src="/images/DW_Logo.png" alt="DreamCoin" style="width: 20px; height: 20px;"> ${dreamCoins}`;
        } else {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
        }
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

function showWinningAmount(amount) {
    const winAmountDiv = document.createElement('div');
    winAmountDiv.textContent = `+$${amount.toLocaleString()}`;
    winAmountDiv.style.position = 'absolute';
    winAmountDiv.style.top = '50%';
    winAmountDiv.style.left = '50%';
    winAmountDiv.style.transform = 'translate(-50%, -50%)';
    winAmountDiv.style.fontSize = '48px';
    winAmountDiv.style.color = 'limegreen';
    winAmountDiv.style.textShadow = '0 0 10px limegreen, 0 0 20px lime, 0 0 30px green';
    winAmountDiv.style.fontWeight = 'bold';
    winAmountDiv.style.transition = 'opacity 2s ease-out';
    winAmountDiv.style.opacity = '1';
    winAmountDiv.style.zIndex = '9999';

    document.body.appendChild(winAmountDiv);

    setTimeout(() => {
        winAmountDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(winAmountDiv);
        }, 2000);
    }, 2000);
}

function showLosingAmount(amount) {
    const loseAmountDiv = document.createElement('div');
    loseAmountDiv.textContent = `-$${amount.toLocaleString()}`;
    loseAmountDiv.style.position = 'absolute';
    loseAmountDiv.style.top = '50%';
    loseAmountDiv.style.left = '50%';
    loseAmountDiv.style.transform = 'translate(-50%, -50%)';
    loseAmountDiv.style.fontSize = '48px';
    loseAmountDiv.style.color = 'red';
    loseAmountDiv.style.textShadow = '0 0 10px red, 0 0 20px crimson, 0 0 30px darkred';
    loseAmountDiv.style.fontWeight = 'bold';
    loseAmountDiv.style.transition = 'opacity 2s ease-out';
    loseAmountDiv.style.opacity = '1';
    loseAmountDiv.style.zIndex = '9999';

    document.body.appendChild(loseAmountDiv);

    setTimeout(() => {
        loseAmountDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loseAmountDiv);
        }, 2000);
    }, 2000);
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
