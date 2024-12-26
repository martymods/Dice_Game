// ui.js

/**
 * Updates the UI elements for balance, rent, and turns remaining.
 */
export function updateUI(balance, rent, turns, maxTurns, currentBet) {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
}

/**
 * Updates the background image based on the number of rolls remaining.
 */
export function updateBackgroundImage(rollsRemaining, maxTurns) {
    if (rollsRemaining === maxTurns) {
        document.body.style.backgroundImage = "url('/images/LandLord0.png')";
    } else if (rollsRemaining <= maxTurns / 2 && rollsRemaining > 2) {
        document.body.style.backgroundImage = "url('/images/LandLord1.png')";
    } else if (rollsRemaining <= 2) {
        document.body.style.backgroundImage = "url('/images/LandLord2.png')";
    }
}

/**
 * Adds a flash effect to the screen with a given color.
 */
export function flashScreen(color) {
    const body = document.body;
    const originalBackgroundColor = getComputedStyle(body).backgroundColor;

    // Apply flash effect
    body.style.transition = 'background-color 0.2s ease';
    body.style.backgroundColor = color;
    setTimeout(() => {
        body.style.transition = 'background-color 0.5s ease';
        body.style.backgroundColor = originalBackgroundColor;
    }, 200);
}

/**
 * Displays a winning amount on the screen with an animation.
 */
export function showWinningAmount(amount) {
    const winAmountDiv = document.createElement('div');
    winAmountDiv.textContent = `+$${amount.toLocaleString()}`;
    winAmountDiv.style.position = 'absolute';
    winAmountDiv.style.top = '50%';
    winAmountDiv.style.left = '50%';
    winAmountDiv.style.transform = 'translate(-50%, -50%)';
    winAmountDiv.style.fontSize = '48px';
    winAmountDiv.style.color = 'limegreen';
    winAmountDiv.style.textShadow = '0 0 10px limegreen, 0 0 20px lime, 0 0 30px green';
    winAmountDiv.style.fontWeight = 'bold';
    winAmountDiv.style.transition = 'opacity 2s ease-out';
    winAmountDiv.style.opacity = '1';
    winAmountDiv.style.zIndex = '9999';

    document.body.appendChild(winAmountDiv);

    // Fade out and remove after 2 seconds
    setTimeout(() => {
        winAmountDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(winAmountDiv);
        }, 2000);
    }, 2000);
}

/**
 * Displays a losing amount on the screen with an animation.
 */
export function showLosingAmount(amount) {
    const loseAmountDiv = document.createElement('div');
    loseAmountDiv.textContent = `-$${amount.toLocaleString()}`;
    loseAmountDiv.style.position = 'absolute';
    loseAmountDiv.style.top = '50%';
    loseAmountDiv.style.left = '50%';
    loseAmountDiv.style.transform = 'translate(-50%, -50%)';
    loseAmountDiv.style.fontSize = '48px';
    loseAmountDiv.style.color = 'red';
    loseAmountDiv.style.textShadow = '0 0 10px red, 0 0 20px crimson, 0 0 30px darkred';
    loseAmountDiv.style.fontWeight = 'bold';
    loseAmountDiv.style.transition = 'opacity 2s ease-out';
    loseAmountDiv.style.opacity = '1';
    loseAmountDiv.style.zIndex = '9999';

    document.body.appendChild(loseAmountDiv);

    // Fade out and remove after 2 seconds
    setTimeout(() => {
        loseAmountDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loseAmountDiv);
        }, 2000);
    }, 2000);
}

/**
 * Updates the hustler inventory UI, including the list of hustlers and their effects.
 */
export function updateHustlerInventoryUI(hustlerInventory) {
    const hustlerList = document.getElementById('hustler-list');
    const hustlerEffectElement = document.getElementById('hustler-effects');
    const hustlerCountElement = document.getElementById('hustler-count');
    const maxHustlers = 5;

    // Update hustler list
    hustlerList.innerHTML = '';
    hustlerInventory.forEach((hustler, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${hustler.name} (${hustler.description}) 
            <button onclick="discardHustler(${index})">Discard</button>
        `;
        hustlerList.appendChild(li);
    });

    // Update active effects
    const activeEffects = hustlerInventory.map(hustler => hustler.effect).join(', ');
    hustlerEffectElement.textContent = activeEffects
        ? `Active Hustler Effects: ${activeEffects}`
        : 'Active Hustler Effects: None';

    // Update inventory count
    hustlerCountElement.textContent = `Max Hustlers: ${hustlerInventory.length}/${maxHustlers}`;
}

/**
 * Updates the hustler panel with currently active hustlers.
 */
export function updateHustlerPanel(hustlerInventory) {
    const hustlersDisplay = document.getElementById("hustlers-display");
    hustlersDisplay.innerHTML = "";

    hustlerInventory.forEach(hustler => {
        const hustlerElement = document.createElement("div");
        hustlerElement.classList.add("hustler");
        hustlerElement.textContent = hustler.name[0]; // Use the first letter or an emoji
        hustlerElement.setAttribute("data-description", hustler.description);
        hustlersDisplay.appendChild(hustlerElement);
    });
}

/**
 * Shows the item popup with a list of available items.
 */
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

/**
 * Toggles the visibility of the store UI.
 */
export function toggleStore(open) {
    const storeImage = document.getElementById('store-image');
    const buyItemContainer = document.getElementById('buy-item-container');

    if (open) {
        storeImage.src = '/images/Store0.gif';
        setTimeout(() => {
            buyItemContainer.style.display = 'block';
        }, 1000);
    } else {
        buyItemContainer.style.display = 'none';
        storeImage.src = '/images/StoreSign_Closed0.gif';
    }
}
