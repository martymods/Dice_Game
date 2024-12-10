document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const roomsListElement = document.getElementById('rooms-list');
    if (roomsListElement) {
        console.log('Fetching available games...');
        const socket = io();

        socket.emit('getAvailableGames');
        socket.on('availableGames', (gamesList) => {
            console.log('Available games:', gamesList);

            if (gamesList.length === 0) {
                roomsListElement.innerHTML = '<li>No games available. Create one instead!</li>';
            } else {
                roomsListElement.innerHTML = gamesList.map(game => `
                    <li>
                        ${game.roomName} - Players: ${game.players.length}/${game.maxPlayers}
                        <button onclick="joinGame('${game.roomName}')">Join</button>
                    </li>
                `).join('');
            }
        });

        socket.on('joinError', (error) => {
            alert(`Failed to join game: ${error.message}`);
        });
    }
});

// Join a Game
function joinGame(roomName) {
    const playerName = prompt('Enter your name:');
    if (playerName) {
        const socket = io();
        socket.emit('joinGame', { roomName, playerName });
        socket.on('gameJoined', () => {
            window.location.href = `/game.html?room=${encodeURIComponent(roomName)}&player=${encodeURIComponent(playerName)}`;
        });
    } else {
        alert('Player name is required to join a game.');
    }
}
