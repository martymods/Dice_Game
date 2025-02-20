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

// ✅ Function to Add Players
function addPlayer(name) {
    const index = players.length % characterSprites.length;
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    const spawnX = Math.random() * (canvas.width - 50) + 10;

    const playerElement = document.createElement('img');
    playerElement.src = characterSprites[index].idle;
    playerElement.className = 'player';
    playerElement.style.left = `${spawnX}px`;
    playerElement.style.top = `${canvas.height - 60}px`;
    playerElement.style.position = 'absolute';
    playerElement.style.width = '40px';
    playerElement.style.height = '40px';

    const nameTag = document.createElement('span');
    nameTag.className = 'player-name';
    nameTag.innerText = `${name} (${randomNumber})`;
    nameTag.style.left = `${spawnX}px`;
    nameTag.style.top = `${canvas.height - 80}px`;
    nameTag.style.position = 'absolute';
    nameTag.style.color = 'black';
    nameTag.style.background = 'rgba(255,255,255,0.7)';
    nameTag.style.padding = '2px 5px';
    nameTag.style.borderRadius = '3px';

    document.getElementById('game-container').appendChild(playerElement);
    document.getElementById('game-container').appendChild(nameTag);

    players.push({
        x: spawnX,
        y: canvas.height - 60,
        spriteIndex: index,
        name: name,
        number: randomNumber,
        element: playerElement,
        nameTag: nameTag,
        footstepCooldown: false,
        moving: false
    });
}

// ✅ Update Players with Footstep Sounds & Leaderboard
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

        // ✅ Check if player crossed the winner line
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

// ✅ Start Countdown Timer
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

// ✅ Add Winners to Leaderboard
function addToLeaderboard(name) {
    const leaderboard = document.getElementById('leaderboard-list');
    const entry = document.createElement('li');
    entry.innerText = `${name} - Winner!`;
    leaderboard.appendChild(entry);
}

// ✅ Toggle Green Light / Red Light
function toggleGreenLight() {
    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");
}

setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

// ✅ Ensure pressing '1' still spawns players
window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addPlayer(`Player${players.length + 1}`);
    }
});

// ✅ Main Game Loop
function gameLoop() {
    drawBackground();
    updatePlayers();
    requestAnimationFrame(gameLoop);
}

dollMusic.loop = true;
dollMusic.play();

requestAnimationFrame(gameLoop);

