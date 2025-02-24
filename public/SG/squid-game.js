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
// ✅ GET ELEMENTS
const comboContainer = document.getElementById("combo-container");
const comboText = document.getElementById("combo-text");
const comboBar = document.getElementById("combo-bar");

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
let roundActive = false; // Track if round is ongoing
let dollTalkPlaying = false; // Track if Doll Talk Sound is playing
// ✅ COMBO METER VARIABLES
let comboCount = 0;
let comboActive = false;
let comboBarWidth = 200; // Starts full
let comboInterval;

const dollImage = new Image();
dollImage.src = "/SG/Doll_Attack.gif";
let bgImage = new Image();
bgImage.src = "/SG/game-background.jpg";

/* ✅ Optimize Performance by Preloading Assets & Ensuring Smooth Execution */
let preloadedImages = {}; // ✅ Store images globally
let assetsLoaded = 0;
let totalAssets = 0;
let assetsReady = false;

// ✅ Function to preload assets with a callback
function preloadAssets(callback) {
    let soundPaths = [
        "/SG/SG_Background_Ambience_0.mp3",
        "/SG/Buzzer.mp3",
        "/SG/CountDown.mp3",
        "/SG/CountDown_END.mp3",
        "/SG/SoundAl.mp3",
        "/SG/Doll_Reload.mp3",
        "/SG/Doll_Talk.mp3",
        "/SG/Doll_Shooting_0.mp3",
        "/SG/Doll_Shooting_1.mp3",
        "/SG/Doll_Shooting_2.mp3",
        "/SG/Doll_Shooting_3.mp3",
        "/SG/C_Hit_0.mp3",
        "/SG/C_Hit_1.mp3",
        "/SG/C_Hit_2.mp3",
        "/SG/C_Death_0.mp3",
        "/SG/C_Death_1.mp3",
        "/SG/C_Death_2.mp3",
        "/SG/C_Death_3.mp3",
        "/SG/C_Death_4.mp3"
    ];

    let imagePaths = [
        "/SG/Blood_Explosion_0.png",
        "/SG/Blood_Explosion_1.png",
        "/SG/Blood_Explosion_2.png",
        "/SG/Blood_Explosion_3.png",
        "/SG/Cyborg_Hud_0.gif",
        "/SG/Cyborg_Hud_1.gif"
    ];

    let deadBodySprites = [
        "/SG/Dead_Body_0.png", "/SG/Dead_Body_1.png", "/SG/Dead_Body_2.png",
        "/SG/Dead_Body_3.png", "/SG/Dead_Body_4.png", "/SG/Dead_Body_5.png",
        "/SG/Dead_Body_6.png", "/SG/Dead_Body_7.png", "/SG/Dead_Body_8.png",
        "/SG/Dead_Body_9.png"
    ];

    let characterSprites = [
        "/SG/char_0_0.gif", "/SG/char_0_1.gif",
        "/SG/char_1_0.gif", "/SG/char_1_1.gif",
        "/SG/char_2_0.gif", "/SG/char_2_1.gif",
        "/SG/char_3_0.gif", "/SG/char_3_1.gif",
        "/SG/char_4_0.gif", "/SG/char_4_1.gif",
        "/SG/char_5_0.gif", "/SG/char_5_1.gif",
        "/SG/char_6_0.gif", "/SG/char_6_1.gif",
        "/SG/char_7_0.gif", "/SG/char_7_1.gif"
    ];

    let comboSounds = [
        "/SG/Combo_0.mp3", "/SG/Combo_1.mp3", "/SG/Combo_2.mp3",
        "/SG/Combo_3.mp3", "/SG/Combo_4.mp3", "/SG/Combo_5.mp3",
        "/SG/Combo_6.mp3", "/SG/Combo_7.mp3", "/SG/Combo_8.mp3",
        "/SG/Combo_9.mp3"
    ];

    let comboEndSound = "/SG/Combo_over.mp3";

    let allAssets = [...soundPaths, ...imagePaths, ...characterSprites, ...deadBodySprites, ...comboSounds, comboEndSound];
    totalAssets = allAssets.length;

    allAssets.forEach(asset => {
        if (asset.endsWith(".mp3")) {
            const audio = new Audio(asset);
            audio.load();
            assetsLoaded++;
        } else {
            const img = new Image();
            img.onload = () => {
                assetsLoaded++;
                if (assetsLoaded === totalAssets) {
                    assetsReady = true;
                    console.log("✅ All assets preloaded successfully.");
                    if (callback) callback();
                }
            };
            img.src = asset;
            preloadedImages[asset] = img; // ✅ Store in preloadedImages correctly
        }
    });
}

