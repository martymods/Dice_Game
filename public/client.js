document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    
    // Check if Single Player mode is active
    const isSinglePlayer = window.location.search.includes('singlePlayer=true');
    if (isSinglePlayer) {
        console.log('Single-player mode active');
        rollButton.style.display = 'inline-block'; // Show buttons for Single Player mode
        betButton.style.display = 'inline-block';
        quitButton.style.display = 'inline-block';
    }

    if (rollButton) {
        rollButton.addEventListener('click', rollDice);
    } else {
        console.error('Roll button not found!');
    }

    if (betButton) {
        betButton.addEventListener('click', placeBet);
    } else {
        console.error('Bet button not found!');
    }

    if (quitButton) {
        quitButton.addEventListener('click', quitGame);
    } else {
        console.error('Quit button not found!');
    }
});

// Variables for storing player and game state
let point = null; // Store the point number for gameplay
let currentPlayerIndex = 0;
let players = [
    { name: "Player 1", balance: 300, bet: 0 },
    { name: "Player 2", balance: 300, bet: 0 },
    { name: "Player 3", balance: 300, bet: 0 },
];
let currentBet = 0;
const socket = io(); // Initialize WebSocket connection

// Handle Single Player mode
function startSinglePlayer() {
    console.log('Single-player game started!');
    window.location.href = '/game.html?singlePlayer=true'; // Redirect to the game page
}

// Create a game and handle navigation
function showCreateGame() {
    console.log('Create game button clicked!');
    const roomName = prompt('Enter room name:');
    const playerName = prompt('Enter your name:');
    console.log(`Creating game. Room: ${roomName}, Player: ${playerName}`);
    if (roomName && playerName) {
        socket.emit('createGame', { roomName, playerName });
        socket.on('gameCreated', (data) => {
            if (data.success) {
                console.log(`Game created successfully! Room: ${data.roomName}`);
                window.location.href = `/game.html?room=${data.roomName}`; // Transition to game page
            } else {
                console.log('Game creation failed.');
                alert('Failed to create game.');
            }
        });
    }
}

// Display available games and allow joining
function showJoinGame() {
    console.log('Join game button clicked!');
    socket.emit('getAvailableGames');
    
    socket.on('availableGames', (gamesList) => {
        console.log('Available games:', gamesList);

        const roomsListElement = document.getElementById('rooms-list');
        if (!roomsListElement) {
            console.error("Element for displaying available games not found!");
            return;
        }

        if (gamesList.length === 0) {
            alert('No games available. Please create a new game.');
        } else {
            let gameListHTML = '';
            gamesList.forEach(game => {
                gameListHTML += `<li>${game.roomName} - Players: ${game.players.length}/${game.maxPlayers}</li>`;
            });
            roomsListElement.innerHTML = gameListHTML;
        }
    });
}

// Handle dice roll and betting in multiplayer mode
function rollDiceInMultiplayer(roomName, betAmount) {
    console.log(`Rolling dice in room: ${roomName}`);
    socket.emit('rollDice', { roomName, bet: betAmount });
    socket.on('diceRolled', (data) => {
        console.log('Dice rolled:', data);
        document.getElementById('dice1').src = `public/images/dice${data.diceRoll[0]}.png`;
        document.getElementById('dice2').src = `public/images/dice${data.diceRoll[1]}.png`;
        alert(`Dice Roll: ${data.diceRoll} - Outcome: ${data.outcome}`);
        handleBets(data.outcome);
    });
}

function handleBets(outcome) {
    console.log('Handling bets:', outcome);
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
