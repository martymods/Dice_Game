// gameLogic.js

let winStreak = 0;
let onFire = false;

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

export function loadStats() {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
        Object.assign(playerStats, JSON.parse(savedStats));
    }
}

export function saveStats() {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
}

export function updateWinStreak() {
    winStreak++;
    if (winStreak >= 3 && !onFire) {
        activateOnFire();
    }
}

export function resetWinStreak() {
    winStreak = 0;
    if (onFire) deactivateOnFire();
}

export function activateOnFire() {
    onFire = true;
    document.getElementById('dice1').src = '/images/DiceFire1.gif';
    document.getElementById('dice2').src = '/images/DiceFire2.gif';
}

export function deactivateOnFire() {
    onFire = false;
    document.getElementById('dice1').src = '/images/dice1.png';
    document.getElementById('dice2').src = '/images/dice2.png';
}
