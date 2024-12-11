document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else if (roomName && playerName) {
        setupMultiplayer(roomName, playerName);
    } else {
        console.error('Invalid game mode.');
    }
});

// Single Player Setup
function setupSinglePlayer() {
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let monthCounter = 1;
    let rollsLeft = maxTurns;

    const availableItems = [
        { name: 'Loaded Dice', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3.' },
        { name: 'Forged Papers', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.' },
        { name: 'Old Gang Leader’s Blade', rarity: 'Very Rare', cost: 200, description: 'Yields DreamCoins +9 each spin.' },
        { name: 'Neighborhood OG’s Manual', rarity: 'Rare', cost: 150, description: 'Boosts payouts for specific symbols.' },
        { name: 'Barrel of Hustlers', rarity: 'Uncommon', cost: 180, description: 'Summon 7 Street Hustlers.' },
    ];

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const itemPopup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');
    const monthCounterElem = document.getElementById('month-counter');
    const rollLeft = document.getElementById('rolls-left');

    // Initial setup
    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
    monthCounterElem.textContent = `Month: ${monthCounter}`;
    rollLeft.textContent = rollsLeft;

    // Show buttons
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            // Roll Dice Animation
            startDiceRollAnimation(() => {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                const sum = dice1 + dice2;

                // Display dice
                document.getElementById('dice1').src = `/images/dice${dice1}.png`;
                document.getElementById('dice2').src = `/images/dice${dice2}.png`;

                // Win or Loss logic
                if (sum === 7 || sum === 11) {
                    balance += currentBet * 2;  // Double bet for win
                    gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                } else if (sum === 2 || sum === 3 || sum === 12) {
                    balance -= currentBet;  // Deduct bet for loss
                    gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                    if (balance <= 0) {
                        alert('Game Over. Your balance is $0.');
                        quitGame();
                    }
                } else {
                    gameStatus.textContent = `Roll: ${sum}`;
                }

                currentBet = 0;
                bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;

                rollsLeft--;
                rollLeft.textContent = rollsLeft;

                if (rollsLeft <= 0) {
                    if (balance >= rent) {
                        rent = progression < 9 ? rent * 5 : rent * 6;
                        rollsLeft = Math.min(maxTurns + 1, 12);
                        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
                        turns = 0;
                        progression++;
                        monthCounter++;
                        monthCounterElem.textContent = `Month: ${monthCounter}`;
                        alert(`You paid the rent! Rent has increased! Now, the landlord wants more money. You’re making too much money from dice — pay up!`);
                        showItemPopup();
                    } else {
                        alert('Game Over. You could not pay the rent.');
                        quitGame();
                    }
                } else {
                    // Allow buying an item after every 3 rolls
                    if (turns % 3 === 0 && turns !== 0) {
                        showItemPopup();
                    }
                }
            });
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', () => placeBet());
    bet25Button.addEventListener('click', () => setBet(0.25 * balance));
    bet50Button.addEventListener('click', () => setBet(0.5 * balance));
    bet100Button.addEventListener('click', () => setBet(balance));

    quitButton.addEventListener('click', quitGame);

    function startDiceRollAnimation(callback) {
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');

        let count = 0;
        const interval = setInterval(() => {
            dice1.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            dice2.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            count++;
            if (count === 10) {
                clearInterval(interval);
                callback();
            }
        }, 100); // Change dice image every 100ms
    }

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
    }

    function showItemPopup() {
        itemPopup.style.display = 'block';
        itemList.innerHTML = '';

        // Display 3 items available for purchase
        const itemsToDisplay = availableItems.slice(0, 3);
        itemsToDisplay.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost}`;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            alert(`You bought ${item.name}!`);
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
            itemPopup.style.display = 'none'; // Close item popup
        } else {
            alert('Not enough balance to buy this item.');
        }
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }
}
