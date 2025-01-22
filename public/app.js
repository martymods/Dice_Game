// app.

import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats, updateWinStreak, resetWinStreak } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects, updateHustlerUI } from './modules/hustlers.js';
import { updateUI, showItemPopup, getItemColor, handleGameOverScreen } from './modules/ui.js';
import { itemsList } from './items.js';
import { playSound } from './modules/audio.js';
import { applyPurchasedItemEffects } from './itemEffects.js'; 
import { updateBalanceDisplay, setEarningsPerSecond } from './modules/ui.js'; // Ensure the correct path

// Example: Setting earnings dynamically based on gameplay logic
if (document.getElementById("earnings-per-second")) {
setEarningsPerSecond(15.75); // This sets the earnings per second to $15.75
}

// Use `window.socket` instead:
console.log('Using global socket in app.js:', window.socket);


// Fire Status
let winStreak = 0; // Track the current winning streak
let playerHasPurchased = false; // Track if the player has purchased an item/hustler in the shop
let onFire = false; // Whether the dice are "on fire"
let fireSound; // Sound for when "on fire" is active
let canRollDice = true; // Flag to track if rolling is allowed
let cursorX = window.innerWidth / 2; // Initialize cursor position (center of the screen)
let cursorY = window.innerHeight / 2;
let isShaking = false; // Track if the controller is shaking
let shakeThreshold = 0.8; // Adjust sensitivity for detecting shakes
let rollInProgress = false; // Prevent multiple rolls simultaneously

let hustlerInventory = []; // Player's hustlers
let ambienceSound = new Audio('/sounds/Ambience0.ogg');
ambienceSound.loop = true;


// Global API Base URL
const API_BASE_URL = 'https://dice-game-1-6iwc.onrender.com'; // Adjust as needed

// Ensure the required items are accessible globally
window.itemEffects = window.itemEffects || {}; // Remove if you are including it via another script

// Import item effects for modules only
if (typeof window === "undefined") {

}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    // Initialize the game mode
    if (urlParams.has('stats')) {
        displayStats();
    } else if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.log('No specific game mode detected. Defaulting to Main Menu.');
    }

});

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
        totalTimePlayed: 0, // In seconds
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
    };

    window.formatTime = function (seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    };

    window.startSinglePlayer = function () {
        window.location.href = 'game.html?singlePlayer=true';
    };
}

