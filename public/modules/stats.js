// stats.js
import { playerStats, loadStats } from './gameLogic.js';

export function displayStats() {
    loadStats(); // Ensure stats are loaded from localStorage
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = `
        <ul>
            <li>Games Played: ${playerStats.gamesPlayed}</li>
            <li>Games Won: ${playerStats.gamesWon}</li>
            <li>Times Evicted: ${playerStats.evictions}</li>
            <li>Months Unlocked: ${playerStats.monthsUnlocked}/12</li>
            <li>Total Money Won: $${playerStats.totalMoneyWon.toLocaleString()}</li>
            <li>Total Money Lost: $${playerStats.totalMoneyLost.toLocaleString()}</li>
            <li>Hustlers Recruited: ${playerStats.hustlersRecruited}</li>
            <li>Total Time Played: ${formatTime(playerStats.totalTimePlayed)}</li>
            <li>Current Winning Streak: ${playerStats.currentWinStreak}</li>
            <li>Longest Winning Streak: ${playerStats.longestWinStreak}</li>
            <li>Total Days Passed: ${playerStats.totalDaysPassed}</li>
        </ul>
    `;
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}
