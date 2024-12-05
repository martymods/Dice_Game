const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];

app.use(express.static('public'));  // Serve static files like HTML, CSS, JS

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('newPlayer', (name) => {
        players.push({ name, socketId: socket.id });
        io.emit('updatePlayers', players);
    });

    socket.on('diceRoll', (data) => {
        io.emit('diceRollResult', data);
    });

    socket.on('placeBet', (data) => {
        io.emit('updateBet', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        players = players.filter(player => player.socketId !== socket.id);
        io.emit('updatePlayers', players);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
