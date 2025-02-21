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

// ✅ Winner Line Position (Fixed Issue)
const winnerLineY = 100;

// ✅ Footstep sounds
const footstepSounds = ['/SG/walk_0.mp3', '/SG/walk_1.mp3', '/SG/walk_2.mp3'];

// ✅ Gunshot and Death Sounds (Fixed Issue)
const gunshotSounds = ['/SG/Doll_Shooting_0.mp3', '/SG/Doll_Shooting_1.mp3', '/SG/Doll_Shooting_2.mp3', '/SG/Doll_Shooting_3.mp3'];
const hitSounds = ['/SG/C_Hit_0.mp3', '/SG/C_Hit_1.mp3', '/SG/C_Hit_2.mp3'];
const deathSounds = ['/SG/C_Death_0.mp3', '/SG/C_Death_1.mp3', '/SG/C_Death_2.mp3', '/SG/C_Death_3.mp3', '/SG/C_Death_4.mp3'];

// ✅ Character Sprites
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

// ✅ Function to Draw Background (Restored)
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);

    // ✅ Draw Winner Line (Fixed Issue)
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

// ✅ Function to Eliminate Players During Red Light
function eliminatePlayers() {
    if (!isGreenLight && players.length > 0) {
        let numToEliminate = Math.floor(Math.random() * Math.max(1, players.length / 2)); // Random eliminations

        for (let i = 0; i < numToEliminate; i++) {
            let player = players[Math.floor(Math.random() * players.length)];
            if (player) {
                displayDeath(player);
            }
        }
    }
}

// ✅ Function to Display Death Animation and Sounds
function displayDeath(player) {
    playSound(gunshotSounds); // Play gunshot first

    setTimeout(() => {
        playSound(hitSounds); // Play hit sound after 200ms
    }, 200);

    setTimeout(() => {
        playSound(deathSounds); // Play death sound after 300ms
        displayDeathMessage(player);
    }, 300);

    setTimeout(() => {
        player.element.remove();
        player.nameTag.remove();
        players = players.filter(p => p !== player);
    }, 2000); // Remove player after 2 seconds
}

// ✅ Function to Display "Player X is Dead"
function displayDeathMessage(player) {
    ctx.fillStyle = "red";
    ctx.font = "bold 30px Arial";
    ctx.fillText(`${player.name} is Dead`, canvas.width / 2 - 100, canvas.height / 2);
}

// ✅ Function to Play Random Sounds
function playSound(soundArray) {
    const sound = new Audio(soundArray[Math.floor(Math.random() * soundArray.length)]);
    sound.volume = 0.5;
    sound.play();
}

// ✅ Update Players & Check Eliminations
function updatePlayers() {
    players.forEach(player => {
        if (isGreenLight) {
            player.y -= 0.5; // Move players towards the goal
            player.element.src = characterSprites[player.spriteIndex].walking;
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }

        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`;

        // ✅ Check if player crossed the winner line
        if (player.y <= winnerLineY) {
            addToLeaderboard(player.nameTag.innerText);
            player.element.remove();
            player.nameTag.remove();
            players = players.filter(p => p !== player);
        }
    });
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
    
    if (!isGreenLight) {
        setTimeout(eliminatePlayers, 500); // Delay eliminations slightly for effect
    }
}

setInterval(() => {
    toggleGreenLight();
}, Math.random() * (6000 - 3000) + 3000);

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

    document.getElementById('game-container').appendChild(playerElement);

    players.push({
        x: spawnX,
        y: canvas.height - 60,
        spriteIndex: index,
        name: name,
        number: randomNumber,
        element: playerElement
    });
}

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
