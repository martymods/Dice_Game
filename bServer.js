import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import axios from 'axios'; // 🔹 Add axios for API calls
import { MongoClient } from 'mongodb';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to generate AI response
async function getAIResponse(userMessage) {
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a fun and energetic AI commentator in a TikTok race game. Respond with enthusiasm and humor!" },
                { role: "user", content: userMessage }
            ],
            max_tokens: 50
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ AI Error:", error);
        return "I didn't quite catch that! Try again!";
    }
}

// Serve Static Files
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/terms.html'));
});

// Catch-all route for the TikTok game
app.get('/modules/tiktok_game.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/modules/tiktok_game.html'));
});

app.post("/test/webhook", (req, res) => {
    console.log("✅ Webhook Test Received:", req.body);
    res.status(200).send("Webhook Test Successful");
});

// TikTok Chat Webhook: AI Bot Responds to TikTok Messages
app.post('/api/tiktok/chat', async (req, res) => {
    const { username, message } = req.body;

    if (!username || !message) {
        return res.status(400).json({ error: "Invalid data received." });
    }

    console.log(`📩 New TikTok Message: ${username}: ${message}`);

    // Send message to the frontend
    io.emit("tiktok-chat-response", { username, aiResponse: message });

    res.status(200).json({ success: true });
});

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'dice_game';
const MONGODB_COLLECTION = process.env.MONGODB_LEADERBOARD_COLLECTION || 'leaderboard';

let mongoClient;
let leaderboardCollection = null;
let leaderboardCache = [];
const playerProfiles = {};

const mapLeaderboardEntries = (entries = []) => entries.map(entry => ({
    name: entry.name,
    score: entry.score,
    wallet: entry.name,
    points: entry.score,
}));

async function reloadLeaderboardCache(limit = 100) {
    if (leaderboardCollection) {
        const documents = await leaderboardCollection
            .find({}, { projection: { _id: 0, name: 1, score: 1 } })
            .sort({ score: -1, updatedAt: 1 })
            .limit(limit)
            .toArray();
        leaderboardCache = documents.map(doc => ({ name: doc.name, score: doc.score }));
    } else {
        leaderboardCache = leaderboardCache
            .slice()
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    return leaderboardCache;
}

async function persistLeaderboardEntry(name, score) {
    const trimmedName = typeof name === 'string' ? name.trim().slice(0, 50) : '';
    const numericScore = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;

    if (!trimmedName) {
        throw new Error('Invalid name for leaderboard entry.');
    }

    if (leaderboardCollection) {
        await leaderboardCollection.updateOne(
            { name: trimmedName },
            {
                $set: {
                    name: trimmedName,
                    score: numericScore,
                    updatedAt: new Date(),
                },
            },
            { upsert: true },
        );
    } else {
        const existingIndex = leaderboardCache.findIndex(entry => entry.name === trimmedName);
        if (existingIndex >= 0) {
            leaderboardCache[existingIndex].score = numericScore;
        } else {
            leaderboardCache.push({ name: trimmedName, score: numericScore });
        }
    }

    await reloadLeaderboardCache();
    return leaderboardCache;
}

async function initializeLeaderboardStorage() {
    if (!MONGODB_URI) {
        console.warn('MONGODB_URI not set. Leaderboard entries will be stored in memory only.');
        return;
    }

    try {
        mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        await mongoClient.connect();
        leaderboardCollection = mongoClient.db(MONGODB_DB).collection(MONGODB_COLLECTION);
        await leaderboardCollection.createIndex({ score: -1 });
        await reloadLeaderboardCache();
        console.log('Connected to MongoDB for leaderboard storage.');
    } catch (error) {
        leaderboardCollection = null;
        console.error('Failed to connect to MongoDB:', error);
    }
}

await initializeLeaderboardStorage();

// Wallet Setup
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(privateKey, provider);

// Lottery Setup
let tickets = [];
let pot = 3000;
let winningNumber = Math.floor(Math.random() * 50000) + 1;

// TikTok Token Route
app.post('/api/tiktok/token', async (req, res) => {
    try {
        console.log("📡 TikTok Token Request Received...");

        // Ensure environment variables are set
        if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
            console.error("❌ TikTok API Keys are missing!");
            return res.status(500).json({ error: "TikTok API credentials missing." });
        }

        const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ TikTok API Error:", errorText);
            return res.status(response.status).json({ error: "Failed to fetch TikTok token", details: errorText });
        }

        const data = await response.json();

        if (!data.access_token) {
            console.error("❌ TikTok returned an invalid token response:", data);
            return res.status(500).json({ error: "TikTok did not return an access token." });
        }

        console.log("✅ TikTok Access Token Fetched Successfully!");
        res.json({ access_token: data.access_token });

    } catch (error) {
        console.error("❌ Error fetching TikTok token:", error);
        res.status(500).json({ error: "Server error while fetching TikTok token" });
    }
});


// Pot Route
app.get('/pot', (req, res) => {
    res.status(200).json({ pot });
});

