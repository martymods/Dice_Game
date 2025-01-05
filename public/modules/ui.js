import { playSound } from './audio.js';
import { itemsList } from '/items.js'; // Ensure the correct relative path


// Global state for multipliers and effects
let activeEffects = [];
let currentMultiplier = 1;
let purchasedItems = []; // Proper initialization as an empty array

// Function to set default cursor
export function setDefaultCursor() {
    document.body.style.cursor = "url('/images/MouseCursor_0.png'), auto";
}

// Add hover event to buttons for animated cursor effect
const buttons = document.querySelectorAll('button');
buttons.forEach((button) => {
    button.addEventListener('mouseover', () => {
        button.style.cursor = "url('/images/MouseCursor_1.png'), pointer";
    });

    button.addEventListener('mouseout', () => {
        setDefaultCursor(); // Revert to default cursor
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .button-image');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playHoverSound();
        });
    });
});

/**
 * Plays the default hover sound for buttons.
 */
function playHoverSound() {
    const hoverSound = new Audio('/sounds/Click_001.ogg');
    hoverSound.play().catch(err => console.error('Hover sound error:', err));
}



/**
 * Applies the effects of all purchased items.
 * Updates the multiplier and other game effects dynamically.
 */
export function applyPurchasedItemEffects(purchasedItems) {
    activeEffects = [];
    currentMultiplier = 1; // Reset multiplier

    purchasedItems.forEach(item => {
        // Remove emoji from item name if present
        const itemName = item.name.split(' ')[0];
        const effectFunctionName = `${itemName.toLowerCase()}Effect`;

        const effectFunction = window.itemEffects?.[effectFunctionName];
        if (typeof effectFunction === 'function') {
            const effect = effectFunction(item);

            // Update multiplier if effect contains multiplier
            if (effect.multiplier) {
                currentMultiplier *= effect.multiplier;
            }

            activeEffects.push({ name: item.name, effect });
        } else {
            console.error(`Missing effect function for item: ${item.name}`);
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
export function showItemPopup(balance, items, purchasedItems) {
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');
    const restockButton = document.getElementById('restockButton');

    popup.style.display = 'block';
    itemList.innerHTML = '';

    const shuffledItems = window.itemsList.sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffledItems.forEach(item => {
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.emoji || '❓'} ${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.style.backgroundColor = getItemColor(item.rarity);
        itemButton.classList.add('item-button');

        itemButton.onmouseenter = () => showItemDescription(item.description);
        itemButton.onmouseleave = hideItemDescription;

        itemButton.onclick = () => {
            handleItemPurchase(item, balance, purchasedItems); // Ensure it's passed here
            applyPurchasedItemEffects(purchasedItems); // Ensure it's passed here

            const voiceClips = ["/sounds/Lord_voice_0.ogg", "/sounds/Lord_voice_1.ogg", "/sounds/Lord_voice_2.ogg"];
            playSound(voiceClips, true);
        };

        itemList.appendChild(itemButton);
    });
}

/**
 * Handles restocking items.
 */
export function handleRestock(balance, restockFee, items) {
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

/**
 * Handles item purchase logic, deducting balance and adding the item to inventory.
 */
export function handleItemPurchase(item, balance, purchasedItems = []) {
    if (!Array.isArray(purchasedItems)) {
        purchasedItems = [];
    }

    if (balance >= item.cost) {
        balance -= item.cost; // Deduct item cost
        purchasedItems.push(item); // Add to inventory
        updatePurchasedItemsDisplay(purchasedItems); // Update inventory UI
        updateBalanceDisplay(balance); // Update balance display
        playSound("/sounds/UI_Buy1.ogg");
        alert(`You purchased ${item.name}!`);
        return { balance, purchasedItems };
    } else {
        alert("Not enough money to buy this item.");
        playSound("/sounds/UI_Error.ogg");
        return { balance, purchasedItems }; // Return unchanged values
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
export function addItemToPurchasedItems(item, purchasedItems = []) {
    if (!Array.isArray(purchasedItems)) {
        console.error('purchasedItems array is not initialized. Initializing now.');
        purchasedItems = [];
    }

    // Add the item to the array
    purchasedItems.push(item);
    console.log('Purchased Items:', purchasedItems); // Debugging: Verify the array contents

    // Apply effects and update the UI
    applyPurchasedItemEffects(purchasedItems);
    updatePurchasedItemsDisplay(purchasedItems);
}


/**
 * Updates the display for purchased items with emojis and hover descriptions.
 */
export function updatePurchasedItemsDisplay(items = []) {
    const purchasedItemsDisplay = document.getElementById('purchased-items-display');
    purchasedItemsDisplay.innerHTML = ''; // Clear previous items

    if (!Array.isArray(items)) {
        console.error('updatePurchasedItemsDisplay received an invalid items array.');
        return;
    }

    // Iterate through all items in the array
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('purchased-item');

        // Display the item's emoji
        itemElement.textContent = item.emoji || '❓';

        // Set hover description
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

    console.log('Purchased Items Display Updated:', items); // Debugging: Verify the display contents
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

/**
 * Updates the balance display using images for each digit.
 * @param {number} balance - The current balance to display.
 */
export function updateBalanceDisplay(balance) {
    const balanceDisplay = document.getElementById('balance-display');

    // Check if the display container exists
    if (!balanceDisplay) {
        console.error("Balance display container not found.");
        return;
    }

    // Clear the previous balance display
    balanceDisplay.innerHTML = '';

    // Convert the balance to a string and iterate over each digit
    const balanceString = balance.toString();
    for (const digit of balanceString) {
        // Create an image element for each digit
        const digitImage = document.createElement('img');
        digitImage.src = `/images/Font_Number_${digit}.gif`; // Adjust path if needed
        digitImage.alt = digit;
        digitImage.style.width = '40px'; // Adjust size
        digitImage.style.height = 'auto';
        digitImage.style.margin = '0 2px'; // Add spacing between digits

        // Append the image to the balance display
        balanceDisplay.appendChild(digitImage);
    }
}

// Chat functionality


document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('toggle-chat');
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            console.log('Chat button clicked (ui.js)');
            const chatContainer = document.getElementById('chat-container');
            chatContainer.classList.toggle('chat-expanded');
        });
    }
});

// Send a message
document.addEventListener('DOMContentLoaded', () => {
    const sendMessageButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');

    function handleSendMessage() {
        if (!window.socket) {
            console.error('Socket is not initialized.');
            return;
        }

        const message = messageInput?.value.trim();
        if (message) {
            console.log('Sending message:', message);
            window.socket.emit('sendMessage', message);
            messageInput.value = ''; // Clear the input field
        } else {
            console.error('Message is empty.');
        }
    }

    if (sendMessageButton) {
        // Remove any existing listener before adding a new one
        sendMessageButton.removeEventListener('click', handleSendMessage);
        sendMessageButton.addEventListener('click', handleSendMessage);
    } else {
        console.error('Send message button not found.');
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const socket = window.socket; // Access the global `socket`

    if (!socket) {
        console.error('Socket is not initialized. Ensure app.js is loaded before ui.js.');
        return;
    }

    // **Forcefully clear all existing listeners**
    socket.removeAllListeners(); // Completely unbind all listeners attached to this socket

    // Add fresh listeners
    socket.on('newMessage', ({ name, message }) => {
        const messageList = document.getElementById('message-list');
        if (messageList) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${name}: ${message}`;
            messageList.appendChild(messageDiv);
            messageList.scrollTop = messageList.scrollHeight; // Scroll to the latest message
        } else {
            console.error('message-list element not found in the DOM.');
        }
    });

    socket.on('playerUpdate', ({ players }) => {
        const playerNames = document.getElementById('player-names');
        if (!playerNames) {
            console.error("Element 'player-names' not found in the DOM.");
            return; // Exit early if the element is missing
        }
        playerNames.innerHTML = '';
        Object.values(players).forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            playerNames.appendChild(li);
        });
    });
});



// Update message list
socket.on('newMessage', ({ name, message }) => {
    console.log('Socket initialized in app.js:', socket);

    const messageList = document.getElementById('message-list');
    const div = document.createElement('div');
    div.textContent = `${name}: ${message}`;
    messageList.appendChild(div);
    messageList.scrollTop = messageList.scrollHeight; // Scroll to the latest message
});

socket.emit('test', 'Hello from Client');

socket.on('testReply', (data) => {
    console.log('Server reply:', data);
});

document.addEventListener('DOMContentLoaded', () => {
    const socket = window.socket;

    if (!socket) {
        console.error('Socket is not initialized. Ensure app.js is loaded before ui.js.');
        return;
    }

    socket.on('newMessage', ({ name, message }) => {
        console.log(`New message from ${name}: ${message}`);
        const messageList = document.getElementById('message-list');
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${name}: ${message}`;
        messageList.appendChild(messageDiv);
        messageList.scrollTop = messageList.scrollHeight; // Scroll to the bottom
    });
});


/**
 * Initializes and manages the combinations modal functionality.
 */
export function initializeCombinationsModal() {
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    if (showCombinationsButton && combinationsModal && closeCombinationsButton) {
        // Show the combinations modal when the button is clicked
        showCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'flex'; // Show the modal
        });

        // Hide the combinations modal when the close button is clicked
        closeCombinationsButton.addEventListener('click', () => {
            combinationsModal.style.display = 'none'; // Hide the modal
        });

        // Close the modal when clicking outside the modal content
        combinationsModal.addEventListener('click', (event) => {
            if (event.target === combinationsModal) {
                combinationsModal.style.display = 'none';
            }
        });
    } else {
        console.error('Combination modal elements are missing in the DOM.');
    }
}

// Ensure the function is called when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCombinationsModal();
});
