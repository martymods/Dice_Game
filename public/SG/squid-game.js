/* squid-game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dollMusic = document.getElementById('doll-music');
const gunshotSound = document.getElementById('gunshot');

canvas.width = 800;
canvas.height = 600;

let players = [];
let isGreenLight = false;
let gameActive = true;
const dollImage = new Image();
dollImage.src = '/SG/Doll_Attack.gif';
let bgImage = new Image();
bgImage.src = '/SG/game-background.jpg';

// Updated Character Sprites with Correct Paths
const characterSprites = [
    { idle: '/SG/char_0_0.gif', walking: '/SG/char_0_1.gif' },
    { idle: '/SG/char_1_0.gif', walking: '/SG/char_1_1.gif' },
    { idle: '/SG/char_2_0.gif', walking: '/SG/char_2_1.gif' },
    { idle: '/SG/char_3_0.gif', walking: '/SG/char_3_1.gif' },
    { idle: '/SG/char_4_0.gif', walking: '/SG/char_4_1.gif' },
    { idle: '/SG/char_5_0.gif', walking: '/SG/char_5_1.gif' },
    { idle: '/SG/char_6_0.gif', walking: '/SG/char_6_1.gif' },
    { idle: '/SG/char_7_0.gif', walking: '/SG/char_7_1.gif' }
];

function drawBackground() {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);
}

function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    drawBackground();
    
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.05; // Further reduced movement speed
            player.moving = true; // Switch to walking animation
        } else {
            player.moving = false; // Switch to idle animation
        }
        
        const sprite = characterSprites[player.spriteIndex];
        const img = new Image();
        img.src = player.moving ? sprite.walking : sprite.idle;
        img.onload = () => {
            ctx.drawImage(img, player.x, player.y, 40, 40);
        };
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`${player.name} (${player.number})`, player.x, player.y - 5);
    });
}

function updateGame() {
    if (!gameActive) return;
    drawPlayers();
}

function addTikTokPlayer(username) {
    console.log("Adding TikTok Player:", username);
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    players.push({ x: Math.random() * (canvas.width - 40), y: canvas.height - 60, spriteIndex: index, name: username, number: randomNumber, moving: false });
    updateGame();
}

function addManualPlayer() {
    console.log("Adding Manual Player");
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    players.push({ x: Math.random() * (canvas.width - 40), y: canvas.height - 60, spriteIndex: index, name: `Player${players.length + 1}`, number: randomNumber, moving: false });
    updateGame();
}

window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addManualPlayer();
    }
});

// Toggle Red Light / Green Light System
function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");
    updateGame(); // Ensure game updates when switching light states
}

// Change Green Light / Red Light every 3-6 seconds randomly
setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

dollImage.onload = () => {
    bgImage.onload = () => {
        gameLoop();
    };
};
