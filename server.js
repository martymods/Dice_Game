const express = require('express');
const path = require('path');
const app = express();

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`Request for ${req.url}`);
    next();
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Main route for the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle joining the game
app.get('/game.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Route to handle the join game page
app.get('/join.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

// Start the server on port 10000
const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
