const socket = io(); // Initialize WebSocket connection
let currentGame; // Declare the game variable globally

// Log when the client connects
console.log('Client connected to the server');

function startSinglePlayer() {
    console.log('Single Player mode selected');
    currentGame = {}; // Initialize game logic
    alert('Single-player game started! (Feature still in progress)');
}

function showCreateGame() {
    const roomName = prompt('Enter room name:');
    const playerName = prompt('Enter your name:');
    console.log(`Attempting to create a game. Room: ${roomName}, Player: ${playerName}`);
    if (roomName && playerName) {
        socket.emit('createGame', { roomName, playerName });
        socket.on('gameCreated', (data) => {
            console.log('Game created:', data);
            if (data.success) {
                alert(`Game created successfully! Room Name: ${data.roomName}`);
                // Transition to game interface
                // Example: window.location.href = "/game.html";
            }
        });
    }
}

function showJoinGame() {
    const roomName = prompt('Enter room name to join:');
    const playerName = prompt('Enter your name:');
    console.log(`Attempting to join game. Room: ${roomName}, Player: ${playerName}`);
    if (roomName && playerName) {
        socket.emit('joinGame', { roomName, playerName });
        socket.on('playerJoined', (data) => {
            console.log(`${data.playerName} joined the game in room: ${data.roomName}`);
            alert(`${data.playerName} has joined the game!`);
            // Transition to game interface
            // Example: window.location.href = "/game.html";
        });
        socket.on('error', (err) => {
            console.error('Error joining game:', err);
            alert(err.message);
        });
    }
}
