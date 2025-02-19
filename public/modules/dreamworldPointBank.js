// dreamworldPointBank.js

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

const API_BASE_URL = '/modules'; // Adjust with your actual backend API path

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
    const ethAmount = '0.01'; // Adjust ETH amount per points

    const tx = await signer.sendTransaction({
        to: 'your-wallet-address', // Your receiving wallet address
        value: ethers.utils.parseEther(ethAmount)
    });

    alert('Transaction sent! Waiting for confirmation...');
    await tx.wait();
    alert('Transaction confirmed! Points credited.');
    checkEnrollment();
}

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