async function setupSinglePlayer() {
    loadStats();
    const purchasedItems = []; // Initialize or fetch purchased items here
    applyPurchasedItemEffects(purchasedItems); // Apply pre-purchased effects
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let items = [];
    let dreamCoins = 0; // New DreamCoin balance
    let gameStartTime = Date.now();

    // Increment games played
    playerStats.gamesPlayed++;
    saveStats();

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const inventoryDisplay = document.getElementById('inventory-list');
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');
    const gameOverContainer = document.getElementById('gameOverContainer');
    const landlordVideo = document.getElementById('landlordVideo');
    const gameTitle = document.querySelector('h1');

    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');

    const ambienceSound = new Audio('/sounds/Ambience0.ogg');
    ambienceSound.loop = true;
    ambienceSound.play().catch(err => console.error('Ambience sound error:', err));

     // Ensure necessary elements exist
     const requiredElements = [
        { id: 'rollButton', element: rollButton },
        { id: 'betButton', element: betButton },
        { id: 'quitButton', element: quitButton },
        { id: 'betting-status', element: bettingStatus },
        { id: 'gameStatus', element: gameStatus },
        { id: 'rent-status', element: rentStatus },
        { id: 'inventory-list', element: inventoryDisplay },
        { id: 'buy-item-container', element: popup },
        { id: 'item-list', element: itemList },
        { id: 'gameOverContainer', element: gameOverContainer },
        { id: 'bet25Button', element: bet25Button },
        { id: 'bet50Button', element: bet50Button },
        { id: 'bet100Button', element: bet100Button }
    ];

    for (const { id, element } of requiredElements) {
        if (!element) {
            console.error(`Missing required element: ${id}`);
            alert(`Missing required element: ${id}. Please check the HTML.`);
            return;
        }
    }
   
    if (!itemsList || itemsList.length === 0) {
        console.error('Items list is empty or not loaded from items.js.');
        alert('Failed to load items. Please refresh the page.');
        return;
    }
    
        updateUI();

        rollButton.addEventListener('click', handleRollDice);
        betButton.addEventListener('click', handlePlaceBet);
        quitButton.addEventListener('click', quitGame);

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
   

        function setBet(input) {
            let amount;
        
            // Determine if input is a percentage or a fixed amount
            if (typeof input === "number" && input <= 1) {
                // If input is a decimal (percentage), calculate the bet amount
                amount = Math.floor(balance * input);
            } else {
                // Otherwise, treat it as a fixed amount
                amount = input;
            }
        
            // Ensure the bet does not exceed the balance
            if (amount > balance) amount = balance;
        
            // Validate the bet
            if (amount <= 0) {
                alert("Insufficient balance to place this bet!");
                return;
            }
        
            // Update the current bet and UI
            currentBet = Math.floor(amount);
            console.log(`Bet set to: $${currentBet}`); // Debugging log
            updateUI(); // Update the UI with the new bet
        }
        
        // Make the function globally accessible
        window.setBet = setBet;
        

        function handleRollDice() {
            if (!canRollDice) {
                console.log("Roll Dice is on cooldown."); // Debugging message
                return;
            }
        
            if (currentBet <= 0) {
                alert('Place a bet first!');
                return;
            }
        
            canRollDice = false; // Disable rolling
            setTimeout(() => {
                canRollDice = true; // Re-enable rolling after 0.2 seconds
            }, 200); // 200 milliseconds delay

        // Dim the background and highlight the dice during the roll
        const gameContainer = document.getElementById('game-container');
        const diceContainer = document.getElementById('dice-container');
        gameContainer.classList.add('dimmed'); // Dim the background
        diceContainer.classList.add('dimmed-dice'); // Brighten the dice and add glow

        // Play dice shake sound
        playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

        // Generate dice rolls
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        // Apply Hustler Effects
        const { multiplier, cashBonus } = applyHustlerEffects(dice1, dice2);

        // Animate dice rolling
        animateDice(dice1, dice2, () => {
            // Play dice roll sound after animation stops
            const diceRollSounds = ["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"];
            const randomSound = diceRollSounds[Math.floor(Math.random() * diceRollSounds.length)];
            playSound(randomSound);


            let winnings = 0;

            if (sum === 7 || sum === 11) {
                // Winning roll
                winnings = currentBet * 2 * multiplier + cashBonus;
                balance += winnings;
                updateBalanceDisplay(balance); // Reflect changes
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                playSound("/sounds/Winner_0.ogg");
                flashScreen('gold');
                showWinningAmount(winnings);

                // Update total money won
                playerStats.totalMoneyWon += winnings;
                saveStats();

                winStreak++;
                if (winStreak >= 3 && !onFire) {
                    activateOnFire(); // Activate "on fire" if streak is 3
                }
            } else if (sum === 2 || sum === 3 || sum === 12) {
                // Losing roll
                balance -= currentBet; // Deduct the bet on loss
                updateBalanceDisplay(balance); // Reflect changes
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                playSound("/sounds/Loser_0.ogg");
                flashScreen('red');
                showLosingAmount(currentBet);

                // Update total money lost
                playerStats.totalMoneyLost += currentBet;
                saveStats();

                winStreak = 0; // Reset streak
                if (onFire) deactivateOnFire(); // Deactivate "on fire" on loss
            } else {
                // Neutral roll
                balance += cashBonus;
                gameStatus.textContent = `Roll: ${sum}. Multiplier: ${multiplier}x. Bonus: $${cashBonus}`;
            }

            currentBet = 0;
            updateUIAfterRoll();

            // Restore background brightness after roll
            setTimeout(() => {
                gameContainer.classList.remove('dimmed');
                diceContainer.classList.remove('dimmed-dice');
            }, 1000); // Restore after 1 second
        });
    }

    // Attach handleRollDice to the window object
    window.handleRollDice = handleRollDice;
    
    function updateBalanceImages(balance) {
        console.log(`Updating balance to: ${balance}`); // Debugging log
        const balanceContainer = document.getElementById('balance-images');
        if (!balanceContainer) {
            console.error('Balance container not found');
            return;
        }
        balanceContainer.innerHTML = ''; // Clear existing images
    
        const balanceString = balance.toString(); // Convert balance to string
        for (let digit of balanceString) {
            const digitElement = document.createElement('div');
            digitElement.classList.add('balance-digit');
            digitElement.style.backgroundImage = `url('/images/Font_Number_${digit}.gif')`;
            balanceContainer.appendChild(digitElement);
        }
    }
    

// Global variable for the fire border
let fireBorderElement;

function activateOnFire() {
    onFire = true;
    playSound("/sounds/FireIgnite0.ogg"); // Play ignite sound

    // Change dice to fire versions
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');
    dice1Element.src = '/images/DiceFire1.gif';
    dice2Element.src = '/images/DiceFire2.gif';

    // Add fire effect class
    dice1Element.classList.add('dice-fire');
    dice2Element.classList.add('dice-fire');

    // Start fire sound loop
    fireSound = new Audio('/sounds/FireBurn0.ogg');
    fireSound.loop = true;
    fireSound.play().catch(err => console.error('Error playing fire burn sound:', err));

    // Display the fire border image with fade-in
    if (!fireBorderElement) {
        fireBorderElement = document.createElement('img');
        fireBorderElement.src = '/images/Border_FireDice.gif';
        fireBorderElement.alt = 'Fire Border';
        fireBorderElement.style.position = 'fixed';
        fireBorderElement.style.top = '0';
        fireBorderElement.style.left = '0';
        fireBorderElement.style.width = '100%';
        fireBorderElement.style.height = '100%';
        fireBorderElement.style.objectFit = 'cover';
        fireBorderElement.style.zIndex = '9997'; // Just below other interactive elements
        fireBorderElement.style.opacity = '0'; // Start fully transparent
        fireBorderElement.style.transition = 'opacity 0.5s ease-in'; // Smooth fade-in
        fireBorderElement.style.pointerEvents = 'none'; // Make it non-interactive
        document.body.appendChild(fireBorderElement);

        // Trigger fade-in
        setTimeout(() => {
            fireBorderElement.style.opacity = '1';
        }, 10); // Allow the browser to render before starting the transition
    }

    gameStatus.textContent = "🔥 You're on fire! All winnings are doubled! 🔥";
}

function deactivateOnFire() {
    onFire = false;
    playSound("/sounds/FireEnd0.ogg"); // Play end sound

    // Revert dice to normal versions
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');
    dice1Element.src = '/images/dice1.gif';
    dice2Element.src = '/images/dice2.gif';

    // Remove fire effect class
    dice1Element.classList.remove('dice-fire');
    dice2Element.classList.remove('dice-fire');

    // Stop fire sound loop
    if (fireSound) {
        fireSound.pause();
        fireSound = null;
    }

    // Hide the fire border image with fade-out
    if (fireBorderElement) {
        fireBorderElement.style.transition = 'opacity 0.5s ease-out'; // Smooth fade-out
        fireBorderElement.style.opacity = '0';
        setTimeout(() => {
            if (fireBorderElement && fireBorderElement.parentNode) {
                fireBorderElement.parentNode.removeChild(fireBorderElement);
                fireBorderElement = null; // Clean up
            }
        }, 500); // Wait for the fade-out to complete
    }

    gameStatus.textContent = "🔥 Fire has ended. Good luck! 🔥";
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

    function displayInventory() {
        inventoryDisplay.innerHTML = items.map(item => `<li>${item.name} (${item.description})</li>`).join('');
    }

    function updateUI() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;

        const hustlerEffects = hustlerInventory.map(hustler => hustler.description).join(', ');
        const hustlerEffectElement = document.getElementById('hustler-effects');
        if (hustlerEffectElement) {
            hustlerEffectElement.textContent = `Active Hustler Effects: ${hustlerEffects}`;
        }

        updateBackgroundImage();
    }


    function updateBackgroundImage() {
        const rollsRemaining = maxTurns - turns;
        if (rollsRemaining === maxTurns) {
            document.body.style.backgroundImage = "url('/images/LandLord0.gif')";
        } else if (rollsRemaining <= maxTurns / 2 && rollsRemaining > 2) {
            document.body.style.backgroundImage = "url('/images/LandLord1.gif')";
        } else if (rollsRemaining <= 2) {
            document.body.style.backgroundImage = "url('/images/LandLord2.gif')";
        }
    }

    function quitGame() {
        window.location.href = '/';
    }
    // Attach quitGame to the global window object
    window.quitGame = quitGame;
    console.log(window.quitGame); // Should log the quitGame function


    // Handle Showing and Hiding the Combinations Modal
    document.addEventListener('DOMContentLoaded', () => {
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    showCombinationsButton.addEventListener('click', () => {
        combinationsModal.style.display = 'flex';
    });

    closeCombinationsButton.addEventListener('click', () => {
        combinationsModal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    combinationsModal.addEventListener('click', (event) => {
        if (event.target === combinationsModal) {
            combinationsModal.style.display = 'none';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    if (showCombinationsButton && combinationsModal && closeCombinationsButton) {
        // Show the combinations modal when the button is clicked
        showCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'flex'; // Show the modal
        });

        // Hide the combinations modal when the close button is clicked
        closeCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'none'; // Hide the modal
        });

        // Optional: Close the modal when clicking outside the modal content
        combinationsModal.addEventListener('click', (event) => {
            if (event.target === combinationsModal) {
                combinationsModal.style.display = 'none';
            }
        });
    } else {
        console.error('Combination modal elements are missing in the DOM.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cryptoSection = document.getElementById('crypto-section');
    if (cryptoSection) {
        cryptoSection.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const action = event.target.textContent.trim();
                if (action === "Connect MetaMask") {
                    connectMetaMask();
                } else if (action === "Place Bet") {
                    const betAmountETH = document.getElementById('betAmountETH')?.value;
                    if (betAmountETH) {
                        placeBet(betAmountETH);
                    } else {
                        alert("Please enter a valid bet amount.");
                    }
                }
            }
        });
    } else {
        console.error("Crypto section element is missing.");
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('intro-container');
    const mainMenu = document.getElementById('main-menu');
    const skipIntroButton = document.getElementById('skip-intro');
if (skipIntroButton) {
    skipIntroButton.addEventListener('click', () => {
        clearTimeout(timer);
        introContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
    });
} else {
    console.error("skipIntroButton not found.");
}


    // Transition to main menu after 5 seconds
    const timer = setTimeout(() => {
        introContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
    }, 15000);

    // Skip intro immediately if button is clicked
    skipIntroButton.addEventListener('click', () => {
        clearTimeout(timer);
        introContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
    });
});


function animateDice(dice1, dice2, callback) {
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');

    if (!dice1Element || !dice2Element) {
        console.error("Dice elements not found in the DOM.");
        return;
    }

    // Set the rolling animation for both dice
    const rollingAnimation = '/images/3dDiceRoll_1.gif';
    dice1Element.src = rollingAnimation;
    dice2Element.src = rollingAnimation;

    // Play the rolling sound effect
    playSound("/sounds/DiceRoll.ogg");

    // Wait for the rolling animation to finish before showing the result
    setTimeout(() => {
        // Set the final dice result based on whether "onFire" is active
        dice1Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice1}${onFire ? '.gif' : '.gif'}`;
        dice2Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice2}${onFire ? '.gif' : '.gif'}`;

        // Execute the callback function after the final dice are displayed
        if (typeof callback === 'function') {
            callback();
        }
    }, 2000); // Adjust this timeout to match the duration of your rolling animation GIF
}


    function updateUIAfterRoll() {
        updateUI(balance, rent, turns, maxTurns, currentBet);
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
                console.log('Opening shop with items:', itemsList);
                showItemPopup(balance, [...itemsList]);


            } else {
                handleGameOver();
            }
        }
    
        // Add this check for balance reaching 0
        if (balance === 0) {
            showGameOverScreen();
        }
    
        if (balance <= 0) {
            handleGameOver();
        }
    }


   async function handleGameOver() {
        const gameEndTime = Date.now();
        const timePlayed = Math.floor((gameEndTime - gameStartTime) / 1000);
        playerStats.totalTimePlayed += timePlayed;
        playerStats.evictions++;
        playerStats.currentWinStreak = 0;
        saveStats();

            // Stop ambience sound
    if (ambienceSound) {
        ambienceSound.pause();
        ambienceSound.currentTime = 0; // Reset playback position
    }
    
        flashScreen('red');
        playSound('/sounds/Death0.ogg');
    
        // Leaderboard prompt for scores > 1
        if (balance > 1) {
        displayLeaderboardPrompt(balance);
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
        winAmountDiv.style.fontSize = '52px';
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

    /**
 * Displays the GameOverEvicted.gif covering the entire screen when the balance reaches 0.
 */
    function showGameOverScreen() {
        // Ensure a container for the game over screen
        const gameOverContainer = document.createElement('div');
        gameOverContainer.id = 'gameOverContainer';
        gameOverContainer.style.position = 'fixed';
        gameOverContainer.style.top = '0';
        gameOverContainer.style.left = '0';
        gameOverContainer.style.width = '100%';
        gameOverContainer.style.height = '100%';
        gameOverContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Black overlay
        gameOverContainer.style.display = 'flex';
        gameOverContainer.style.justifyContent = 'center';
        gameOverContainer.style.alignItems = 'center';
        gameOverContainer.style.zIndex = '9999';
    
        // Add the GameOverEvicted.gif image
        const gameOverImage = document.createElement('img');
        gameOverImage.src = '/images/GameOverEvicted.gif'; // Replace with the correct path
        gameOverImage.alt = 'Game Over';
        gameOverImage.style.width = '100%';
        gameOverImage.style.height = '100%';
        gameOverImage.style.objectFit = 'cover';
    
        gameOverContainer.appendChild(gameOverImage);
    
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.position = 'fixed';
        buttonsContainer.style.bottom = '20px';
        buttonsContainer.style.left = '50%';
        buttonsContainer.style.transform = 'translateX(-50%)';
        buttonsContainer.style.zIndex = '9999';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '20px';
    
        // Restart Button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.backgroundColor = '#28a745';
        restartButton.style.color = '#fff';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.addEventListener('click', () => {
            window.location.reload(); // Refresh the page
        });
    
        // Quit Game Button
        const quitButton = document.createElement('button');
        quitButton.textContent = 'Quit Game';
        quitButton.style.padding = '10px 20px';
        quitButton.style.fontSize = '18px';
        quitButton.style.backgroundColor = '#dc3545';
        quitButton.style.color = '#fff';
        quitButton.style.border = 'none';
        quitButton.style.borderRadius = '5px';
        quitButton.style.cursor = 'pointer';
        quitButton.addEventListener('click', () => {
            window.location.href = '/'; // Navigate to the main menu/index page
        });
    
        // Append buttons to the container
        buttonsContainer.appendChild(restartButton);
        buttonsContainer.appendChild(quitButton);
    
        // Append buttons container to the game over container
        gameOverContainer.appendChild(buttonsContainer);
    
        // Append the entire container to the body
        document.body.appendChild(gameOverContainer);
    }
    

function addHustlerToInventory(hustler) {
    if (hustlerInventory.length >= 5) {
        alert('You can only hold 5 Hustlers at a time. Discard one to make space.');
        return;
    }
    hustlerInventory.push(hustler);
    updateHustlerInventoryUI();
}

function applyHustlerEffects(roll1, roll2) {
    let multiplier = 1;
    let cashBonus = 0;

    hustlerInventory.forEach(hustler => {
        if (hustler.name === 'Joker') multiplier += 2;
        if (hustler.name === 'Greedy Joker' && roll1 + roll2 > 6) cashBonus += 5;
        if (hustler.name === 'Wrathful Joker' && roll1 + roll2 < 4) multiplier += 3;
        if (hustler.name === 'Even Steven' && (roll1 % 2 === 0 && roll2 % 2 === 0)) multiplier += 3;
        if (hustler.name === 'Odd Todd' && (roll1 % 2 !== 0 && roll2 % 2 !== 0)) multiplier += 3;
    });

    return { multiplier, cashBonus };
}

function updateHustlerInventoryUI() {
    const hustlerList = document.getElementById('hustler-list');
    const hustlerEffectElement = document.getElementById('hustler-effects');
    const hustlerCountElement = document.getElementById('hustler-count');
    const maxHustlers = 5; // Maximum number of hustlers allowed

    // Update hustler list
    hustlerList.innerHTML = ''; // Clear current list
    hustlerInventory.forEach((hustler, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${hustler.name} (${hustler.description}) 
            <button onclick="discardHustler(${index})">Discard</button>
        `;
        hustlerList.appendChild(li);
    });

    // Update active effects
    const activeEffects = hustlerInventory.map(hustler => hustler.effect).join(', ');
    hustlerEffectElement.textContent = activeEffects
        ? `Active Hustler Effects: ${activeEffects}`
        : 'Active Hustler Effects: None';

    // Update inventory count
    hustlerCountElement.textContent = `Max Hustlers: ${hustlerInventory.length}/${maxHustlers}`;
}

function updateHustlerPanel() {
    const hustlersDisplay = document.getElementById("hustlers-display");
    hustlersDisplay.innerHTML = ""; // Clear existing

    hustlerInventory.forEach(hustler => {
        const hustlerElement = document.createElement("div");
        hustlerElement.classList.add("hustler");
        hustlerElement.textContent = hustler.name[0]; // Use the first letter or an emoji
        hustlerElement.setAttribute("data-description", hustler.description); // Tooltip
        hustlersDisplay.appendChild(hustlerElement);
    });
}

updateHustlerPanel();


function discardHustler(index) {
    hustlerInventory.splice(index, 1); // Remove the hustler
    updateHustlerInventoryUI(); // Refresh UI
}
// Manage Store Open/Close Animation
function toggleStore(open) {
    const storeImage = document.getElementById('store-image');
    const buyItemContainer = document.getElementById('buy-item-container');

    if (open) {
        // Show the "Store Open" animation
        storeImage.src = '/images/Store0.gif';
        setTimeout(() => {
            buyItemContainer.style.display = 'block'; // Show the buy item section
        }, 1000); // Wait for 1 second
    } else {
        // Close the store
        buyItemContainer.style.display = 'none'; // Hide the buy item section
        storeImage.src = '/images/StoreSign_Closed0.gif';
    }
}

// Add event listener for the "Save Money" button
document.getElementById('saveMoneyButton').addEventListener('click', () => {
    toggleStore(false);
});



}// Stats Display Logic
function displayStats() {
    loadStats(); // Ensure stats are loaded from localStorage
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

const ethers = window.ethers;

// Payout Winnings (Transfer ETH from your wallet to player's wallet)
async function payoutWinnings(playerAddress, winningsETH) {
    try {
        const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider); // Replace with your private key
        const transaction = await wallet.sendTransaction({
            to: playerAddress,
            value: ethers.utils.parseEther(winningsETH.toString()), // Convert ETH amount
        });

        console.log("Payout successful:", transaction);
        alert("Payout sent successfully!");
    } catch (error) {
        console.error("Error sending payout:", error);
        alert("Payout failed. Please check your wallet.");
    }
}

// Example: Call this function when the player wins
async function handleWin(betAmount) {
    const winnings = betAmount * 2; // x1 bonus = double the bet
    const ethToUsdRate = 3500; // Example conversion rate: 1 ETH = $3500
    const winningsUSD = (winnings * ethToUsdRate).toFixed(2);

    const transaction = await signer.sendTransaction({
        to: await signer.getAddress(), // Player's wallet address
        value: ethers.utils.parseEther(winnings.toString()),
    });

    console.log("Payout successful:", transaction);
    alert(`Congratulations! You won ${winnings} ETH ($${winningsUSD}).`);

    const gameStatus = document.getElementById('gameStatus');
    gameStatus.innerHTML = `
        <span style="color: #7fbcf7;">+${winnings} ETH</span>
        <span>($${winningsUSD})</span>
    `;
}

// Example: Call this function when the player loses
function handleLoss(betAmount) {
    const ethToUsdRate = 3500; // Example conversion rate
    const lossUSD = (betAmount * ethToUsdRate).toFixed(2);

    const gameStatus = document.getElementById('gameStatus');
    gameStatus.innerHTML = `
        <span style="color: red;">-${betAmount} ETH</span>
        <span>($${lossUSD})</span>
    `;
    alert(`You lost ${betAmount} ETH ($${lossUSD}). Better luck next time!`);
}

export function startSinglePlayer() {
    // Show the transition overlay
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';

    // Play the transition sound
    const transitionSound = new Audio('/sounds/transitionSFX0.ogg');
    transitionSound.play().catch(err => console.error('Error playing transition sound:', err));

    // Wait for 2 seconds before navigating to the game
    setTimeout(() => {
        window.location.href = 'game.html?singlePlayer=true';
    }, 5000);
}

// MetaMask Connection
let provider;
let signer;

// MetaMask Connection
export async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected wallet:", address);

        // Persist wallet address in localStorage
        localStorage.setItem("connectedWallet", address);

        alert(`Connected wallet: ${address}`);
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}
// Make signer accessible globally
window.signer = signer;


// Restore Wallet Connection on Page Reload
document.addEventListener('DOMContentLoaded', async () => {
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
        console.log(`Restoring connection to wallet: ${savedWallet}`);

        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            try {
                const address = await signer.getAddress();
                console.log(`Wallet successfully restored: ${address}`);
            } catch (err) {
                console.error("Error restoring wallet:", err);
                localStorage.removeItem("connectedWallet");
            }
        } else {
            console.error("MetaMask is not installed.");
        }
    }
});


// Make connectMetaMask globally accessible
window.connectMetaMask = connectMetaMask;


// Place Bet (Transfer ETH from player to your wallet)
export async function placeBet(betAmountETH) {
    try {
        if (!signer) {
            alert("Please connect your MetaMask wallet first.");
            return;
        }

        // Validate and parse bet amount
        const betAmount = parseFloat(betAmountETH);
        if (isNaN(betAmount) || betAmount <= 0) {
            alert("Invalid bet amount.");
            return;
        }

        // Get current ETH to USD conversion rate (hardcoded for now or fetched via API)
        const ethToUsdRate = 1800; // Example conversion rate: 1 ETH = $1800
        const betAmountUSD = (betAmount * ethToUsdRate).toFixed(2);

        // Transaction: send ETH to your wallet
        const transaction = await signer.sendTransaction({
            to: "0x5638c9f84361a7430b29a63216f0af0914399eA2", // Replace with your wallet address
            value: ethers.utils.parseEther(betAmount.toString()),
        });

        console.log("Transaction successful:", transaction);

        // Display bet amount in ETH and USD
        const bettingStatus = document.getElementById('betting-status');
        bettingStatus.innerHTML = `
            <img src="/images/ETH_Logo.png" alt="ETH" style="width: 24px; vertical-align: middle;">
            <span style="color: #7fbcf7;">${betAmount} ETH</span>
            <span>($${betAmountUSD})</span>
        `;
        alert("Bet placed successfully!");

        // Simulate game outcome (for example purposes)
        const playerWon = Math.random() < 0.5; // 50% chance of winning
        if (playerWon) {
            await handleWin(betAmount);
        } else {
            handleLoss(betAmount);
        }
    } catch (error) {
        console.error("Error placing bet:", error);
        alert("Bet placement failed. Please try again.");
    }
}


window.placeBet = placeBet;


document.getElementById('crypto-section').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const action = event.target.textContent.trim();
        if (action === "Connect MetaMask") {
            connectMetaMask();
        } else if (action === "Place Bet") {
            const betAmountETH = document.getElementById('betAmountETH').value;
            placeBet(betAmountETH);
        }
    }
});

function disconnectWallet() {
    localStorage.removeItem("connectedWallet");
    signer = null;
    alert("Wallet disconnected.");
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

    // Play game over sound
    if (ambienceSound) {
        ambienceSound.pause();
        ambienceSound.currentTime = 0; // Reset playback position
    }
    const deathSound = new Audio('/sounds/Death0.ogg');
    deathSound.play().catch(err => console.error('Death sound error:', err));

    // Display the game-over screen with animations
    handleGameOverScreen();
    
    // Trigger leaderboard prompt if score is greater than 1
        if (balance > 1) {
            displayLeaderboardPrompt(balance);
        } else {
            alert('Game Over! Better luck next time.');
        }
    }
    

// Leaderboard Prompt Function
async function displayLeaderboardPrompt(score) {
    const overlay = document.getElementById("leaderboard-overlay");
    const playerNameInput = document.getElementById("player-name");
    const submitButton = document.getElementById("submit-leaderboard");
    const leaderboardDisplay = document.getElementById("leaderboard-entries");

    // Clear previous buttons if any
    const quitButtonExists = document.getElementById("quit-leaderboard");
    if (quitButtonExists) quitButtonExists.remove();

    overlay.style.display = "flex";

    try {
        // Fetch leaderboard data
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leaderboardData = await response.json();

        // Populate leaderboard display
        leaderboardDisplay.innerHTML = leaderboardData
            .map((entry, index) => `<p>${index + 1}. ${entry.name}: $${entry.score}</p>`)
            .join("");
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        leaderboardDisplay.innerHTML = "<p>Unable to load leaderboard.</p>";
    }

    // Create a Quit Game button dynamically
    const quitButton = document.createElement("button");
    quitButton.id = "quit-leaderboard";
    quitButton.textContent = "Quit Game";
    quitButton.style.marginLeft = "10px"; // Add spacing from the Submit button
    quitButton.onclick = window.quitGame; // Use the globally attached quitGame function

    // Add the Quit Game button next to Submit button
    submitButton.parentNode.insertBefore(quitButton, submitButton.nextSibling);

    // Submit leaderboard entry
    submitButton.onclick = async () => {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            try {
                const response = await fetch(`${API_BASE_URL}/leaderboard`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: playerName, score }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Refresh leaderboard after submission
                const updatedLeaderboard = await fetch(
                    `${API_BASE_URL}/leaderboard`
                ).then((res) => res.json());
                leaderboardDisplay.innerHTML = updatedLeaderboard
                    .map((entry, index) => `<p>${index + 1}. ${entry.name}: $${entry.score}</p>`)
                    .join("");

                // Clear input and display success message
                playerNameInput.value = "";
                alert("Leaderboard entry submitted successfully!");
            } catch (error) {
                console.error("Error submitting leaderboard entry:", error);
                alert("Unable to submit leaderboard entry. Please try again.");
            }
        } else {
            alert("Please enter a name to submit your score.");
        }
    };
}


// List of fortunes
const fortunes = [
    "Believe in yourself.",
    "You’re doing great!",
    "Success is near...",
    "You’re closer than you think.",
    "Keep climbing! The ceiling’s not that far.",
    "Your dream will come to life later today.",
    "Your hard work will pay off.",
    "You’ve got this...",
    "An old friend will reappear.",
    "Unexpected kindness is coming.",
    "Stay hopeful...",
    "Fortune is on your side.", // Special: Gold Cookie
    "A financial reward is near.",
    "Big dreams start with small crumbs of hope.", // Special: Blue Cookie
    "Success is around the corner. Keep circling.",
    "Even a broken clock is right twice a day.",
    "Good things come to those who wait.",
    "Keep believing.",
    "If at first you don’t succeed, try again.", // Special: Red Cookie
    "Your time to shine is coming.",
    "The universe has a plan.",
    "A dream will come true.",
    "A problem will resolve itself.",
    "One day, you’ll look back and laugh.",
    "New beginnings bring fresh energy.",
];

let collectedFortunes = new Set();

const cookieCountElement = document.getElementById("cookie-count");
const collectedCookiesElement = document.getElementById("collected-cookies");
const fortuneTextElement = document.getElementById("fortune-text");
const fortuneDisplayElement = document.getElementById("fortune-display");

// Purchase Fortune Cookie
document.getElementById("buy-cookie-button").addEventListener("click", async () => {
    // Use existing ETH system to charge player $1
    const ethAmount = 0.00042; // Replace with correct ETH equivalent
    try {
        await placeBet(ethAmount); // Assuming placeBet() handles ETH transfers
        openFortuneCookie();
    } catch (error) {
        console.error("Transaction failed", error);
    }
});

// Open Fortune Cookie and show random fortune
function openFortuneCookie() {
    if (collectedFortunes.size >= 25) {
        alert("You've collected all fortunes!");
        return;
    }

    const newFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    if (!collectedFortunes.has(newFortune)) {
        collectedFortunes.add(newFortune);
        updateCollectionDisplay();
    }

    fortuneTextElement.textContent = newFortune;
    fortuneDisplayElement.style.display = "block";
}


// Close fortune display
document.getElementById("close-fortune").addEventListener("click", () => {
    fortuneDisplayElement.style.display = "none";
});


// Function to save fortunes in local storage
function saveFortuneData() {
    const fortunesArray = Array.from(collectedFortunes); // Convert Set to array
    localStorage.setItem("playerFortunes", JSON.stringify(fortunesArray));
}

// Function to load fortunes from local storage
function loadFortuneData() {
    const storedFortunes = JSON.parse(localStorage.getItem("playerFortunes") || "[]");
    collectedFortunes = new Set(storedFortunes); // Convert array back to Set
    updateCollectionDisplay();
}

// Call loadFortuneData on page load to restore saved fortunes
document.addEventListener("DOMContentLoaded", () => {
    loadFortuneData();
});

// When the player successfully buys a fortune cookie
function purchaseFortuneCookie() {
    if (collectedFortunes.size >= 25) {
        alert("You've already collected all 25 fortunes!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const randomFortune = fortunes[randomIndex];

    // Prevent duplicate fortunes
    if (!collectedFortunes.has(randomFortune)) {
        collectedFortunes.add(randomFortune);
        saveFortuneData(); // Save updated fortunes

        // Check for special cookies
        let specialImage = "cookie_Open.png"; // Default image
        if (randomFortune === "Fortune is on your side.") {
            specialImage = "cookie_Gold.png";
            updateDiceAppearance("GOLD");
        } else if (randomFortune === "Big dreams start with small crumbs of hope.") {
            specialImage = "cookie_Blue.png";
            updateDiceAppearance("BLUE");
        } else if (randomFortune === "If at first you don’t succeed, try again.") {
            specialImage = "cookie_Red.png";
            updateDiceAppearance("RED");
        }

        // Update the UI for the purchased fortune
        displayPurchasedCookie(randomFortune, specialImage);
        alert(`You've received a new fortune: "${randomFortune}"`);
    } else {
        alert("You already own this fortune! Try buying another.");
    }
}

function updateDiceAppearance(color) {
    const diceContainer = document.getElementById("dice-container");
    const diceImages = diceContainer.querySelectorAll(".dice");

    diceImages.forEach((dice, index) => {
        const diceNumber = index + 1;
        dice.src = `/images/dice${color}${diceNumber}.png`; // Change dice image based on color
    });
}

function displayPurchasedCookie(fortune, imagePath) {
    const myFortunesSection = document.getElementById("my-fortunes"); // Section to display collected cookies

    // Create a new cookie icon
    const cookieIcon = document.createElement("div");
    cookieIcon.classList.add("fortune-cookie-icon");
    cookieIcon.style.backgroundImage = `url(${imagePath})`; // Use special image
    cookieIcon.title = fortune; // Display fortune message on hover

    // Add the cookie to the player's collection
    myFortunesSection.appendChild(cookieIcon);
    updateCollectionDisplay(); // Refresh collection UI
}

export function updateCollectionDisplay() {
    const myFortunesSection = document.getElementById("my-fortunes");
    myFortunesSection.innerHTML = ""; // Clear existing display

    collectedFortunes.forEach((fortune) => {
        let imagePath = "/images/cookie_Open.png"; // Default cookie image

        // Handle special fortune cookies
        if (fortune === "Fortune is on your side.") {
            imagePath = "/images/cookie_Gold.png";
        } else if (fortune === "Big dreams start with small crumbs of hope.") {
            imagePath = "/images/cookie_Blue.png";
        } else if (fortune === "If at first you don’t succeed, try again.") {
            imagePath = "/images/cookie_Red.png";
        }

        // Create and append cookie display
        const cookieIcon = document.createElement("div");
        cookieIcon.classList.add("fortune-cookie-icon");
        cookieIcon.style.backgroundImage = `url(${imagePath})`;
        cookieIcon.title = fortune; // Display fortune message on hover

        myFortunesSection.appendChild(cookieIcon);
    });
}



// Clear saved fortunes
function resetFortunes() {
    localStorage.removeItem("playerFortunes");
    collectedFortunes.clear();
    updateCollectionDisplay();
}

// Example button (add this to your HTML for debugging or player options):
// <button onclick="resetFortunes()">Reset My Fortunes</button>

function startHighRoller() {
    window.location.href = '/highRoller.html'; // Correct path to the High Roller page
}

// CashApp BTC
document.getElementById('pay-with-bitcoin').addEventListener('click', () => {
    const bitcoinAddress = '3BuG5H7qyEVsnRk7cs6i2sgjYoRVGEHXtb'; // Replace with your actual address
    const paymentAmount = 0.00005; // Example Bitcoin amount to charge

    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=bitcoin:${bitcoinAddress}?amount=${paymentAmount}&choe=UTF-8`;

    alert(`Send ${paymentAmount} BTC to the following address:\n${bitcoinAddress}`);

    // Optionally, display a QR code for easier payment
    const qrModal = document.createElement('div');
    qrModal.id = 'qr-modal';
    qrModal.innerHTML = `
        <div style="text-align: center;">
            <p>Scan this QR code to pay:</p>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;">
            <button onclick="document.getElementById('qr-modal').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(qrModal);
});
    // Hide the Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');

    // Wait until all assets are fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0'; // Fade out effect
            setTimeout(() => {
                loadingScreen.style.display = 'none'; // Remove from view
            }, 500); // Match fade-out duration
        }, 500); // Optional delay for smoother transition
    });
});

