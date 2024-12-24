// app.

import { rollDice, animateDice, playDiceSound } from './modules/dice.js';
import { playerStats, loadStats, saveStats, updateWinStreak, resetWinStreak } from './modules/gameLogic.js';
import { addHustler, applyHustlerEffects, updateHustlerUI } from './modules/hustlers.js';
import { updateUI, showItemPopup } from './modules/ui.js';

// Fire Status
let winStreak = 0; // Track the current winning streak
let onFire = false; // Whether the dice are "on fire"
let fireSound; // Sound for when "on fire" is active


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

    // Ensure the "Show Combinations" functionality is scoped correctly
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    // Add event listeners for "Show Combinations" modal if the elements are present
    if (showCombinationsButton && combinationsModal && closeCombinationsButton) {
        showCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'flex'; // Show the modal
        });

        closeCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'none'; // Hide the modal
        });

        combinationsModal.addEventListener('click', (event) => {
            if (event.target === combinationsModal) {
                combinationsModal.style.display = 'none'; // Close the modal when clicking outside the content
            }
        });
    } else {
        console.error('Combination modal elements are missing in the DOM.');
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
    

    for (const { id, element } of requiredElements) {
        if (!element) {
            console.error(`Missing required element: ${id}`);
            alert(`Missing required element: ${id}. Please check the HTML.`);
            return;
        }
    }
    

    const script = document.createElement('script');
    script.src = '/items.js';
    document.head.appendChild(script);

    script.onload = () => {
        if (typeof window.itemsList === 'undefined' || !window.itemsList || window.itemsList.length === 0) {
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
            // Play dice roll sound
            playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);
    
            let winnings = 0;
    
            if (sum === 7 || sum === 11) {
                // Winning roll
                winnings = currentBet * 2 * multiplier + cashBonus;
                balance += winnings;
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
    
        gameStatus.textContent = "🔥 You're on fire! All winnings are doubled! 🔥";
    }
    
    function deactivateOnFire() {
        onFire = false;
        playSound("/sounds/FireEnd0.ogg"); // Play end sound
    
        // Revert dice to normal versions
        const dice1Element = document.getElementById('dice1');
        const dice2Element = document.getElementById('dice2');
        dice1Element.src = '/images/dice1.png';
        dice2Element.src = '/images/dice2.png';
    
        // Remove fire effect class
        dice1Element.classList.remove('dice-fire');
        dice2Element.classList.remove('dice-fire');
    
        // Stop fire sound loop
        if (fireSound) {
            fireSound.pause();
            fireSound = null;
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

    function showItemPopup() {
        toggleStore(true);
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
    
            if (item.type === 'hustler') {
                addHustlerToInventory(item); // Add to hustler inventory
                updateHustlerInventoryUI(); // Refresh the UI
            } else {
                items.push(item); // Add to general items
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
            const dice1Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.png'}`;
            const dice2Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.png'}`;
            dice1Element.src = dice1Src;
            dice2Element.src = dice2Src;
            counter++;
    
            if (counter >= 10) {
                clearInterval(interval);
                dice1Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice1}${onFire ? '.gif' : '.png'}`;
                dice2Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice2}${onFire ? '.gif' : '.png'}`;
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
    
    let hustlerInventory = []; // Player's hustlers

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
    const winnings = betAmount * 2; // Example multiplier
    await payoutWinnings(playerWallet, winnings);
}

// Example: Call this function when the player loses
async function handleLoss() {
    alert("You lost the bet! Better luck next time.");
}



function startSinglePlayer() {
    // Show the transition overlay
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';

    // Play the transition sound
    const transitionSound = new Audio('/sounds/transitionSFX0.ogg');
    transitionSound.play().catch(err => console.error('Error playing transition sound:', err));

    // Wait for 2 seconds before navigating to the game
    setTimeout(() => {
        window.location.href = 'game.html?singlePlayer=true';
    }, 2000);
}

// MetaMask Connection
let provider;
let signer;

async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []); // Request accounts if not already connected
        signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected wallet:", address);
        alert(`Connected wallet: ${address}`);
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}
window.connectMetaMask = connectMetaMask;



// Place Bet (Transfer ETH from player to your wallet)
async function placeBet(betAmountETH) {
    try {
        if (!signer) {
            alert("Please connect your MetaMask wallet first.");
            return;
        }

        const transaction = await signer.sendTransaction({
            to: gameWallet, // Your wallet address
            value: ethers.utils.parseEther(betAmountETH.toString()), // Convert ETH amount
        });

        console.log("Transaction successful:", transaction);
        alert("Bet placed successfully!");
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
// Save Connection State
async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected wallet:", address);
        localStorage.setItem("connectedWallet", address); // Save wallet address
        alert(`Connected wallet: ${address}`);
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}
// Restore Connection on Page Reload
document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
        console.log(`Restoring connection to wallet: ${savedWallet}`);
        connectMetaMask(); // Reinitialize connection
    }
});


// Ensure these functions are accessible globally
window.startSinglePlayer = startSinglePlayer;
window.connectMetaMask = connectMetaMask;
window.placeBet = placeBet;
