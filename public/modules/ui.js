// ui.js

export function updateUI(balance, rent, turns, maxTurns, currentBet) {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
}

export function showItemPopup(items) {
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');

    popup.style.display = 'block';
    itemList.innerHTML = '';

    items.forEach(item => {
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.onclick = () => {
            alert(`You purchased ${item.name}!`);
        };
        itemList.appendChild(itemButton);
    });
}
