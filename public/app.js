// app.js

import itemEffects from './itemEffects.js'; // Import item effects

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.error('Invalid game mode.');
    }
});

async function setupSinglePlayer() {
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let items = [];
    let dreamCoins = 0; // New DreamCoin balance

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

    const requiredElements = [
        rollButton, betButton, quitButton, bettingStatus, gameStatus, rentStatus,
        inventoryDisplay, popup, itemList, gameOverContainer, bet25Button, bet50Button, bet100Button
    ];

    for (const element of requiredElements) {
        if (!element) {
            console.error('One or more required elements are missing in the DOM.');
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

        playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        animateDice(dice1, dice2, () => {
            playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);

            let rollBonus = 0;

            // Check for passive effects
            items.forEach(item => {
                if (item.name === 'Loaded Dice 🎲') {
                    rollBonus += itemEffects.loadedDiceEffect(sum, currentBet);
                }
                if (item.name === "Old Gang Leader’s Blade 🔪") {
                    dreamCoins += itemEffects.gangLeaderBladeEffect(items);
                }
            });

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2 + rollBonus; // Double winnings plus bonus
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet; // Deduct the bet
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
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
            itemButton.onclick = () => handleItemPurchase(item);
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

        const rollsRemaining = maxTurns - turns;
        if (rollsRemaining === 1) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in <span style="color: orange; font-weight: bold;">1</span> roll`;
        } else if (rollsRemaining > 0) {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsRemaining} rolls`;
        } else {
            if (balance >= rent) {
                balance -= rent;
                rent *= progression <= 9 ? 4 : 5;
                maxTurns++;
                progression++;
                turns = 0;
                alert('You paid the rent! Get ready for the next stage.');
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
        landlordVideo.loop = false;
        landlordVideo.play().catch(err => console.error('Video play error:', err));

        landlordVideo.addEventListener('ended', () => {
            landlordVideo.style.display = 'none';
            gameOverContainer.style.display = 'block';
        });
    }

    function updateUI() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        if (dreamCoins > 0) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
            rentStatus.innerHTML += ` <img src="/images/DW_Logo.png" alt="DreamCoin" style="width: 20px; height: 20px;"> ${dreamCoins}`;
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
        const soundFile = Array.isArray(sounds) && randomize ? sounds[Math.floor(Math.random() * sounds.length)] : sounds;
        const audio = new Audio(soundFile);
        audio.play().catch(err => console.error('Audio play error:', err));
    }
}