// ✅ Call preload and start the game when assets are ready
preloadAssets(() => {
    console.log("✅ Game assets are fully loaded, starting game...");
    startGame();
});

// ✅ Function to start game only after assets are ready
function startGame() {
    if (assetsReady) {
        dollMusic.loop = true;
        dollMusic.play();
        requestAnimationFrame(gameLoop);
    } else {
        setTimeout(startGame, 500); // Wait until assets are fully loaded
    }
}

// ✅ Call the function once
preloadAssets();

function preloadImages(imagePaths) {
    imagePaths.forEach(path => {
        const img = new Image();
        img.src = path;
        preloadedImages[path] = img;
    });
}

// ✅ Function that TikFinity Calls When a Player Joins
function onTikTokGiftReceived(username) {
    console.log(`🎁 TikTok User Joined: ${username}`);

    latestTikTokUser = username; // ✅ Store the latest TikTok username
}

// ✅ Modify UpdatePlayers to Ensure Players Are Marked as Safe
function updatePlayers() {
    players.forEach(player => {
        if (!player || !player.element || !player.nameTag) return;

        if (isGreenLight && !isDollShooting) {
            player.y -= 0.4;
            
            if (player.element.src !== preloadedImages[characterSprites[player.spriteIndex].walking].src) {
                player.element.src = preloadedImages[characterSprites[player.spriteIndex].walking].src;
            }

            playFootstepSound(player);
        } else {
            if (player.element.src !== preloadedImages[characterSprites[player.spriteIndex].idle].src) {
                player.element.src = preloadedImages[characterSprites[player.spriteIndex].idle].src;
            }
        }

        // ✅ Properly Update Position
        player.element.style.top = `${player.y}px`;
        player.nameTag.style.top = `${player.y - 20}px`;

        // ✅ Handle Winner Line Detection and Ensure Players Are "Safe"
        if (player.y <= winnerLineY && !player.hasCrossedLine) {
            player.hasCrossedLine = true; // ✅ Mark as Safe
            console.log(`🏁 SAFE: ${player.nameTag.innerText} has crossed the line!`); // 🔴 Debugging log

            if (!firstWinnerTime) {
                firstWinnerTime = Date.now();
                startRoundCountdown();
            }

            leaderboardScores[player.nameTag.innerText] = true; // ✅ Add to leaderboard
            addToLeaderboard(player);
        }
    });
}

// ✅ Winner Line Position
const winnerLineY = 100;

// ✅ Updated Function: Play Footstep Sound with 17 Variants
const footstepSounds = [
    "/SG/S_Cement_01_Mono.WAV", "/SG/S_Cement_02_Mono.WAV", "/SG/S_Cement_03_Mono.WAV",
    "/SG/S_Cement_04_Mono.WAV", "/SG/S_Cement_05_Mono.WAV", "/SG/S_Cement_06_Mono.WAV",
    "/SG/S_Cement_07_Mono.WAV", "/SG/S_Cement_08_Mono.WAV", "/SG/S_Cement_09_Mono.WAV",
    "/SG/S_Cement_10_Mono.WAV", "/SG/S_Cement_11_Mono.WAV", "/SG/S_Cement_12_Mono.WAV",
    "/SG/S_Cement_13_Mono.WAV", "/SG/S_Cement_14_Mono.WAV", "/SG/S_Cement_15_Mono.WAV",
    "/SG/S_Cement_16_Mono.WAV", "/SG/S_Cement_17_Mono.WAV"
];

