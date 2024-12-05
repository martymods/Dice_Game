document.getElementById('rollButton').addEventListener('click', rollDice);

let point = null;

function rollDice() {
    // Generate two random dice rolls (values between 1 and 6)
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    
    // Display dice values on the screen
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;

    const sum = dice1 + dice2;

    // Handle the come-out roll (initial roll)
    if (point === null) {
        if (sum === 7 || sum === 11) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            document.getElementById('pointStatus').textContent = "";
        } else if (sum === 2 || sum === 3 || sum === 12) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            document.getElementById('pointStatus').textContent = "";
        } else {
            point = sum; // Set the point
            document.getElementById('gameStatus').textContent = "Point is " + point + ". Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    } else {
        // Handle point rolls
        if (sum === point) {
            document.getElementById('gameStatus').textContent = "You win! 🎉";
            document.getElementById('pointStatus').textContent = "";
            point = null; // Reset point
        } else if (sum === 7) {
            document.getElementById('gameStatus').textContent = "You lose! 💔";
            document.getElementById('pointStatus').textContent = "";
            point = null; // Reset point
        } else {
            document.getElementById('gameStatus').textContent = "Keep rolling!";
            document.getElementById('pointStatus').textContent = "Your point is: " + point;
        }
    }
}