// Gamepad Connection Detection
window.addEventListener("gamepadconnected", (event) => {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    alert("PS5 controller connected!");
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    alert("PS5 controller disconnected.");
});


// Gamepad Polling and Input Handling
function pollGamepadInput() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use the first connected gamepad

    if (gamepad) {
        handleGamepadActions(gamepad);
    }

    requestAnimationFrame(pollGamepadInput); // Keep polling
}

pollGamepadInput(); // Start polling

// Mapping Gamepad Actions
function handleGamepadActions(gamepad) {
        // Check if the gamepad supports haptics
        const haptics = gamepad.vibrationActuator;

        if (gamepad.buttons[0].pressed) { // Cross (X)
            handleRollDice(); // Call the roll dice function
            console.log("Roll Dice: Intense Vibration");
            if (haptics) {
                haptics.playEffect("dual-rumble", {
                    duration: 2000, // 2 seconds
                    strongMagnitude: 1.0, // Intense vibration
                    weakMagnitude: 1.0,
                });
            }
        }
    
        if (gamepad.buttons[2].pressed) { // Square (Square)
            console.log("Bet 25%: Soft Vibration");
            setBet(0.25); // Set bet to 25%
            if (haptics) {
                haptics.playEffect("dual-rumble", {
                    duration: 500, // 0.5 seconds
                    strongMagnitude: 0.2, // Soft vibration
                    weakMagnitude: 0.2,
                });
            }
        }
    
        if (gamepad.buttons[3].pressed) { // Triangle (△)
            console.log("Bet 50%: Soft Vibration");
            setBet(0.50); // Set bet to 50%
            if (haptics) {
                haptics.playEffect("dual-rumble", {
                    duration: 500, // 0.5 seconds
                    strongMagnitude: 0.2, // Soft vibration
                    weakMagnitude: 0.2,
                });
            }
        }
    
        if (gamepad.buttons[1].pressed) { // Circle (Circle)
            console.log("Bet 100%: Soft Vibration");
            setBet(1.00); // Set bet to 100%
            if (haptics) {
                haptics.playEffect("dual-rumble", {
                    duration: 500, // 0.5 seconds
                    strongMagnitude: 0.2, // Soft vibration
                    weakMagnitude: 0.2,
                });
            }
        }
    
    // Buttons
    if (gamepad.buttons[0].pressed) { // Cross (X)
        handleRollDice(); // Call the roll dice function
    }
    if (gamepad.buttons[2].pressed) { // Square (Sqaure)
        console.log("Bet 25%");
        setBet(0.25); // Function to set bet to 25%
    }
    if (gamepad.buttons[3].pressed) { // △ (Triangle)
        console.log("Bet 50%");
        setBet(0.50); // Function to set bet to 50%
    }
    if (gamepad.buttons[1].pressed) { // Circle (Circle)
        console.log("Bet 100%");
        setBet(1.00); // Function to set bet to 100%
    }

    if (gamepad.buttons[8].pressed) { // Back (O)
        quitGame(); // Call the quit game function
    }

    if (gamepad.buttons[12].pressed) { // D-pad Up
        console.log("Navigate Up");
    }
    if (gamepad.buttons[13].pressed) { // D-pad Down
        console.log("Navigate Down");
    }
    if (gamepad.buttons[14].pressed) { // D-pad Left
        console.log("Navigate Left");
    }
    if (gamepad.buttons[15].pressed) { // D-pad Right
        console.log("Navigate Right");
    }

    // Left Stick (Axes)
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];

    if (Math.abs(leftStickX) > 0.2 || Math.abs(leftStickY) > 0.2) {
        console.log(`Left Stick moved: X=${leftStickX}, Y=${leftStickY}`);
    }
}

