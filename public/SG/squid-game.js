
/* squid-game.js */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dollMusic = new Audio("/SG/SG_Background_Ambience_0.mp3");
const buzzerSound = new Audio("/SG/Buzzer.mp3");
const countdownSound = new Audio("/SG/CountDown.mp3");
const countdownEndSound = new Audio("/SG/CountDown_END.mp3");
const soundAl = new Audio("/SG/SoundAl.mp3");

canvas.width = 800;
canvas.height = 600;

let players = [];
let deadBodies = [];
let isGreenLight = false;
let isDollShooting = false;
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

// ✅ Function to Draw Background (Fixed)
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dollImage, canvas.width / 2 - 50, 20, 100, 100);

    // ✅ Draw Winner Line
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

// ✅ Function to Move Players Towards the Red Line
function updatePlayers() {
    players.forEach(player => {
        if (!player || !player.element || !player.nameTag) return;

        if (isGreenLight) {
            player.y -= 1.5; // Players move faster towards the red line
            player.element.src = characterSprites[player.spriteIndex].walking;
        } else {
            player.element.src = characterSprites[player.spriteIndex].idle;
        }

        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`;

        // ✅ Check if player crossed the winner line
        if (player.y <= winnerLineY) {
            addToLeaderboard(player.name);
            player.element.remove();
            player.nameTag.remove();
            players = players.filter(p => p !== player);
        }
    });
}

// ✅ Function to Add Players to Leaderboard
function addToLeaderboard(player) {
    const leaderboard = document.getElementById("leaderboard-list");
    const entry = document.createElement("li");
    entry.innerText = `${player.nameTag.innerText} - Winner!`; // Use nameTag text
    leaderboard.appendChild(entry);
}

// ✅ Function to Eliminate Players One by One
function eliminatePlayers() {
    if (!isGreenLight && players.length > 0 && !isDollShooting) {
        isDollShooting = true;
        let targets = [...players];
        let delay = 0;

        targets.forEach(player => {
            setTimeout(() => {
                displayDeath(player);
            }, delay);
            delay += 1000;
        });

        setTimeout(() => {
            isDollShooting = false;
        }, delay + 1000);
    }
}

// ✅ Updated Function to Display Death Animation and Sounds
function displayDeath(player) {
    if (!player || !player.element) return;

    playSound(gunshotSounds);
    setTimeout(() => playSound(hitSounds), 200);
    setTimeout(() => playSound(deathSounds), 300);

    // ✅ Play Blood Explosion Sequence before showing the dead body
    let deathIndex = 0;
    const deathAnimation = setInterval(() => {
        if (deathIndex < bloodExplosionFrames.length) {
            player.element.src = bloodExplosionFrames[deathIndex]; // Show explosion frames
            deathIndex++;
        } else {
            clearInterval(deathAnimation);

            // ✅ Create a new dead body element
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
    }, 200);

    setTimeout(() => {
        if (player.element) player.element.remove();
        if (player.nameTag) player.nameTag.remove();
        players = players.filter(p => p !== player);
    }, 2000);
}


// ✅ Function to Display "Player X is Dead"
let currentDeathMessage = null; // Track current death message

function displayDeathMessage(player) {
    if (currentDeathMessage) {
        currentDeathMessage.remove(); // Remove previous message
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

    document.getElementById("game-container").appendChild(currentDeathMessage);
}


// ✅ Toggle Green Light / Red Light
function toggleGreenLight() {
    // ✅ Remove previous death message when green light resumes
    if (currentDeathMessage) {
        currentDeathMessage.remove();
        currentDeathMessage = null;
    }

    if (isDollShooting) return;


    isGreenLight = !isGreenLight;
    console.log(isGreenLight ? "🟢 Green Light! Players Move." : "🔴 Red Light! Players Stop.");

    if (!isGreenLight) {
        setTimeout(eliminatePlayers, 500);
    }
}

setInterval(toggleGreenLight, Math.random() * (6000 - 3000) + 3000);

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