let lastFootstepTime = 0;

function playFootstepSound() {
    let now = Date.now();
    if (now - lastFootstepTime < 300) return; // Prevents excessive footstep sounds

    lastFootstepTime = now;
    let soundPath = footstepSounds[Math.floor(Math.random() * footstepSounds.length)];
    playSound(soundPath);
}
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

// ✅ Store audio elements to reuse them
let audioElements = {};

function playSound(soundArray) {
    if (!Array.isArray(soundArray) || soundArray.length === 0) return;

    let soundPath = soundArray[Math.floor(Math.random() * soundArray.length)];

    if (!audioElements[soundPath]) {
        audioElements[soundPath] = new Audio(soundPath);
        audioElements[soundPath].volume = 0.5;
    }

    let sound = audioElements[soundPath];

    // ✅ Only play if not already playing
    if (!sound.paused) return;

    sound.currentTime = 0;
    sound.play().catch(error => {
        console.warn("🔇 Audio play prevented:", error);
    });
}

// ✅ Function to Draw Background
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // ❌ Removed dollImage from being drawn on the canvas

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

// ✅ Ensure Killing is Spaced Out (1 Second Per Kill) and Skip Winners
function eliminatePlayers() {
    if (!isGreenLight && players.length > 0) {
        let alivePlayers = players.filter(p => !p.isDead); 

        console.log(`⚠️ CHECKING FOR ELIMINATIONS, ALIVE PLAYERS: ${alivePlayers.length}`);

        alivePlayers = alivePlayers.filter(p => !p.hasCrossedLine); // ✅ Exclude players who crossed

        console.log(`🏁 SAFE PLAYERS EXCLUDED, REMAINING TARGETS: ${alivePlayers.length}`);

        function killNext() {
            if (alivePlayers.length === 0 || isGreenLight) return;

            let randomIndex = Math.floor(Math.random() * alivePlayers.length);
            let playerToKill = alivePlayers.splice(randomIndex, 1)[0];

            if (playerToKill && !playerToKill.isDead) {
                console.log(`💀 ATTEMPTING TO KILL: ${playerToKill.nameTag.innerText}`);

                let survivalChance = Math.random();
                if (survivalChance < 0.5) {
                    displayDeath(playerToKill);
                }
            }

            if (alivePlayers.length > 0) {
                setTimeout(killNext, 1000);
            }
        }

        killNext();
    }
}

// ✅ Updated Function: Display Death with Blood GIF + Splatter
function displayDeath(player) {
    if (!player || player.isDead) return; // ✅ Prevent multiple deaths
    player.isDead = true; // ✅ Mark player as dead

    // ✅ Play sound effects
    playSound(gunshotSounds[Math.floor(Math.random() * gunshotSounds.length)]);
    setTimeout(() => playSound(hitSounds[Math.floor(Math.random() * hitSounds.length)]), 100);
    setTimeout(() => playSound(deathSounds[Math.floor(Math.random() * deathSounds.length)]), 300);

    screenShake(); // ✅ Add screen shake effect

    // ✅ Change player's name to red upon death
    player.nameTag.style.color = "red";
    player.nameTag.style.fontWeight = "bold";
    player.nameTag.style.textShadow = "2px 2px 5px black";

    // ✅ Ensure ONLY ONE Dead Body Spawns
    if (!player.hasDeadBody) {
        player.hasDeadBody = true; // ✅ Prevent duplicate bodies

        // 🎨 Create Dead Body Image
        const deadBodyElement = new Image();
        let deadBodySprite = deadBodySprites[Math.floor(Math.random() * deadBodySprites.length)];
        deadBodyElement.src = preloadedImages[deadBodySprite]?.src || deadBodySprite;
        deadBodyElement.className = "dead-body";
        deadBodyElement.style.position = "absolute";
        deadBodyElement.style.left = player.element.style.left;
        deadBodyElement.style.top = player.element.style.top;
        deadBodyElement.style.width = player.element.style.width; // ✅ Scale to match player
        deadBodyElement.style.height = player.element.style.height;
        document.getElementById("game-container").appendChild(deadBodyElement);
        deadBodies.push(deadBodyElement);

        // 🎨 Add Blood Splatter under Dead Body
        addBloodSplatter(player);

        // 🎨 Create Blood Explosion GIF on top of Dead Body
        const bloodGif = new Image();
        bloodGif.src = "/SG/BloodSplatter_Explosion.gif";
        bloodGif.className = "blood-gif";
        bloodGif.style.position = "absolute";
        bloodGif.style.left = player.element.style.left;
        bloodGif.style.top = player.element.style.top;
        bloodGif.style.width = player.element.style.width; // ✅ Scale to match player
        bloodGif.style.height = player.element.style.height;
        document.getElementById("game-container").appendChild(bloodGif);

        // ⏳ Remove GIF after animation completes (~1.2 seconds)
        setTimeout(() => {
            bloodGif.remove();
        }, 1200);
    }

    // ✅ Instantly remove the player from the game
    if (player.element) player.element.remove();
    players = players.filter(p => p !== player);
}

