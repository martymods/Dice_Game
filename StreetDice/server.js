const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');  // This helps with file path handling

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL ("/") to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Make sure index.html is in the "public" folder
});

// Handle socket connections for multiplayer functionality
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Handle new player joining the game
    socket.on('newPlayer', (name) => {
        console.log(`${name} has joined the game`);
        // You can add logic here to store the player's name in an array if needed
    });

    // Handle dice roll event
    socket.on('diceRoll', (data) => {
        console.log('Dice rolled: ', data);
        io.emit('diceRollResult', data);  // Emit the result to all players
    });

    // Handle player placing a bet
    socket.on('placeBet', (data) => {
        console.log(`${data.playerName} placed a bet of $${data.betAmount}`);
        io.emit('updateBet', data);  // Emit bet update to all players
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Handle player disconnection logic if needed
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
