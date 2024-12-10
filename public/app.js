document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    const singlePlayerBtn = document.getElementById('singlePlayerBtn');
    const hostGameBtn = document.getElementById('hostGameBtn');
    const joinGameBtn = document.getElementById('joinGameBtn');
    const gameContainer = document.getElementById('gameContainer');
    const mainMenu = document.getElementById('mainMenu');

    singlePlayerBtn.addEventListener('click', () => {
        window.location.href = '/game.html?singlePlayer=true';
    });

    hostGameBtn.addEventListener('click', () => {
        window.location.href = '/game.html?hostGame=true';
    });

    joinGameBtn.addEventListener('click', () => {
        window.location.href = '/game.html?joinGame=true';
    });

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

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('bettingStatus');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rentStatus');
    const leaderboard = document.getElementById('leaderboard');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !leaderboard) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;

            document.getElementById('dice1').src = `/images/dice${dice1}.png`;
            document.getElementById('dice2').src = `/images/dice${dice2}.png`;

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2; // Win doubles the bet amount
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet; // Loss deducts bet amount
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
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
                    alert('You paid the rent! Rent has increased!');
                } else {
                    showLeaderboard(balance);
                }
            }
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', placeBet);

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
        window.location.href = '/'; // Redirect to main menu
    }
}

// Multiplayer Setup (placeholder for now)
function setupMultiplayer(roomName, playerName) {
    console.log('Multiplayer mode active.');
    // Implement Multiplayer setup logic here (similar to Single Player)
}