// ✅ Function to Add Random Blood Splatter Under Dead Body
function addBloodSplatter(player) {
    let splatterCount = Math.floor(Math.random() * 3) + 1; // Randomly place 1-3 splatters

    for (let i = 0; i < splatterCount; i++) {
        let splatterElement = new Image();
        let splatterSprite = `/SG/Blood_Splatter_0${Math.floor(Math.random() * 9)}.png`; // Pick a random splatter

        splatterElement.src = splatterSprite;
        splatterElement.className = "blood-splatter";
        splatterElement.style.position = "absolute";

        // ✅ Align with Character's Exact Position
        let playerX = parseInt(player.element.style.left);
        let playerY = parseInt(player.element.style.top);

        splatterElement.style.left = `${playerX + (Math.random() * 10 - 5)}px`; // Small variation in position
        splatterElement.style.top = `${playerY + 20}px`; // Move slightly downward to match ground level
        splatterElement.style.width = `${player.element.clientWidth * 1.2}px`; // Scale to match character size
        splatterElement.style.height = splatterElement.style.width; // Maintain aspect ratio
        splatterElement.style.transform = `rotate(${Math.random() * 360}deg)`; // Random rotation
        splatterElement.style.opacity = "1";
        splatterElement.style.zIndex = "0"; // Keep under dead bodies

        document.getElementById("game-container").appendChild(splatterElement);
        deadBodies.push(splatterElement);

        console.log(`🩸 Blood Splatter ${i + 1} created at (${splatterElement.style.left}, ${splatterElement.style.top})`);
    }
}

// ✅ Remove All Players, Dead Bodies, and Blood Splatter at End of Round
function removeAllPlayers() {
    players.forEach(player => {
        if (player.element) player.element.remove();
        if (player.nameTag) player.nameTag.remove();
    });
    players = []; // ✅ Clear players

    deadBodies.forEach(body => body.remove()); // ✅ Remove dead bodies
    deadBodies = []; // ✅ Clear array

    let bloodSplatters = document.querySelectorAll(".blood-splatter");
    bloodSplatters.forEach(splatter => splatter.remove()); // ✅ Remove all blood splatters
}


