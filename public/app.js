document.addEventListener('DOMContentLoaded', () => {
    console.log('Game loaded.');

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    if (isSinglePlayer) {
        console.log('Single Player mode active');
        setupSinglePlayer(rollButton, betButton, quitButton);
    } else if (roomName && playerName) {
        console.log(`Multiplayer mode active in room: ${roomName}, player: ${playerName}`);
        setupMultiplayer(rollButton, betButton, quitButton, roomName, playerName);
    } else {
        console.error('Invalid game mode.');
    }
});

function setupSinglePlayer(rollButton, betButton, quitButton) {
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    let balance = 300;
    let currentBet = 0;

    document.getElementById('betting-status').textContent = `$${balance}`;

    rollButton.addEventListener('click', () => rollDice(balance, currentBet));
    betButton.addEventListener('click', () => {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount. Please check your balance.');
        } else {
            currentBet = betAmount;
            document.getElementById('betAmount').value = '';
            document.getElementById('betting-status').textContent = `Bet: $${currentBet} | Balance: $${balance}`;
        }
    });
    quitButton.addEventListener('click', quitGame);
}

function rollDice(balance, currentBet) {
    console.log('Rolling dice...');
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    document.getElementById('dice1').src = `/images/dice${dice1}.png`;
    document.getElementById('dice2').src = `/images/dice${dice2}.png`;

    const sum = dice1 + dice2;
    console.log(`Dice rolled: ${dice1} + ${dice2} = ${sum}`);

    const gameStatus = document.getElementById('gameStatus');
    const pointStatus = document.getElementById('pointStatus');

    if (!window.point) {
        if (sum === 7 || sum === 11) {
            gameStatus.textContent = 'You win! 🎉';
            balance += currentBet;
        } else if (sum === 2 || sum === 3 || sum === 12) {
            gameStatus.textContent = 'You lose! 💔';
            balance -= currentBet;
        } else {
            window.point = sum;
            gameStatus.textContent = `Point is ${sum}. Keep rolling!`;
            pointStatus.textContent = `Your point is: ${sum}`;
        }
    } else {
        if (sum === window.point) {
            gameStatus.textContent = 'You win! 🎉';
            balance += currentBet;
            delete window.point;
            pointStatus.textContent = '';
        } else if (sum === 7) {
            gameStatus.textContent = 'You lose! 💔';
            balance -= currentBet;
            delete window.point;
            pointStatus.textContent = '';
        } else {
            gameStatus.textContent = 'Keep rolling!';
        }
    }

    currentBet = 0;
    document.getElementById('betting-status').textContent = `Balance: $${balance}`;
}

function setupMultiplayer(rollButton, betButton, quitButton, roomName, playerName) {
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    // Implement multiplayer logic here
    quitButton.addEventListener('click', quitGame);
}

function quitGame() {
    console.log('Returning to the main menu.');
    window.location.href = '/';
}

