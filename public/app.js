// app.js

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

    playerStats.gamesPlayed++;
    saveStats();


// Ensure the required items are accessible globally
window.itemEffects = window.itemEffects || {};

// Define the startSinglePlayer function globally
window.startSinglePlayer = function () {
    window.location.href = 'game.html?singlePlayer=true';
};

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
const urlParams = new URLSearchParams(window.location.search);
const isSinglePlayer = urlParams.has('singlePlayer');

if (urlParams.has('stats')) {
    displayStats();
} else if (isSinglePlayer) {
    setupSinglePlayer();
} else {
    console.log('Main menu mode detected.');
}
}); // This closes the DOMContentLoaded event listener properly

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
}

// Function to set up single-player mode
async function setupSinglePlayer() {
    console.log('Single Player mode active.');


// Ensure necessary elements exist
const requiredElementIds = [
    'rollButton',
    'betButton',
    'quitButton',
    'betting-status',
    'gameStatus',
    'rent-status',
    'inventoryItems', // Corrected to ensure inventory list is properly referenced
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
    return;
}


// Example initialization for existing elements
const rollButton = document.getElementById('rollButton');
const betButton = document.getElementById('betButton');
const quitButton = document.getElementById('quitButton');
const bettingStatus = document.getElementById('betting-status');
const rentStatus = document.getElementById('rent-status');
const bet25Button = document.getElementById('bet25Button');
const bet50Button = document.getElementById('bet50Button');
const bet100Button = document.getElementById('bet100Button');

// Ensure all required elements exist before adding event listeners
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
};

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
} // Closing brace for script.onload

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
                const winnings = currentBet * 2 + rollBonus; // Calculate winnings
                balance += winnings; // Update balance
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
    
                // Play Winner sound
                playSound("/sounds/Winner_0.ogg");
    
                // Trigger flashing screen effect
                flashScreen('gold');
    
                // Show winning amount
                showWinningAmount(winnings);
    
            } else if (sum === 2 || sum === 3 || sum === 12) {
                const loss = currentBet; // Loss amount
                balance -= loss; // Deduct the bet
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
    
                // Play Loser sound
                playSound("/sounds/Loser_0.ogg");
    
                // Trigger flashing screen effect
                flashScreen('red');
    
                // Show losing amount
                showLosingAmount(loss);
            } else {
                balance += rollBonus; // Apply bonus
                gameStatus.textContent = `Roll: ${sum}`;
            }
    
            currentBet = 0; // Reset bet after roll
            updateUIAfterRoll();
        });
    }

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

    function showItemPopup() {
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
                const voiceClips = ["/sounds/Lord_voice_0.ogg", "/sounds/Lord_voice_1.ogg", "/sounds/Lord_voice_2.ogg"];
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
            balance -= item.cost; // Deduct item cost
            items.push(item);
            if (item.name === 'Forged Papers 📜') {
                items = itemEffects.forgedPapersEffect(items);
            }
            playSound("/sounds/UI_Buy1.ogg");
            alert(`You purchased ${item.name}!`);
            popup.style.display = 'none';
            displayInventory();
            updateUI(); // Update UI after purchase
        } else {
            alert('Not enough money to buy this item.');
        }
    }

    function displayInventory() {
        inventoryDisplay.innerHTML = items.map(item => `<li>${item.name} (${item.description})</li>`).join('');
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
    
                // Play random Lord voice clip and show congratulation popup
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
    
    function handleGameOver() {
        const deathSound = new Audio('/sounds/Death0.ogg');
        deathSound.play().catch(err => console.error('Death sound error:', err));

        // Hide UI elements
        rollButton.style.display = 'none';
        betButton.style.display = 'none';
        bet25Button.style.display = 'none';
        bet50Button.style.display = 'none';
        bet100Button.style.display = 'none';
        bettingStatus.style.display = 'none';
        rentStatus.style.display = 'none';
        inventoryDisplay.style.display = 'none';
        gameTitle.style.display = 'none';

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

        landlordVideo.play().catch(err => console.error('Video play error:', err));

        landlordVideo.addEventListener('ended', () => {
            landlordVideo.style.display = 'none';
            gameOverContainer.style.display = 'block';
        });
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

if (!window.updateUIAfterRoll) { // Ensure no duplicate declarations
    function updateUIAfterRoll() {
        updateUI();
        turns++;

        const rentPaidStatements = [
            "Well done! You paid the rent. But success has its price—the rent just went up!",
            "Congratulations on keeping up! I knew you could handle more, so I raised the rent!",
            "Impressive! You’ve survived another month. Let’s see if you can handle next month’s new rent!",
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
                // Deduct rent and adjust progression
                balance -= rent;
                rent *= progression <= 9 ? 4 : 5;
                maxTurns++;
                progression++;
                turns = 0;
    
                // Update player stats
                playerStats.totalDaysPassed += 30;
                playerStats.monthsUnlocked = Math.max(playerStats.monthsUnlocked, progression);
                saveStats();
    
                // Play random Lord voice clip
                const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
                playSound(randomClip);
    
                // Display congratulatory popup
                const randomStatement = rentPaidStatements[Math.floor(Math.random() * rentPaidStatements.length)];
                alert(randomStatement);
    
                // Show item popup
                showItemPopup();
            } else {
                handleGameOver();
            }
        }
    
        if (balance <= 0) {
            handleGameOver();
        }
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
    
        gameOverContainer.style.display = 'block';
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
    function flashScreen(color) {
        const body = document.body;
        const originalBackgroundColor = getComputedStyle(body).backgroundColor;
    
        // Apply flash effect
        body.style.transition = 'background-color 0.2s ease';
        body.style.backgroundColor = color; // Flash color
        setTimeout(() => {
            body.style.transition = 'background-color 0.5s ease';
            body.style.backgroundColor = originalBackgroundColor;
        }, 200); // Short flash duration
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
    
    
        
// Stats Display Logic
function displayStats() {
    const statsList = document.getElementById('stats-list');
    if (!statsList) {
        console.error('Stats list element is missing.');
        return;
    }

    // Load stats from localStorage and display them
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
}
