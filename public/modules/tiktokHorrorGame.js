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

// List of Dead Body Images
const deadBodyImages = Array.from({ length: 18 }, (_, i) => `/images/MissingPerson/Dead_Body_ (${i + 1}).png`);

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
    fakeProfile.style.transform = 'translateX(-50%)';
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
    zoomToRandomLocation();
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
