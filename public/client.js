document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const roomsListElement = document.getElementById('rooms-list');
    const availableGamesSection = document.getElementById('available-games');

    // Check if Multiplayer mode is active
    const isMultiplayer = window.location.search.includes('room=');
    if (isMultiplayer) {
        console.log('Multiplayer mode active');
        rollButton.style.display = 'inline-block';
        betButton.style.display = 'inline-block';
        quitButton.style.display = 'inline-block';

        rollButton.addEventListener('click', () => rollDiceInMultiplayer());
        betButton.addEventListener('click', placeBet);
        quitButton.addEventListener('click', quitGame);
    }

    // Show available games for "Join Game"
    if (availableGamesSection && roomsListElement) {
        socket.emit('getAvailableGames');
        socket.on('availableGames', (gamesList) => {
            console.log('Available games:', gamesList);

            if (gamesList.length === 0) {
                alert('No games available. Please create a new game.');
            } else {
                let gameListHTML = '';
                gamesList.forEach(game => {
                    gameListHTML += `<li>${game.roomName} - Players: ${game.players.length}/2
                        <button onclick="joinGame('${game.roomName}')">Join</button></li>`;
                });
                roomsListElement.innerHTML = gameListHTML;
                availableGamesSection.style.display = 'block';
            }
        });
    } else {
        console.error("Element for displaying available games not found!");
    }
});

// Roll Dice in Multiplayer Mode
function rollDiceInMultiplayer() {
    console.log('Rolling dice...');
    socket.emit('rollDice', { roomName });
}

// Quit Game
function quitGame() {
    console.log('Exiting the game and returning to the main menu.');
    window.location.href = '/';
}

// Join a Game
function joinGame(roomName) {
    console.log(`Joining game: ${roomName}`);
    const playerName = prompt('Enter your name:');
    if (playerName) {
        socket.emit('joinGame', { roomName, playerName });
        socket.on('gameJoined', (data) => {
            console.log('Game joined:', data);
            window.location.href = `/game.html?room=${roomName}`;
        });
        socket.on('joinError', (error) => {
            alert(`Failed to join game: ${error.message}`);
        });
    }
}
