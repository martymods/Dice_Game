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

    rollButton.addEventListener('click', rollDice);
    betButton.addEventListener('click', placeBet);
    quitButton.addEventListener('click', quitGame);
}

function setupMultiplayer(rollButton, betButton, quitButton, roomName, playerName) {
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    const socket = io();

    socket.emit('joinGame', { roomName, playerName });

    rollButton.addEventListener('click', () => {
        socket.emit('rollDice', { roomName });
    });

    betButton.addEventListener('click', placeBet);

    quitButton.addEventListener('click', () => {
        socket.emit('leaveGame', { roomName, playerName });
        quitGame();
    });

    socket.on('diceRolled', ({ dice1, dice2 }) => {
        console.log(`Dice rolled: ${dice1}, ${dice2}`);
        document.getElementById('dice1').textContent = dice1;
        document.getElementById('dice2').textContent = dice2;
    });

    socket.on('gameStatus', (status) => {
        document.getElementById('gameStatus').textContent = status.message;
    });
}

function rollDice() {
    console.log('Rolling dice...');
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;
    console.log(`Dice rolled: ${dice1} + ${dice2}`);
}

function placeBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Invalid bet amount!');
        return;
    }
    console.log(`Bet placed: $${betAmount}`);
}

function quitGame() {
    console.log('Returning to the main menu.');
    window.location.href = '/';
}
