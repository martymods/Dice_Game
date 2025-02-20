/* squid-game.js */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dollMusic = new Audio('/SG/SG_Background_Ambience_0.mp3');
const buzzerSound = new Audio('/SG/Buzzer.mp3');
const countdownSound = new Audio('/SG/CountDown.mp3');
const countdownEndSound = new Audio('/SG/CountDown_END.mp3');

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
    ctx.shadowBlur = 0; // Reset shadow
}

function playSound(soundArray) {
    const sound = new Audio(soundArray[Math.floor(Math.random() * soundArray.length)]);
    sound.play();
}

function updatePlayers() {
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5; // Slower movement upwards
            player.element.src = characterSprites[player.spriteIndex].walking; // Change to walking GIF
            if (Math.random() < 0.1) playSound(footstepSounds); // Randomized footsteps
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle; // Change to idle GIF
        }

        player.y = Math.max(0, Math.min(canvas.height - 40, player.y));
        player.x = Math.max(10, Math.min(canvas.width - 50, player.x));

        player.element.style.top = `${player.y}px`;
        player.element.style.left = `${player.x}px`;
        player.nameTag.style.top = `${player.y - 20}px`;
        player.nameTag.style.left = `${player.x}px`;

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

function eliminatePlayers() {
    let numToKill = Math.floor(Math.random() * (players.length / 2)) + 1;
    let killed = 0;
    let eliminationInterval = setInterval(() => {
        if (killed >= numToKill || players.length === 0) {
            clearInterval(eliminationInterval);
            return;
        }
        let victim = players[Math.floor(Math.random() * players.length)];
        playSound(gunshotSounds);
        setTimeout(() => playSound(hitSounds), 200);
        setTimeout(() => playSound(deathSounds), 300);
        setTimeout(() => {
            victim.element.remove();
            victim.nameTag.remove();
            players = players.filter(p => p !== victim);
        }, 2000);
        killed++;
    }, 2000);
}

function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");
    if (!isGreenLight) eliminatePlayers();
}

setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

dollMusic.loop = true;
dollMusic.play();

gameLoop();

