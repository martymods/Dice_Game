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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);
}

function updatePlayers() {
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 1; // Slow movement upwards
            player.element.src = characterSprites[player.spriteIndex].walking; // Change to walking GIF
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle; // Change to idle GIF
        }

        // Update position in DOM
        player.element.style.top = `${player.y}px`;
    });
}

function addPlayer(name) {
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;

    // Create player image
    const playerElement = document.createElement('img');
    playerElement.src = characterSprites[index].idle; // Start with idle state
    playerElement.className = 'player';
    playerElement.style.left = `${Math.random() * (canvas.width - 40)}px`;
    playerElement.style.top = `${canvas.height - 60}px`;
    playerElement.style.position = 'absolute';
    playerElement.style.width = '40px';
    playerElement.style.height = '40px';

    document.body.appendChild(playerElement);

    players.push({
        x: parseInt(playerElement.style.left),
        y: canvas.height - 60,
        spriteIndex: index,
        name: name,
        number: randomNumber,
        element: playerElement,
        moving: false
    });
}

// Manual Player Spawn (Key Press "1")
window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addPlayer(`Player${players.length + 1}`);
    }
});

// Toggle Red Light / Green Light System
function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");
}

// Change Green Light / Red Light every 3-6 seconds randomly
setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

function gameLoop() {
    drawBackground();
    updatePlayers();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
