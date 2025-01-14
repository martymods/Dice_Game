// gameLogic.js

const GAME_CONFIG = {
    FIRE_STREAK_THRESHOLD: 3, // Number of wins needed to activate "On Fire" mode
};

let gameState = {
    winStreak: 0,
    onFire: false,
};

export const playerStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    evictions: 0,
    monthsUnlocked: 0,
    totalMoneyWon: 0,
    totalMoneyLost: 0,
    currentWinStreak: 0,
    longestWinStreak: 0,
    totalDaysPassed: 0,
    totalTimePlayed: 0,
};

// Load player stats from localStorage or initialize default values
export function loadStats() {
    try {
        const savedStats = localStorage.getItem('playerStats');
        if (savedStats) {
            Object.assign(playerStats, JSON.parse(savedStats));
        }
    } catch (error) {
        console.error('Error loading player stats:', error);
    }
}

// Save player stats to localStorage
export function saveStats() {
    try {
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
    } catch (error) {
        console.error('Error saving player stats:', error);
    }
}

// Update win streak and check if "On Fire" mode should activate
export function updateWinStreak() {
    gameState.winStreak++;
    if (gameState.winStreak >= GAME_CONFIG.FIRE_STREAK_THRESHOLD && !gameState.onFire) {
        activateOnFire();
    }
}

// Reset win streak and deactivate "On Fire" mode if active
export function resetWinStreak() {
    gameState.winStreak = 0;
    if (gameState.onFire) deactivateOnFire();
}

// Activate "On Fire" mode
function activateOnFire() {
    gameState.onFire = true;
    updateDiceUI(true);
}

// Deactivate "On Fire" mode
function deactivateOnFire() {
    gameState.onFire = false;
    updateDiceUI(false);
}

// Update dice visuals based on "On Fire" mode
function updateDiceUI(isOnFire) {
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');

    if (dice1 && dice2) {
        dice1.src = isOnFire ? '/images/DiceFire1.gif' : '/images/dice1.gif';
        dice2.src = isOnFire ? '/images/DiceFire2.gif' : '/images/dice2.gif';
    } else {
        console.warn('Dice elements not found in the DOM.');
    }
}
