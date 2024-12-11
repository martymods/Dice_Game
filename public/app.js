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

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const inventoryDisplay = document.getElementById('inventory-list');
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');

    const requiredElements = [rollButton, betButton, quitButton, bettingStatus, gameStatus, rentStatus, inventoryDisplay, popup, itemList];

    for (const element of requiredElements) {
        if (!element) {
            console.error('One or more required elements are missing in the DOM.');
            return;
        }
    }

    // Load items dynamically
    const script = document.createElement('script');
    script.src = '/items.js';
    document.head.appendChild(script);

    script.onload = () => {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

        // Event Listeners
        rollButton.addEventListener('click', () => handleRollDice());
        betButton.addEventListener('click', () => handlePlaceBet());
        quitButton.addEventListener('click', () => quitGame());
    };

    async function handleRollDice() {
        playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

        if (currentBet <= 0) {
            alert('Place a bet first!');
            return;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        animateDice(dice1, dice2, () => {
            playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2;
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet;
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

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
            bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
        }
    }

    function showItemPopup() {
        popup.style.display = 'block';
        itemList.innerHTML = '';

        availableItems.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost.toLocaleString()}`;
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

    function updateUIAfterRoll() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    }

    function quitGame() {
        window.location.href = '/';
    }

    function getItemColor(rarity) {
        switch (rarity) {
            case 'Common':
                return 'gray';
            case 'Uncommon':
                return 'blue';
            case 'Rare':
                return 'purple';
            case 'Very Rare':
                return 'gold';
            default:
                return 'white';
        }
    }

    function playSound(sounds, randomize = false) {
        let soundFile = Array.isArray(sounds) && randomize ? sounds[Math.floor(Math.random() * sounds.length)] : sounds;
        const audio = new Audio(soundFile);
        audio.play().catch(err => console.error('Audio play error:', err));
    }

    function animateDice(dice1, dice2, callback) {
        const dice1Element = document.getElementById('dice1');
        const dice2Element = document.getElementById('dice2');

        if (!dice1Element || !dice2Element) {
            console.error('Dice elements not found.');
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
}
