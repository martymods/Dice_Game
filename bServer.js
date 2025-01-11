const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Initialize App
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

// Middleware to serve the Socket.IO library
app.use('/socket.io', express.static('node_modules/socket.io/client-dist'));

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(express.static('public')); // Serve static files from the 'public' folder

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

// Lottery Setup
let tickets = [];
let pot = 3000; // Starting pot
let winningNumber = Math.floor(Math.random() * 50000) + 1;

app.get('/pot', (req, res) => {
    res.status(200).json({ pot });
});


// Online Players and Games Tracking
const onlinePlayers = {};
const games = {};

// WebSocket Handlers
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Debug: Check for duplicate listeners
    const existingListeners = socket.listenerCount('sendMessage');
    if (existingListeners > 0) {
        console.warn(`sendMessage listener already exists for socket ${socket.id}`);
    }

    // Ensure the listener is only added once
    socket.removeAllListeners('sendMessage');
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);
        const name = onlinePlayers[socket.id] || 'Unknown';
        io.emit('newMessage', { name, message });
    });

    // Other event listeners
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete onlinePlayers[socket.id];
        io.emit('playerUpdate', { players: onlinePlayers });
    });



    socket.on('sendMessage', (message) => {
        console.log('Received message:', message); // Debug
        const name = onlinePlayers[socket.id];
        io.emit('newMessage', { name, message });
    });

    // Assign a random name to the connected player
    const randomName = `Player${Math.floor(Math.random() * 10000)}`;
    onlinePlayers[socket.id] = randomName;

    // Notify all clients about the new player
    io.emit('playerUpdate', { players: onlinePlayers });

    // Handle name change
    socket.on('changeName', (newName) => {
        if (newName && newName.trim()) {
            onlinePlayers[socket.id] = newName.trim();
            io.emit('playerUpdate', { players: onlinePlayers });
        }
    });

    // Handle chat messages
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);
        const name = onlinePlayers[socket.id];
        io.emit('newMessage', { name, message });
    });

    // Test message handling
    socket.on('test', (data) => {
        console.log('Test message received:', data);
        socket.emit('testReply', 'Hello from Server');
    });

    // Notify when a player disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete onlinePlayers[socket.id];
        io.emit('playerUpdate', { players: onlinePlayers });
    });

    // Game-related events
    socket.on('createGame', ({ roomName, playerName }) => {
        games[roomName] = { players: [playerName], maxPlayers: 2 };
        socket.join(roomName);
        socket.emit('gameCreated', { success: true, roomName });
        console.log(`Game created by ${playerName} in room: ${roomName}`);
    });

    socket.on('getAvailableGames', () => {
        const availableGames = Object.entries(games).map(([roomName, game]) => ({
            roomName,
            players: game.players,
            maxPlayers: game.maxPlayers
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
        console.log(`${playerName} joined room: ${roomName}`);
    });
});

// API Routes

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

    const sanitizedName = name.trim().substring(0, 50); // Limit name length
    leaderboard.push({ name: sanitizedName, score });

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100); // Keep top 100 scores

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

// Serve the Socket.IO client library
app.get('/socket.io-client/socket.io.min.js', (req, res) => {
    const filePath = require.resolve('socket.io-client/dist/socket.io.min.js');
    res.sendFile(filePath);
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
    console.log(`Request received for: ${req.url}`);
    next();
});

// Lottery Routes
app.post('/buy-ticket', (req, res) => {
    const { number, price } = req.body;

    if (!number || number < 1 || number > 50000 || !price || price <= 0) {
        return res.status(400).json({ error: 'Invalid ticket data.' });
    }

    tickets.push({ number, price, date: new Date() });
    pot += price;

    res.status(200).json({ success: true, pot });
});

app.get('/winning-number', (req, res) => {
    res.status(200).json({ winningNumber });
});


// Update ETH Prices
async function updateEthPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        const ethToUsd = data.ethereum.usd;
        console.log(`1 ETH = $${ethToUsd}`);
    } catch (error) {
        console.error('Failed to fetch ETH prices:', error);
    }
}
setInterval(updateEthPrices, 60000); // Update every 60 seconds
