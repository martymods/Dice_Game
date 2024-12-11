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

// Single Player Setup
function setupSinglePlayer() {
    console.log('Single Player mode active.');

    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let monthCounter = 1;
    
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const rollLeft = document.getElementById('rolls-left');
    const monthCounterElem = document.getElementById('month-counter');
    
    // Required elements
    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    // Initial display setup
    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    // Roll dice button event listener
    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            // Roll Dice Animation
            startDiceRollAnimation(() => {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                const sum = dice1 + dice2;
                
                document.getElementById('dice1').src = `/images/dice${dice1}.png`;
                document.getElementById('dice2').src = `/images/dice${dice2}.png`;

                if (sum === 7 || sum === 11) {
                    balance += currentBet * 2; // Win doubles the bet amount
                    gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
                } else if (sum === 2 || sum === 3 || sum === 12) {
                    balance -= currentBet; // Loss deducts bet amount
                    gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
                    if (balance <= 0) {
                        alert('Game Over. Your balance is $0.');
                        quitGame();
                    }
                } else {
                    gameStatus.textContent = `Roll: ${sum}`;
                }

                // Decrease remaining rolls and check rent payment
                turns++;
                rollLeft.textContent = maxTurns - turns;
                if (turns >= maxTurns) {
                    if (balance >= rent) {
                        rent = progression < 9 ? rent * 5 : rent * 6;
                        maxTurns = Math.min(maxTurns + 1, 12);
                        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;
                        turns = 0;
                        progression++;
                        monthCounter++;
                        monthCounterElem.textContent = `Month: ${monthCounter}`;
                        alert('You paid the rent! Rent has increased!');
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

    // Bet button event listeners
    betButton.addEventListener('click', () => placeBet());
    
    // Setting quick bet percentages
    document.getElementById('bet25Button').addEventListener('click', () => setBet(0.25 * balance));
    document.getElementById('bet50Button').addEventListener('click', () => setBet(0.5 * balance));
    document.getElementById('bet100Button').addEventListener('click', () => setBet(balance));

    quitButton.addEventListener('click', quitGame);

    // Functions
    function startDiceRollAnimation(callback) {
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');

        let count = 0;
        const interval = setInterval(() => {
            dice1.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            dice2.src = `/images/dice${Math.floor(Math.random() * 6) + 1}.png`;
            count++;
            if (count === 10) {
                clearInterval(interval);
                callback(); // Call the callback after animation is complete
            }
        }, 100); // Change dice image every 100ms
    }

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${(balance - currentBet).toLocaleString()} | Bet: $${currentBet}`;
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }
}
