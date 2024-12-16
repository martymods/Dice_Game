// Global Variables
let isSinglePlayer = false;
let balance = 300;
let currentBet = 0;
let turns = 0;
let rent = 400;
let maxTurns = 6;
let progression = 1;
let items = [];
let dreamCoins = 0;
let gameStartTime = Date.now();

// Ensure playerStats is globally accessible
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
        totalDaysPassed: 0,
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

    loadStats();
    playerStats.gamesPlayed++;
    saveStats();
}
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const inventoryModal = document.getElementById('inventoryModal');
    const inventoryButton = document.getElementById('inventoryButton');
    const closeInventoryButton = document.getElementById('closeInventoryButton');
    const inventoryItems = document.getElementById('inventoryItems');

    // Initialize inventory modal state
    if (inventoryModal) {
        inventoryModal.style.display = 'none'; // Close inventory by default
    }

    // Check required elements
    if (rollButton && betButton && quitButton) {
        rollButton.addEventListener('click', handleRollDice);
        betButton.addEventListener('click', handlePlaceBet);
        quitButton.addEventListener('click', quitGame);
    } else {
        console.error('One or more required elements are missing in the DOM: rollButton, betButton, quitButton');
    }

    // Inventory functionality
    if (inventoryButton && inventoryModal && closeInventoryButton && inventoryItems) {
        inventoryButton.addEventListener('click', () => {
            populateInventory();
            inventoryModal.style.display = 'block'; // Show modal
        });

        closeInventoryButton.addEventListener('click', () => {
            inventoryModal.style.display = 'none'; // Hide modal
        });
    } else {
        console.error('One or more required inventory elements are missing in the DOM.');
    }
});
function handleRollDice() {
    if (currentBet <= 0) {
        alert('Place a bet first!');
        return;
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    animateDice(dice1, dice2, () => {
        if (sum === 7 || sum === 11) {
            const winnings = currentBet * 2;
            balance += winnings;
            alert(`You win! 🎉 Roll: ${sum}`);
        } else if (sum === 2 || sum === 3 || sum === 12) {
            alert(`You lose! 💔 Roll: ${sum}`);
        } else {
            alert(`Roll: ${sum}`);
        }
        currentBet = 0; // Reset the bet
        updateUI();
    });
}

function handlePlaceBet() {
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
        bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
        rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns - turns} rolls`;
    } else {
        console.error('One or more required elements (bettingStatus, rentStatus) are missing in the DOM.');
    }
}

function populateInventory() {
    if (!items.length) {
        console.warn('No items to display in the inventory.');
        return;
    }
    const inventoryItems = document.getElementById('inventoryItems');
    if (inventoryItems) {
        inventoryItems.innerHTML = '';
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} (${item.description})`;
            inventoryItems.appendChild(listItem);
        });
    }
}

function animateDice(dice1, dice2, callback) {
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');
    if (dice1Element && dice2Element) {
        dice1Element.textContent = `Dice 1: ${dice1}`;
        dice2Element.textContent = `Dice 2: ${dice2}`;
        callback();
    }
}
function handleItemPurchase(item) {
    if (balance >= item.cost) {
        balance -= item.cost;
        items.push(item);
        alert(`You purchased ${item.name}!`);
        updateUI();
    } else {
        alert('Not enough money to buy this item.');
    }
}

function showItemPopup() {
    const popup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');
    if (popup && itemList) {
        popup.style.display = 'block';
        itemList.innerHTML = '';
        items.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost}`;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });
    } else {
        console.error('Popup or item list not found.');
    }
}
function updateRentProgression() {
    const rollsRemaining = maxTurns - turns;
    if (rollsRemaining > 0) {
        const rentStatus = document.getElementById('rent-status');
        if (rentStatus) {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsRemaining} rolls`;
        }
    } else {
        if (balance >= rent) {
            balance -= rent;
            rent = progression <= 9 ? rent * 2 : rent * 3; // Increase rent for the next round
            maxTurns++;
            progression++;
            turns = 0;
            alert('Rent paid successfully! The challenge increases!');
        } else {
            handleGameOver();
        }
    }

    if (balance <= 0) {
        handleGameOver();
    }
}

function handleGameOver() {
    alert('Game Over! You could not pay the rent.');
    // Redirect or reload the game
    window.location.href = '/';
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

function showNotification(message, color) {
    const notificationDiv = document.createElement('div');
    notificationDiv.textContent = message;
    notificationDiv.style.position = 'absolute';
    notificationDiv.style.top = '50%';
    notificationDiv.style.left = '50%';
    notificationDiv.style.transform = 'translate(-50%, -50%)';
    notificationDiv.style.padding = '20px';
    notificationDiv.style.backgroundColor = color;
    notificationDiv.style.color = '#fff';
    notificationDiv.style.fontSize = '18px';
    notificationDiv.style.borderRadius = '5px';
    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        document.body.removeChild(notificationDiv);
    }, 2000);
}
function displayStats() {
    const statsList = document.getElementById('stats-list');
    if (!statsList) {
        console.error('Stats list element is missing.');
        return;
    }

    const stats = JSON.parse(localStorage.getItem('playerStats')) || {};
    statsList.innerHTML = `
        <ul>
            <li>Games Played: ${stats.gamesPlayed || 0}</li>
            <li>Games Won: ${stats.gamesWon || 0}</li>
            <li>Times Evicted: ${stats.evictions || 0}</li>
            <li>Months Unlocked: ${stats.monthsUnlocked || 0}/12</li>
            <li>Total Money Won: $${(stats.totalMoneyWon || 0).toLocaleString()}</li>
            <li>Total Money Lost: $${(stats.totalMoneyLost || 0).toLocaleString()}</li>
            <li>Hustlers Recruited: ${stats.hustlersRecruited || 0}</li>
            <li>Total Time Played: ${formatTime(stats.totalTimePlayed || 0)}</li>
            <li>Current Winning Streak: ${stats.currentWinStreak || 0}</li>
            <li>Longest Winning Streak: ${stats.longestWinStreak || 0}</li>
            <li>Total Days Passed: ${stats.totalDaysPassed || 0}</li>
        </ul>
    `;
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}
function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play().catch(err => console.error('Audio play error:', err));
}

function playRandomSound(sounds) {
    const randomIndex = Math.floor(Math.random() * sounds.length);
    playSound(sounds[randomIndex]);
}
document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = [
        'rollButton',
        'betButton',
        'quitButton',
        'betting-status',
        'rent-status',
        'inventoryItems',
        'buy-item-container',
        'item-list',
        'gameOverContainer',
        'bet25Button',
        'bet50Button',
        'bet100Button',
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error(
            `One or more required elements are missing in the DOM: ${missingElements.join(', ')}`
        );
    } else {
        console.log('All required elements are present.');
    }
});

