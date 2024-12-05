const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (CSS, JS, Images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL ("/") to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let players = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newPlayer', (name) => {
        console.log(`${name} has joined the game`);
    });

    socket.on('hostGame', (data) => {
        console.log(`${data.playerName} is hosting a game`);
        socket.emit('gameStarted', { message: 'Game is starting! You are the host.' });
    });

    socket.on('joinGame', (data) => {
        console.log(`${data.playerName} has joined the game`);
        socket.emit('gameStarted', { message: 'You have joined the game!' });
    });

    socket.on('diceRoll', (data) => {
        console.log(`Dice rolled by ${data.playerName}: ${data.dice1}, ${data.dice2}, Total: ${data.result}`);
        io.emit('diceRollResult', data);  // Broadcast the dice roll result to all players
    });

    socket.on('placeBet', (data) => {
        console.log(`${data.playerName} placed a bet of $${data.betAmount}`);
        io.emit('updateBet', data);  // Broadcast the bet to all players
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
