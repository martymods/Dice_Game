document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else if (roomName && playerName) {
        setupMultiplayer(roomName, playerName);
    } else {
        console.error('Invalid game mode.');
    }
});

function setupSinglePlayer() {
    console.log('Single Player mode active.');
    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');

    bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;

            document.getElementById('dice1').src = `/images/dice${dice1}.png`;
            document.getElementById('dice2').src = `/images/dice${dice2}.png`;

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2;
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet;
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                if (balance <= 0) {
                    alert('Game Over. Your balance is $0.');
                    quitGame();
                }
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            currentBet = 0;
            bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;

            turns++;
            if (turns >= maxTurns) {
                if (balance >= rent) {
                    rent = progression < 9 ? rent * 5 : rent * 6;
                    maxTurns = Math.min(maxTurns + 1, 12);
                    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;
                    turns = 0;
                    progression++;
                    alert('You paid the rent! Rent has increased!');
                } else {
                    alert('Game Over. You could not pay the rent.');
                    quitGame();
                }
            }
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', () => {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${balance - currentBet} | Bet: $${currentBet}`;
        }
    });

    quitButton.addEventListener('click', quitGame);
}

function setupMultiplayer(roomName, playerName) {
    console.log(`Multiplayer mode active. Room: ${roomName}, Player: ${playerName}`);
}

function quitGame() {
    window.location.href = '/';
}