// WebSocket Handlers
const onlinePlayers = {};
const games = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', (message) => {
        const name = onlinePlayers[socket.id] || 'Unknown';
        io.emit('newMessage', { name, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete onlinePlayers[socket.id];
        io.emit('playerUpdate', { players: onlinePlayers });
    });

    const randomName = `Player${Math.floor(Math.random() * 10000)}`;
    onlinePlayers[socket.id] = randomName;

    io.emit('playerUpdate', { players: onlinePlayers });

    socket.on('changeName', (newName) => {
        if (newName && newName.trim()) {
            onlinePlayers[socket.id] = newName.trim();
            io.emit('playerUpdate', { players: onlinePlayers });
        }
    });

        // ✅ NEW: Handle AI Chat Responses
        socket.on('tiktok-chat-response', (data) => {
            const { username, aiResponse } = data;
            console.log(`💬 AI Replying to ${username}: ${aiResponse}`);
    
            // Emit AI response to all connected players
            io.emit('chatMessage', { username, message: aiResponse });
        });
    

    socket.on('createGame', ({ roomName, playerName }) => {
        games[roomName] = { players: [playerName], maxPlayers: 2 };
        socket.join(roomName);
        socket.emit('gameCreated', { success: true, roomName });
    });

    socket.on('getAvailableGames', () => {
        const availableGames = Object.entries(games).map(([roomName, game]) => ({
            roomName,
            players: game.players,
            maxPlayers: game.maxPlayers,
        }));
        socket.emit('availableGames', availableGames);
    });

    socket.on('joinGame', ({ roomName, playerName }) => {
        if (!games[roomName]) {
            return socket.emit('joinError', { message: 'Room does not exist.' });
        }
        if (games[roomName].players.length >= games[roomName].maxPlayers) {
            return socket.emit('joinError', { message: 'Room is full.' });
        }
        games[roomName].players.push(playerName);
        socket.join(roomName);
        socket.emit('gameJoined', { success: true, roomName });
    });
});

app.get('/vipStatus', (req, res) => {
    const { wallet } = req.query;
    if (!wallet) return res.json({ vip: false });

    const points = playerProfiles[wallet]?.points || 0;
    res.json({ vip: points > 5000 }); // 5000 points = VIP
});


// Leaderboard Endpoints
app.get('/leaderboard', async (req, res) => {
    try {
        const entries = await reloadLeaderboardCache();
        res.status(200).json(mapLeaderboardEntries(entries));
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        res.status(500).json({ error: 'Failed to load leaderboard.' });
    }
});

app.post('/leaderboard', async (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
        return res.status(400).json({ error: 'Invalid name or score.' });
    }

    try {
        const updatedEntries = await persistLeaderboardEntry(name, score);
        res.status(201).json({ message: 'Leaderboard updated.', leaderboard: mapLeaderboardEntries(updatedEntries) });
    } catch (error) {
        console.error('Failed to update leaderboard entry:', error);
        res.status(500).json({ error: 'Failed to update leaderboard.' });
    }
});

app.post('/updatePoints', async (req, res) => {
    const { wallet, amount } = req.body;
    if (!wallet) return res.status(400).json({ success: false });

    if (!playerProfiles[wallet]) playerProfiles[wallet] = { points: 0 };
    playerProfiles[wallet].points += amount;

    try {
        const updatedEntries = await persistLeaderboardEntry(wallet, playerProfiles[wallet].points);
        const topTen = mapLeaderboardEntries(updatedEntries).slice(0, 10);
        io.emit('leaderboardUpdate', topTen);
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to persist leaderboard points:', error);
        res.status(500).json({ success: false, error: 'Failed to persist leaderboard entry.' });
    }
});


// Update ETH Prices
async function updateEthPrices() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        console.log(`1 ETH = $${data.ethereum.usd}`);
    } catch (error) {
        console.error('Error fetching ETH prices:', error);
    }
}
setInterval(updateEthPrices, 60000); // Update every minute

// Enrollment
app.post('/enroll', async (req, res) => {
    const { wallet } = req.body;
    if (!wallet) {
        return res.status(400).json({ success: false, message: "Wallet address required" });
    }
    // Store the wallet in a database (or in-memory for now)
    playerProfiles[wallet] = { points: 0 }; // Default points to 0
    res.json({ success: true, message: "Enrollment successful" });
});

app.get('/checkEnrollment', async (req, res) => {
    const { wallet } = req.query;
    if (!wallet || !playerProfiles[wallet]) {
        return res.json({ enrolled: false, points: 0 });
    }
    res.json({ enrolled: true, points: playerProfiles[wallet].points });
});

app.post("/api/tiktok/webhook", (req, res) => {
    try {
        console.log("📡 Webhook Event Received:", req.body);
        
        // Send an immediate success response (TikTok requires 200 OK)
        res.status(200).json({ success: true });

        // Process the event asynchronously (so TikTok gets a fast response)
        setTimeout(() => {
            if (req.body && req.body.event) {
                console.log("✅ TikTok Webhook Data Processed:", req.body);
                // 🔹 Here you can add logic to handle events (e.g., GiftReceived, ChatMessage, etc.)
            }
        }, 100);

    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).json({ error: "Server error processing webhook." });
    }
});


// Start Server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