// Testing Navigation
let currentMenuIndex = 0;
const menuButtons = document.querySelectorAll("#menu-buttons button");

function updateMenuNavigation(direction) {
    menuButtons[currentMenuIndex].classList.remove("active");

    currentMenuIndex += direction;
    if (currentMenuIndex < 0) currentMenuIndex = menuButtons.length - 1;
    if (currentMenuIndex >= menuButtons.length) currentMenuIndex = 0;

    menuButtons[currentMenuIndex].classList.add("active");
    menuButtons[currentMenuIndex].focus();
}

function handleGamepadNavigation(gamepad) {
    if (gamepad.buttons[12].pressed) { // D-pad Up
        updateMenuNavigation(-1);
    }
    if (gamepad.buttons[13].pressed) { // D-pad Down
        updateMenuNavigation(1);
    }
    if (gamepad.buttons[0].pressed) { // Cross (X)
        menuButtons[currentMenuIndex].click();
    }
}


// Touch Pad Control
const cursorSpeed = 10; // Adjust cursor speed
let controllerActive = false; // Track if the controller is active

function handleGamepadTouchpad(gamepad) {
    // PS5 touchpad axes
    const touchpadX = gamepad.axes[2]; // Horizontal position (-1 to 1)
    const touchpadY = gamepad.axes[3]; // Vertical position (-1 to 1)

    // Update cursor position
    cursorX += touchpadX * cursorSpeed;
    cursorY += touchpadY * cursorSpeed;

    // Clamp cursor within screen bounds
    cursorX = Math.max(0, Math.min(window.innerWidth, cursorX));
    cursorY = Math.max(0, Math.min(window.innerHeight, cursorY));

    // Update cursor style (for visual feedback)
    const cursorElement = document.getElementById("gamepad-cursor");
    if (cursorElement) {
        cursorElement.style.left = `${cursorX}px`;
        cursorElement.style.top = `${cursorY}px`;
    }

    // Simulate left-click when touchpad is pressed
    if (gamepad.buttons[13]?.pressed) {
        simulateMouseClick(cursorX, cursorY);
    }
}

