document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else if (roomName && playerName) {
        setupMultiplayer(roomName, playerName);
    } else {
        console.error('Invalid game mode.');
    }
});

// Single Player Setup
function setupSinglePlayer() {
    console.log('Single Player mode active.');
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    // Game Logic
    // (Similar logic for betting, rolling, and progressing with rent as provided earlier)
    // Add event listeners here
}

// Multiplayer Setup
function setupMultiplayer(roomName, playerName) {
    console.log(`Multiplayer mode active. Room: ${roomName}, Player: ${playerName}`);
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    if (!rollButton || !betButton || !quitButton) {
        console.error('One or more required elements are missing in the DOM for multiplayer.');
        return;
    }

    // Event Listeners and Game Logic for Multiplayer
    rollButton.addEventListener('click', () => {
        console.log(`${playerName} rolled the dice.`);
        // Emit dice roll to server
    });

    betButton.addEventListener('click', () => {
        console.log(`${playerName} placed a bet.`);
        // Emit bet to server
    });

    quitButton.addEventListener('click', () => {
        console.log(`${playerName} quit the game.`);
        // Return to main menu
        returnToMainMenu();
    });
}

// Show Game Creation Screen
function showCreateGame() {
    const hostGameContainer = document.getElementById('hostGameContainer');
    const mainMenu = document.querySelector('body > h1, body > button');
    mainMenu.style.display = 'none';
    hostGameContainer.style.display = 'block';
}

// Show Join Game Screen
function showJoinGame() {
    const joinGameContainer = document.getElementById('joinGameContainer');
    const mainMenu = document.querySelector('body > h1, body > button');
    mainMenu.style.display = 'none';
    joinGameContainer.style.display = 'block';
}

// Return to Main Menu
function returnToMainMenu() {
    window.location.href = '/';
}
