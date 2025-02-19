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
            to: '0x5638c9f84361a7430b29a63216f0af0914399eA2',
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
const socket = io.connect(API_BASE_URL);

socket.on('leaderboardUpdate', (leaderboard) => {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = leaderboard
        .map((entry, index) => `<div class="leaderboard-entry">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-wallet">${entry.wallet}</span>
            <span class="leaderboard-points">${entry.points} pts</span>
        </div>`)
        .join('');
});

async function checkVIPStatus(wallet) {
    const response = await fetch(`${API_BASE_URL}/vipStatus?wallet=${wallet}`);
    const data = await response.json();
    if (data.vip) {
        document.getElementById('vip-status').textContent = "🌟 VIP Member 🌟";
    }
}

// Run this after wallet connects
document.addEventListener("DOMContentLoaded", () => {
    if (userAddress) checkVIPStatus(userAddress);
});


async function buyPointPack(points) {
    const ethPrices = { 10: "0.002", 50: "0.01", 100: "0.02" };
    const ethAmount = ethPrices[points];

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
        to: "0x5638c9f84361a7430b29a63216f0af0914399eA2", 
        value: ethers.utils.parseEther(ethAmount)
    });

    alert(`Purchased ${points} points!`);
    checkEnrollment();
}

function loadLeaderboard() {
    fetch(`${API_BASE_URL}/leaderboard`)
        .then(response => response.json())
        .then(leaderboard => {
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = leaderboard
                .map((entry, index) => `<div class="leaderboard-entry">
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-wallet">${entry.wallet}</span>
                    <span class="leaderboard-points">${entry.points} pts</span>
                </div>`)
                .join('');
        })
        .catch(error => console.error("Error loading leaderboard:", error));
}



// Load leaderboard on page load
document.addEventListener("DOMContentLoaded", loadLeaderboard);

