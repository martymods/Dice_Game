// socket-init.js
const socket = io(); // Initialize the socket
window.socket = socket; // Expose globally

// Add debug logs for clarity
console.log('Socket initialized in socket-init.js:', socket);

if (!window.socket) {
    const socket = io(); // Initialize the socket
    window.socket = socket; // Expose globally
    console.log('Socket initialized in socket-init.js:', socket);
} else {
    console.log('Socket already initialized.');
}
