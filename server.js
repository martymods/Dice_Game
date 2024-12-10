const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const games = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('createGame', ({ roomName, playerName }) => {
        if (!games[roomName]) {
            games[roomName] = { players: [playerName], maxPlayers: 2 };
            socket.join(roomName);
            socket.emit('gameCreated', { success: true, roomName });
            console.log(`Game created by ${playerName} in room: ${roomName}`);
        } else {
            socket.emit('gameCreated', { success: false, message: 'Room already exists.' });
        }
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
        const game = games[roomName];
        if (!game) {
            return socket.emit('joinError', { message: 'Room does not exist.' });
        }
        if (game.players.length >= game.maxPlayers) {
            return socket.emit('joinError', { message: 'Room is full.' });
        }
        game.players.push(playerName);
        socket.join(roomName);
        socket.emit('gameJoined', { success: true, roomName });
        console.log(`${playerName} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
