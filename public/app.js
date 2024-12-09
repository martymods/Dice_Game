document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');

    const isSinglePlayer = window.location.search.includes('singlePlayer=true');
    if (isSinglePlayer) {
        console.log('Single-player mode active');
        rollButton.style.display = 'inline-block';
        betButton.style.display = 'inline-block';
        quitButton.style.display = 'inline-block';

        rollButton.addEventListener('click', rollDice);
        betButton.addEventListener('click', placeBet);
        quitButton.addEventListener('click', quitGame);
    }
});

// Game State Variables
let point = null;
let balance = 300; // Starting balance for Single Player mode
let betAmount = 0;

// Function to Roll Dice
function rollDice() {
    console.log('Rolling dice...');
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    console.log(`Dice rolled: ${dice1} + ${dice2} = ${sum}`);
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;

    if (point === null) {
        // Handle the come-out roll
        if (sum === 7 || sum === 11) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            updateBalance('win');
            resetGame();
        } else if (sum === 2 || sum === 3 || sum === 12) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            updateBalance('lose');
            resetGame();
        } else {
            point = sum;
            document.getElementById('gameStatus').textContent = `Point is ${point}. Keep rolling!`;
            document.getElementById('pointStatus').textContent = `Your point: ${point}`;
        }
    } else {
        // Handle rolling for the point
        if (sum === point) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            updateBalance('win');
            resetGame();
        } else if (sum === 7) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            updateBalance('lose');
            resetGame();
        } else {
            document.getElementById('gameStatus').textContent = "Keep rolling!";
        }
    }
}

// Function to Place a Bet
function placeBet() {
    const betInput = document.getElementById('betAmount');
    betAmount = parseInt(betInput.value);

    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount. Please enter a valid number within your balance.");
        return;
    }

    console.log(`Bet placed: $${betAmount}`);
    document.getElementById('betting-status').textContent = `Bet placed: $${betAmount}`;
    betInput.value = ''; // Clear the input field
}

// Function to Update Balance
function updateBalance(result) {
    if (result === 'win') {
        balance += betAmount;
    } else if (result === 'lose') {
        balance -= betAmount;
    }
    betAmount = 0; // Reset the bet amount
    document.getElementById('betting-status').textContent = `Balance: $${balance}`;
}

// Function to Reset the Game
function resetGame() {
    point = null;
    document.getElementById('pointStatus').textContent = '';
}

// Function to Quit Game
function quitGame() {
    console.log('Exiting the game and returning to the main menu.');
    window.location.href = '/';
}
