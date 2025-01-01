import { ethers } from 'ethers';

let signer;
let ethBalance = 0;

// Connect MetaMask on page load
async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        updateETHBalance();
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}

// Update ETH balance
async function updateETHBalance() {
    const address = await signer.getAddress();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    ethBalance = ethers.utils.formatEther(balance);
    document.getElementById('balance-display').textContent = `${ethBalance} ETH`;
}

// Place a bet
async function placeBet() {
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    const predictedRoll = parseInt(document.getElementById('predicted-roll').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > ethBalance || isNaN(predictedRoll)) {
        alert("Invalid bet or prediction.");
        return;
    }

    // Deduct bet and simulate roll
    try {
        const transaction = await signer.sendTransaction({
            to: "0xYourEthereumAddressHere", // Replace with your ETH wallet address
            value: ethers.utils.parseEther(betAmount.toString()),
        });

        console.log("Bet transaction successful:", transaction);
        alert("Bet placed successfully!");

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const rollSum = dice1 + dice2;

        updateDiceImages(dice1, dice2);

        if (rollSum === predictedRoll) {
            const winnings = betAmount * 5; // 5x payout for correct prediction
            await payoutWinnings(winnings);
            updateGameStatus(`Congratulations! You won ${winnings.toFixed(3)} ETH! 🎉`, "gold");
        } else {
            updateGameStatus(`You lost. Roll was ${rollSum}. Better luck next time!`, "red");
        }

        updateETHBalance();
    } catch (error) {
        console.error("Bet failed:", error);
        alert("Transaction failed. Please try again.");
    }
}

// Payout winnings
async function payoutWinnings(amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider); // Replace with your private key
    await wallet.sendTransaction({
        to: await signer.getAddress(),
        value: ethers.utils.parseEther(amount.toString()),
    });
}

// Update dice images
function updateDiceImages(dice1, dice2) {
    document.getElementById('dice1').src = `/images/dice${dice1}.png`;
    document.getElementById('dice2').src = `/images/dice${dice2}.png`;
}

// Update game status
function updateGameStatus(message, color) {
    const gameStatus = document.getElementById('high-roller-status');
    gameStatus.textContent = message;
    gameStatus.style.color = color;
}

// Return to main menu
function returnToMainMenu() {
    window.location.href = '/';
}

document.getElementById('placeBetButton').addEventListener('click', placeBet);
window.addEventListener('load', connectMetaMask);
