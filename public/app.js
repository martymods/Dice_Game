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
}); // End of DOMContentLoaded
// Setup Single Player
function setupSinglePlayer() {
    console.log('Single Player mode active');
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    if (!rollButton || !betButton || !quitButton) {
        console.error('Required elements for single-player mode are missing.');
        return;
    }

    rollButton.addEventListener('click', handleRollDice);
    betButton.addEventListener('click', handlePlaceBet);
    quitButton.addEventListener('click', quitGame);

    console.log('Single Player setup completed.');
}

// Check for required elements
const requiredElementIds = [
    'rollButton',
    'betButton',
    'quitButton',
    'betting-status',
    'gameStatus',
    'rent-status',
    'inventoryItems', // Inventory list
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
const bettingStatus = document.getElementById('betting-status');
const rentStatus = document.getElementById('rent-status');
const bet25Button = document.getElementById('bet25Button');
const bet50Button = document.getElementById('bet50Button');
const bet100Button = document.getElementById('bet100Button');

// Add event listeners for betting buttons
if (bet25Button && bet50Button && bet100Button) {
    bet25Button.addEventListener('click', () => {
        setBet(balance * 0.25);
    });

    bet50Button.addEventListener('click', () => {
        setBet(balance * 0.5);
    });

    bet100Button.addEventListener('click', () => {
        setBet(balance);
    });
} else {
    console.error('One or more betting buttons are missing.');
}

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

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    animateDice(dice1, dice2, () => {
        processDiceRoll(sum);
    });
}

function processDiceRoll(sum) {
    let rollBonus = 0;

    // Check for passive effects from items
    items.forEach(item => {
        if (item.name === 'Loaded Dice 🎲') {
            rollBonus += window.itemEffects.loadedDiceEffect(sum, currentBet);
        }
    });

    if (sum === 7 || sum === 11) {
        const winnings = currentBet * 2 + rollBonus;
        balance += winnings;
        displayGameStatus(`You win! 🎉 Roll: ${sum}`);
        flashScreen('gold');
        showWinningAmount(winnings);
    } else if (sum === 2 || sum === 3 || sum === 12) {
        displayGameStatus(`You lose! 💔 Roll: ${sum}`);
        flashScreen('red');
        showLosingAmount(currentBet);
    } else {
        balance += rollBonus;
        displayGameStatus(`Roll: ${sum}`);
    }

    currentBet = 0; // Reset bet after roll
    updateUI();
}

function handlePlaceBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value, 10);
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
function updateUI() {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus && rentStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        if (dreamCoins > 0) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls` +
                ` <img src="/images/DW_Logo.png" alt="DreamCoin" style="width: 20px; height: 20px;"> ${dreamCoins}`;
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

function displayGameStatus(message) {
    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
        gameStatus.textContent = message;
    } else {
        console.error('Game status element is missing in the DOM.');
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
function handleGameOver() {
    const gameEndTime = Date.now();
    const timePlayed = Math.floor((gameEndTime - gameStartTime) / 1000);
    playerStats.totalTimePlayed += timePlayed;
    playerStats.evictions++;
    playerStats.currentWinStreak = 0;
    saveStats();

    flashScreen('red');

    const deathSound = new Audio('/sounds/Death0.ogg');
    deathSound.play().catch(err => console.error('Death sound error:', err));

    const gameOverContainer = document.getElementById('gameOverContainer');
    if (gameOverContainer) {
        gameOverContainer.style.display = 'block';
    } else {
        console.error('Game Over container is missing in the DOM.');
    }

    // Hide UI elements
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    [rollButton, betButton, bet25Button, bet50Button, bet100Button, bettingStatus, rentStatus].forEach(el => {
        if (el) el.style.display = 'none';
    });

    const landlordVideo = document.getElementById('landlordVideo');
    if (landlordVideo) {
        landlordVideo.style.display = 'block';
        landlordVideo.style.width = '80%';
        landlordVideo.style.height = 'auto';
        landlordVideo.style.position = 'absolute';
        landlordVideo.style.top = '10%';
        landlordVideo.style.left = '10%';
        landlordVideo.style.zIndex = '10';
        landlordVideo.style.backgroundColor = 'black';
        landlordVideo.style.border = '2px solid white';
        landlordVideo.style.boxShadow = '0px 0px 10px rgba(255, 255, 255, 0.7)';
        landlordVideo.loop = false;

        landlordVideo.play().catch(err => console.error('Landlord video error:', err));

        landlordVideo.addEventListener('ended', () => {
            landlordVideo.style.display = 'none';
            if (gameOverContainer) gameOverContainer.style.display = 'block';
        });
    }
}

function handleGameWin() {
    playerStats.gamesWon++;
    playerStats.currentWinStreak++;
    playerStats.longestWinStreak = Math.max(playerStats.longestWinStreak, playerStats.currentWinStreak);
    saveStats();

    const winMessage = document.getElementById('winMessage');
    if (winMessage) {
        winMessage.textContent = 'Congratulations, you won!';
        winMessage.style.display = 'block';
    }
}

function handleItemPurchase(item) {
    if (balance >= item.cost) {
        balance -= item.cost;
        items.push(item);

        if (item.name === 'Forged Papers 📜') {
            items = itemEffects.forgedPapersEffect(items);
        }

        playSound('/sounds/UI_Buy1.ogg');
        alert(`You purchased ${item.name}!`);

        const popup = document.getElementById('popup');
        if (popup) popup.style.display = 'none';

        displayInventory();
        updateUI();
    } else {
        alert('Not enough money to buy this item.');
    }
}

function displayInventory() {
    const inventoryDisplay = document.getElementById('inventoryItems');
    if (inventoryDisplay) {
        inventoryDisplay.innerHTML = items.map(item => `<li>${item.name} (${item.description})</li>`).join('');
    } else {
        console.error('Inventory display element is missing in the DOM.');
    }
}

function playSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);

    audio.play().catch(err => console.error('Audio play error:', err));
}
function flashScreen(color) {
    const body = document.body;
    const originalBackgroundColor = getComputedStyle(body).backgroundColor;

    // Apply the flash effect
    body.style.transition = 'background-color 0.2s ease';
    body.style.backgroundColor = color;

    setTimeout(() => {
        body.style.transition = 'background-color 0.5s ease';
        body.style.backgroundColor = originalBackgroundColor;
    }, 200); // Short flash duration
}

function updateUI() {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus && rentStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        if (dreamCoins > 0) {
            rentStatus.innerHTML = `
                Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls
                <img src="/images/DW_Logo.png" alt="DreamCoin" style="width: 20px; height: 20px;"> ${dreamCoins}`;
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

function quitGame() {
    window.location.href = '/';
}

function getItemColor(rarity) {
    switch (rarity) {
        case 'Common': return 'gray';
        case 'Uncommon': return 'blue';
        case 'Rare': return 'purple';
        case 'Very Rare': return 'gold';
        default: return 'white';
    }
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

    // Fade out and remove after 2 seconds
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

    // Fade out and remove after 2 seconds
    setTimeout(() => {
        loseAmountDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loseAmountDiv);
        }, 2000);
    }, 2000);
}
function handleGameOver() {
    const gameEndTime = Date.now();
    const timePlayed = Math.floor((gameEndTime - gameStartTime) / 1000);
    playerStats.totalTimePlayed += timePlayed;
    playerStats.evictions++;
    playerStats.currentWinStreak = 0;
    saveStats();

    // Trigger red flash for game over
    flashScreen('red');

    const deathSound = new Audio('/sounds/Death0.ogg');
    deathSound.play().catch(err => console.error('Death sound error:', err));

    const gameOverContainer = document.getElementById('gameOverContainer');
    if (gameOverContainer) {
        gameOverContainer.style.display = 'block';
    } else {
        console.error('Game Over Container element is missing.');
    }
}

function handleGameWin() {
    playerStats.gamesWon++;
    playerStats.currentWinStreak++;
    playerStats.longestWinStreak = Math.max(
        playerStats.longestWinStreak,
        playerStats.currentWinStreak
    );
    saveStats();
}

function trackMoneyWon(amount) {
    playerStats.totalMoneyWon += amount;
    saveStats();
}

function trackMoneyLost(amount) {
    playerStats.totalMoneyLost += amount;
    saveStats();
}

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
}

function playSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);

    // Resume audio context if necessary
    if (typeof audio.resume === "function") {
        audio.resume().catch(err => console.error("Audio context resume error:", err));
    }

    audio.play().catch(err => console.error('Audio play error:', err));
}

function showItemPopup() {
    const popup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');

    if (!popup || !itemList) {
        console.error('Item popup or item list elements are missing.');
        return;
    }

    popup.style.display = 'block';
    itemList.innerHTML = '';

    const shuffledItems = window.itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffledItems.forEach(item => {
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.style.backgroundColor = getItemColor(item.rarity);
        itemButton.onclick = () => {
            handleItemPurchase(item);

            // Play random Lord voice clip
            const voiceClips = [
                "/sounds/Lord_voice_0.ogg",
                "/sounds/Lord_voice_1.ogg",
                "/sounds/Lord_voice_2.ogg"
            ];
            playSound(voiceClips, true);
        };
        itemList.appendChild(itemButton);
    });

    const skipButton = document.createElement('button');
    skipButton.textContent = 'Save Money';
    skipButton.onclick = () => {
        playSound("/sounds/UI_Click1.ogg");
        popup.style.display = 'none';
    };
    itemList.appendChild(skipButton);
}

function handleItemPurchase(item) {
    if (balance >= item.cost) {
        balance -= item.cost;
        items.push(item);
        if (item.name === 'Forged Papers 📜') {
            items = itemEffects.forgedPapersEffect(items);
        }
        playSound("/sounds/UI_Buy1.ogg");
        alert(`You purchased ${item.name}!`);
        const popup = document.getElementById('itemPopup');
        if (popup) {
            popup.style.display = 'none';
        }
        displayInventory();
        updateUI();
    } else {
        alert('Not enough money to buy this item.');
    }
}

function displayInventory() {
    const inventoryDisplay = document.getElementById('inventoryItems');
    if (!inventoryDisplay) {
        console.error('Inventory display element is missing.');
        return;
    }

    inventoryDisplay.innerHTML = items.map(item =>
        `<li>${item.name} (${item.description})</li>`
    ).join('');
}

function updateUIAfterRoll() {
    updateUI();
    turns++;

    const rentPaidStatements = [
        "Well done! You paid the rent. But success has its price—the rent just went up!",
        "Congratulations on keeping up! I knew you could handle more, so I raised the rent!",
        "Impressive! You’ve survived another month. Let’s see if you can handle next month’s new rent.",
        "Good job paying the rent! But comfort is costly—your rent just increased.",
        "You did it! The rent’s paid. Now let’s see how you handle my latest adjustment.",
        "You’re doing so well! I couldn’t resist rewarding you with higher rent.",
        "Bravo! You’ve proven your worth… and now you’ll prove you can pay even more.",
        "Rent paid! Your reward? A bigger challenge. I’ve raised the stakes—and the rent!",
        "Fantastic work! To celebrate, I’ve made the rent a little more interesting for next time.",
        "You made it through! But the better you perform, the more I expect—rent’s going up!"
    ];

    const voiceClips = [
        "/sounds/Lord_voice_0.ogg",
        "/sounds/Lord_voice_1.ogg",
        "/sounds/Lord_voice_2.ogg"
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

            showItemPopup();
        } else {
            handleGameOver();
        }
    }

    if (balance <= 0) {
        handleGameOver();
    }
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

        // Check for passive effects
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

        currentBet = 0; // Reset the bet after roll
        updateUI();
        console.log(`Dice rolled: ${dice1}, ${dice2} (Sum: ${sum})`);
    });
}

function updateUI() {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus && rentStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        if (dreamCoins > 0) {
            rentStatus.innerHTML = `
                Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls
                <img src="/images/DW_Logo.png" alt="DreamCoin" style="width: 20px; height: 20px;"> ${dreamCoins}
            `;
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

function quitGame() {
    window.location.href = '/';
}

function getItemColor(rarity) {
    switch (rarity) {
        case 'Common': return 'gray';
        case 'Uncommon': return 'blue';
        case 'Rare': return 'purple';
        case 'Very Rare': return 'gold';
        default: return 'white';
    }
}

function animateDice(dice1, dice2, callback) {
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');

    if (!dice1Element || !dice2Element) {
        console.error('Dice elements are missing in the DOM.');
        callback();
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

// Ensure all elements are loaded and setup
document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = [
        'betting-status',
        'rent-status',
        'rollButton',
        'betButton',
        'quitButton',
        'bet25Button',
        'bet50Button',
        'bet100Button'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error(`Missing DOM elements: ${missingElements.join(', ')}`);
        return;
    }

    console.log('All required elements are present.');

    setupSinglePlayer();
    updateUI();
});

}
}