// ✅ Modify `startRoundCountdown()` to remove players at 0
function startRoundCountdown() {
    if (!countdownTimerElement) {
        countdownTimerElement = document.createElement("div");
        countdownTimerElement.style.position = "absolute";
        countdownTimerElement.style.top = "10px";
        countdownTimerElement.style.left = "50%";
        countdownTimerElement.style.transform = "translateX(-50%)";
        countdownTimerElement.style.color = "white";
        countdownTimerElement.style.fontSize = "30px";
        countdownTimerElement.style.fontWeight = "bold";
        countdownTimerElement.style.zIndex = "1000";
        document.getElementById("game-container").appendChild(countdownTimerElement);
    }

    let timeLeft = 20;
    buzzerSound.play();
    countdownTimer = setInterval(() => {
        countdownTimerElement.innerText = `Time Left: ${timeLeft}`;
        
        if (timeLeft <= 10) countdownSound.play();

        // 🎤 Play countdown voices for last 3 seconds
        if (timeLeft === 3) playSound("/SG/Woman_Voice_UI_Count_Down_3.mp3");
        if (timeLeft === 2) playSound("/SG/Woman_Voice_UI_Count_Down_2.mp3");
        if (timeLeft === 1) playSound("/SG/Woman_Voice_UI_Count_Down_1.mp3");

        if (timeLeft === 0) {
            clearInterval(countdownTimer);
            countdownEndSound.play();
            
            isGreenLight = false; // ✅ Force stop Green Light
            isDollShooting = true; // ✅ Ensure Red Light actions occur
            startRedLight(); // ✅ Immediately start Red Light phase
        
            eliminatePlayers(); // Ensure remaining players are eliminated
            removeAllPlayers(); // Remove all players who didn't die
        
            // ✅ Remove ALL red death messages from the screen
            removeDeathMessages();
        
            if (countdownTimerElement) {
                countdownTimerElement.remove();
                countdownTimerElement = null;
            }
        
            setTimeout(resetGame, 3000);
        }
        
        timeLeft--;
    }, 1000);
}

function removeDeathMessages() {
    let deathMessages = document.querySelectorAll(".death-message, .player-name");
    deathMessages.forEach(msg => msg.remove());
    currentDeathMessage = null;
}

// ✅ Function to Display "Player X is Dead" Message
let currentDeathMessage = null;

// ✅ Ensure player name turns red when they die
function displayDeathMessage(player) {
    if (!player || !player.nameTag) return;

    // ✅ Remove previous message
    if (currentDeathMessage) {
        currentDeathMessage.remove();
    }

    // ✅ Change the player name color
    player.nameTag.style.color = "red";
    player.nameTag.style.fontWeight = "bold";
    player.nameTag.style.textShadow = "2px 2px 5px black";

    // ✅ Create death message
    currentDeathMessage = document.createElement("div");
    currentDeathMessage.innerText = `${player.nameTag.innerText} is Dead`;
    currentDeathMessage.style.position = "absolute";
    currentDeathMessage.style.top = "50%";
    currentDeathMessage.style.left = "50%";
    currentDeathMessage.style.transform = "translate(-50%, -50%)";
    currentDeathMessage.style.color = "red";
    currentDeathMessage.style.fontSize = "30px";
    currentDeathMessage.style.fontWeight = "bold";
    currentDeathMessage.style.textShadow = "2px 2px 4px black";
    currentDeathMessage.style.zIndex = "1000";

    document.getElementById("game-container").appendChild(currentDeathMessage);

    // ✅ Remove message after 3 seconds
    setTimeout(() => {
        if (currentDeathMessage) {
            currentDeathMessage.remove();
            currentDeathMessage = null;
        }
    }, 3000);
}


// ✅ Ensure Doll Attack Image is in the DOM
function addDollAttackImage() {
    let dollImg = document.getElementById("doll-attack");
    if (!dollImg) {
        dollImg = document.createElement("img");
        dollImg.id = "doll-attack";
        dollImg.src = "/SG/Doll_Attack.gif";
        document.body.appendChild(dollImg);
    }
}

// ✅ Toggle Doll Visibility
function toggleDollImage(isRedLight) {
    let dollImg = document.getElementById("doll-attack");

    if (!dollImg) {
        dollImg = document.createElement("img");
        dollImg.id = "doll-attack";
        dollImg.src = "/SG/Doll_Attack.gif"; // Default Doll Image
        dollImg.style.position = "absolute";
        dollImg.style.bottom = "855px";
        dollImg.style.right = "650px";
        dollImg.style.width = "110px";
        dollImg.style.height = "auto";
        dollImg.style.opacity = "1";
        dollImg.style.zIndex = "999";
        dollImg.style.transition = "opacity 0.3s ease, transform 0.5s ease";
        document.body.appendChild(dollImg);
    }

    if (isRedLight) {
        dollImg.style.opacity = "1"; // ✅ Ensure it's visible on Red Light
    } else {
        dollImg.src = "/SG/Doll_Attack.gif"; // ✅ Reset to Default on Green Light
        dollImg.style.opacity = "1"; // ✅ Keep visible
    }
}

