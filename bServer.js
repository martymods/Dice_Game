import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // ESM syntax for fetch
import { fileURLToPath } from 'url';

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

// Serve Static Files
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/terms.html'));
});

// Leaderboard
const leaderboardFile = path.resolve(__dirname, 'leaderboard.json');
let leaderboard = [];

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

const saveLeaderboard = () => {
    try {
        fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
    } catch (error) {
        console.error('Failed to save leaderboard:', error);
    }
};

// Load leaderboard on startup
leaderboard = loadLeaderboard();

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
        const response = await fetch('https://api.tiktok.com/live/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
            }),
        });

        if (!response.ok) {
            console.error('TikTok API Error:', await response.text());
            return res.status(response.status).json({ error: 'Failed to fetch TikTok token' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching TikTok token:', error);
        res.status(500).json({ error: 'Server error' });
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

// Leaderboard Endpoints
app.get('/leaderboard', (req, res) => {
    res.status(200).json(leaderboard);
});

app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Invalid name or score.' });
    }
    leaderboard.push({ name: name.trim(), score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100);
    saveLeaderboard();
    res.status(201).json({ message: 'Leaderboard updated.', leaderboard });
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

// Start Server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
