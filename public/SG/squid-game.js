/* squid-game.js */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dollMusic = new Audio("/SG/SG_Background_Ambience_0.mp3");
const buzzerSound = new Audio("/SG/Buzzer.mp3");
const countdownSound = new Audio("/SG/CountDown.mp3");
const countdownEndSound = new Audio("/SG/CountDown_END.mp3");
const soundAl = new Audio("/SG/SoundAl.mp3");
const dollReloadSound = new Audio("/SG/Doll_Reload.mp3");
const dollTalkSound = new Audio("/SG/Doll_Talk.mp3");

canvas.width = 800;
canvas.height = 600;

let players = [];
let deadBodies = [];
let isGreenLight = false;
let isDollShooting = false;
let firstWinnerTime = null;
let countdownTimerElement = null;
let countdownTimer = null;
let leaderboardScores = {}; // Track player scores

const dollImage = new Image();
dollImage.src = "/SG/Doll_Attack.gif";
let bgImage = new Image();
bgImage.src = "/SG/game-background.jpg";

// ✅ Winner Line Position
const winnerLineY = 100;

// ✅ Footstep Sounds
const footstepSounds = ['/SG/walk_0.mp3', '/SG/walk_1.mp3', '/SG/walk_2.mp3'];

// ✅ Sound Effects
const gunshotSounds = ["/SG/Doll_Shooting_0.mp3", "/SG/Doll_Shooting_1.mp3", "/SG/Doll_Shooting_2.mp3", "/SG/Doll_Shooting_3.mp3"];
const hitSounds = ["/SG/C_Hit_0.mp3", "/SG/C_Hit_1.mp3", "/SG/C_Hit_2.mp3"];
const deathSounds = ["/SG/C_Death_0.mp3", "/SG/C_Death_1.mp3", "/SG/C_Death_2.mp3", "/SG/C_Death_3.mp3", "/SG/C_Death_4.mp3"];

// ✅ Death Animation Sequence
const bloodExplosionFrames = [
    "/SG/Blood_Explosion_0.png",
    "/SG/Blood_Explosion_1.png",
    "/SG/Blood_Explosion_2.png",
    "/SG/Blood_Explosion_3.png"
];

const deadBodySprites = [
    "/SG/Dead_Body_0.png", "/SG/Dead_Body_1.png", "/SG/Dead_Body_2.png",
    "/SG/Dead_Body_3.png", "/SG/Dead_Body_4.png", "/SG/Dead_Body_5.png",
    "/SG/Dead_Body_6.png", "/SG/Dead_Body_7.png", "/SG/Dead_Body_8.png",
    "/SG/Dead_Body_9.png"
];

// ✅ Character Sprites
const characterSprites = [
    { idle: "/SG/char_0_0.gif", walking: "/SG/char_0_1.gif" },
    { idle: "/SG/char_1_0.gif", walking: "/SG/char_1_1.gif" },
    { idle: "/SG/char_2_0.gif", walking: "/SG/char_2_1.gif" },
    { idle: "/SG/char_3_0.gif", walking: "/SG/char_3_1.gif" },
    { idle: "/SG/char_4_0.gif", walking: "/SG/char_4_1.gif" },
    { idle: "/SG/char_5_0.gif", walking: "/SG/char_5_1.gif" },
    { idle: "/SG/char_6_0.gif", walking: "/SG/char_6_1.gif" },
    { idle: "/SG/char_7_0.gif", walking: "/SG/char_7_1.gif" }
];

// ✅ Function to Play Random Sounds
function playSound(soundArray) {
    const sound = new Audio(soundArray[Math.floor(Math.random() * soundArray.length)]);
    sound.volume = 0.5;
    sound.play();
}

