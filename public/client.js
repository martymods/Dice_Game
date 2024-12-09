const socket = io(); // Initialize WebSocket connection
let currentGame; // Declare the game variable globally

function startSinglePlayer() {
    currentGame = {}; // Initialize game logic
    console.log('Single-player game started');
    alert('Single-player game started! (Feature still in progress)');
}

function showCreateGame() {
    const roomName = prompt('Enter room name:');
    const playerName = prompt('Enter your name:');
    if (roomName && playerName) {
        socket.emit('createGame', { roomName, playerName });
        socket.on('gameCreated', (data) => {
            if (data.success) {
                alert(`Game created successfully! Room Name: ${data.roomName}`);
            }
        });
    }
}

function showJoinGame() {
    const roomName = prompt('Enter room name to join:');
    const playerName = prompt('Enter your name:');
    if (roomName && playerName) {
        socket.emit('joinGame', { roomName, playerName });
        socket.on('playerJoined', (data) => {
            alert(`${data.playerName} has joined the game!`);
        });
        socket.on('error', (err) => {
            alert(err.message);
        });
    }
}
