ocument.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.error('Invalid game mode.');
    }
});

function setupSinglePlayer() {
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let items = [];
    const availableItems = [
        { name: 'Loaded Dice 🎲', cost: 50, description: 'Boosts rolls of 2 and 3.' },
        { name: 'Forged Papers 📜', cost: 100, description: 'Recruit 3 allies.' },
        { name: 'OG Blade 🔪', cost: 200, description: 'Yields +9 coins each spin.' }
    ];

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const inventoryDisplay = document.getElementById('inventory');
    const itemPopup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !inventoryDisplay || !itemPopup || !itemList) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

    rollButton.addEventListener('click', () => {
        if (currentBet <= 0) {
            alert('Place a bet first!');
            return;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        animateDice(dice1, dice2, () => {
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
    });

    betButton.addEventListener('click', () => {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        }
    });

    quitButton.addEventListener('click', quitGame);

    function updateUIAfterRoll() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        turns++;

        if (turns === maxTurns - 1) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in <span style="color: orange; font-weight: bold;">1</span> roll`;
        } else if (turns >= maxTurns) {
            if (balance >= rent) {
                balance -= rent;
                rent *= 2;
                maxTurns = Math.min(maxTurns + 1, 12);
                turns = 0;
                alert('You paid the rent! Time to keep hustling!');
                showItemPopup();
            } else {
                alert('Game Over. You could not pay the rent.');
                displayLeaderboard(balance);
                return;
            }
        } else {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
        }

        if (balance <= 0) {
            alert('Game Over. You have no money left.');
            displayLeaderboard(balance);
        }
    }

    function showItemPopup() {
        itemPopup.style.display = 'block';
        itemList.innerHTML = '';

        availableItems.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost.toLocaleString()}`;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });

        const skipButton = document.createElement('button');
        skipButton.textContent = 'Save Money';
        skipButton.onclick = () => {
            itemPopup.style.display = 'none';
        };
        itemList.appendChild(skipButton);
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            items.push(item);
            alert(`You purchased ${item.name}!`);
            itemPopup.style.display = 'none';
            displayInventory();
        } else {
            alert('Not enough money to buy this item.');
        }
    }

    function displayInventory() {
        inventoryDisplay.innerHTML = items.map(item => `${item.name} (${item.description})`).join(', ');
    }

    function quitGame() {
        window.location.href = '/';
    }

    function displayLeaderboard(score) {
        const leaderboardContainer = document.getElementById('leaderboardContainer');

        if (!leaderboardContainer) {
            console.error('Leaderboard container not found.');
            return;
        }

        const playerName = prompt('Enter your name for the leaderboard:');

        if (playerName) {
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard.push({ name: playerName, score });
            leaderboard.sort((a, b) => b.score - a.score);
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        }

        const topPlayers = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardContainer.innerHTML = '<h2>Leaderboard</h2>' +
            topPlayers.map(player => `<p>${player.name}: $${player.score.toLocaleString()}</p>`).join('') +
            '<button onclick="window.location.href='/'">Return to Main Menu</button>';

        leaderboardContainer.style.display = 'block';
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
