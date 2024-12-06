const socket = io();  // Connect to the server

// Menu screens
const menu = document.getElementById('menu');
const hostMenu = document.getElementById('hostMenu');
const joinMenu = document.getElementById('joinMenu');
const gameArea = document.getElementById('gameArea');

// Buttons
const hostButton = document.getElementById('hostGame');
const joinButton = document.getElementById('joinGame');
const singlePlayerButton = document.getElementById('singlePlayer');
const startHostingButton = document.getElementById('startHosting');
const backToMenuFromHostButton = document.getElementById('backToMenuFromHost');
const backToMenuFromJoinButton = document.getElementById('backToMenuFromJoin');
const backToMenuFromGameButton = document.getElementById('backToMenuFromGame');
const rollDiceButton = document.getElementById('rollDiceButton');
const refreshGamesButton = document.getElementById('refreshGames');

// Game elements
const numPlayersInput = document.getElementById('numPlayers');
const gameList = document.getElementById('gameList');
const dice1Image = document.getElementById('dice1Image');
const dice2Image = document.getElementById('dice2Image');
const dice1Result = document.getElementById('dice1Result');
const dice2Result = document.getElementById('dice2Result');
const diceTotalResult = document.getElementById('diceTotalResult');

let isMultiplayer = false;
let playerName = prompt("Enter your name:");

// Show main menu
function showMenu() {
    menu.style.display = 'block';
    hostMenu.style.display = 'none';
    joinMenu.style.display = 'none';
    gameArea.style.display = 'none';
}

// Multiplayer hosting
hostButton.addEventListener('click', () => {
    menu.style.display = 'none';
    hostMenu.style.display = 'block';
});

startHostingButton.addEventListener('click', () => {
    const numPlayers = parseInt(numPlayersInput.value);
    if (numPlayers < 1 || numPlayers > 12) {
        alert('Please select a valid number of players (1–12).');
        return;
    }
    socket.emit('hostGame', { hostName: playerName, numPlayers });
    alert(`Hosting a game for ${numPlayers} players!`);
    showGameArea('Multiplayer');
});

// Multiplayer joining
joinButton.addEventListener('click', () => {
    socket.emit('requestGameList');
    menu.style.display = 'none';
    joinMenu.style.display = 'block';
});

refreshGamesButton.addEventListener('click', () => {
    socket.emit('requestGameList');
});

socket.on('gameList', (games) => {
    gameList.innerHTML = '';
    if (games.length === 0) {
        gameList.innerHTML = '<p>No games available. <button id="hostInstead">Host a Game</button></p>';
        document.getElementById('hostInstead').addEventListener('click', () => {
            menu.style.display = 'none';
            hostMenu.style.display = 'block';
        });
    } else {
        games.forEach((game, index) => {
            const button = document.createElement('button');
            button.textContent = `Join Game: ${game.hostName}'s Game (${game.numPlayers} players)`;
            button.addEventListener('click', () => {
                socket.emit('joinGame', { gameId: index, playerName });
                showGameArea('Multiplayer');
            });
            gameList.appendChild(button);
        });
    }
});

// Single player game
singlePlayerButton.addEventListener('click', () => {
    showGameArea('Single Player');
});

rollDiceButton.addEventListener('click', rollDice);

function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    dice1Image.src = `images/dice${dice1}.png`;
    dice2Image.src = `images/dice${dice2}.png`;
    dice1Result.textContent = `Dice 1: ${dice1}`;
    dice2Result.textContent = `Dice 2: ${dice2}`;
    diceTotalResult.textContent = `Total: ${dice1 + dice2}`;
}

// Show the appropriate game area
function showGameArea(mode) {
    menu.style.display = 'none';
    hostMenu.style.display = 'none';
    joinMenu.style.display = 'none';
    gameArea.style.display = 'block';
    document.getElementById('gameTitle').textContent = mode;
}

// Back to menu buttons
backToMenuFromHostButton.addEventListener('click', showMenu);
backToMenuFromJoinButton.addEventListener('click', showMenu);
backToMenuFromGameButton.addEventListener('click', showMenu);