// Simulate a mouse click at the cursor position
function simulateMouseClick(x, y) {
    const event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    });

    const target = document.elementFromPoint(x, y);
    if (target) {
        target.dispatchEvent(event);
        console.log("Simulated click at:", x, y);
    }
}

// Continuously poll for gamepad input
function pollGamepadTouchpad() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use the first connected gamepad

    if (gamepad && controllerActive) {
        handleGamepadTouchpad(gamepad);
    }

    requestAnimationFrame(pollGamepadTouchpad);
}

// Create a visual cursor for feedback
function createGamepadCursor() {
    const cursorElement = document.createElement("div");
    cursorElement.id = "gamepad-cursor";
    cursorElement.style.position = "absolute";
    cursorElement.style.width = "10px";
    cursorElement.style.height = "10px";
    cursorElement.style.backgroundColor = "red";
    cursorElement.style.borderRadius = "50%";
    cursorElement.style.pointerEvents = "none"; // Ensure it doesn't interfere with clicks
    cursorElement.style.display = "none"; // Initially hidden
    document.body.appendChild(cursorElement);
}

// Show or hide the cursor based on controller activation
function toggleGamepadCursor(show) {
    const cursorElement = document.getElementById("gamepad-cursor");
    if (cursorElement) {
        cursorElement.style.display = show ? "block" : "none";
    }
}

