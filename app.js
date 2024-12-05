document.getElementById('rollButton').addEventListener('click', rollDice);
document.getElementById('betButton').addEventListener('click', placeBet);

let point = null;
let currentPlayerIndex = 0;
let players = [
    { name: "Player 1", balance: 100, bet: 0 },
    { name: "Player 2", balance: 100, bet: 0 },
    { name: "Player 3", balance: 100, bet: 0 },
];
let currentBet = 0;

function updatePlayerInfo() {
    // Update current shooter and balance
    document.getElementById('shooter-name').textContent = players[currentPlayerIndex].name;
}

function rollDice() {
    // Generate two random dice rolls (values between 1 and 6)
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    
    // Display dice values on the screen
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;

    const sum = dice1 + dice2;

    // Handle the come-out roll (initial roll)
    if (point === null) {
        if (sum === 7 || sum === 11) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            handleBets('win');
            document.getElementById('pointStatus').textContent = "";
        } else if (sum === 2 || sum === 3 || sum === 12) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            handleBets('lose');
            document.getElementById('pointStatus').textContent = "";
        } else {
            point = sum; // Set the point
            document.getElementById('gameStatus').textContent = "Point is " + point + ". Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    } else {
        // Handle point rolls
        if (sum === point) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            handleBets('win');
            document.getElementById('pointStatus').textContent = "";
            point = null; // Reset point
        } else if (sum === 7) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            handleBets('lose');
            document.getElementById('pointStatus').textContent = "";
            point = null; // Reset point
        } else {
            document.getElementById('gameStatus').textContent = "Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    }

    // Switch player turns
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerInfo();
}

function handleBets(result) {
    // Check the bets for each player and update balances
    players.forEach(player => {
        if (player.bet > 0) {
            if (result === 'win') {
                player.balance += player.bet; // Player wins
            } else if (result === 'lose') {
                player.balance -= player.bet; // Player loses
            }
            player.bet = 0; // Reset the bet after the roll
        }
    });

    // Update balance information in the UI
    let bettingStatus = '';
    players.forEach(player => {
        bettingStatus += `${player.name}: $${player.balance} | Bet: $${player.bet} <br>`;
    });
    document.getElementById('betting-status').innerHTML = bettingStatus;
}

function placeBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    // Place the bet for the current player
    players[currentPlayerIndex].bet = betAmount;
    document.getElementById('betAmount').value = ''; // Clear the input
    handleBets(''); // Update bet status without resolving any outcome yet
    document.getElementById('betting-status').textContent = `${players[currentPlayerIndex].name} has placed a bet of $${betAmount}.`;
}
