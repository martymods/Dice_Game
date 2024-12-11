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
    let rent = 400; // Initial rent value set to 400
    let maxTurns = 6;
    let progression = 1;
    let items = [];

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

    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');

    const requiredElements = [
        rollButton, betButton, quitButton, bettingStatus, gameStatus, rentStatus,
        inventoryDisplay, popup, itemList, gameOverContainer,
        bet25Button, bet50Button, bet100Button
    ];

    for (const element of requiredElements) {
        if (!element) {
            console.error('One or more required elements are missing in the DOM.');
            return;
        }
    }

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

    rollButton.addEventListener('click', () => handleRollDice());
    betButton.addEventListener('click', () => handlePlaceBet());
    quitButton.addEventListener('click', quitGame);

    bet25Button.addEventListener('click', () => setBet(balance * 0.25));
    bet50Button.addEventListener('click', () => setBet(balance * 0.5));
    bet100Button.addEventListener('click', () => setBet(balance));

    function setBet(amount) {
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
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

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2; // Win: double the bet
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet; // Loss: deduct the bet from balance
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            currentBet = 0; // Reset the bet after a roll
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
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        }
    }

    function updateUIAfterRoll() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        turns++;

        const rollsRemaining = maxTurns - turns;
        if (rollsRemaining === 1) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in <span style="color: orange; font-weight: bold;">1</span> roll`;
        } else if (rollsRemaining > 0) {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsRemaining} rolls`;
        } else {
            if (balance >= rent) {
                balance -= rent; // Deduct rent payment
                rent *= progression < 9 ? 4 : 5; // Rent increases
                maxTurns++;
                turns = 0;
                alert('You paid the rent! Now get ready for even more demands!');
                showItemPopup();
            } else {
                endGame();
            }
        }

        if (balance <= 0) {
            endGame();
        }
    }

    function endGame() {
        alert('Game Over. You couldn’t pay the rent.');
        gameOverContainer.innerHTML = `
            <h2>Game Over</h2>
            <button onclick="window.location.href='/'">Return to Main Menu</button>
        `;
        gameOverContainer.style.display = 'block';
    }

    function showItemPopup() {
        popup.style.display = 'block';
        itemList.innerHTML = '';

        const shuffledItems = itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);
        shuffledItems.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
            itemButton.classList.add(item.rarity.toLowerCase());
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });

        const skipButton = document.createElement('button');
        skipButton.textContent = 'Save Money';
        skipButton.onclick = () => {
            popup.style.display = 'none';
        };
        itemList.appendChild(skipButton);
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            items.push(item);
            playSound("/sounds/UI_Buy1.ogg");
            alert(`You purchased ${item.name}!`);
            popup.style.display = 'none';
            displayInventory();
        } else {
            alert('Not enough money to buy this item.');
        }
    }

    function displayInventory() {
        inventoryDisplay.innerHTML = items.map(item => `<li>${item.name} (${item.description})</li>`).join('');
    }

    function quitGame() {
        window.location.href = '/';
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
        let soundFile = Array.isArray(sounds) && randomize
            ? sounds[Math.floor(Math.random() * sounds.length)]
            : sounds;
        const sound = new Audio(soundFile);
        sound.play().catch(err => console.error('Audio play error:', err));
    }
}
