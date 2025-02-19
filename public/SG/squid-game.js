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

    console.log("Loading background image:", bgImage.src);

    bgImage.onerror = function () {
        console.error("Background image failed to load! Ensure '/SG/game-background.jpg' exists on the server.");
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    bgImage.onload = function () {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    };
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

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();


