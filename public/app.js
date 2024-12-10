document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has("singlePlayer");
    const roomName = urlParams.get("room");
    const playerName = urlParams.get("player");

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else if (roomName && playerName) {
        setupMultiplayer(roomName, playerName);
    } else {
        console.error("Invalid game mode.");
    }
});

function setupSinglePlayer() {
    // Include the single-player logic you provided earlier, updated with fixes.
}

function setupMultiplayer(roomName, playerName) {
    console.log(`Multiplayer mode active. Room: ${roomName}, Player: ${playerName}`);
    // Multiplayer logic similar to single-player, with betting and rolling logic.
}