// Gamepad connection and disconnection events
window.addEventListener("gamepadconnected", (event) => {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    controllerActive = true;
    toggleGamepadCursor(true); // Show cursor
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    controllerActive = false;
    toggleGamepadCursor(false); // Hide cursor
});

// Initialize touchpad controls
document.addEventListener("DOMContentLoaded", () => {
    createGamepadCursor(); // Create the cursor element
    pollGamepadTouchpad(); // Start polling for touchpad input
});

function addPS5ButtonImages() {
    const buttonMappings = [
        { id: "rollButton", image: "PS5Button_x.png" },
        { id: "bet100Button", image: "PS5Button_circle.png" },
        { id: "quitButton", image: "PS5Button_s.png" },
        { id: "bet25Button", image: "PS5Button_square.png" },
        { id: "bet50Button", image: "PS5Button_triangle.png" },
    ];

    buttonMappings.forEach(({ id, image }) => {
        const button = document.getElementById(id);
        if (button) {
            const img = document.createElement("img");
            img.src = `/images/${image}`;
            img.classList.add("ps5-button-overlay");
            img.style.position = "absolute";
            img.style.left = `${button.offsetLeft + button.offsetWidth / 2 - 25}px`; // Center over the button
            img.style.top = `${button.offsetTop - 30}px`; // Slightly above the button
            img.style.width = "50px"; // Adjust as needed
            img.style.height = "50px";
            img.style.pointerEvents = "none"; // Ensure it doesn’t block clicks
            button.parentElement.appendChild(img);
        }
    });
}

