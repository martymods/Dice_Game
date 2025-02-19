// adminPointControl.js

const API_BASE_URL = '/modules'; // Adjust with your actual backend API path

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
