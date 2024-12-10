const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const games = [];

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/game.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "game.html"));
});

app.get("/available-games", (req, res) => {
    res.json(games);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
