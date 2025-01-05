// socket-init.js
const socket = io(); // Initialize the socket
window.socket = socket; // Expose globally

// Add debug logs for clarity
console.log('Socket initialized in socket-init.js:', socket);
