/* squid-game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dollMusic = new Audio('/SG/SG_Background_Ambience_0.mp3');
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

function startCountdown() {
    let timeLeft = 20;
    buzzerSound.play();
    countdownTimer = setInterval(() => {
        if (timeLeft === 10) countdownSound.play();
        if (timeLeft <= 10) playSound(['/SG/CountDown.mp3']);
        if (timeLeft === 0) {
            countdownEndSound.play();
            clearInterval(countdownTimer);
        }
        console.log(`Countdown: ${timeLeft}`);
        timeLeft--;
    }, 1000);
}

function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");
}

setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

function playSound(soundArray) {
    const sound = new Audio(soundArray[Math.floor(Math.random() * soundArray.length)]);
    sound.play();
}

function updatePlayers() {
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5; // Move players towards the goal
            player.element.src = characterSprites[player.spriteIndex].walking;
            if (Math.random() < 0.1) playSound(footstepSounds);
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }

        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`; // Keep name above player

        // Check if player crossed the winner line
        if (player.y <= winnerLineY) {
            if (!firstWinnerTime) {
                firstWinnerTime = Date.now();
                startCountdown();
            }
            addToLeaderboard(player.nameTag.innerText);
            player.element.remove();
            player.nameTag.remove();
            players = players.filter(p => p !== player);
        }
    });
}

function gameLoop() {
    drawBackground();
    updatePlayers();
    requestAnimationFrame(gameLoop);
}

dollMusic.loop = true;
dollMusic.play();

requestAnimationFrame(gameLoop);
