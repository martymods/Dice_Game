// dreamworldPointBank.js

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

const API_BASE_URL = 'https://dice-game-1-6iwc.onrender.com'; // Your actual backend URL


let userAddress = null;

// Check if user is enrolled
async function checkEnrollment() {
    if (!userAddress) return;
    const response = await fetch(`${API_BASE_URL}/checkEnrollment?wallet=${userAddress}`);
    const data = await response.json();
    if (!data.enrolled) {
        enrollUser();
    } else {
        updatePointsDisplay(data.points);
    }
}

// Enroll user
async function enrollUser() {
    if (!userAddress) return;
    await fetch(`${API_BASE_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userAddress })
    });
    alert('Enrollment successful!');
    checkEnrollment();
}

// Update points display
function updatePointsDisplay(points) {
    document.getElementById('user-points').textContent = `Points: ${points}`;
}

// Buy points with ETH
async function buyPoints() {
    if (!window.ethereum) {
        alert('MetaMask required!');
        return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const ethAmount = '0.01'; // Adjust as needed

    try {
        const tx = await signer.sendTransaction({
            to: '0xYourActualWalletAddressHere',
            value: ethers.utils.parseEther(ethAmount)
        });

        alert('Transaction sent! Waiting for confirmation...');
        await tx.wait();
        alert('Transaction confirmed! Points credited.');

        // 🎯 Fetch updated ETH price
        fetchEthPrice();
        checkEnrollment();
    } catch (error) {
        console.error('Transaction error:', error);
        alert('Transaction failed!');
    }
}

// Fetch ETH price from CoinGecko
async function fetchEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        document.getElementById('eth-price').textContent = `1 ETH = $${data.ethereum.usd.toFixed(2)}`;
    } catch (error) {
        console.error("Error fetching ETH price:", error);
    }
}

// Load ETH price on page load
document.addEventListener("DOMContentLoaded", fetchEthPrice);


// Connect MetaMask
async function connectMetaMask() {
    if (!window.ethereum) {
        alert('MetaMask is required.');
        return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    userAddress = accounts[0];
    document.getElementById('wallet-address').textContent = `Wallet: ${userAddress}`;
    checkEnrollment();
}

document.getElementById('connect-wallet').addEventListener('click', connectMetaMask);
document.getElementById('buy-points').addEventListener('click', buyPoints);

// leaderboard
async function loadLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    const leaderboard = await response.json();
    const leaderboardDiv = document.getElementById('leaderboard');
    
    leaderboardDiv.innerHTML = leaderboard
        .map(entry => `<p>${entry.wallet}: ${entry.points} points</p>`)
        .join('');
}

// Load leaderboard on page load
document.addEventListener("DOMContentLoaded", loadLeaderboard);
