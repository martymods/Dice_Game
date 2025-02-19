// adminPointControl.js

const API_BASE_URL = 'https://dice-game-1-6iwc.onrender.com'; // Your actual backend URL

//server-side authentication system
const ADMIN_PASSWORD = "logon215"; // Change this to a secure password!

function authenticateAdmin() {
    const enteredPassword = prompt("Enter Admin Password:");
    if (enteredPassword !== ADMIN_PASSWORD) {
        alert("Access Denied!");
        window.location.href = "/"; // Redirect to home if wrong password
    }
}

// Ensure authentication on page load
document.addEventListener("DOMContentLoaded", authenticateAdmin);


// Function to update player points
async function updatePlayerPoints() {
    const wallet = document.getElementById('wallet-address-input').value.trim();
    const amount = parseInt(document.getElementById('points-amount').value, 10);

    if (!wallet || isNaN(amount)) {
        alert('Please enter a valid wallet address and amount.');
        return;
    }

    const response = await fetch(`${API_BASE_URL}/updatePoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, amount })
    });

    const data = await response.json();
    if (data.success) {
        alert('Points updated successfully!');
    } else {
        alert('Error updating points.');
    }
}

document.getElementById('update-points-btn').addEventListener('click', updatePlayerPoints);
