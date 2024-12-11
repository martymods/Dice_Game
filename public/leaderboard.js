document.addEventListener('DOMContentLoaded', () => {
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardContainer = document.getElementById('leaderboard-container');
    
    leaderboardData.sort((a, b) => b.score - a.score); // Sort leaderboard by score descending

    leaderboardData.slice(0, 20).forEach((entry, index) => {
        const playerEntry = document.createElement('div');
        playerEntry.textContent = `${index + 1}. ${entry.name}: $${entry.score}`;
        leaderboardContainer.appendChild(playerEntry);
    });
});