// ✅ Function to Draw Background
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);

    // ✅ Draw Winner Line
    ctx.beginPath();
    ctx.moveTo(0, winnerLineY);
    ctx.lineTo(canvas.width, winnerLineY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "red";
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// ✅ Function to Move Players Towards the Red Line
function updatePlayers() {
    players.forEach(player => {
        if (!player || !player.element || !player.nameTag) return;

        if (isGreenLight && !isDollShooting) {
            player.y -= 0.8;
            player.element.src = characterSprites[player.spriteIndex].walking;
            player.element.src += "?t=" + new Date().getTime();
            playFootstepSound(player);
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }

        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`;

        if (player.y <= winnerLineY) {
            if (!firstWinnerTime) {
                firstWinnerTime = Date.now();
                startRoundCountdown();
            }
            addToLeaderboard(player);
        }
    });
}

// ✅ Function to Play Footstep Sound
function playFootstepSound(player) {
    if (Math.random() < 0.2) {
        playSound(footstepSounds, 0.25); // 🔹 Reduced volume by 50%
        const footstep = new Audio(footstepSounds[Math.floor(Math.random() * footstepSounds.length)]);
        footstep.volume = 0.5;
        footstep.play();
    }
}

// ✅ Function to Add Players to Leaderboard
function addToLeaderboard(player) {
    if (!player || !player.nameTag) return;

    let playerName = player.nameTag.innerText;
    if (!leaderboardScores[playerName]) {
        leaderboardScores[playerName] = 0;
    }
    leaderboardScores[playerName]++;

    const leaderboard = document.getElementById("leaderboard-list");
    leaderboard.innerHTML = "";
    for (let name in leaderboardScores) {
        const entry = document.createElement("li");
        entry.innerText = `${name} - Score: ${leaderboardScores[name]}`;
        leaderboard.appendChild(entry);
    }
}

// ✅ Function to Eliminate Players Randomly (Ensures Some Players Survive)
function eliminatePlayers() {
    if (!isGreenLight && players.length > 0) {
        let numToEliminate = Math.floor(Math.random() * Math.max(1, players.length / 2)); // 🔹 Random number of eliminations

        for (let i = 0; i < numToEliminate; i++) {
            let player = players[Math.floor(Math.random() * players.length)];
            if (player) {
                displayDeath(player);
            }
        }
    }
}

// ✅ Updated Function to Display Death Animation and Sounds
function displayDeath(player) {
    if (!player || !player.element) return;

    playSound(gunshotSounds);
    setTimeout(() => playSound(hitSounds), 100);
    setTimeout(() => playSound(deathSounds), 300);

    let deathIndex = 0;
    const deathAnimation = setInterval(() => {
        if (deathIndex < bloodExplosionFrames.length) {
            player.element.src = bloodExplosionFrames[deathIndex]; // Show explosion frames
            deathIndex++;
        } else {
            clearInterval(deathAnimation);

            // ✅ Instantly replace with dead body
            const deadBodyElement = document.createElement("img");
            deadBodyElement.src = deadBodySprites[Math.floor(Math.random() * deadBodySprites.length)];
            deadBodyElement.className = "dead-body";
            deadBodyElement.style.position = "absolute";
            deadBodyElement.style.left = player.element.style.left;
            deadBodyElement.style.top = player.element.style.top;
            deadBodyElement.style.width = "40px";
            deadBodyElement.style.height = "40px";

            document.getElementById("game-container").appendChild(deadBodyElement);
            deadBodies.push(deadBodyElement);
        }
    }, 100);

    // ✅ Display death message immediately
    displayDeathMessage(player);

    setTimeout(() => {
        if (player.element) player.element.remove();
        if (player.nameTag) player.nameTag.remove();
        players = players.filter(p => p !== player);
    }, 2000);
}

// ✅ Function to Start Round Countdown
function startRoundCountdown() {
    countdownTimerElement = document.createElement("div");
    countdownTimerElement.style.position = "absolute";
    countdownTimerElement.style.top = "10px";
    countdownTimerElement.style.left = "50%";
    countdownTimerElement.style.transform = "translateX(-50%)";
    countdownTimerElement.style.color = "white";
    countdownTimerElement.style.fontSize = "30px";
    countdownTimerElement.style.fontWeight = "bold";
    document.getElementById("game-container").appendChild(countdownTimerElement);

    let timeLeft = 20;
    buzzerSound.play();
    countdownTimer = setInterval(() => {
        if (timeLeft <= 10) {
            countdownSound.play();
        }
        if (timeLeft === 0) {
            clearInterval(countdownTimer);
            countdownEndSound.play();
            eliminatePlayers();
            resetGame();
        }
        timeLeft--;
    }, 1000);
}

// ✅ Function to Display "Player X is Dead" Message
let currentDeathMessage = null;

function displayDeathMessage(player) {
    if (currentDeathMessage) {
        currentDeathMessage.remove();
    }

    currentDeathMessage = document.createElement("div");
    currentDeathMessage.innerText = `${player.nameTag.innerText} is Dead`;
    currentDeathMessage.style.position = "absolute";
    currentDeathMessage.style.top = "50%";
    currentDeathMessage.style.left = "50%";
    currentDeathMessage.style.transform = "translate(-50%, -50%)";
    currentDeathMessage.style.color = "red";
    currentDeathMessage.style.fontSize = "30px";
    currentDeathMessage.style.fontWeight = "bold";
    currentDeathMessage.style.zIndex = "1000"; // 🔹 Ensure it stays on top

    document.getElementById("game-container").appendChild(currentDeathMessage);
}

// ✅ Toggle Green Light / Red Light
function toggleGreenLight() {
    if (currentDeathMessage) {
        currentDeathMessage.remove();
        currentDeathMessage = null;
    }

    if (isDollShooting) return;

    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");

    if (isGreenLight) {
        playSound([dollReloadSound.src]);
        dollTalkSound.playbackRate = (Math.random() * (1.5 - 0.5) + 0.5);
        dollTalkSound.play();
    } else {
        dollTalkSound.pause();
    }

    if (!isGreenLight) {
        isDollShooting = true;
        let redLightDuration = Math.random() * (12000 - 1000) + 1000;
        let shootInterval = setInterval(() => {
            if (!isGreenLight) {
                eliminatePlayers();
            } else {
                clearInterval(shootInterval);
            }
        }, 1000);

        setTimeout(() => {
            isDollShooting = false;
            isGreenLight = true;
            console.log("🟢 Green Light Resumes!");
        }, redLightDuration);
    }
}

setInterval(toggleGreenLight, Math.random() * (6000 - 3000) + 3000);;

// ✅ Function to Reset Game
function resetGame() {
    players = [];
    deadBodies.forEach(body => body.remove());
    deadBodies = [];
    firstWinnerTime = null;
}

// ✅ Function to Add Players (Fixed)
function addPlayer(name) {
    if (!characterSprites || characterSprites.length === 0) return;

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

    document.getElementById('game-container').appendChild(playerElement);
    document.getElementById('game-container').appendChild(nameTag);

    players.push({
        x: spawnX,
        y: canvas.height - 60,
        spriteIndex: index,
        name: name,
        number: randomNumber,
        element: playerElement,
        nameTag: nameTag
    });
}

// ✅ Ensure pressing '1' still spawns players
window.addEventListener('keydown', event => {
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

// ✅ Start Game
dollMusic.loop = true;
dollMusic.play();
requestAnimationFrame(gameLoop);
