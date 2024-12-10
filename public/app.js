document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else {
        console.error('Invalid game mode.');
    }
});

// Single Player Setup
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
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const winLossDisplay = document.getElementById('win-loss-display');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !dice1 || !dice2 || !winLossDisplay) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    // Initialize UI
    updateUI();

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            startDiceAnimation(() => {
                const dice1Value = Math.floor(Math.random() * 6) + 1;
                const dice2Value = Math.floor(Math.random() * 6) + 1;
                const sum = dice1Value + dice2Value;

                dice1.src = `/images/dice${dice1Value}.png`;
                dice2.src = `/images/dice${dice2Value}.png`;

                if (sum === 7 || sum === 11) {
                    const winnings = currentBet * 2;
                    balance += winnings;
                    gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                    showWinOrLoss(`+$${winnings}`, 'green');
                } else if (sum === 2 || sum === 3 || sum === 12) {
                    balance -= currentBet;
                    gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                    showWinOrLoss(`-$${currentBet}`, 'red');
                    if (balance <= 0) {
                        alert('Game Over. Your balance is $0.');
                        quitGame();
                    }
                } else {
                    gameStatus.textContent = `Roll: ${sum}`;
                }

                currentBet = 0;
                updateUI();

                turns++;
                if (turns >= maxTurns) {
                    if (balance >= rent) {
                        const landlordMessage = progression < 9 
                            ? 'Congratulations! You paid the rent. But your landlord sees your dice skills and demands more rent!'
                            : 'The landlord is furious at your success and has doubled the rent!';
                        rent = progression < 9 ? rent * 5 : rent * 6;
                        maxTurns = Math.min(maxTurns + 1, 12);
                        alert(`${landlordMessage}`);
                        rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;
                        turns = 0;
                        progression++;
                    } else {
                        alert('Game Over. You could not pay the rent.');
                        quitGame();
                    }
                }
            });
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', () => placeBet());
    bet25Button.addEventListener('click', () => setBet(0.25 * balance));
    bet50Button.addEventListener('click', () => setBet(0.5 * balance));
    bet100Button.addEventListener('click', () => {
        setBet(balance);
        if (currentBet === balance && balance <= 0) {
            alert('Game Over. You lost all your money.');
            quitGame();
        }
    });

    quitButton.addEventListener('click', quitGame);

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            updateUI();
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        updateUI();
    }

    function showWinOrLoss(amount, color) {
        winLossDisplay.style.color = color;
        winLossDisplay.textContent = amount;
        setTimeout(() => {
            winLossDisplay.textContent = '';
        }, 3000);
    }

    function updateUI() {
        bettingStatus.innerHTML = `<span style="color: darkgreen;">Balance: $${balance}</span> | <span style="color: lightgreen;">Bet: $${currentBet}</span>`;
        rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns - turns} rolls`;
    }

    function startDiceAnimation(callback) {
        let count = 0;
        const interval = setInterval(() => {
            dice1.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            dice2.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            count++;
            if (count > 10) {
                clearInterval(interval);
                callback();
            }
        }, 200);
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }
}
