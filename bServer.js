require('dotenv').config();
const { ethers } = require('ethers');
const express = require('express');

console.log("ALCHEMY_API_URL:", process.env.ALCHEMY_API_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);


const app = express();
const port = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Wallet and Provider
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Endpoint to Send Payout
app.post('/payout', async (req, res) => {
    const { playerAddress, winningsETH } = req.body;

    try {
        const tx = await wallet.sendTransaction({
            to: playerAddress,
            value: ethers.utils.parseEther(winningsETH.toString()),
        });

        console.log('Payout successful:', tx);
        res.status(200).send({ success: true, transaction: tx });
    } catch (error) {
        console.error('Error in payout:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

// Endpoint to Process Bets
app.post('/placeBet', async (req, res) => {
    const { betAmount } = req.body;

    try {
        // Validate bet amount
        if (!betAmount || betAmount <= 0) {
            throw new Error("Invalid bet amount.");
        }

        console.log(`Bet placed for: ${betAmount} ETH`);
        res.status(200).send({ success: true, message: "Bet placed successfully!" });
    } catch (error) {
        console.error("Error in placing bet:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});


// Start the Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
