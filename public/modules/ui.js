import { playSound } from './audio.js';
import { itemsList } from '/items.js'; // Ensure the correct relative path


// Global state for multipliers and effects
let activeEffects = [];
let currentMultiplier = 1;

/**
 * Applies the effects of all purchased items.
 * Updates the multiplier and other game effects dynamically.
 */
export function applyPurchasedItemEffects(purchasedItems) {
    activeEffects = [];
    currentMultiplier = 1; // Reset multiplier

    purchasedItems.forEach(item => {
        const effectFunction = window.itemEffects?.[item.name + 'Effect'];
        if (typeof effectFunction === 'function') {
            const effect = effectFunction(item);

            // Update multiplier if effect contains multiplier
            if (effect.multiplier) {
                currentMultiplier *= effect.multiplier;
            }

            activeEffects.push({ name: item.name, effect });
        }
    });

    updateMultiplierUI(currentMultiplier); // Reflect the updated multiplier
}


/**
 * Updates the multiplier display in the UI.
 */
function updateMultiplierUI(multiplier) {
    const multiplierElement = document.getElementById('multiplier-display');
    if (multiplierElement) {
        multiplierElement.textContent = `Multiplier: ${multiplier.toFixed(2)}x`;
    }
}



/**
 * Updates the UI elements for balance, rent, and turns remaining.
 */
export function updateUI(balance, rent = 0, turns = 0, maxTurns = 0, currentBet = 0) {
    const bettingStatus = document.getElementById('betting-status');
    const rentStatus = document.getElementById('rent-status');

    if (bettingStatus) {
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet}`;
    }

    if (rentStatus) {
        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns - turns} rolls`;
    }
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
export function showItemPopup(balance, items) {
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');
    const restockButton = document.getElementById('restockButton'); // Ensure button exists in the DOM


    popup.style.display = 'block';
    itemList.innerHTML = ''; // Clear previous items

        // Calculate restock fee
        const restockFee = Math.ceil(balance * 0.08);

        // Update the "Restock" button text with the fee
        if (restockButton) {
            restockButton.textContent = `Restock ($${restockFee.toLocaleString()})`;
            restockButton.onclick = () => handleRestock(balance, restockFee, items);
        }

    // Ensure itemsList exists and has items
    if (!window.itemsList || window.itemsList.length === 0) {
        console.error("Items list is empty or not loaded.");
        alert("No items available to purchase. Please try again later.");
        return;
    }

    // Randomly select items from the itemsList
    const shuffledItems = window.itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffledItems.forEach(item => {
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.style.backgroundColor = getItemColor(item.rarity);
        itemButton.classList.add('item-button'); // Add a class for styling
        
        
        // Attach event listeners for hover
        itemButton.onmouseenter = () => showItemDescription(item.description);
        itemButton.onmouseleave = hideItemDescription;

        // Add click event for purchase
        itemButton.onclick = () => {
            handleItemPurchase(item, balance, items);

            // Play random Lord voice clip
            const voiceClips = ["/sounds/Lord_voice_0.ogg", "/sounds/Lord_voice_1.ogg", "/sounds/Lord_voice_2.ogg"];
            playSound(voiceClips, true);
        };
        itemList.appendChild(itemButton);
    });

}

/**
 * Handles restocking items.
 */
function handleRestock(balance, restockFee, items) {
    if (balance >= restockFee) {
        // Deduct the restock fee
        balance -= restockFee;

        // Regenerate the items in the popup
        showItemPopup(balance, items);

        // Update the UI to reflect the new balance
        updateUI(balance);

        // Play sound effect for restocking
        playSound("/sounds/UI_Restock.ogg");

        alert(`You restocked items for $${restockFee.toLocaleString()}!`);
    } else {
        alert("You don't have enough money to restock!");
        playSound("/sounds/UI_Error.ogg");
    }
}

/**
 * Displays the item description.
 */
function showItemDescription(description) {
    const descriptionDiv = document.getElementById('item-description');
    descriptionDiv.textContent = description;
    descriptionDiv.style.display = 'block'; // Show the description
}

/**
 * Hides the item description.
 */
function hideItemDescription() {
    const descriptionDiv = document.getElementById('item-description');
    descriptionDiv.style.display = 'none'; // Hide the description
}

