// tiktokHorrorGame.js

const gameContainer = document.getElementById('game-container');
const overlay = document.createElement('img');
overlay.src = '/images/MissingPerson/TikTok_Overlay_0.gif';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '50%';
overlay.style.transform = 'translateX(-50%)';
overlay.style.width = '100%';
overlay.style.zIndex = '1000';
document.body.appendChild(overlay);

const deadBodyImages = Array.from({ length: 18 }, (_, i) => `/images/MissingPerson/Dead_Body_ (${i + 1}).png`);

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

function announceGift(user, amount) {
    const audio = new SpeechSynthesisUtterance(`${user} has sent ${amount} coins`);
    speechSynthesis.speak(audio);
}

function randomizeLocation() {
    const lat = (Math.random() * 180 - 90).toFixed(6);  // Random latitude
    const lng = (Math.random() * 360 - 180).toFixed(6); // Random longitude
    document.getElementById('google-map').src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyAxQJKugSQrDayu1QNIvuNAFkYo9QCOj0A&center=${lat},${lng}&zoom=12`;
}

function handleTikTokGift(event) {
    const { username, amount } = event;
    announceGift(username, amount);
    spawnDeadBody();
    randomizeLocation(); // Move the map to a new random location
}

// Simulate TikFinity integration (replace with actual TikFinity event listener)
window.addEventListener('keydown', (e) => {
    if (e.key === 'G') {
        handleTikTokGift({ username: 'User123', giftName: 'Rosa', amount: 10 });
    }
});
