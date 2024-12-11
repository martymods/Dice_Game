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
    let rollsLeft = maxTurns;
    let monthCounter = 1;
    let items = [];
    const availableItems = [
        { name: 'Loaded Dice 🎲', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3.' },
        { name: 'Forged Papers 📝', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.' },
        { name: 'Old Gang Leader’s Blade 🗡️', rarity: 'Very Rare', cost: 200, description: 'Yields DreamCoins +9 each spin.' },
        { name: 'Neighborhood OG’s Manual 📚', rarity: 'Rare', cost: 150, description: 'Boosts payouts for specific symbols.' },
        { name: 'Barrel of Hustlers 🏆', rarity: 'Uncommon', cost: 180, description: 'Summon 7 Street Hustlers.' },
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
    const skipButton = document.getElementById('skipButton');
    const inventoryDisplay = document.getElementById('inventory');
    const monthCounterElem = document.getElementById('month-counter');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !itemPopup) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
    monthCounterElem.textContent = `Month: ${monthCounter}`;

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';

    // Roll Dice Button
    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            startDiceRollAnimation(() => {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                const sum = dice1 + dice2;

                document.getElementById('dice1').src = `/images/dice${dice1}.png`;
                document.getElementById('dice2').src = `/images/dice${dice2}.png`;

                if (sum === 7 || sum === 11) {
                    balance += currentBet * 2;
                    gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                } else if (sum === 2 || sum === 3 || sum === 12) {
                    balance -= currentBet;
                    gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                    if (balance <= 0) {
                        endGame();
                        return;
                    }
                } else {
                    gameStatus.textContent = `Roll: ${sum}`;
                }

                currentBet = 0;
                bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
                rollsLeft--;

                if (rollsLeft === 1) {
                    rentStatus.style.color = 'orange';
                    rentStatus.style.fontWeight = 'bold';
                } else {
                    rentStatus.style.color = '';
                    rentStatus.style.fontWeight = '';
                }

                if (rollsLeft === 0) {
                    if (balance >= rent) {
                        balance -= rent;
                        rent *= 2;
                        rollsLeft = maxTurns;
                        monthCounter++;
                        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
                        monthCounterElem.textContent = `Month: ${monthCounter}`;
                        gameStatus.textContent = 'You paid the rent!';
                        showItemPopup();
                    } else {
                        endGame();
                    }
                } else {
                    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
                }
            });
        } else {
            alert('Place a bet first!');
        }
    });

    // Bet Button
    betButton.addEventListener('click', placeBet);
    bet25Button.addEventListener('click', () => setBet(0.25 * balance));
    bet50Button.addEventListener('click', () => setBet(0.5 * balance));
    bet100Button.addEventListener('click', () => setBet(balance));
    quitButton.addEventListener('click', quitGame);

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
        const itemsToShow = availableItems.slice(0, 3);
        itemsToShow.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost}`;
            itemButton.title = item.description;
            itemList.appendChild(itemButton);

            itemButton.onclick = () => handleItemPurchase(item);
        });

        skipButton.style.display = 'inline-block';
        skipButton.onclick = () => {
            itemPopup.style.display = 'none';
        };
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            items.push(item);
            alert(`You purchased ${item.name}!`);
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
            displayInventory();
            itemPopup.style.display = 'none';
        } else {
            alert('Not enough money to buy this item.');
        }
    }

    function displayInventory() {
        inventoryDisplay.innerHTML = '<h3>Inventory:</h3>';
        items.forEach(item => {
            inventoryDisplay.innerHTML += `<p>${item.name}: ${item.description}</p>`;
        });
    }

    function quitGame() {
        window.location.href = '/';
    }

    function endGame() {
        if (balance >= 1) {
            const playerName = prompt('Enter your name for the leaderboard:');
            if (playerName) {
                saveScore(playerName, balance);
            }
        }
        alert('Game Over!');
        window.location.href = '/leaderboard.html';
    }

    function saveScore(name, score) {
        const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardData.push({ name, score });
        localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    }

    function startDiceRollAnimation(callback) {
        let count = 0;
        const interval = setInterval(() => {
            document.getElementById('dice1').src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            document.getElementById('dice2').src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            if (count >= 10) {
                clearInterval(interval);
                callback();
            }
            count++;
        }, 100);
    }
}
