document.addEventListener('DOMContentLoaded', () => {
    console.log('Main menu loaded.');
});

// Start Single Player Mode
function startSinglePlayer() {
    console.log('Starting Single Player mode...');
    window.location.href = '/game.html?singlePlayer=true';
}

// Host a New Game
function showCreateGame() {
    console.log('Creating a new game...');
    const roomName = prompt('Enter a room name:');
    const playerName = prompt('Enter your name:');

    if (roomName && playerName) {
        console.log(`Creating game. Room: ${roomName}, Player: ${playerName}`);
        window.location.href = `/game.html?room=${encodeURIComponent(roomName)}&player=${encodeURIComponent(playerName)}`;
    } else {
        alert('Room name and player name are required.');
    }
}

// Join an Existing Game
function showJoinGame() {
    console.log('Navigating to Join Game page...');
    window.location.href = '/join.html';
}