// ✅ Ensure Doll Image is Created on Load
addDollAttackImage();

// ✅ Ensure Green & Red Lights Alternate Properly
let greenLightTimeout;
let redLightTimeout;

function startGreenLight() {
    if (isGreenLight) return; // ✅ Prevent multiple green light loops
    isGreenLight = true;

    console.log("🟢 Green Light! Players Move.");

    let dollImg = document.getElementById("doll-attack");
    if (dollImg) {
        dollImg.src = "/SG/Doll_Attack.gif"; // ✅ Reset to Default Doll GIF
    }

    toggleDollImage(false); // ✅ Keep Doll visible with Default Image
    playSound([dollReloadSound.src]);
    dollTalkSound.playbackRate = Math.random() * (1.5 - 0.5) + 0.5;
    dollTalkSound.play();

    setTimeout(() => {
        startRedLight(); // ✅ Transition to Red Light after time
    }, Math.random() * (6000 - 3000) + 3000);
}


function startRedLight() {
    if (!isGreenLight) return;
    isGreenLight = false;
    isDollShooting = true;

    console.log("🔴 Red Light! Players Stop.");
    toggleDollImage(true); // ✅ Ensure Doll is visible for Red Light
    dollTalkSound.pause();

    let redLightDuration = Math.random() * (6000 - 3000) + 3000; // 🔹 3 to 6 seconds

    let remainingTime = redLightDuration / 1000;
    let killInterval = setInterval(() => {
        if (!isGreenLight && players.length > 0 && remainingTime > 0) {
            let randomPlayerIndex = Math.floor(Math.random() * players.length);
            let playerToKill = players[randomPlayerIndex];

            if (playerToKill && !playerToKill.isDead) {
                updateDollAttackImage(playerToKill); // ✅ Change Doll GIF Based on Position
                displayDeath(playerToKill);
            }

            remainingTime--; // Reduce timer
        } else {
            clearInterval(killInterval); // ✅ Stop when time runs out
        }
    }, 1000); // ✅ Kill one player per second

    // 🎤 Play a random voice line between 0 to 3 seconds after Red Light starts
    setTimeout(() => {
        let randomVoiceLine = [
            "/SG/Woman_Voice_UI_00.mp3",
            "/SG/Woman_Voice_UI_01.mp3",
            "/SG/Woman_Voice_UI_02.mp3",
            "/SG/Woman_Voice_UI_03.mp3",
            "/SG/Woman_Voice_UI_04.mp3",
            "/SG/Woman_Voice_UI_05.mp3"
        ];
        playSound(randomVoiceLine[Math.floor(Math.random() * randomVoiceLine.length)]);
    }, Math.random() * 3000);

    setTimeout(() => {
        clearInterval(killInterval);
        isDollShooting = false;
        startGreenLight();
    }, redLightDuration);
}

// ✅ Function to Change Doll's Attack Image Based on Player Position
function updateDollAttackImage(player) {
    let dollImg = document.getElementById("doll-attack");
    if (!dollImg) return; // If no doll image, exit

    let playerX = player.element.getBoundingClientRect().left;
    let canvasCenter = canvas.width / 2;
    let canvasRight = canvas.width - (canvas.width / 3);
    let canvasLeft = canvas.width / 3;

    // ✅ Choose the appropriate Doll GIF based on the player's position
    if (playerX < canvasLeft) {
        dollImg.src = "/SG/Doll_Attack_Left.gif"; // 🔴 Use Left GIF
    } else if (playerX > canvasRight) {
        dollImg.src = "/SG/Doll_Attack_Right.gif"; // 🔴 Use Right GIF
    } else {
        dollImg.src = "/SG/Doll_Attack_Center.gif"; // 🔴 Use Center GIF
    }

    // ✅ Ensure the doll is visible
    dollImg.style.opacity = "1";
}

