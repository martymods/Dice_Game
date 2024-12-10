function startSinglePlayer() {
    window.location.href = "/game.html?singlePlayer=true";
}

function showCreateGame() {
    document.getElementById("hostGameContainer").style.display = "block";
}

function showJoinGame() {
    const joinGameContainer = document.getElementById("joinGameContainer");
    joinGameContainer.style.display = "block";

    // Fetch available games from the server
    fetch('/available-games')
        .then((response) => response.json())
        .then((games) => {
            const availableGames = document.getElementById("availableGames");
            if (games.length === 0) {
                availableGames.textContent = "No games available. Create one!";
            } else {
                availableGames.innerHTML = games
                    .map(game => `<button onclick="joinGame('${game.roomName}')">${game.roomName} (${game.players} players)</button>`)
                    .join("");
            }
        });
}

function joinGame(roomName) {
    const playerName = prompt("Enter your name:");
    if (!playerName) return;
    window.location.href = `/game.html?room=${encodeURIComponent(roomName)}&player=${encodeURIComponent(playerName)}`;
}

function returnToMainMenu() {
    window.location.href = "/";
}
