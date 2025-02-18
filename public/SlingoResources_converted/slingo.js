/* slingo.js */
let score = 0;
let spinsLeft = 20;
let isSpinning = false;

const slotReels = document.querySelectorAll(".slot-reel");
const spinButton = document.getElementById("spin-button");
const scoreDisplay = document.getElementById("score");
const spinsDisplay = document.getElementById("spins");

function startSpin() {
    if (isSpinning || spinsLeft <= 0) return;
    isSpinning = true;
    spinsLeft--;
    spinsDisplay.textContent = spinsLeft;

    playSound("sounds/Button_Spin_Sfx.mp3");
    
    let results = [];
    slotReels.forEach((reel, index) => {
        let randomValue = Math.floor(Math.random() * 10) + 1;
        results.push(randomValue);
        reel.textContent = "";
        setTimeout(() => {
            reel.textContent = randomValue;
        }, index * 200);
    });
    
    setTimeout(() => {
        checkMatches(results);
        isSpinning = false;
    }, 1200);
}

function checkMatches(results) {
    let matched = false;
    results.forEach((value, index) => {
        // Match logic for Buffoons, Fools, and other special symbols
        if (value === 7) {  // Example match condition
            matched = true;
            score += 200;
            playSound("sounds/Score_Sfx_0.mp3");
        }
    });
    
    if (matched) {
        scoreDisplay.textContent = score;
    }
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play().catch(err => console.error("Sound error:", err));
}