// ✅ Start the game with the first Green Light
setTimeout(startGreenLight, Math.random() * (6000 - 3000) + 3000);


/* ✅ Cyborg HUD Improvements */
function addCyborgHud() {
    let hud = document.getElementById("cyborg-hud");
    if (!hud) {
        hud = document.createElement("img");
        hud.id = "cyborg-hud";
        hud.src = "/SG/Cyborg_Hud_0.gif"; // Start with default
        document.body.appendChild(hud);
    }
}

// ✅ Run after window fully loads
window.onload = function () {
    addCyborgHud();
    toggleCyborgHud(); // ✅ Start switching images after loading
};

// ✅ Function to Control Cyborg HUD in CSS
function toggleCyborgHud() {
    let hud = document.getElementById("cyborg-hud");
    if (!hud) addCyborgHud();
    hud.src = Math.random() < 0.5 ? "/SG/Cyborg_Hud_0.gif" : "/SG/Cyborg_Hud_1.gif";
    setTimeout(toggleCyborgHud, Math.random() * (7000 - 3000) + 3000);
}

// ✅ Call function to initialize HUD
addCyborgHud();
toggleCyborgHud();

/* ✅ Red Light Death Visual Effect (Screen Shake) */
function screenShake() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.style.animation = "shake 0.3s";
    setTimeout(() => { gameContainer.style.animation = ""; }, 300);
}

// ✅ Ensure Green Light / Red Light properly alternates
setTimeout(startGreenLight, Math.random() * (6000 - 3000) + 3000);

// ✅ Function to Reset Game
function resetGame() {
    players.forEach(player => player.element.remove());
    players = [];
    deadBodies.forEach(body => body.remove());
    deadBodies = [];
    firstWinnerTime = null;
}

// ✅ Function to Add Players Using TikTok Username
function addPlayer(tiktokUsername = null) {
    if (!characterSprites || characterSprites.length === 0) return;

    const index = players.length % characterSprites.length;
    const spawnX = Math.random() * (canvas.width - 50) + 10;

    // ✅ Use TikTok username if available, otherwise use "PlayerX"
    let playerName = tiktokUsername && tiktokUsername.trim() !== "" ? tiktokUsername : `Player${players.length + 1}`;

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
    nameTag.innerText = playerName; // ✅ Set TikTok username
    nameTag.style.left = `${spawnX}px`;
    nameTag.style.top = `${canvas.height - 80}px`;
    nameTag.style.position = 'absolute';

    document.getElementById('game-container').appendChild(playerElement);
    document.getElementById('game-container').appendChild(nameTag);

    players.push({
        x: spawnX,
        y: canvas.height - 60,
        spriteIndex: index,
        name: playerName, // ✅ Save actual TikTok username
        element: playerElement,
        nameTag: nameTag
    });

    console.log(`🎮 New Player Joined: ${playerName}`);
}

// ✅ Global Variable to Store Incoming TikTok Usernames
let latestTikTokUser = null;

// ✅ Listen for the "1" key press to spawn a TikTok user's character
window.addEventListener('keydown', event => {
    if (event.key === '1') {
        addPlayer(latestTikTokUser); // ✅ Use TikTok username instead of "PlayerX"
        latestTikTokUser = null; // ✅ Reset after spawning character
    }
});

// ✅ Main Game Loop
function gameLoop() {
    drawBackground();
    updatePlayers();
    requestAnimationFrame(gameLoop);
}

// ✅ FUNCTION TO START OR INCREASE COMBO
function increaseCombo() {
    if (!comboActive) {
        comboActive = true;
        comboContainer.style.display = "block";
        comboCount = 0;
        comboBarWidth = 200;
        decreaseComboBar();
    }

    comboCount++;
    comboText.innerText = `Combo: ${comboCount}`;
    comboBarWidth = Math.min(comboBarWidth + 10, 200);

    // 🎵 Change sound every 5 combo points
    let soundIndex = Math.floor(comboCount / 5) % comboSounds.length;
    let selectedSound = comboSounds[soundIndex];

    playSound(selectedSound);

    comboContainer.classList.add("flash-effect");
    setTimeout(() => comboContainer.classList.remove("flash-effect"), 200);
}

