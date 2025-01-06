// gameLogic.js

import { playSound } from './audio.js';

const GAME_CONFIG = {
    FIRE_STREAK_THRESHOLD: 3,
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

// Load stats
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

// Save stats
export function saveStats() {
    try {
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
    } catch (error) {
        console.error('Error saving player stats:', error);
    }
}

// Reset win streak and deactivate fire mode
export function resetWinStreak(fireSound) {
    gameState.winStreak = 0;
    if (gameState.onFire) {
        const fireState = deactivateOnFire(gameState.onFire, fireSound);
        gameState.onFire = fireState.onFire;
    }
}

// Increment streak and activate fire mode if threshold is met
export function updateWinStreak(fireSound) {
    gameState.winStreak++;
    if (gameState.winStreak >= GAME_CONFIG.FIRE_STREAK_THRESHOLD && !gameState.onFire) {
        const fireState = activateOnFire(gameState.onFire, fireSound);
        gameState.onFire = fireState.onFire;
    }
}

// Fire activation
function activateOnFire(onFire, fireSound) {
    onFire = true;

    playSound("/sounds/FireIgnite0.ogg");

    if (!fireSound) {
        fireSound = new Audio('/sounds/FireBurn0.ogg');
        fireSound.loop = true;
        fireSound.play().catch(err => console.error('Error playing fire sound:', err));
    }

    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
        gameStatus.textContent = "🔥 You're on fire! All winnings are tripled! 🔥";
    }

    return { onFire, fireSound };
}

// Fire deactivation
function deactivateOnFire(onFire, fireSound) {
    onFire = false;

    if (fireSound) {
        fireSound.pause();
        fireSound = null;
    }

    playSound("/sounds/FireEnd0.ogg");

    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
        gameStatus.textContent = "🔥 Fire has ended. Good luck! 🔥";
    }

    return { onFire, fireSound };
}

// Grouped export for all needed functions
export { loadStats, saveStats, resetWinStreak, updateWinStreak };

// Update dice visuals based on "On Fire" mode
function updateDiceUI(isOnFire) {
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');

    if (dice1 && dice2) {
        dice1.src = isOnFire ? '/images/DiceFire1.gif' : '/images/dice1.png';
        dice2.src = isOnFire ? '/images/DiceFire2.gif' : '/images/dice2.png';
    } else {
        console.warn('Dice elements not found in the DOM.');
    }
}
