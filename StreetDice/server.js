const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let games = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('hostGame', (data) => {
        games.push({ hostName: data.hostName, numPlayers: data.numPlayers, players: [] });
        console.log(`${data.hostName} is hosting a game for ${data.numPlayers} players`);
    });

    socket.on('requestGameList', () => {
        socket.emit('gameList', games);
    });

    socket.on('joinGame', (data) => {
        games[data.gameId].players.push(data.playerName);
        console.log(`${data.playerName} joined ${games[data.gameId].hostName}'s game`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
