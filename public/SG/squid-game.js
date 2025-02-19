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
const dollImage = new Image();
dollImage.src = '/SG/Doll_Attack.gif';

// Character Sprites
const characterSprites = [
    { idle: '/SG/FourPlayers2-Char_0_0.gif', walking: '/SG/FourPlayers2-Char_0_1.gif' },
    { idle: '/SG/FourPlayers2-Char_1_0.gif', walking: '/SG/FourPlayers2-Char_1_1.gif' },
    { idle: '/SG/FourPlayers2-Char_2_0.gif', walking: '/SG/FourPlayers2-Char_2_1.gif' },
    { idle: '/SG/FourPlayers2-Char_3_0.gif', walking: '/SG/FourPlayers2-Char_3_1.gif' },
    { idle: '/SG/FourPlayers2-Char_4_0.gif', walking: '/SG/FourPlayers2-Char_4_1.gif' },
    { idle: '/SG/FourPlayers2-Char_5_0.gif', walking: '/SG/FourPlayers2-Char_5_1.gif' },
    { idle: '/SG/FourPlayers2-Char_6_0.gif', walking: '/SG/FourPlayers2-Char_6_1.gif' },
    { idle: '/SG/FourPlayers2-Char_7_0.gif', walking: '/SG/FourPlayers2-Char_7_1.gif' }
];

function drawBackground() {
    let bgImage = new Image();
    bgImage.src = '/SG/game-background.jpg';
    bgImage.onload = function () {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);
    };
}

function drawPlayers() {
    players.forEach(player => {
        const sprite = characterSprites[player.spriteIndex];
        const img = new Image();
        img.src = player.moving ? sprite.walking : sprite.idle;
        ctx.drawImage(img, player.x, player.y, 40, 40);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`${player.name} (${player.number})`, player.x, player.y - 5);
    });
}

function updateGame() {
    if (!gameActive) return;
    drawBackground();
    drawPlayers();
}

function addTikTokPlayer(username) {
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    players.push({ x: Math.random() * canvas.width, y: canvas.height - 40, spriteIndex: index, name: username, number: randomNumber, moving: true });
}

function addManualPlayer() {
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    players.push({ x: Math.random() * canvas.width, y: canvas.height - 40, spriteIndex: index, name: 'Player', number: randomNumber, moving: true });
}

window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addManualPlayer();
    }
});

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();


