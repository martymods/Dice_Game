// tiktokHorrorGame.js

const gameContainer = document.getElementById('game-container');
const overlay = document.createElement('img');
overlay.src = '/images/MissingPerson/TikTok_Overlay_0.gif';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '50%';
overlay.style.transform = 'translateX(-50%)';
overlay.style.width = '33%';
overlay.style.zIndex = '1000';
document.body.appendChild(overlay);

// Initialize Cesium Google Earth Viewer
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDA4ODE2OS0zNDIwLTQ4YWMtOTM5OC0xZWViNzAwMWRlMzAiLCJpZCI6Mjc1MjkxLCJpYXQiOjE3MzkzMzAwMDZ9.DEwXlpfOsVmRxid3ujkTcvhX8MJHCcdX4Zr6AWo1G7I";
const viewer = new Cesium.Viewer('game-container', {
    terrainProvider: Cesium.createWorldTerrain()
});

// Start Zoomed Out (Global View)
viewer.camera.flyHome(0);

// Mission GIF Container
const missionContainer = document.createElement('div');
missionContainer.id = 'mission-container';
const missionImage = document.createElement('img');
missionImage.id = 'mission-image';
missionImage.src = '/images/MissingPerson/Mission_Select_0.gif';
missionContainer.appendChild(missionImage);
document.body.appendChild(missionContainer);

// Stats Container
const statsContainer = document.createElement('div');
statsContainer.id = 'stats-container';
statsContainer.innerHTML = "<p>Murders: <span id='murder-count'>0</span></p><p>Shootings: <span id='shooting-count'>0</span></p>";
document.body.appendChild(statsContainer);

// Leaderboard Container
const leaderboardContainer = document.createElement('div');
leaderboardContainer.id = 'leaderboard-container';
leaderboardContainer.innerHTML = "<h3>Top Players</h3><ul id='leaderboard'></ul>";
document.body.appendChild(leaderboardContainer);

let players = {};
let murderCount = 0;
let shootingCount = 0;

function updateStats() {
    document.getElementById('murder-count').innerText = murderCount;
    document.getElementById('shooting-count').innerText = shootingCount;
}

function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    const sortedPlayers = Object.entries(players).sort((a, b) => b[1] - a[1]).slice(0, 3);
    sortedPlayers.forEach(([player, score]) => {
        const li = document.createElement('li');
        li.innerText = `${player}: ${score} pts`;
        leaderboard.appendChild(li);
    });
}

function registerPlayer(username) {
    if (!players[username]) {
        players[username] = 0;
    }
}

function attemptMurder(attacker, victim) {
    if (players[victim]) {
        const pointsStolen = Math.floor(players[victim] * 0.2);
        players[attacker] += pointsStolen;
        players[victim] -= pointsStolen;
    }
    updateLeaderboard();
}


// Function to Change Mission GIF
function updateMissionImage(newSrc, duration = null, callback = null) {
    missionImage.src = newSrc;
    if (duration) {
        setTimeout(() => {
            if (callback) {
                callback();
            } else {
                missionImage.src = '/images/MissingPerson/Mission_Select_0.gif';
            }
        }, duration);
    }
}

// Ensure bgMusicStarted is defined
let bgMusicStarted = false;

