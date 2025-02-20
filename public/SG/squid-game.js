/* squid-game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dollMusic = new Audio('/SG_Background_Ambience_0.mp3');
const buzzerSound = new Audio('/SG/Buzzer.mp3');
const countdownSound = new Audio('/SG/CountDown.mp3');
const countdownEndSound = new Audio('/SG/CountDown_END.mp3');
const soundAl = new Audio('/SG/SoundAl.mp3');

canvas.width = 800;
canvas.height = 600;

let players = [];
let isGreenLight = false;
let gameActive = true;
let firstWinnerTime = null;
let countdownTimer = null;
const dollImage = new Image();
dollImage.src = '/SG/Doll_Attack.gif';
let bgImage = new Image();
bgImage.src = '/SG/game-background.jpg';

// Winner Line Position
const winnerLineY = 100;

// Footstep sounds
const footstepSounds = ['/SG/walk_0.mp3', '/SG/walk_1.mp3', '/SG/walk_2.mp3'];

// Gunshot and Death Sounds
const gunshotSounds = ['/SG/Doll_Shooting_0.mp3', '/SG/Doll_Shooting_1.mp3', '/SG/Doll_Shooting_2.mp3', '/SG/Doll_Shooting_3.mp3'];
const hitSounds = ['/SG/C_Hit_0.mp3', '/SG/C_Hit_1.mp3', '/SG/C_Hit_2.mp3'];
const deathSounds = ['/SG/C_Death_0.mp3', '/SG/C_Death_1.mp3', '/SG/C_Death_2.mp3', '/SG/C_Death_3.mp3', '/SG/C_Death_4.mp3'];

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

    // Draw Winner Line
    ctx.beginPath();
    ctx.moveTo(0, winnerLineY);
    ctx.lineTo(canvas.width, winnerLineY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'red';
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function updatePlayers() {
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            
            // Play footstep sounds at random intervals while moving
            if (!player.footstepCooldown) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                footstep.play();
                player.footstepCooldown = true;
                setTimeout(() => player.footstepCooldown = false, 500); // Prevents overlapping sounds
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });
}
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            
            // Play footstep sounds at regular intervals
            if (!player.footstepCooldown) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                let stereoPan = (player.x / canvas.width) * 2 - 1;
                if (footstep.pan) footstep.pan.value = stereoPan;
                footstep.play();
                player.footstepCooldown = true;
                setTimeout(() => player.footstepCooldown = false, 500); // Ensures footsteps don't play too fast
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            
            // Play footstep sounds at regular intervals
            if (!player.footstepCooldown) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                footstep.play();
                player.footstepCooldown = true;
                setTimeout(() => player.footstepCooldown = false, 500); // Ensures footsteps don't play too fast
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            
            // Play footstep sounds at random intervals
            if (Math.random() < 0.15) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                let stereoPan = (player.x / canvas.width) * 2 - 1; // Convert x position to stereo pan (-1 to 1)
                if (footstep.pan) footstep.pan.value = stereoPan;
                footstep.play();
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            if (Math.random() < 0.2) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                let stereoPan = (player.x / canvas.width) * 2 - 1;
                if (footstep.pan) footstep.pan.value = stereoPan;
                footstep.play();
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5;
            player.element.src = characterSprites[player.spriteIndex].walking;
            if (Math.random() < 0.15) {
                let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
                footstep.volume = 0.5;
                let stereoPan = (player.x / canvas.width) * 2 - 1; // Convert x position to stereo pan (-1 to 1)
                if (footstep.pan) footstep.pan.value = stereoPan;
                footstep.play();
            }
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player
    });


function gameLoop() {
    drawBackground();
    updatePlayers();
    requestAnimationFrame(gameLoop);
}

// Ensure pressing '1' still spawns players
window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addPlayer(`Player${players.length + 1}`);
    }
});

// Footstep sounds play while moving
setInterval(() => {
    players.forEach(player => {
        if (isGreenLight && Math.random() < 0.3) {
            let footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
            footstep.volume = 0.5;
            footstep.play();
        }
    });
}, 500);


dollMusic.loop = true;
dollMusic.play();

requestAnimationFrame(gameLoop);

