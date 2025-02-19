/* squid-game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dollMusic = document.getElementById('doll-music');
const gunshotSound = document.getElementById('gunshot');

canvas.width = 800;
canvas.height = 600;

let players = [];
let isGreenLight = true;
let gameActive = true;

function drawBackground() {
    let bgImage = new Image();
    bgImage.src = '/SG/game-background.jpg';
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayers() {
    players.forEach(player => {
        ctx.fillStyle = player.alive ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, 20, 20);
    });
}

function updateGame() {
    if (!gameActive) return;

    drawBackground();
    drawPlayers();
}

function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    if (!isGreenLight) {
        detectMovers();
    }
}

function detectMovers() {
    players.forEach(player => {
        if (Math.random() > 0.5) { // Simulating random movement
            player.alive = false;
            gunshotSound.play();
        }
    });
}

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// TikTok Gift Integration using TikFinity
window.addEventListener("message", (event) => {
    if (event.data?.event === "GiftReceived") {
        addTikTokPlayer(event.data.username);
    }
});

function addTikTokPlayer(username) {
    players.push({ x: Math.random() * canvas.width, y: canvas.height - 40, alive: true, name: username });
    updateLeaderboard(username);
}

function updateLeaderboard(username) {
    const leaderboard = document.getElementById("leaderboard-list");
    let listItem = document.createElement("li");
    listItem.textContent = username;
    leaderboard.appendChild(listItem);
}
