
const leaderboard = []; // In-memory leaderboard storage


require('dotenv').config();
const express = require('express');
const ethers = require('ethers');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Initialize Wallet
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(privateKey, provider);

app.post('/placeBet', (req, res) => {
    const { betAmount } = req.body;
    console.log(`Received bet: ${betAmount} ETH`);
    res.status(200).json({ success: true, message: 'Bet placed successfully!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid name or score.' });
    }

    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
    leaderboard.splice(100); // Keep only top 100 scores

    res.status(201).json({ message: 'Entry added successfully!', leaderboard });
});

app.get('/leaderboard', (req, res) => {
    res.status(200).json(leaderboard);
});
const fs = require('fs');
const leaderboardFile = './leaderboard.json';

// Load leaderboard from disk
const loadLeaderboard = () => {
    if (fs.existsSync(leaderboardFile)) {
        const data = fs.readFileSync(leaderboardFile);
        return JSON.parse(data);
    }
    return [];
};

// Save leaderboard to disk
const saveLeaderboard = () => {
    fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard));
};

// Load leaderboard at startup
leaderboard.push(...loadLeaderboard());

// Save leaderboard whenever an entry is added
app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid name or score.' });
    }

    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(100);

    saveLeaderboard(); // Save changes to disk
    res.status(201).json({ message: 'Entry added successfully!', leaderboard });
});
