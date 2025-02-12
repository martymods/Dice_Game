const express = require('express');
const fetch = require('node-fetch'); // Ensure this is installed
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const games = {};
const onlinePlayers = {}; // To track players and their names

// When a new socket connects
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

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
        if (message && message.trim()) {
            const name = onlinePlayers[socket.id];
            io.emit('newMessage', { name, message: message.trim() });
        }
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

// ✅ Correct Proxy Route for Fetching Image
app.get('/proxy-face', async (req, res) => {
    try {
        const response = await fetch('https://thispersondoesnotexist.com/image');
        if (!response.ok) throw new Error('Failed to fetch image');

        // Stream the image directly to the client
        res.setHeader('Content-Type', 'image/jpeg');
        response.body.pipe(res);
    } catch (error) {
        console.error('Error fetching face image:', error);
        res.status(500).sendFile(path.join(__dirname, 'public', 'images', 'MissingPerson', 'default_face.png')); // Serve fallback image
    }
});

// Ensure `/proxy-face` is registered before starting the server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

