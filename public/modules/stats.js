// stats.js
import { playerStats, loadStats } from '/modules/gameLogic.js';
import { itemsList } from 'items.js';
console.log('Items List Loaded:', itemsList);
import { viewPurchasedItems } from '/modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Display stats
    loadStats();
    console.log('Player Stats:', playerStats); // Log the playerStats object
    displayStats();

    // Set up View Purchased Items button
    const viewItemsButton = document.getElementById('view-purchased-items');
    viewItemsButton.addEventListener('click', () => {
        const purchasedItemsSection = document.getElementById('purchased-items-section');
        purchasedItemsSection.style.display = 'block'; // Show Purchased Items Section
        viewPurchasedItems(itemsList); // Call the function to display items
    });
});


export function displayStats() {
    console.log('Displaying stats:', playerStats); // Debug log
    loadStats(); // Ensure stats are loaded from localStorage
    const statsList = document.getElementById('stats-list');
    if (!statsList) {
        console.error("'stats-list' element not found.");
        return;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const viewItemsButton = document.getElementById('view-purchased-items');
    if (!viewItemsButton) {
        console.error("'View Purchased Items' button not found.");
        return;
    }

    viewItemsButton.addEventListener('click', () => {
        console.log('View Purchased Items button clicked.');
        viewPurchasedItems(itemsList);
    });
});
