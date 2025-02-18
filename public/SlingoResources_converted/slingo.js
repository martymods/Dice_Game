/* slingo.js */
let score = 0;
let spinsLeft = 20;
let isSpinning = false;
let countdown = 10;
let countdownInterval;

const slotReels = document.querySelectorAll(".slot-reel");
const spinButton = document.getElementById("spin-button");
const scoreDisplay = document.getElementById("score");
const spinsDisplay = document.getElementById("spins");
const countdownDisplay = document.createElement("p");
countdownDisplay.id = "countdown-timer";
document.getElementById("score-area").appendChild(countdownDisplay);

const bingoCard = document.getElementById("bingo-card");
const cardNumbers = [];

function generateBingoCard() {
    let usedNumbers = new Set();
    for (let i = 0; i < 25; i++) {
        let num;
        do {
            num = Math.floor(Math.random() * 99) + 1;
        } while (usedNumbers.has(num));
        usedNumbers.add(num);
        cardNumbers.push(num);
    }
    renderBingoCard();
}

function renderBingoCard() {
    bingoCard.innerHTML = "";
    let index = 0;
    for (let row = 0; row < 5; row++) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("bingo-row");
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement("div");
            cell.classList.add("bingo-cell");
            cell.textContent = cardNumbers[index++];
            rowDiv.appendChild(cell);
        }
        bingoCard.appendChild(rowDiv);
    }
}

generateBingoCard();

function startCountdown() {
    countdown = 10;
    updateCountdownDisplay();
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        countdown--;
        updateCountdownDisplay();
        if (countdown === 5) playSound("/sounds/Warning_Sfx_1.mp3");
        if (countdown <= 3 && countdown > 0) playSound("/sounds/CountDown_Sfx_0.mp3");
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            autoSkipTurn();
        }
    }, 1000);
}

function updateCountdownDisplay() {
    countdownDisplay.textContent = `Time Left: ${countdown}s`;
}

function autoSkipTurn() {
    spinsLeft--;
    spinsDisplay.textContent = spinsLeft;
    playSound("/sounds/Denied_Sfx_0.mp3");
    isSpinning = false;
    if (spinsLeft <= 0) gameOver();
}

function startSpin() {
    if (isSpinning || spinsLeft <= 0) return;
    isSpinning = true;
    spinsLeft--;
    spinsDisplay.textContent = spinsLeft;
    playSound("/sounds/Activate_Button_Spin_Sfx.mp3");
    clearInterval(countdownInterval);
    
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
        startCountdown();
    }, 1200);
}

function checkMatches(results) {
    let matched = false;
    results.forEach((value, index) => {
        if (value === 7) {
            matched = true;
            score += 200;
            playSound("/sounds/Score_High_Bingo_Sfx_0.mp3");
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

function gameOver() {
    alert("Game Over! No more spins left.");
}
