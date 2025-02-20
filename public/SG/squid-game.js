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

function playSound(soundArray) {
    const sound = new Audio(soundArray[Math.floor(Math.random() * soundArray.length)]);
    sound.play();
}

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
        moving: false
    });
}

window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        addPlayer(`Player${players.length + 1}`);
    }
});

function gameLoop() {
    drawBackground();
    requestAnimationFrame(gameLoop);
}

dollMusic.loop = true;
dollMusic.play();

requestAnimationFrame(gameLoop);
