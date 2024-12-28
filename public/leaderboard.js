document.addEventListener('DOMContentLoaded', async () => {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const API_BASE_URL = 'http://localhost:3000'; // Adjust if deployed 

    // Fetch leaderboard data
    const leaderboardData = await fetch(`${API_BASE_URL}/leaderboard`).then(res => res.json());


    leaderboardData.slice(0, 20).forEach((entry, index) => {
        const playerEntry = document.createElement('div');
        playerEntry.textContent = `${index + 1}. ${entry.name}: $${entry.score}`;
        leaderboardContainer.appendChild(playerEntry);
    });
});
