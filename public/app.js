
document.addEventListener('DOMContentLoaded', () => {
    const rentStatus = document.getElementById('rent-status');
    const gameStatus = document.getElementById('gameStatus');
    const rollButton = document.getElementById('rollButton');

    if (!rentStatus || !gameStatus || !rollButton) {
        console.error('Missing essential game elements.');
        return;
    }

    rollButton.addEventListener('click', () => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        gameStatus.textContent = `You rolled ${dice1} and ${dice2}!`;
    });
});
