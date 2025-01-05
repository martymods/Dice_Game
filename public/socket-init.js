// socket-init.js
const socket = io(); // Uses the globally available `io` object from the script tag
window.socket = socket; // Expose `socket` globally
