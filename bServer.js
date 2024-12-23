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

