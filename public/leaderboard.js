document.addEventListener('DOMContentLoaded', async () => {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const API_BASE_URL = 'https://dice-game-1-6iwc.onrender.com/'; // Backend URL

    try {
        // Fetch leaderboard data
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leaderboardData = await response.json();

        // Display leaderboard data
        leaderboardData.slice(0, 20).forEach((entry, index) => {
            const playerEntry = document.createElement('div');
            playerEntry.textContent = `${index + 1}. ${entry.name}: $${entry.score}`;
            leaderboardContainer.appendChild(playerEntry);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardContainer.innerHTML = '<p>Unable to load leaderboard.</p>';
    }
});