// Shop Restore
export function handleItemPurchase(item, balance, purchasedItems) {
    if (balance >= item.cost) {
        // Deduct the item cost
        balance -= item.cost;

        // Add item to purchased items and trigger its effects
        addItemToPurchasedItems(item, purchasedItems);

        // Play purchase sound
        playSound("/sounds/UI_Buy1.ogg");

        // Notify the player
        alert(`You purchased ${item.name}!`);

        // Close the shop popup
        document.getElementById('buy-item-container').classList.toggle('hidden');

        // Update the UI elements
        updatePurchasedItemsDisplay(purchasedItems);
        updateUI(balance);

        // Return the updated balance and purchased items
        return { balance, purchasedItems };
    } else {
        // Not enough balance to buy the item
        alert('Not enough money to buy this item.');
        playSound("/sounds/UI_Error.ogg");
        return { balance, purchasedItems };
    }
}


// Shop Inventory
export function displayInventory(items) {
    const inventoryDisplay = document.getElementById('inventory-list');
    inventoryDisplay.innerHTML = items.map(item => `<li>${item.name} (${item.description})</li>`).join('');
}

// Get Item Color
export function getItemColor(rarity) {
    switch (rarity) {
        case 'Common': return 'gray';
        case 'Uncommon': return 'blue';
        case 'Rare': return 'purple';
        case 'Very Rare': return 'gold';
        case 'Legendary': return 'red';
        default: return 'white';
    }
}

/**
 * Handles adding a new item to the purchased items and applies its effects.
 */
export function addItemToPurchasedItems(item, purchasedItems) {
    purchasedItems.push(item);
    applyPurchasedItemEffects(purchasedItems);
    updatePurchasedItemsDisplay(purchasedItems);
}

// Update to display purchased items with emojis and hover descriptions
export function updatePurchasedItemsDisplay(items) {
    const purchasedItemsDisplay = document.getElementById('purchased-items-display');
    purchasedItemsDisplay.innerHTML = ''; // Clear previous items

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('purchased-item');

        // Use item.emoji if it exists, otherwise use the default ❓ emoji
        const itemEmoji = item.name.match(/[\p{Emoji}\uFE0F]/gu)?.[0] || '❓';
        itemElement.textContent = itemEmoji;

        // Set description for hover effect
        itemElement.setAttribute('data-description', item.description || 'No description available.');

        // Add hover effect to show description
        itemElement.addEventListener('mouseenter', () => {
            const descriptionDiv = document.getElementById('item-description');
            descriptionDiv.textContent = item.description || 'No description available.';
            descriptionDiv.style.display = 'block';
        });

        itemElement.addEventListener('mouseleave', () => {
            const descriptionDiv = document.getElementById('item-description');
            descriptionDiv.style.display = 'none';
        });

        purchasedItemsDisplay.appendChild(itemElement);
    });
}

/**
 * Displays a bonus earned from purchased item effects.
 */
export function displayBonusFromItems(bonus) {
    const bonusElement = document.createElement('div');
    bonusElement.textContent = `Bonus: $${bonus.toLocaleString()}`;
    bonusElement.style.position = 'absolute';
    bonusElement.style.top = '50%';
    bonusElement.style.left = '50%';
    bonusElement.style.transform = 'translate(-50%, -50%)';
    bonusElement.style.fontSize = '32px';
    bonusElement.style.color = 'gold';
    bonusElement.style.textShadow = '0 0 10px gold, 0 0 20px orange';
    bonusElement.style.zIndex = '9999';

    document.body.appendChild(bonusElement);

    setTimeout(() => {
        document.body.removeChild(bonusElement);
    }, 2000);
}


/**
 * Handles the game-over animations and transitions.
 */
export function handleGameOverScreen() {
    const gameOverContainer = document.getElementById('gameOverContainer');
    gameOverContainer.innerHTML = ''; // Clear previous content

    // Show GameOverEvicted.gif
    const evictedGif = document.createElement('img');
    evictedGif.src = '/images/GameOverEvicted.gif?v=1.0.1'; // Cache-busted URL
    evictedGif.alt = 'Game Over Evicted';
    evictedGif.style.position = 'fixed';
    evictedGif.style.top = '0';
    evictedGif.style.left = '0';
    evictedGif.style.width = '100%';
    evictedGif.style.height = '100%';
    evictedGif.style.objectFit = 'cover';
    evictedGif.style.zIndex = '9998';

    gameOverContainer.appendChild(evictedGif);
    gameOverContainer.style.display = 'block';

    // Replace with GameOverIdleScreen.png after 6 seconds
    setTimeout(() => {
        evictedGif.src = '/images/GameOverIdleScreen.png?v=1.0.1'; // Cache-busted URL
        evictedGif.alt = 'Game Over Idle Screen';
    }, 6000);
}
