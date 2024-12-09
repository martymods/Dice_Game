const socket = io(); // Initialize WebSocket connection
let currentGame = {}; // Declare the game variable globally
let players = [
    { name: "Player 1", balance: 300, bet: 0 },
    { name: "Player 2", balance: 300, bet: 0 },
    { name: "Player 3", balance: 300, bet: 0 },
]; // Example player data
let currentPlayerIndex = 0;
let point = null; // Store the point number for gameplay

console.log('Client connected to the server');

// Handle Single Player mode
function startSinglePlayer() {
    alert('Single-player game started!');
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
}

// Quit Game and go back to the main menu
function quitGame() {
    window.location.href = '/';
}

document.getElementById('quitButton').addEventListener('click', quitGame);
