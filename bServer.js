const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ethers = require('ethers');
require('dotenv').config();

// Initialize App
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Leaderboard Storage
const leaderboardFile = './leaderboard.json';
let leaderboard = [];

// Load leaderboard from disk
const loadLeaderboard = () => {
    if (fs.existsSync(leaderboardFile)) {
        const data = fs.readFileSync(leaderboardFile, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

// Save leaderboard to disk
const saveLeaderboard = () => {
    fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
};

// Load leaderboard at startup
leaderboard = loadLeaderboard();

// Wallet Initialization
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(privateKey, provider);

// Routes

// Place Bet Endpoint
app.post('/placeBet', (req, res) => {
    const { betAmount } = req.body;

    if (!betAmount || typeof betAmount !== 'number' || betAmount <= 0) {
        return res.status(400).json({ error: 'Invalid bet amount.' });
    }

    console.log(`Received bet: ${betAmount} ETH`);
    res.status(200).json({ success: true, message: 'Bet placed successfully!' });
});

// Leaderboard GET Endpoint
app.get('/leaderboard', (req, res) => {
    res.status(200).json(leaderboard);
});

// Leaderboard POST Endpoint
app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Invalid name or score.' });
    }

    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
    leaderboard = leaderboard.slice(0, 100); // Keep top 100 scores
    saveLeaderboard(); // Save to disk

    res.status(201).json({ message: 'Entry added successfully!', leaderboard });
});

// Server Start
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Wallet Functionality Example
app.get('/wallet/balance', async (req, res) => {
    try {
        const balance = await wallet.getBalance();
        res.status(200).json({ balance: ethers.utils.formatEther(balance) });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance.' });
    }
});
