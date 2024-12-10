const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = {}; // Store game data here
let players = {}; // Store player data here

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('New player connected: ', socket.id);

    socket.on('createGame', (gameName, playerName) => {
        if (!games[gameName]) {
            games[gameName] = {
                players: [playerName],
                gameStatus: 'waiting', // or 'active'
            };
            players[socket.id] = { gameName, playerName };
            console.log(`${playerName} created game: ${gameName}`);
        } else {
            socket.emit('gameCreationError', 'Game already exists!');
        }
    });

    socket.on('joinGame', (gameName, playerName) => {
        if (games[gameName] && games[gameName].players.length < 2) {
            games[gameName].players.push(playerName);
            players[socket.id] = { gameName, playerName };
            socket.emit('gameJoined', gameName, playerName);
            console.log(`${playerName} joined game: ${gameName}`);
        } else {
            socket.emit('gameJoinError', 'Game is full or does not exist');
        }
    });

    socket.on('disconnect', () => {
        if (players[socket.id]) {
            const { gameName, playerName } = players[socket.id];
            if (games[gameName]) {
                games[gameName].players = games[gameName].players.filter(player => player !== playerName);
                if (games[gameName].players.length === 0) {
                    delete games[gameName];
                }
            }
            delete players[socket.id];
        }
        console.log('Player disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
