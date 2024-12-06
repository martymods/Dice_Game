const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

let games = {}; // Store games for multiplayer
let players = {}; // Store player data for each game

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createGame', (data) => {
    const gameId = `${socket.id}-${Date.now()}`;
    games[gameId] = {
      host: socket.id,
      players: [data.name],
    };
    socket.join(gameId);
    io.to(gameId).emit('gameCreated', { gameId, name: data.name });
  });

  socket.on('joinGame', (data) => {
    const { gameId, name } = data;
    if (games[gameId]) {
      games[gameId].players.push(name);
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', { players: games[gameId].players });
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('rollDice', (data) => {
    const { gameId } = data;
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    // Send roll results to everyone in the game
    io.to(gameId).emit('diceRolled', { dice1, dice2, total });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Remove player and game logic
    for (let gameId in games) {
      games[gameId].players = games[gameId].players.filter(
        (player) => player !== socket.id
      );
      if (games[gameId].players.length === 0) {
        delete games[gameId];
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