// Expanded List of Residential Land Coordinates to Avoid Ocean Zoom
const landCoordinates = [
    { lat: 40.7128, lng: -74.0060 }, // New York
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 51.5074, lng: -0.1278 }, // London
    { lat: 35.6895, lng: 139.6917 }, // Tokyo
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: 48.8566, lng: 2.3522 }, // Paris
    { lat: 37.7749, lng: -122.4194 }, // San Francisco
    { lat: 41.9028, lng: 12.4964 }, // Rome
    { lat: 52.5200, lng: 13.4050 }, // Berlin
    { lat: 55.7558, lng: 37.6173 }, // Moscow
    { lat: 39.9042, lng: 116.4074 }, // Beijing
    { lat: 31.2304, lng: 121.4737 }, // Shanghai
    { lat: 19.4326, lng: -99.1332 }, // Mexico City
    { lat: -23.5505, lng: -46.6333 }, // São Paulo
    { lat: 1.3521, lng: 103.8198 }, // Singapore
    { lat: 45.5017, lng: -73.5673 }, // Montreal
    { lat: 51.0447, lng: -114.0719 }, // Calgary
    { lat: 53.3498, lng: -6.2603 }, // Dublin
    { lat: -36.8485, lng: 174.7633 }, // Auckland
    { lat: -37.8136, lng: 144.9631 }, // Melbourne
    { lat: 35.2271, lng: -80.8431 }, // Charlotte
    { lat: 29.7604, lng: -95.3698 }, // Houston
    { lat: 47.6062, lng: -122.3321 }, // Seattle
    { lat: 25.7617, lng: -80.1918 }, // Miami
    { lat: 32.7767, lng: -96.7970 }, // Dallas
    { lat: 33.4484, lng: -112.0740 }, // Phoenix
    { lat: 39.7392, lng: -104.9903 }, // Denver
    { lat: 44.9778, lng: -93.2650 }, // Minneapolis
    { lat: 42.3601, lng: -71.0589 }, // Boston
    { lat: 38.9072, lng: -77.0369 } // Washington DC
];

// List of Sounds
const horrorMusic = ['/sounds/TikTokHorrorMusic.mp3', '/sounds/TikTokHorrorMusic1.mp3'];
const caveAmbience = '/sounds/Cave_Loop_0.mp3';
const beepSound = '/sounds/Beep_0.mp3';
const crowdSounds = ['/sounds/Crowd_0.mp3', '/sounds/Crowd_1.mp3', '/sounds/Crowd_2.mp3', '/sounds/Crowd_3.mp3', '/sounds/Crowd_4.mp3', '/sounds/Crowd_5.mp3'];
const gunSounds = ['/sounds/Gun_0.mp3', '/sounds/Gun_1.mp3'];
const tireSounds = ['/sounds/Car_Tires_0.mp3', '/sounds/Car_Tires_1.mp3', '/sounds/Car_Tires_2.mp3'];
const copSounds = ['/sounds/Cops_0.mp3', '/sounds/Cops_1.mp3'];

// Function to Play Audio
function playSound(src, delay = 0) {
    setTimeout(() => {
        const audio = new Audio(src);
        audio.play().catch(err => console.error('Audio Play Error:', err));
    }, delay);
}

// Function to Loop Horror Music
function loopHorrorMusic() {
    let index = 0;
    function playNextSong() {
        const audio = new Audio(horrorMusic[index]);
        audio.play().catch(err => console.error('Audio Play Error:', err));
        audio.onended = () => {
            setTimeout(() => {
                index = (index + 1) % horrorMusic.length;
                playNextSong();
            }, 10000); // 10-second pause before switching
        };
    }
    playNextSong();
}

// Function to Loop Cave Ambience
function loopCaveAmbience() {
    const caveAudio = new Audio(caveAmbience);
    caveAudio.loop = true;
    caveAudio.play().catch(err => console.error('Audio Play Error:', err));
}

// List of Dead Body Images
const deadBodyImages = Array.from({ length: 18 }, (_, i) => `/images/MissingPerson/Dead_Body_ (${i + 1}).png`);

