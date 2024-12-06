const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static("public"));

let games = {}; // Store active games

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("createGame", ({ gameName, playerName }) => {
        if (!games[gameName]) {
            games[gameName] = { players: {}, diceRolls: [] };
            console.log(`Game created: ${gameName}`);
        }
        games[gameName].players[socket.id] = playerName;
        socket.join(gameName);
        io.to(gameName).emit("updatePlayers", games[gameName].players);
    });

    socket.on("joinGame", ({ gameName, playerName }) => {
        if (games[gameName]) {
            games[gameName].players[socket.id] = playerName;
            socket.join(gameName);
            io.to(gameName).emit("updatePlayers", games[gameName].players);
        } else {
            socket.emit("gameNotFound");
        }
    });

    socket.on("rollDice", ({ gameName }) => {
        const dice1 = Math.ceil(Math.random() * 6);
        const dice2 = Math.ceil(Math.random() * 6);
        const result = { dice1, dice2, total: dice1 + dice2 };

        games[gameName].diceRolls.push(result);
        io.to(gameName).emit("diceRolled", result);
    });

    socket.on("disconnect", () => {
        for (const gameName in games) {
            delete games[gameName].players[socket.id];
            io.to(gameName).emit("updatePlayers", games[gameName].players);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
