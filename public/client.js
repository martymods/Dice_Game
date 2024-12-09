const socket = io(); // Initialize WebSocket connection
let currentGame = {}; // Declare the game variable globally
let currentPlayerIndex = 0;
let players = [
    { name: "Player 1", balance: 300, bet: 0 },
    { name: "Player 2", balance: 300, bet: 0 },
    { name: "Player 3", balance: 300, bet: 0 },
];

let point = null; // Store the point number for gameplay

console.log('Client connected to the server');

// Handle Single Player mode
function startSinglePlayer() {
    console.log('Single-player game started!');
    window.location.href = '/game.html?singlePlayer=true'; // Redirect to the game page
}

// Create a game and handle navigation
function showCreateGame() {
    const roomName = prompt('Enter room name:');
    const playerName = prompt('Enter your name:');
    console.log(`Creating game. Room: ${roomName}, Player: ${playerName}`);
    if (roomName && playerName) {
        socket.emit('createGame', { roomName, playerName });
        socket.on('gameCreated', (data) => {
            if (data.success) {
                alert(`Game created successfully! Room: ${data.roomName}`);
                window.location.href = `/game.html?room=${data.roomName}`; // Transition to game page
            } else {
                alert('Failed to create game.');
                console.log('Game creation failed.');
            }
        });
    }
}

// Display available games and allow joining
function showJoinGame() {
    socket.emit('getAvailableGames');
    socket.on('availableGames', (gamesList) => {
        if (gamesList.length === 0) {
            alert('No games available. Please create a new game.');
        } else {
            let gameListHTML = '';
            gamesList.forEach(game => {
                gameListHTML += `<li>${game.roomName} - Players: ${game.players.length}/4</li>`;
            });
            document.getElementById('rooms-list').innerHTML = gameListHTML;
        }
    });
}

// Handle dice roll and betting in multiplayer mode
function rollDiceInMultiplayer(roomName, betAmount) {
    console.log(`Rolling dice in room: ${roomName}`);
    socket.emit('rollDice', { roomName, bet: betAmount });
    socket.on('diceRolled', (data) => {
        document.getElementById('dice1').src = `public/images/dice${data.diceRoll[0]}.png`;
        document.getElementById('dice2').src = `public/images/dice${data.diceRoll[1]}.png`;
        alert(`Dice Roll: ${data.diceRoll} - Outcome: ${data.outcome}`);
        handleBets(data.outcome);
    });
}

function handleBets(outcome) {
    players.forEach(player => {
        if (player.bet > 0) {
            if (outcome === 'win') {
                player.balance += player.bet;
            } else if (outcome === 'lose') {
                player.balance -= player.bet;
            }
            player.bet = 0; // Reset bet after each roll
        }
    });
    updateBettingDisplay();
}

function updateBettingDisplay() {
    let bettingStatus = '';
    players.forEach(player => {
        bettingStatus += `${player.name}: $${player.balance} | Bet: $${player.bet} <br>`;
    });
    document.getElementById('betting-status').innerHTML = bettingStatus;
    document.getElementById('balance').textContent = players[currentPlayerIndex].balance;
}

// Quit Game and go back to the main menu
function quitGame() {
    console.log('Exiting the game and returning to the main menu.');
    window.location.href = '/';
}

document.getElementById('quitButton').addEventListener('click', quitGame);