// Function to Spawn a Dead Body and Fake Profile
async function spawnDeadBody() {
    const bodyImage = document.createElement('img');
    bodyImage.src = deadBodyImages[Math.floor(Math.random() * deadBodyImages.length)];
    bodyImage.classList.add('death-image'); // Assign a CSS class for styling
    gameContainer.appendChild(bodyImage);
    
    // Play Gunshot
    playSound(gunSounds[Math.floor(Math.random() * gunSounds.length)]);
    
    // 50% chance to play tire sounds 1 second after
    if (Math.random() < 0.5) {
        playSound(tireSounds[Math.floor(Math.random() * tireSounds.length)], 1000);
    }
    
    // 50% chance to play cop sounds 2 seconds after
    if (Math.random() < 0.5) {
        playSound(copSounds[Math.floor(Math.random() * copSounds.length)], 2000);
    }
    
    // Use an iframe instead of fetching the image directly
    const fakeProfile = document.createElement('iframe');
    fakeProfile.src = 'https://thispersondoesnotexist.com';
    fakeProfile.classList.add('fake-profile-iframe');
    gameContainer.appendChild(fakeProfile);
}

// Function to Announce a Gift via Text-to-Speech
function announceGift(user, amount) {
    const audio = new SpeechSynthesisUtterance(`${user} has sent ${amount} coins`);
    speechSynthesis.speak(audio);
}

// Function to Zoom to Random Land Location and Enter Street View
function zoomToRandomLocation() {
    const { lat, lng } = landCoordinates[Math.floor(Math.random() * landCoordinates.length)];
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 150), // Adjusted height to prevent excessive zoom-in
        orientation: {
            heading: Cesium.Math.toRadians(Math.random() * 360),
            pitch: Cesium.Math.toRadians(-45), // Adjusted to prevent full downward pitch
            roll: 0.0
        },
        duration: 5
    });

    setTimeout(() => {
        spawnDeadBody();
        setTimeout(() => {
            viewer.camera.flyHome(3);
        }, 5000);
    }, 6000);
}

// Function to Handle TikTok Gift
function handleTikTokGift(event) {
    const { username, amount } = event;
    announceGift(username, amount);
    playSound(beepSound);
    updateMissionImage('/images/MissingPerson/Paid.gif', 1000, () => {
        updateMissionImage('/images/MissingPerson/Searching.gif');
    });
    setTimeout(() => {
        const randomTarget = `/images/MissingPerson/Target_Located_${Math.floor(Math.random() * 7) + 1}.gif`;
        playSound(crowdSounds[Math.floor(Math.random() * crowdSounds.length)]);
        updateMissionImage(randomTarget, 4000, () => {
            updateMissionImage('/images/MissingPerson/BreakingNew_0.gif', 4000, () => {
                updateMissionImage('/images/MissingPerson/Mission_Select_0.gif');
            });
        });
    }, 3000);
    zoomToRandomLocation();
}

// Function to Handle Cops Audio
function handleCopsAudio() {
    updateMissionImage('/images/MissingPerson/Homicide_0.gif', 4000, () => {
        updateMissionImage('/images/MissingPerson/Mission_Select_0.gif');
    });
}


function flashScreen() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0.8';
    flash.style.zIndex = '2000';
    document.body.appendChild(flash);
    setTimeout(() => {
        document.body.removeChild(flash);
    }, 50); // Flash duration in milliseconds
}

window.addEventListener('keydown', (e) => {
    console.log('Key Pressed:', e.key);
    if (e.key === 'G' || e.key === 'g') {
        const tiktokEvent = { username: 'RandomTikTokUser', amount: 10 }; // Replace with actual event data
        const tiktokUsername = tiktokEvent.username || 'Unknown_Contractor';
        registerPlayer(tiktokUsername);
        handleTikTokGift({ username: tiktokUsername, amount: 10 });
        murderCount++;
        players[tiktokUsername] += 10;
        updateStats();
        updateLeaderboard();
    }
    if (e.key === 'B' || e.key === 'b') {
        playSound(gunSounds[Math.floor(Math.random() * gunSounds.length)]);
        shootingCount++;
        updateStats();
        flashScreen();
    }
});

// Play background sounds only after user interacts with page
document.addEventListener('click', () => {
    if (!bgMusicStarted) {
        loopHorrorMusic();
        loopCaveAmbience();
        bgMusicStarted = true;
    }
}, { once: true });
