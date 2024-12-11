document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (isSinglePlayer) {
        setupSinglePlayer();
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

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const leaderboard = document.getElementById('leaderboard');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    
    // Item tracking
    const items = [];
    let availableItems = [];

    // Load items based on progress
    function getRandomItem() {
        const rarityChance = Math.random();
        let item;

        if (rarityChance < 0.5) {
            item = 'Loaded Dice'; // Common item
        } else if (rarityChance < 0.75) {
            item = 'Pigeon Coop'; // Uncommon item
        } else {
            item = 'Old Gang Leader’s Blade'; // Rare item
        }

        if (!items.includes(item)) {
            items.push(item);
        }

        availableItems.push(item);
        alert(`You earned an item: ${item}`);
    }

    // Initialize item display
    const itemDisplay = document.getElementById('item-display');
    itemDisplay.textContent = `Items: ${availableItems.join(', ')}`;

    // Error handling for missing elements
    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;

    // Display the buttons
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;

            document.getElementById('dice1').src = `/images/dice${dice1}.png`;
            document.getElementById('dice2').src = `/images/dice${dice2}.png`;

            // Item effect
            if (availableItems.includes('Loaded Dice') && (dice1 === 2 || dice2 === 3)) {
                sum += 2; // Modify dice roll outcome with "Loaded Dice"
            }

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2; // Win: Double bet amount
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                displayWinAmount(currentBet * 2);
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet; // Loss: Deduct bet amount
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                displayLossAmount(currentBet);
                if (balance <= 0) {
                    showLeaderboard(balance);
                }
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            currentBet = 0;
            bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;

            turns++;
            if (turns >= maxTurns) {
                if (balance >= rent) {
                    rent = progression < 9 ? rent * 5 : rent * 6;
                    maxTurns = Math.min(maxTurns + 1, 12);
                    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;
                    turns = 0;
                    progression++;
                    alert(`You paid the rent! Rent has increased! Now, the landlord wants more money. You’re making too much money from dice — pay up!`);
                } else {
                    showLeaderboard(balance);
                }
            }
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', () => placeBet());
    bet25Button.addEventListener('click', () => setBet(0.25 * balance));
    bet50Button.addEventListener('click', () => setBet(0.5 * balance));
    bet100Button.addEventListener('click', () => {
        setBet(balance);
        if (currentBet === balance && balance <= 0) {
            showLeaderboard(balance);
        }
    });

    quitButton.addEventListener('click', quitGame);

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${balance - currentBet} | Bet: $${currentBet}`;
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${balance - currentBet} | Bet: $${currentBet}`;
    }

    function displayWinAmount(amount) {
        const winAmountDisplay = document.createElement('div');
        winAmountDisplay.textContent = `$${amount} Winnings!`;
        winAmountDisplay.style.fontWeight = 'bold';
        winAmountDisplay.style.color = 'green';
        winAmountDisplay.style.fontSize = '1.5em';
        document.body.appendChild(winAmountDisplay);
        setTimeout(() => winAmountDisplay.remove(), 2000);
    }

    function displayLossAmount(amount) {
        const lossAmountDisplay = document.createElement('div');
        lossAmountDisplay.textContent = `-$${amount} Loss!`;
        lossAmountDisplay.style.fontWeight = 'bold';
        lossAmountDisplay.style.color = 'red';
        lossAmountDisplay.style.fontSize = '1.5em';
        document.body.appendChild(lossAmountDisplay);
        setTimeout(() => lossAmountDisplay.remove(), 2000);
    }

    function showLeaderboard(finalScore) {
        leaderboard.innerHTML = `
            <h2>Game Over</h2>
            <p>Your final balance: $${finalScore}</p>
            <input type="text" id="playerName" placeholder="Enter your name">
            <button id="submitScore">Submit Score</button>
        `;
        document.getElementById('submitScore').addEventListener('click', () => {
            const playerName = document.getElementById('playerName').value;
            if (playerName) {
                saveScore(playerName, finalScore);
                quitGame();
            } else {
                alert('Please enter your name.');
            }
        });
    }

    function saveScore(name, score) {
        const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardData.push({ name, score });
        localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }
}
