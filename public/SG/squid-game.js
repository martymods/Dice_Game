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
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
