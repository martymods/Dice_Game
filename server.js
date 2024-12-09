const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store game rooms and player data
let rooms = {};
let players = {}; // Store player money and bet data

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket setup
io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    // Emit list of available games
    socket.on('getAvailableGames', () => {
        console.log('Fetching available games');
        const availableGames = Object.keys(rooms).map(roomName => ({
            roomName,
            players: rooms[roomName].players,
            maxPlayers: rooms[roomName].maxPlayers
        }));
        socket.emit('availableGames', availableGames);
    });

    // Create a new game
    socket.on('createGame', (data) => {
        if (!rooms[data.roomName]) {
            rooms[data.roomName] = {
                players: [data.playerName],
                maxPlayers: 4,  // Max players per game
                currentBet: 0,
                shooter: data.playerName,
                isFull: false
            };
            players[data.playerName] = { money: 300 };
            socket.join(data.roomName);
            socket.emit('gameCreated', { success: true, roomName: data.roomName });
            console.log(`Game created by ${data.playerName} in room: ${data.roomName}`);
        } else {
            socket.emit('error', { message: 'Room already exists.' });
            console.log(`Failed to create game: Room ${data.roomName} already exists`);
        }
    });

    // Join an existing game
    socket.on('joinGame', (data) => {
        const room = rooms[data.roomName];
        if (room && !room.isFull) {
            if (room.players.length < room.maxPlayers) {
                room.players.push(data.playerName);
                players[data.playerName] = { money: 300 }; // New player starts with $300
                socket.join(data.roomName);
                io.to(data.roomName).emit('playerJoined', { playerName: data.playerName, roomName: data.roomName });
                console.log(`${data.playerName} joined the game in room: ${data.roomName}`);
            }
            if (room.players.length === room.maxPlayers) {
                room.isFull = true;
                console.log(`Room ${data.roomName} is now full.`);
            }
        } else {
            socket.emit('error', { message: 'Room does not exist or is full.' });
            console.log(`Failed to join game: Room ${data.roomName} does not exist or is full.`);
        }
    });

    // Roll the dice in a game
    socket.on('rollDice', (data) => {
        const room = rooms[data.roomName];
        if (room) {
            const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
            const outcome = checkDiceRoll(diceRoll);
            io.to(data.roomName).emit('diceRolled', { diceRoll, outcome });
            console.log(`Dice rolled in room ${data.roomName}: ${diceRoll} - Outcome: ${outcome}`);
            // Update player's money based on the outcome
            for (let player of room.players) {
                if (players[player]) {
                    if (outcome === 'win') {
                        players[player].money += data.bet;
                    } else {
                        players[player].money -= data.bet;
                    }
                }
            }
        }
    });

    // Disconnect player
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Check dice roll outcome
function checkDiceRoll(roll) {
    if (roll === 7 || roll === 11) {
        return 'win';
    } else if (roll === 2 || roll === 3 || roll === 12) {
        return 'lose';
    } else {
        return 'point';
    }
}

// Serve index.html for all unknown routes
app.get('*', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