// ✅ Store Preloaded Sounds and Prevent Duplication
let preloadedAudio = {};

// ✅ Helper Function to Play Sounds Efficiently
function playSound(soundPath) {
    if (!preloadedAudio[soundPath]) {
        preloadedAudio[soundPath] = new Audio(soundPath);
    }
    
    let sound = preloadedAudio[soundPath];

    // ✅ Only play if not already playing
    if (!sound.paused) return;

    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play().catch(error => console.warn("🔇 Audio play prevented:", error));
}

// ✅ FUNCTION TO DECREASE COMBO BAR
function decreaseComboBar() {
    clearInterval(comboInterval);
    
    comboInterval = setInterval(() => {
        let depletionSpeed = Math.max(1, comboCount * 0.5); // Higher combo = faster depletion
        comboBarWidth -= depletionSpeed;
        comboBar.style.width = `${Math.max(0, comboBarWidth)}px`;

        // RESET COMBO IF BAR REACHES ZERO
        if (comboBarWidth <= 0) {
            clearInterval(comboInterval);
            comboActive = false;
            comboContainer.style.display = "none"; // Hide combo meter
            comboCount = 0;
        }
    }, 100);
}

/* ✅ Combo System Enhancements */
const comboSounds = [
    "/SG/Combo_0.mp3", "/SG/Combo_1.mp3", "/SG/Combo_2.mp3", "/SG/Combo_3.mp3", "/SG/Combo_4.mp3", "/SG/Combo_5.mp3", "/SG/Combo_6.mp3", "/SG/Combo_7.mp3", "/SG/Combo_8.mp3", "/SG/Combo_9.mp3"
];
const comboEndSound = "/SG/Combo_over.mp3";

// ✅ New function to play sound with volume control
function playSoundWithVolume(soundPath, volume) {
    let audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play();
}


function decreaseComboBar() {
    clearInterval(comboInterval);
    comboInterval = setInterval(() => {
        let depletionSpeed = Math.max(1, comboCount * 0.5);
        comboBarWidth -= depletionSpeed;
        comboBar.style.width = `${Math.max(0, comboBarWidth)}px`;
        if (comboBarWidth <= 0) {
            clearInterval(comboInterval);
            comboActive = false;
            comboContainer.style.display = "none";
            playSound([comboEndSound]);
            comboCount = 0;
        }
    }, 100);
}

window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "n") {
        increaseCombo();
    }
});

// Play a Random Ambient
function playAmbientDollVoice() {
    let ambientVoiceLines = [
        "/SG/Woman_Voice_ambience_00.mp3",
        "/SG/Woman_Voice_ambience_01.mp3",
        "/SG/Woman_Voice_ambience_02.mp3",
        "/SG/Woman_Voice_ambience_03.mp3",
        "/SG/Woman_Voice_ambience_04.mp3"
    ];
    
    playSound(ambientVoiceLines[Math.floor(Math.random() * ambientVoiceLines.length)]);
    
    // 🔄 Schedule next voice line in 20-45 seconds
    setTimeout(playAmbientDollVoice, Math.random() * (45000 - 20000) + 20000);
}

// ✅ Start ambient voice lines when the game starts
setTimeout(playAmbientDollVoice, Math.random() * (45000 - 20000) + 20000);


// ✅ Start Game
dollMusic.loop = true;
dollMusic.play();
requestAnimationFrame(gameLoop);

document.getElementById("cyborg-hud").classList.add("cy-hud-large"); // Makes HUD Larger
document.getElementById("cyborg-hud").classList.add("cy-hud-transparent"); // Reduces Opacity
document.getElementById("cyborg-hud").classList.add("cy-hud-hidden"); // Hides HUD

