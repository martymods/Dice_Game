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

// List of Dead Body Images
const deadBodyImages = Array.from({ length: 18 }, (_, i) => `/images/MissingPerson/Dead_Body_ (${i + 1}).png`);

// Function to Spawn a Dead Body at Random Location
function spawnDeadBody() {
    const bodyImage = document.createElement('img');
    bodyImage.src = deadBodyImages[Math.floor(Math.random() * deadBodyImages.length)];
    bodyImage.style.position = 'absolute';
    bodyImage.style.left = `${Math.random() * 80 + 10}%`;
    bodyImage.style.top = `${Math.random() * 80 + 10}%`;
    bodyImage.style.width = '150px';
    bodyImage.style.height = 'auto';
    bodyImage.style.zIndex = '999';
    gameContainer.appendChild(bodyImage);

    const fakeProfile = document.createElement('iframe');
    fakeProfile.src = 'https://thispersondoesnotexist.com';
    fakeProfile.style.position = 'absolute';
    fakeProfile.style.left = `${parseFloat(bodyImage.style.left) - 5}%`;
    fakeProfile.style.top = `${parseFloat(bodyImage.style.top) - 5}%`;
    fakeProfile.style.width = '100px';
    fakeProfile.style.height = '100px';
    fakeProfile.style.border = 'none';
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

// Function to Zoom to Random Earth Location and Back
function zoomToRandomLocation() {
    const lat = (Math.random() * 180 - 90).toFixed(6);  // Random latitude
    const lng = (Math.random() * 360 - 180).toFixed(6); // Random longitude

    // Fly to random street-level location
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 2000), // Zooms to 2km height
        orientation: {
            heading: Cesium.Math.toRadians(Math.random() * 360), // Random rotation
            pitch: Cesium.Math.toRadians(-45), // Tilt camera downward
            roll: 0.0
        },
        duration: 5 // Takes 5 seconds to zoom in
    });

    setTimeout(() => {
        // Spawn dead body at new location
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
    zoomToRandomLocation(); // Move to a new random Earth location
}

// Simulate TikFinity integration (replace with actual TikFinity event listener)
window.addEventListener('keydown', (e) => {
    console.log('Key Pressed:', e.key); // Debugging output
    if (e.key === 'G' || e.key === 'g') {
        handleTikTokGift({ username: 'User123', amount: 10 });
    }
});

// Background music loop
const bgMusic = new Audio('/sounds/TikTokHorrorMusic.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play().catch(err => console.error('Audio Play Error:', err));

