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

// Predefined Land Coordinates to Avoid Ocean Zoom
const landCoordinates = [
    { lat: 40.7128, lng: -74.0060 }, // New York
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 51.5074, lng: -0.1278 }, // London
    { lat: 35.6895, lng: 139.6917 }, // Tokyo
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: 48.8566, lng: 2.3522 }, // Paris
    { lat: 37.7749, lng: -122.4194 } // San Francisco
];

// List of Dead Body Images
const deadBodyImages = Array.from({ length: 18 }, (_, i) => `/images/MissingPerson/Dead_Body_ (${i + 1}).png`);

// Function to Announce a Gift via Text-to-Speech
function announceGift(user, amount) {
    const audio = new SpeechSynthesisUtterance(`${user} has sent ${amount} coins`);
    speechSynthesis.speak(audio);
}

// Function to Fetch Gift Giver Location
async function getGiftGiverLocation() {
    const response = await fetch('/get-location'); // Calls your server
    const data = await response.json();
    if (data.lat && data.lng) {
        return { lat: data.lat, lng: data.lng };
    }
    return null; // If location fails
}

// Function to Zoom to Gift Giver's Location
async function zoomToGiftGiverLocation() {
    const location = await getGiftGiverLocation();
    if (location) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(location.lng, location.lat, 100),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0.0 },
            duration: 5
        });
    } else {
        console.log("Could not retrieve gift giver's location.");
    }
}

// Function to Spawn a Dead Body and Fake Profile
async function spawnDeadBody() {
    const bodyImage = document.createElement('img');
    bodyImage.src = deadBodyImages[Math.floor(Math.random() * deadBodyImages.length)];
    bodyImage.classList.add('death-image'); // Assign a CSS class for styling
    gameContainer.appendChild(bodyImage);

    // Use an iframe instead of fetching the image directly
    const fakeProfile = document.createElement('iframe');
    fakeProfile.src = 'https://thispersondoesnotexist.com';
    fakeProfile.style.position = 'absolute';
    fakeProfile.style.left = '50%';
    fakeProfile.style.bottom = '220px';
    fakeProfile.style.transform = 'translateX(-50%) scale(0.6)'; // Zoom out inside iframe
    fakeProfile.style.width = '250px';
    fakeProfile.style.height = '250px';
    fakeProfile.style.border = '2px solid white';
    fakeProfile.style.zIndex = '1001';
    gameContainer.appendChild(fakeProfile);

    setTimeout(() => {
        gameContainer.removeChild(bodyImage);
        gameContainer.removeChild(fakeProfile);
    }, 10000);
}

// Function to Handle TikTok Gift
function handleTikTokGift(event) {
    const { username, amount } = event;
    announceGift(username, amount);
    zoomToGiftGiverLocation();
}

window.addEventListener('keydown', (e) => {
    console.log('Key Pressed:', e.key);
    if (e.key === 'G' || e.key === 'g') {
        handleTikTokGift({ username: 'User123', amount: 10 });
    }
});

// Background music loop (starts only after user interaction)
let bgMusic;
document.addEventListener('click', () => {
    if (!bgMusic) {
        bgMusic = new Audio('/sounds/TikTokHorrorMusic.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.5;
        bgMusic.play().catch(err => console.error('Audio Play Error:', err));
    }
}, { once: true });
