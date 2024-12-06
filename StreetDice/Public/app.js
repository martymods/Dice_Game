let point = null;
let currentPlayerIndex = 0;
let players = [];
let currentBet = 0;
let isSinglePlayer = false;
let socket = io();

// Show title screen
document.getElementById('title-screen').addEventListener('click', showNameInput);

// Name input screen
document.getElementById('startButton').addEventListener('click', startGameWithName);
document.getElementById('singlePlayerBtn').addEventListener('click', startSinglePlayer);
document.getElementById('hostGameBtn').addEventListener('click', hostGame);
document.getElementById('joinGameBtn').addEventListener('click', joinGame);

// Multiplayer buttons
document.getElementById('rollButton').addEventListener('click', rollDice);
document.getElementById('betButton').addEventListener('click', placeBet);

function showNameInput() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('name-input').classList.remove('hidden');
}

function startGameWithName() {
    const name = document.getElementById('playerName').value;
    if (!name) return alert("Please enter a name");

    players.push({ name, balance: 100, bet: 0 });
    socket.emit('newPlayer', name);  // Send player name to the server

    document.getElementById('name-input').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function startSinglePlayer() {
    isSinglePlayer = true;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    updatePlayerInfo();
}

function hostGame() {
    alert("Hosting multiplayer game (Not Implemented)");
}

function joinGame() {
    alert("Joining multiplayer game (Not Implemented)");
}

function updatePlayerInfo() {
    document.getElementById('shooter-name').textContent = players[currentPlayerIndex].name;
}

function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    // Display dice images
    document.getElementById('dice1').innerHTML = `<img src="dice${dice1}.png" alt="Dice 1">`;
    document.getElementById('dice2').innerHTML = `<img src="dice${dice2}.png" alt="Dice 2">`;

    const sum = dice1 + dice2;
    const player = players[currentPlayerIndex];
    socket.emit('diceRoll', { sum, playerName: player.name });

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
}

function placeBet() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) return alert("Please enter a valid bet amount.");

    players[currentPlayerIndex].bet = betAmount;
    socket.emit('placeBet', { playerName: players[currentPlayerIndex].name, betAmount });

    document.getElementById('betting-status').textContent = `${players[currentPlayerIndex].name} placed a bet of $${betAmount}`;
}

function handleBets(result) {
    if (result === 'win') {
        players[currentPlayerIndex].balance += players[currentPlayerIndex].bet;
    } else if (result === 'lose') {
        players[currentPlayerIndex].balance -= players[currentPlayerIndex].bet;
    }
    updateBalance();
}

function updateBalance() {
    document.getElementById('betting-status').textContent = `${players[currentPlayerIndex].name} has $${players[currentPlayerIndex].balance}`;
}
