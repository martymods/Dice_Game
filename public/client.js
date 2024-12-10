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

// Display Leaderboard from Main Menu
function displayLeaderboard() {
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardData.sort((a, b) => b.score - a.score);
    const top20 = leaderboardData.slice(0, 20);

    // Create leaderboard UI
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.innerHTML = `
            <h2>Leaderboard</h2>
            ${top20
                .map((entry, index) => `<p>${index + 1}. ${entry.name}: $${entry.score}</p>`)
                .join('')}
            <button onclick="location.reload()">Return to Main Menu</button>
        `;
    } else {
        console.error('Main menu element not found.');
    }
}
