const socket = io();
let currentGame = null;

function showCreateGame() {
    const gameName = prompt("Enter a name for your game:");
    const playerName = prompt("Enter your name:");

    if (gameName && playerName) {
        socket.emit("createGame", { gameName, playerName });
        currentGame = gameName;
        document.getElementById("menu").style.display = "none";
        document.getElementById("game").style.display = "block";
        document.getElementById("game-title").innerText = `Game: ${gameName}`;
    }
}

function showJoinGame() {
    const gameName = prompt("Enter the name of the game you want to join:");
    const playerName = prompt("Enter your name:");

    if (gameName && playerName) {
        socket.emit("joinGame", { gameName, playerName });
        currentGame = gameName;
        document.getElementById("menu").style.display = "none";
        document.getElementById("game").style.display = "block";
        document.getElementById("game-title").innerText = `Game: ${gameName}`;
    }
}

function startSinglePlayer() {
    currentGame = "single";
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("game-title").innerText = "Single Player Mode";
    document.getElementById("roll-dice").style.display = "block";
}

function rollDice() {
    if (currentGame === "single") {
        const dice1 = Math.ceil(Math.random() * 6);
        const dice2 = Math.ceil(Math.random() * 6);
        displayDiceResults({ dice1, dice2, total: dice1 + dice2 });
    } else {
        socket.emit("rollDice", { gameName: currentGame });
    }
}

function displayDiceResults({ dice1, dice2, total }) {
    const diceResults = document.getElementById("dice-results");
    diceResults.innerHTML = `
        <p>Dice 1: <img src="images/dice${dice1}.png" alt="Dice ${dice1}"></p>
        <p>Dice 2: <img src="images/dice${dice2}.png" alt="Dice ${dice2}"></p>
        <p>Total: ${total}</p>
    `;
}

function returnToMenu() {
    document.getElementById("menu").style.display = "block";
    document.getElementById("game").style.display = "none";
}

socket.on("updatePlayers", (players) => {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = `
        <h3>Players:</h3>
        <ul>
            ${Object.values(players).map((name) => `<li>${name}</li>`).join("")}
        </ul>
    `;
});

socket.on("diceRolled", (result) => {
    displayDiceResults(result);
});

socket.on("gameNotFound", () => {
    alert("Game not found. Please try again.");
});
