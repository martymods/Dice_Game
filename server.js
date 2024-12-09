const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "Public" folder
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('createGame', (data) => {
        console.log(`Game created by ${data.playerName} in room: ${data.roomName}`);
        socket.join(data.roomName);
        socket.emit('gameCreated', { success: true, roomName: data.roomName });
    });

    socket.on('joinGame', (data) => {
        console.log(`${data.playerName} is attempting to join room: ${data.roomName}`);
        const rooms = io.sockets.adapter.rooms;
        if (rooms.has(data.roomName)) {
            socket.join(data.roomName);
            io.to(data.roomName).emit('playerJoined', { playerName: data.playerName });
        } else {
            socket.emit('error', { message: 'Room does not exist.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