function showPS5MouseCursorImage() {
    const cursorImage = document.createElement("img");
    cursorImage.src = "/images/PS5Button_ra.png";
    cursorImage.id = "ps5-cursor-image";
    cursorImage.style.position = "absolute";
    cursorImage.style.width = "30px"; // Adjust size as needed
    cursorImage.style.height = "30px";
    cursorImage.style.left = `${cursorX}px`;
    cursorImage.style.top = `${cursorY}px`;
    cursorImage.style.transition = "opacity 2s ease"; // Smooth fade-out
    document.body.appendChild(cursorImage);

    setTimeout(() => {
        cursorImage.style.opacity = "0"; // Fade out
        setTimeout(() => {
            cursorImage.remove(); // Remove from DOM
        }, 2000); // Wait for fade-out to complete
    }, 6000); // Display for 6 seconds
}

// Adjust button positions dynamically on window resize
window.addEventListener("resize", () => {
    if (controllerActive) {
        document.querySelectorAll(".ps5-button-overlay").forEach((img) => img.remove());
        addPS5ButtonImages();
    }
});

// Gamepad connection event
window.addEventListener("gamepadconnected", (event) => {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    controllerActive = true;

    // Add button overlays and show cursor image
    addPS5ButtonImages();
    showPS5MouseCursorImage();
});

