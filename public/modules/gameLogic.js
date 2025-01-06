// gameLogic.

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


// Reset win streak and deactivate "on fire" mode
export function resetWinStreak(fireSound) {
    gameState.winStreak = 0;
    if (gameState.onFire) {
        const fireState = deactivateOnFire(gameState.onFire, fireSound); // Deactivate fire mode
        gameState.onFire = fireState.onFire;
    }
}

// Increment streak and activate "on fire" if threshold is met
export function updateWinStreak(fireSound) {
    gameState.winStreak++;
    if (gameState.winStreak >= GAME_CONFIG.FIRE_STREAK_THRESHOLD && !gameState.onFire) {
        const fireState = activateOnFire(gameState.onFire, fireSound);
        gameState.onFire = fireState.onFire;
    }
}


// Activate "On Fire" mode
function activateOnFire(onFire, fireSound) {
    onFire = true;

    // Change dice visuals to fire versions
    updateDiceUI(true);

    // Play ignite sound
    playSound("/sounds/FireIgnite0.ogg");

    // Start fire effect loop
    if (!fireSound) {
        fireSound = new Audio('/sounds/FireBurn0.ogg');
        fireSound.loop = true;
        fireSound.play().catch((err) => console.error('Error playing fire sound:', err));
    }

    // Update UI elements
    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
        gameStatus.textContent = "🔥 You're on fire! All winnings are tripled! 🔥";
    }

    return { onFire, fireSound };
}

// Deactivate "On Fire" mode
function deactivateOnFire(onFire, fireSound) {
    onFire = false;

    // Revert dice visuals to normal versions
    updateDiceUI(false);

    // Stop fire sound loop
    if (fireSound) {
        fireSound.pause();
        fireSound = null;
    }

    // Play extinguish sound
    playSound("/sounds/FireEnd0.ogg");

    // Update UI elements
    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
        gameStatus.textContent = "🔥 Fire has ended. Good luck! 🔥";
    }

    return { onFire, fireSound };
}

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
