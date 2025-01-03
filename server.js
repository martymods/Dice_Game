const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const games = {};
const onlinePlayers = {}; // To track players and their names

app.use(express.static('public'));

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


// Serve the Socket.IO client library
app.get('/socket.io/socket.io.js', (req, res) => {
    const filePath = require.resolve('socket.io-client/dist/socket.io.js');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.sendFile(filePath);
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
