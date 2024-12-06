const socket = io();  // Connect to the server using Socket.io

// Elements for the game
const hostButton = document.getElementById('hostGame');
const joinButton = document.getElementById('joinGame');
const singlePlayerButton = document.getElementById('singlePlayer');
const backToMenuButton = document.getElementById('backToMenuButton');
const gameArea = document.getElementById('gameArea');
const diceResult = document.getElementById('diceResult');
const diceImage = document.getElementById('diceImage');
const placeBetButton = document.getElementById('placeBetButton');
const betAmountInput = document.getElementById('betAmount');
const bettingStatus = document.getElementById('betting-status');
const menuArea = document.getElementById('menu');

// Variable for the current player's name
let currentPlayerName = prompt("Enter your name: ");
let isMultiplayer = false;

// Show the menu when the game starts
menuArea.style.display = 'block';
gameArea.style.display = 'none';

// Event Listeners
hostButton.addEventListener('click', () => {
    console.log("Hosting multiplayer game...");
    isMultiplayer = true;
    socket.emit('hostGame', { playerName: currentPlayerName });
    menuArea.style.display = 'none';
    gameArea.style.display = 'block';
});

joinButton.addEventListener('click', () => {
    console.log("Joining multiplayer game...");
    isMultiplayer = true;
    socket.emit('joinGame', { playerName: currentPlayerName });
    menuArea.style.display = 'none';
    gameArea.style.display = 'block';
});

singlePlayerButton.addEventListener('click', () => {
    console.log("Starting single player game...");
    isMultiplayer = false;
    menuArea.style.display = 'none';
    gameArea.style.display = 'block';
    startGame();
});

backToMenuButton.addEventListener('click', () => {
    console.log("Returning to the main menu...");
    gameArea.style.display = 'none';
    menuArea.style.display = 'block';
});

placeBetButton.addEventListener('click', placeBet);

// Function to roll the dice
function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const result = dice1 + dice2;

    // Display dice result
    diceResult.innerHTML = `Dice 1: ${dice1} | Dice 2: ${dice2} | Total: ${result}`;

    // Set the dice image based on the dice roll
    diceImage.src = `images/dice${dice1}.png`;

    // If multiplayer, send the dice result to the server
    if (isMultiplayer) {
        socket.emit('diceRoll', { playerName: currentPlayerName, dice1, dice2, result });
    }
}

// Function to handle placing a bet
function placeBet() {
    const betAmount = parseInt(betAmountInput.value);

    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    bettingStatus.innerHTML = `${currentPlayerName} placed a bet of $${betAmount}`;
    if (isMultiplayer) {
        socket.emit('placeBet', { playerName: currentPlayerName, betAmount });
    }
}

// Function to start the single player game
function startGame() {
    rollDice();  // Automatically roll dice when starting the single-player game
}

// Multiplayer events from the server
socket.on('gameStarted', (data) => {
    console.log(data.message);
    // Add any logic when the game starts
});

socket.on('updateBet', (data) => {
    console.log(`${data.playerName} placed a bet of $${data.betAmount}`);
});
