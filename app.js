let point = null;
let currentPlayerIndex = 0;
let players = [
    { name: "Player 1", balance: 100, bet: 0 },
    { name: "Player 2", balance: 100, bet: 0 },
    { name: "Player 3", balance: 100, bet: 0 },
];
let currentBet = 0;
let isSinglePlayer = false;

// Show title screen
document.getElementById('title-screen').addEventListener('click', startGame);

// Main menu buttons
document.getElementById('singlePlayerBtn').addEventListener('click', startSinglePlayer);
document.getElementById('hostGameBtn').addEventListener('click', hostGame);
document.getElementById('joinGameBtn').addEventListener('click', joinGame);

// Switch to the main menu screen after title
function startGame() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

// Start Single Player mode
function startSinglePlayer() {
    isSinglePlayer = true;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    updatePlayerInfo();
}

// Host a multiplayer game
function hostGame() {
    alert("Hosting multiplayer game (Not Implemented)");
    // Multiplayer hosting logic can be added here (e.g., using websockets or peer-to-peer)
}

// Join a multiplayer game
function joinGame() {
    alert("Joining multiplayer game (Not Implemented)");
    // Multiplayer joining logic can be added here
}

// Game Logic Functions
function updatePlayerInfo() {
    document.getElementById('shooter-name').textContent = players[currentPlayerIndex].name;
}

document.getElementById('rollButton').addEventListener('click', rollDice);
document.getElementById('betButton').addEventListener('click', placeBet);

function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;

    const sum = dice1 + dice2;

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
            point = sum;
            document.getElementById('gameStatus').textContent = "Point is " + point + ". Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    } else {
        if (sum === point) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            handleBets('win');
            document.getElementById('pointStatus').textContent = "";
            point = null;
        } else if (sum === 7) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            handleBets('lose');
            document.getElementById('pointStatus').textContent = "";
            point = null;
        } else {
            document.getElementById('gameStatus').textContent = "Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    }

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerInfo();
}

function handleBets(result) {
    players.forEach(player => {
        if (player.bet > 0) {
            if (result === 'win') {
                player.balance += player.bet;
            } else if (result === 'lose') {
                player.balance -= player.bet;
            }
            player.bet = 0;
        }
    });

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

    players[currentPlayerIndex].bet = betAmount;
    document.getElementById('betAmount').value = '';
    handleBets('');
    document.getElementById('betting-status').textContent = `${players[currentPlayerIndex].name} has placed a bet of $${betAmount}.`;
}