// Gamepad disconnection event
window.addEventListener("gamepaddisconnected", (event) => {
    console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    controllerActive = false;

    // Remove button overlays
    document.querySelectorAll(".ps5-button-overlay").forEach((img) => img.remove());
});

function applyTiltEffect(gamepad) {
    // Map PS5 motion axes to tilt values
    const tiltX = gamepad.axes[0]; // Horizontal motion
    const tiltY = gamepad.axes[1]; // Vertical motion

    // Calculate rotation angles (adjust sensitivity with multiplier)
    const rotationX = tiltY * 10; // Tilt up/down
    const rotationY = tiltX * 10; // Tilt left/right

    // Apply the tilt effect to the entire body or a specific container
    const container = document.body; // Or replace with a specific container
    container.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    container.style.transition = "transform 0.1s ease"; // Smooth transition
}

// Continuously poll for gamepad motion data
function pollGamepadMotion() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use the first connected gamepad

    if (gamepad) {
        applyTiltEffect(gamepad);
    }

    requestAnimationFrame(pollGamepadMotion); // Keep polling
}

// Start polling when the gamepad is connected
window.addEventListener("gamepadconnected", (event) => {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    pollGamepadMotion(); // Start motion tracking
});

function setPS5ControllerLight(gamepad, color) {
    if (gamepad.lightBar) {
        gamepad.lightBar.color = color;
        console.log(`Set PS5 controller light to ${color}`);
    } else {
        console.log("Light bar control is not supported on this gamepad.");
    }
}

// Function to set light when controller connects
function handlePS5ControllerConnected(event) {
    const gamepad = event.gamepad;

    if (gamepad.id.includes("PS5")) {
        console.log("PS5 controller connected.");

        // Set the light bar to red
        setPS5ControllerLight(gamepad, { r: 255, g: 0, b: 0 });
    }
}

// Function to reset light when controller disconnects
function handlePS5ControllerDisconnected(event) {
    const gamepad = event.gamepad;

    if (gamepad.id.includes("PS5")) {
        console.log("PS5 controller disconnected.");

        // Optionally reset the light bar color (default or turn off)
        setPS5ControllerLight(gamepad, { r: 0, g: 0, b: 0 });
    }
}

// Event listeners for gamepad connection and disconnection
window.addEventListener("gamepadconnected", handlePS5ControllerConnected);
window.addEventListener("gamepaddisconnected", handlePS5ControllerDisconnected);


// Shake Roll// Start polling when the gamepad is connected
function handleControllerShake(gamepad) {
    const motionX = gamepad.axes[2] || 0; // Horizontal motion
    const motionY = gamepad.axes[3] || 0; // Vertical motion
    const motionZ = gamepad.axes[4] || 0; // Depth motion (if supported)

    // Calculate total motion intensity
    const totalMotion = Math.sqrt(motionX ** 2 + motionY ** 2 + motionZ ** 2);

    // Detect shake start
    if (totalMotion > shakeThreshold && !isShaking) {
        isShaking = true;
        console.log("Shaking detected! Starting dice roll...");
        startRollAnimation();
    }

    // Detect shake stop
    if (totalMotion < shakeThreshold && isShaking) {
        isShaking = false;
        console.log("Shake stopped! Ending dice roll...");
        stopRollAnimationAndShowResult();
    }
}

// Start the dice roll animation
function startRollAnimation() {
    if (rollInProgress || currentBet <= 0) {
        console.log("Cannot roll: Either rolling is already in progress or no bet placed.");
        return;
    }

    rollInProgress = true; // Prevent multiple rolls
    const dice1Element = document.getElementById("dice1");
    const dice2Element = document.getElementById("dice2");

    // Animate dice continuously until the player stops shaking
    let counter = 0;
    const interval = setInterval(() => {
        const dice1Roll = Math.floor(Math.random() * 6) + 1;
        const dice2Roll = Math.floor(Math.random() * 6) + 1;

        dice1Element.src = `/images/dice${dice1Roll}.gif`;
        dice2Element.src = `/images/dice${dice2Roll}.gif`;

        counter++;
        if (!isShaking) {
            clearInterval(interval);
        }
    }, 100); // Update dice every 100ms for a smooth animation
}

// Stop dice animation and show final result
function stopRollAnimationAndShowResult() {
    if (!rollInProgress) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    const dice1Element = document.getElementById("dice1");
    const dice2Element = document.getElementById("dice2");

    dice1Element.src = `/images/dice${dice1}.gif`;
    dice2Element.src = `/images/dice${dice2}.gif`;

    console.log(`Dice result: ${dice1} + ${dice2} = ${sum}`);
    handleDiceResult(sum);

    rollInProgress = false; // Allow new rolls
}

// Handle dice result (win/lose logic)
function handleDiceResult(sum) {
    let winnings = 0;

    if (sum === 7 || sum === 11) {
        winnings = currentBet * 2;
        balance += winnings;
        console.log(`You win! Roll: ${sum}, Winnings: ${winnings}`);
    } else if (sum === 2 || sum === 3 || sum === 12) {
        balance -= currentBet;
        console.log(`You lose! Roll: ${sum}`);
    } else {
        console.log(`Neutral roll: ${sum}`);
    }

    currentBet = 0; // Reset bet
    updateUI(); // Update game UI
}

// Poll for gamepad motion and detect shaking
function pollGamepadShake() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use the first connected gamepad

    if (gamepad) {
        handleControllerShake(gamepad);
    }

    requestAnimationFrame(pollGamepadShake); // Continuously poll for motion
}

// Start polling for shake motion when the gamepad is connected
window.addEventListener("gamepadconnected", (event) => {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    pollGamepadShake(); // Start motion tracking
});

// Debug WebSocket connection 
socket.on('connect', () => {
    console.log('Connected to the server:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});


// Make it accessible globally
window.startHighRoller = startHighRoller;

// Ensure these functions are accessible globally
window.startSinglePlayer = startSinglePlayer;
window.placeBet = placeBet;
window.displayLeaderboardPrompt = displayLeaderboardPrompt;
