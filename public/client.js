const socket = io(); // Initialize WebSocket connection
let currentGame = {}; // Declare the game variable globally

console.log('Client connected to the server');

// Start Single Player Game
function startSinglePlayer() {
    console.log('Single Player mode selected');
    // Simulate rolling the dice in Single Player mode
    const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const outcome = checkDiceRoll(diceRoll);
    alert(`Dice Roll: ${diceRoll} - Outcome: ${outcome}`);
}

// Join Game - Display list of rooms
function showJoinGame() {
    socket.emit('getGamesList', () => {
        // Request list of available games from the server
    });

    socket.on('availableGames', (roomsList) => {
        if (roomsList.length === 0) {
            alert('No games available. Please create a new game.');
        } else {
            // Display list of available rooms with available slots
            let roomListHTML = '';
            roomsList.forEach(room => {
                roomListHTML += `<li>${room.name} - Players: ${room.players.length}/${room.maxPlayers}</li>`;
            });
            document.getElementById('rooms-list').innerHTML = roomListHTML;
        }
    });
}

// Create Game
function showCreateGame() {
    const roomName = prompt('Enter room name:');
    const playerName = prompt('Enter your name:');
    console.log(`Creating game. Room: ${roomName}, Player: ${playerName}`);
    if (roomName && playerName) {
        socket.emit('createGame', { roomName, playerName });
        socket.on('gameCreated', (data) => {
            if (data.success) {
                alert(`Game created successfully! Room: ${data.roomName}`);
                window.location.href = `/game.html?room=${data.roomName}`; // Transition to game
            }
        });
    }
}

// Check Dice Outcome
function checkDiceRoll(roll) {
    if (roll === 7 || roll === 11) {
        return 'win';
    } else if (roll === 2 || roll === 3 || roll === 12) {
        return 'lose';
    } else {
        return 'point';
    }
}

// Roll Dice in Multiplayer Game
function rollDiceInMultiplayer(roomName, betAmount) {
    socket.emit('rollDice', { roomName, bet: betAmount });
    socket.on('diceRolled', (data) => {
        alert(`Dice Roll: ${data.diceRoll} - Outcome: ${data.outcome}`);
    });
}

// Handle player money and game over conditions
function handlePlayerMoney(playerName) {
    if (players[playerName].money <= 0) {
        alert(`${playerName}, you are out of money! Game Over.`);
        // Optionally, offer the user $300 from DreamWorld or spectate the game
    }
}
