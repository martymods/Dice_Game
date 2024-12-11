document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.error('Invalid game mode.');
    }
});

async function setupSinglePlayer() {
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400; // Initial rent value set to 400
    let maxTurns = 6;
    let progression = 1;
    let items = [];

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const inventoryDisplay = document.getElementById('inventory-list');
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');

    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const gameOverButton = document.getElementById('gameOverButton'); // Add a game over button reference

    const requiredElements = [
        rollButton, betButton, quitButton, bettingStatus, gameStatus, rentStatus,
        inventoryDisplay, popup, itemList, bet25Button, bet50Button, bet100Button, gameOverButton
    ];

    for (const element of requiredElements) {
        if (!element) {
            console.error('One or more required elements are missing in the DOM.');
            return;
        }
    }

    const script = document.createElement('script');
    script.src = '/items.js';
    document.head.appendChild(script);

    script.onload = () => {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

        rollButton.addEventListener('click', () => handleRollDice());
        betButton.addEventListener('click', () => handlePlaceBet());
        quitButton.addEventListener('click', quitGame);

        bet25Button.addEventListener('click', () => setBet(balance * 0.25));
        bet50Button.addEventListener('click', () => setBet(balance * 0.5));
        bet100Button.addEventListener('click', () => setBet(balance));
    };

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
    }

    function handleRollDice() {
        playSound(["/sounds/DiceShake1.ogg", "/sounds/DiceShake2.ogg", "/sounds/DiceShake3.ogg"], true);

        if (currentBet <= 0) {
            alert('Place a bet first!');
            return;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        animateDice(dice1, dice2, () => {
            playSound(["/sounds/DiceRoll1.ogg", "/sounds/DiceRoll2.ogg", "/sounds/DiceRoll3.ogg"]);

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2;
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet;
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            updateUIAfterRoll();
        });
    }

    function handlePlaceBet() {
        playSound("/sounds/UI_Click1.ogg");

        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
        }
    }

    function updateUIAfterRoll() {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
        turns++;

        const rollsRemaining = maxTurns - turns;
        if (rollsRemaining === 1) {
            rentStatus.innerHTML = `Rent Due: $${rent.toLocaleString()} in <span style="color: orange; font-weight: bold;">1</span> roll`;
        } else if (rollsRemaining > 0) {
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsRemaining} rolls`;
        } else {
            if (balance >= rent) {
                rent *= 4;
                maxTurns = Math.min(maxTurns + 1, 12);
                turns = 0;
                alert('You paid the rent! Now get ready for even more demands!');
                showItemPopup();
            } else {
                alert('Game Over. You couldn’t pay the rent, and the landlord isn’t happy!');
                displayLeaderboard(balance);
                showGameOverButton();
                return;
            }
        }

        if (balance <= 0) {
            alert('Game Over. You have no money left.');
            displayLeaderboard(balance);
            showGameOverButton();
        }
    }

    function quitGame() {
        window.location.href = '/';
    }

    function showGameOverButton() {
        document.getElementById('gameOverContainer').style.display = 'block';
    }

    function displayLeaderboard(score) {
        const leaderboardContainer = document.getElementById('leaderboardContainer');

        if (!leaderboardContainer) {
            console.error('Leaderboard container not found.');
            return;
        }

        const playerName = prompt('Enter your name for the leaderboard:');

        if (playerName) {
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard.push({ name: playerName, score });
            leaderboard.sort((a, b) => b.score - a.score);
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        }

        const topPlayers = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardContainer.innerHTML = '<h2>Leaderboard</h2>' +
            topPlayers.map(player => `<p>${player.name}: $${player.score.toLocaleString()}</p>`).join('') +
            '<button id="gameOverButton" onclick="window.location.href=\'/\'">Return to Main Menu</button>'; // Game Over button

        leaderboardContainer.style.display = 'block';
    }

    function playSound(sounds, randomize = false) {
        let soundFile = Array.isArray(sounds) && randomize ? sounds[Math.floor(Math.random() * sounds.length)] : sounds;
        const audio = new Audio(soundFile);
        audio.play().catch(err => console.error('Audio play error:', err));
    }

    function animateDice(dice1, dice2, callback) {
        const dice1Element = document.getElementById('dice1');
        const dice2Element = document.getElementById('dice2');

        if (!dice1Element || !dice2Element) {
            console.error('Dice elements not found.');
            return;
        }

        let counter = 0;
        const interval = setInterval(() => {
            dice1Element.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            dice2Element.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            counter++;

            if (counter >= 10) {
                clearInterval(interval);
                dice1Element.src = `/images/dice${dice1}.png`;
                dice2Element.src = `/images/dice${dice2}.png`;
                callback();
            }
        }, 100);
    }
}

