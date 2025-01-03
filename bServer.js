const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Initialize App
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Leaderboard Storage
const leaderboardFile = path.resolve(__dirname, 'leaderboard.json');
let leaderboard = [];

// Load leaderboard from disk
const loadLeaderboard = () => {
    try {
        if (fs.existsSync(leaderboardFile)) {
            const data = fs.readFileSync(leaderboardFile, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
    return [];
};

// Save leaderboard to disk
const saveLeaderboard = () => {
    try {
        fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
    } catch (error) {
        console.error('Failed to save leaderboard:', error);
    }
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

    // Sanitize and validate input
    const sanitizedName = name.trim().substring(0, 50); // Limit name length
    leaderboard.push({ name: sanitizedName, score });

    // Sort and retain the top 100 scores
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100);

    // Save to disk
    saveLeaderboard();

    res.status(201).json({ message: 'Entry added successfully!', leaderboard });
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

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).send('<h1>404 - Not Found</h1>');
});

// Server Start
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
