const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/game.html", (req, res) => res.sendFile(path.join(__dirname, "public", "game.html")));

// Example endpoint for available games (You should implement multiplayer game management)
app.get("/available-games", (req, res) => {
    const games = [];  // Return a list of available games
    res.json(games);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

