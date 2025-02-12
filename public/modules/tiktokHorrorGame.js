// tiktokHorrorGame.js

const gameContainer = document.getElementById('game-container');
const overlay = document.createElement('img');
overlay.src = '/images/MissingPerson/TikTok_Overlay_0.gif';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '50%';
overlay.style.transform = 'translateX(-50%)';
overlay.style.width = '50%';
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

// Function to Fetch a Random Face from ThisPersonDoesNotExist
async function fetchRandomFace() {
    try {
        const response = await fetch('https://api.allorigins.win/raw?url=https://thispersondoesnotexist.com/image');
        if (!response.ok) throw new Error('Failed to fetch image');
        return response.url;
    } catch (error) {
        console.error('Error fetching face image:', error);
        return '/images/MissingPerson/default_face.png'; // Fallback image
    }
}


// Function to Spawn a Dead Body and Fake Profile at the Bottom Center
async function spawnDeadBody() {
    const bodyImage = document.createElement('img');
    bodyImage.src = deadBodyImages[Math.floor(Math.random() * deadBodyImages.length)];
    bodyImage.style.position = 'absolute';
    bodyImage.style.left = '50%';
    bodyImage.style.bottom = '10px';
    bodyImage.style.transform = 'translateX(-50%)';
    bodyImage.style.width = '200px';
    bodyImage.style.height = 'auto';
    bodyImage.style.zIndex = '999';
    gameContainer.appendChild(bodyImage);

    // Fetch the actual image instead of embedding the site
    const faceImageSrc = await fetchRandomFace();
    const faceImage = document.createElement('img');
    faceImage.src = faceImageSrc;
    faceImage.style.position = 'absolute';
    faceImage.style.left = '50%';
    faceImage.style.bottom = '220px';
    faceImage.style.transform = 'translateX(-50%)';
    faceImage.style.width = '200px';
    faceImage.style.height = 'auto';
    faceImage.style.border = '2px solid white';
    faceImage.style.zIndex = '1001';
    gameContainer.appendChild(faceImage);

    setTimeout(() => {
        gameContainer.removeChild(bodyImage);
        gameContainer.removeChild(faceImage);
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

    // Fly to a street-level location on land
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 100), // Zoom down to street level
        orientation: {
            heading: Cesium.Math.toRadians(Math.random() * 360), // Random rotation
            pitch: Cesium.Math.toRadians(-90), // Directly looking downward
            roll: 0.0
        },
        duration: 5 // Takes 5 seconds to zoom in
    });

    setTimeout(() => {
        // Spawn dead body and face at the bottom center
        spawnDeadBody();

        // After 5 seconds, zoom back out to the global view
        setTimeout(() => {
            viewer.camera.flyHome(3);
        }, 5000);
    }, 6000);
}

// Function to Handle TikTok Gift
function handleTikTokGift(event) {
    const { username, amount } = event;
    announceGift(username, amount);
    zoomToRandomLocation(); // Move to a new random land-based Earth location
}

// Simulate TikFinity integration (replace with actual TikFinity event listener)
window.addEventListener('keydown', (e) => {
    console.log('Key Pressed:', e.key); // Debugging output
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

