const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket setup
io.on('connection', (socket) => {
    console.log('A user connected');

    // Create game
    socket.on('createGame', (data) => {
        console.log(`Game created by ${data.playerName} in room: ${data.roomName}`);
        socket.join(data.roomName);
        socket.emit('gameCreated', { success: true, roomName: data.roomName });
    });

    // Join game
    socket.on('joinGame', (data) => {
        console.log(`${data.playerName} is attempting to join room: ${data.roomName}`);
        const rooms = io.sockets.adapter.rooms;
        if (rooms.has(data.roomName)) {
            console.log(`${data.playerName} successfully joined room: ${data.roomName}`);
            socket.join(data.roomName);
            io.to(data.roomName).emit('playerJoined', { playerName: data.playerName, roomName: data.roomName });
        } else {
            console.log(`Room ${data.roomName} does not exist`);
            socket.emit('error', { message: 'Room does not exist.' });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Serve index.html for all unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
