document.addEventListener("DOMContentLoaded", () => {
    const spinButton = document.getElementById("spin-button");
    const scoreDisplay = document.getElementById("score");
    const slotWheels = document.querySelectorAll(".wheel");
    let score = 0;

    spinButton.addEventListener("click", () => {
        playSound("/sounds/Button_Spin_Sfx.mp3");
        spinSlots();
    });

    function spinSlots() {
        slotWheels.forEach((wheel, index) => {
            setTimeout(() => {
                const randomNum = Math.floor(Math.random() * 75) + 1;
                wheel.textContent = randomNum;
                checkMatches(randomNum, index);
            }, index * 300);
        });
    }

    function checkMatches(number, column) {
        const cardNumbers = document.querySelectorAll(`#card-numbers .column:nth-child(${column + 1})`);
        cardNumbers.forEach(cell => {
            if (parseInt(cell.textContent) === number) {
                cell.style.backgroundColor = "yellow";
                score += 200;
                playSound("/sounds/Score_Sfx_0.mp3");
                updateScore();
            }
        });
    }

    function updateScore() {
        scoreDisplay.textContent = score;
    }

    function playSound(src) {
        const audio = new Audio(src);
        audio.play().catch(err => console.error("Audio error: ", err));
    }
});
