import { playSound } from './audio.js';
import { itemsList } from '/items.js'; // Ensure the correct relative path
import { ensureWalletConnection } from '/app.js';

console.log('Items List:', itemsList);

if (!itemsList || itemsList.length === 0) {
    console.error('itemsList is empty or not loaded.');
}


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
export function applyPurchasedItemEffects(purchasedItems = []) {
    if (!Array.isArray(purchasedItems)) {
        console.error('purchasedItems is not an array or is undefined.');
        purchasedItems = [];
    }
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
        document.body.style.backgroundImage = "url('/images/LandLord0.gif')";
    } else if (rollsRemaining <= maxTurns / 2 && rollsRemaining > 2) {
        document.body.style.backgroundImage = "url('/images/LandLord1.gif')";
    } else if (rollsRemaining <= 2) {
        document.body.style.backgroundImage = "url('/images/LandLord2.gif')";
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
 * Shows the item popup with a list of available items and calculates restocking fee dynamically.
 */
export function showItemPopup(balance, items, purchasedItems) {
    const popup = document.getElementById('buy-item-container');
    const itemList = document.getElementById('item-list');
    console.log('ItemList DOM:', itemList);

    if (!itemList) {
        console.error('item-list element not found. Ensure it exists in game.html.');
        return;
    }

    if (!items || items.length === 0) {
        console.error('No items available to show in the shop.');
        return;
    }

    const restockButton = document.getElementById('restockButton');
    const restockFeeElement = document.getElementById('restock-fee');
    const restockFee = Math.floor(balance * 0.15);

    popup.style.display = 'block';
    itemList.innerHTML = '';

    if (restockFeeElement) {
        restockFeeElement.textContent = `Restock Fee: $${restockFee.toLocaleString()}`;
    }

    const shuffledItems = (items.length ? items : [...itemsList])
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    console.log('Shuffled items:', shuffledItems);

    shuffledItems.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container');

        // Add item image
        const itemImage = document.createElement('img');
        const itemNameFormatted = item.name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
        itemImage.src = `/images/itemimage/${itemNameFormatted}.png`;
        itemImage.alt = item.name;
        itemImage.onerror = () => { itemImage.src = '/images/itemimage/Item_NoIcon.png'; }; // Fallback image
        itemImage.classList.add('item-image');

        // Create item button
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.style.backgroundColor = getItemColor(item.rarity);
        itemButton.classList.add('item-button');

        itemButton.onmouseenter = () => showItemDescription(item.description);
        itemButton.onmouseleave = hideItemDescription;

        itemButton.onclick = () => {
            handleItemPurchase(item, balance, purchasedItems);
            applyPurchasedItemEffects(purchasedItems);

            const voiceClips = ["/sounds/Lord_voice_0.ogg", "/sounds/Lord_voice_1.ogg", "/sounds/Lord_voice_2.ogg"];
            playSound(voiceClips, true);
        };

        // Append image and button to the container
        itemContainer.appendChild(itemImage);
        itemContainer.appendChild(itemButton);

        itemList.appendChild(itemContainer);
    });

    if (restockButton) {
        restockButton.onclick = () => {
            console.log('Restocking items...');
            handleRestock(balance, [...itemsList]);
        };
    } else {
        console.error('restockButton not found in the DOM.');
    }
}




/**
 * Handles restocking items.
 */
/**
 * Handles restocking items by deducting 15% of the player's balance and updating the store.
 */
export function handleRestock(balance, items) {
    const restockFee = Math.floor(balance * 0.15); // 15% of the player's balance

    if (balance >= restockFee) {
        balance -= restockFee;
        console.log('Restocking items. Remaining balance:', balance);

        // Shuffle and regenerate new items
        const newItems = items.sort(() => Math.random() - 0.5).slice(0, 3);
        updateStoreUI(newItems, balance); // Update the store UI
        alert(`Restocked items for $${restockFee.toLocaleString()}!`);
    } else {
        alert('Not enough money to restock!');
    }
}

/**
 * Updates the store UI with new items and balance.
 */
function updateStoreUI(items, balance) {
    const itemList = document.getElementById('item-list');
    const balanceDisplay = document.getElementById('balance-display');

    // Clear the current item list
    itemList.innerHTML = '';

    // Update the balance display
    if (balanceDisplay) {
        balanceDisplay.textContent = `$${balance.toLocaleString()}`;
    }

    // Add new items to the store
    items.forEach(item => {
        // Create a container for the item
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container'); // Add a custom class for styling

        // Create the item image
        const itemImage = document.createElement('img');
        itemImage.src = `/images/itemimage/${item.name.replace(/\s/g, '')}.png`;
        itemImage.alt = item.name;
        itemImage.classList.add('item-image'); // Custom class for styling
        itemImage.onerror = () => (itemImage.src = '/images/itemimage/Item_NoIcon.png'); // Fallback image

        // Create the item button
        const itemButton = document.createElement('button');
        itemButton.textContent = `${item.emoji || '❓'} ${item.name} (${item.rarity}) - $${item.cost.toLocaleString()}`;
        itemButton.style.backgroundColor = getItemColor(item.rarity);
        itemButton.classList.add('item-button');

        // Add event listeners for hover effects
        itemButton.onmouseenter = () => showItemDescription(item.description);
        itemButton.onmouseleave = hideItemDescription;

        // Add click functionality for purchasing items
        itemButton.onclick = () => {
            handleItemPurchase(item, balance, purchasedItems);
            updatePurchasedItemsDisplay(purchasedItems);
        };

        // Append the image and button to the container
        itemContainer.appendChild(itemImage);
        itemContainer.appendChild(itemButton);

        // Add the container to the item list
        itemList.appendChild(itemContainer);
    });
}



/**
 * Displays the item description.
 */
function showItemDescription(description) {
    const descriptionDiv = document.getElementById('item-description');
    if (descriptionDiv) {
        descriptionDiv.textContent = description;
        descriptionDiv.style.display = 'block';
    }
}

/**
 * Hides the item description.
 */
function hideItemDescription() {
    const descriptionDiv = document.getElementById('item-description');
    if (descriptionDiv) {
        descriptionDiv.style.display = 'none';
    }
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
 * Updates the display for purchased items with images and hover descriptions.
 */
export function updatePurchasedItemsDisplay(items = []) {
    const purchasedItemsDisplay = document.getElementById('purchased-items-display');

    if (!Array.isArray(items)) {
        console.error('updatePurchasedItemsDisplay received an invalid items array.');
        return;
    }

    // Array of hover sound file paths
    const hoverSounds = [
        '/sounds/itemHover0.ogg',
        '/sounds/itemHover1.ogg',
        '/sounds/itemHover2.ogg',
        '/sounds/itemHover3.ogg',
        '/sounds/itemHover4.ogg',
        '/sounds/itemHover5.ogg',
    ];

    items.forEach(item => {
        // Check if the item is already displayed
        const existingItem = Array.from(purchasedItemsDisplay.children).find(child => 
            child.getAttribute('data-item-name') === item.name
        );

        if (!existingItem) {
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('purchased-item');
            itemContainer.setAttribute('data-item-name', item.name); // Add name as data-attribute
            itemContainer.setAttribute('data-item-description', item.description || 'No description available.'); // Add description as data-attribute

            // Add item image
            const itemImage = document.createElement('img');
            const itemNameFormatted = item.name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
            itemImage.src = `/images/itemimage/${itemNameFormatted}.png`;
            itemImage.alt = item.name;
            itemImage.onerror = () => { itemImage.src = '/images/itemimage/Item_NoIcon.png'; };
            itemImage.classList.add('item-image');

            // Add hover event to play a random sound
            itemContainer.addEventListener('mouseenter', () => {
                const randomSound = hoverSounds[Math.floor(Math.random() * hoverSounds.length)];
                const audio = new Audio(randomSound);
                audio.play().catch(err => console.error('Error playing hover sound:', err));
            });

            // Add item label
            const itemLabel = document.createElement('span');
            itemLabel.textContent = item.name;

            itemContainer.appendChild(itemImage);
            itemContainer.appendChild(itemLabel);

            purchasedItemsDisplay.appendChild(itemContainer);
        }
    });

    console.log('Purchased Items Display Updated:', items);
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

    // Add the $ symbol as the first image
    const dollarSignImage = document.createElement('img');
    dollarSignImage.src = '/images/Font_Number_$.gif'; // Update path if needed
    dollarSignImage.alt = '$';
    dollarSignImage.style.width = '50px'; // Match CSS
    dollarSignImage.style.height = 'auto';
    balanceDisplay.appendChild(dollarSignImage);

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

    // Update earnings per second
    setEarningsPerSecondFromBalance(balance);
}

let lastBalance = 0; // Track the last balance

function setEarningsPerSecondFromBalance(currentBalance) {
    const earningsCounterElement = document.getElementById("earnings-per-second");
    if (!earningsCounterElement) {
        console.warn("Earnings counter element not found. Skipping setEarningsPerSecondFromBalance.");
        return;
    }
    const timeInterval = 1; // Interval in seconds for calculations
    const earnings = (currentBalance - lastBalance) / timeInterval;
    lastBalance = currentBalance; // Update last balance for next calculation
    animateEarningsCounter(earnings, parseFloat(earningsCounterElement.textContent) || 0);
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
    // Check if the modal elements exist before initializing
    const showCombinationsButton = document.getElementById('showCombinationsButton');
    const combinationsModal = document.getElementById('combinationsModal');
    const closeCombinationsButton = document.getElementById('closeCombinationsButton');

    if (!showCombinationsButton || !combinationsModal || !closeCombinationsButton) {
        console.warn('Combination modal elements are not present. Skipping initialization.');
        return; // Exit the function early if elements are missing
    }

    // Show the combinations modal when the button is clicked
    showCombinationsButton.addEventListener('click', () => {
        populateCombinationsModal(); // Populate modal with content
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
}


/**
 * Populates the combinations modal with rules and dice images.
 */
let rollCounts = {
    win: { '1-6': 0, '2-5': 0, '3-4': 0, '4-3': 0, '5-2': 0, '6-1': 0, '5-6': 0, '6-5': 0 },
    lose: { '1-1': 0, '1-2': 0, '2-1': 0, '6-6': 0, '5-5': 0, '1-3': 0 }
};

function populateCombinationsModal() {
    const modalContent = document.querySelector('#combinationsModal .modal-content');
    if (!modalContent) {
        console.error('Modal content element is missing.');
        return;
    }

    // Clear existing content
    modalContent.innerHTML = '';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Dice Combinations Rules';
    modalContent.appendChild(title);

    // Add rules
    const rules = document.createElement('ul');
    rules.innerHTML = `
        <li><strong>The Come-Out Roll:</strong> The shooter rolls both dice. The outcome determines the next steps:</li>
        <li><strong>Win:</strong> If the shooter rolls a <span style="color: green;">7</span> or <span style="color: green;">11</span>, they win.</li>
        <li><strong>Lose:</strong> If the shooter rolls a <span style="color: red;">2</span>, <span style="color: red;">3</span>, or <span style="color: red;">12</span>, they lose.</li>
    `;
    modalContent.appendChild(rules);

    // Add visual combinations
    const combinationsSection = document.createElement('div');
    combinationsSection.style.display = 'flex';
    combinationsSection.style.flexDirection = 'column';
    combinationsSection.style.alignItems = 'center';
    modalContent.appendChild(combinationsSection);

    // Define winning and losing combinations
    const combinations = {
        win: [[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1], [5, 6], [6, 5]],
        lose: [[1, 1], [1, 2], [2, 1], [6, 6], [5, 5], [1, 3]],
    };

    // Add winning combinations
    const winTitle = document.createElement('h3');
    winTitle.textContent = 'Winning Rolls (7, 11):';
    combinationsSection.appendChild(winTitle);

    const winRow = document.createElement('div');
    winRow.style.display = 'flex';
    winRow.style.justifyContent = 'center';
    winRow.style.flexWrap = 'wrap';
    combinationsSection.appendChild(winRow);

    combinations.win.forEach(([dice1, dice2]) => {
        const pair = createDicePairElement(dice1, dice2, rollCounts.win);
        winRow.appendChild(pair);
    });

    // Add losing combinations
    const loseTitle = document.createElement('h3');
    loseTitle.textContent = 'Losing Rolls (2, 3, 12):';
    combinationsSection.appendChild(loseTitle);

    const loseRow = document.createElement('div');
    loseRow.style.display = 'flex';
    loseRow.style.justifyContent = 'center';
    loseRow.style.flexWrap = 'wrap';
    combinationsSection.appendChild(loseRow);

    combinations.lose.forEach(([dice1, dice2]) => {
        const pair = createDicePairElement(dice1, dice2, rollCounts.lose);
        loseRow.appendChild(pair);
    });
}

/**
 * Creates a visual representation of a dice pair with roll count.
 * @param {number} dice1 - First dice value.
 * @param {number} dice2 - Second dice value.
 * @param {object} rollCounts - Object to track roll counts for the combination.
 * @returns {HTMLElement} A div element containing the dice images and count.
 */
function createDicePairElement(dice1, dice2, rollCounts) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.margin = '10px';
    container.style.border = '2px solid white';
    container.style.borderRadius = '10px';
    container.style.padding = '10px';
    container.style.backgroundColor = '#f4f4f4';

    const img1 = document.createElement('img');
    img1.src = `/images/dice${dice1}.gif`;
    img1.alt = `Dice ${dice1}`;
    img1.style.width = '40px';

    const img2 = document.createElement('img');
    img2.src = `/images/dice${dice2}.gif`;
    img2.alt = `Dice ${dice2}`;
    img2.style.width = '40px';

    const combinationKey = `${dice1}-${dice2}`;
    const count = rollCounts[combinationKey] || 0; // Default to 0 if no count exists

    const countDisplay = document.createElement('span');
    countDisplay.textContent = `Rolled: ${count} times`;
    countDisplay.style.marginTop = '5px';
    countDisplay.style.fontSize = '14px';
    countDisplay.style.color = '#333';

    container.appendChild(img1);
    container.appendChild(img2);
    container.appendChild(countDisplay);

    return container;
}

/**
 * Call this function to update the counts whenever a roll occurs.
 */
const dicerollCounts = {}; // Global object to store roll counts

export function updateRollCount(dice1, dice2) {
    const key = `${dice1},${dice2}`;
    if (!rollCounts[key]) {
        rollCounts[key] = 0;
    }
    rollCounts[key]++;
}

export function getRollCounts() {
    return rollCounts; // Optional: To retrieve the roll counts
}


document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('toggle-chat');
    const chatContainer = document.getElementById('chat-container');

    if (chatButton && chatContainer) {
        chatButton.addEventListener('click', () => {
            console.log('Chat button clicked (ui.js)');

            // Toggle the 'chat-minimized' class
            chatContainer.classList.toggle('chat-minimized');

            // Adjust visibility based on the current state
            if (chatContainer.classList.contains('chat-minimized')) {
                chatContainer.style.height = '50px'; // Minimized height
            } else {
                chatContainer.style.height = '400px'; // Expanded height
            }
        });

        // Ensure chat is initialized as visible when entering the main menu
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu && mainMenu.style.display === 'flex') {
            chatContainer.classList.remove('chat-minimized');
            chatContainer.style.height = '400px'; // Fully expanded by default
        }
    }
});



// Ensure the function is called when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCombinationsModal();
});


// Ensure the function is called when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCombinationsModal();
});



// Show/Hide Lottery Modal
function toggleLotteryModal() {
    const modal = document.getElementById('lottery-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    } else {
        console.error('Lottery modal element not found.');
    }
}

// Attach it to the global scope
window.toggleLotteryModal = toggleLotteryModal;


// Attach to Lotto Icon
document.addEventListener('DOMContentLoaded', () => {
    const lottoIcon = document.getElementById('lotto-icon');
    if (lottoIcon) {
        lottoIcon.addEventListener('click', toggleLotteryModal);
    } else {
        console.log('Lotto icon not found. Skipping lottery functionality.');
    }
});

/**
 * Fetches the current Ethereum price in USD and updates relevant elements in the UI.
 */
async function fetchEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        const ethToUsd = data.ethereum.usd;

        // Update ETH price display if the element exists
        const ethPriceDisplay = document.getElementById('eth-price-display');
        if (ethPriceDisplay) {
            ethPriceDisplay.textContent = `1 ETH = $${ethToUsd.toFixed(2)}`;
        }

        // Update the pot in USD if the element exists
        const potElement = document.getElementById('current-pot-usd');
        if (potElement) {
            const potInEth = parseFloat(potElement.dataset.eth || 0); // Use data attribute or default to 0
            potElement.textContent = `$${(potInEth * ethToUsd).toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error fetching ETH price:', error);
    }
}



// Add dynamic ETH price conversion for $2 equivalent
async function getEthForUsd(usd) {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        const ethPriceInUsd = data.ethereum.usd;
        return (usd / ethPriceInUsd).toFixed(8); // Return ETH equivalent of the USD amount
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        alert('Unable to fetch ETH price. Please try again later.');
        return null;
    }
}


// Updated buyLotteryTicket function
async function buyLotteryTicket() {
    console.log("Attempting to buy a lottery ticket...");

    // Ensure wallet connection before proceeding
    await ensureWalletConnection();

    if (!window.signer) {
        alert("Please connect your MetaMask wallet first.");
        return;
    }

    console.log("Signer is ready:", window.signer);

    const ticketNumber = document.getElementById('ticket-number').value;
    if (!ticketNumber || ticketNumber < 1 || ticketNumber > 50000) {
        alert('Please pick a valid number between 1 and 50,000.');
        return;
    }

    // Calculate $2 worth of ETH dynamically
    const ethForTwoUsd = await getEthForUsd(2);
    if (!ethForTwoUsd) return;

    try {
        const tx = await window.signer.sendTransaction({
            to: "0x5638c9f84361a7430b29a63216f0af0914399eA2", // Replace with your wallet address
            value: ethers.utils.parseEther(ethForTwoUsd),
        });

        const ticket = {
            number: ticketNumber,
            date: new Date(),
            price: ethForTwoUsd,
            txHash: tx.hash,
        };

        alert('Ticket purchased successfully!');
        addTicketToUser(ticket);
        addTicketToRecent(ticket);
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('Transaction failed. Please try again.');
    }
}


function updatePotDisplay(pot) {
    const potElement = document.getElementById('current-pot');
    const potUsdElement = document.getElementById('current-pot-usd');

    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        .then((res) => res.json())
        .then((data) => {
            const ethToUsd = data.ethereum.usd;
            potUsdElement.textContent = (pot * ethToUsd).toFixed(2);
            potElement.textContent = pot.toFixed(4);
        })
        .catch((err) => console.error('Error fetching ETH price:', err));
}

// Add Ticket to User's List
function addTicketToUser(ticket) {
    const userTickets = document.getElementById('user-tickets');
    const ticketDiv = document.createElement('div');
    ticketDiv.textContent = `Number: ${ticket.number} - Bought: ${ticket.date.toLocaleString()} - Price: ${ticket.price} ETH`;
    userTickets.appendChild(ticketDiv);
}

// Add Ticket to Recent List
function addTicketToRecent(ticket) {
    const recentTickets = document.getElementById('recent-tickets');
    const ticketDiv = document.createElement('div');
    ticketDiv.textContent = `Number: ${ticket.number} - Bought: ${ticket.date.toLocaleString()} - Price: ${ticket.price} ETH`;
    recentTickets.appendChild(ticketDiv);
}



// Expose the function globally
window.buyLotteryTicket = buyLotteryTicket;

document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial ETH price
    fetchEthPrice();

    // Set up periodic updates
    setInterval(fetchEthPrice, 60000); // Update every minute
});


// Simple rules text
const simpleRules = `
1. Buy a ticket for $2 ETH each. Pick a number or get a random one.
2. Every Sunday, a winning number is chosen from 1 to 50,000.
3. If your number matches, you win the pot! You'll get a notification and your prize in your wallet.
4. If multiple people win, the pot is split among them.
5. If no one wins, the pot carries over to the next week. Tickets only last one week.
6. After a win, the pot starts with $3000 added by the bank.
7. From each ticket sold, $1 goes to the pot, and $1 goes to the bank.
`;

// Show the rules modal
function showRules() {
    const rulesModal = document.createElement('div');
    rulesModal.style.position = 'fixed';
    rulesModal.style.top = '0';
    rulesModal.style.left = '0';
    rulesModal.style.width = '100%';
    rulesModal.style.height = '100%';
    rulesModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    rulesModal.style.color = '#fff';
    rulesModal.style.display = 'flex';
    rulesModal.style.flexDirection = 'column';
    rulesModal.style.justifyContent = 'center';
    rulesModal.style.alignItems = 'center';
    rulesModal.style.zIndex = '1003';
    rulesModal.style.padding = '20px';
    rulesModal.style.textAlign = 'center';

    // Add the rules text
    const rulesText = document.createElement('p');
    rulesText.textContent = simpleRules;
    rulesText.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
    rulesText.style.marginBottom = '20px';
    rulesModal.appendChild(rulesText);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '10px 20px';
    closeButton.style.fontSize = '16px';
    closeButton.style.backgroundColor = '#28a745';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(rulesModal);
    });

    rulesModal.appendChild(closeButton);
    document.body.appendChild(rulesModal);
}

// Attach the rules modal to the Info button
document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-button');
    if (infoButton) {
        infoButton.addEventListener('click', showRules);
    } else {
        console.log('Info button not found. Skipping rules modal setup.');
    }
});




async function fetchPot() {
    try {
        const response = await fetch('/pot');
        const data = await response.json();
        return data.pot; // Return the pot value
    } catch (error) {
        console.error('Error fetching pot:', error);
        return null; // Return null if fetching fails
    }
}

// ConnectMetaMask function to the new button
document.addEventListener('DOMContentLoaded', () => {
    const connectMetaMaskButton = document.getElementById('connect-metamask-lottery');

    if (connectMetaMaskButton) {
        connectMetaMaskButton.addEventListener('click', async () => {
            try {
                await connectMetaMask();
                alert("MetaMask connected successfully!");
            } catch (error) {
                console.error("Error connecting MetaMask:", error);
                alert("Failed to connect MetaMask. Please try again.");
            }
        });
    } else {
        console.error("Connect MetaMask button not found in the lottery widget.");
    }
});

// Initialize earnings-related variables
let earningsPerSecond = 0;
let currentEarningsValue = 0; // Current earnings per second


// Check if the earnings-per-second element exists before animating
function animateEarningsCounter(target, currentValue) {
    const earningsCounterElement = document.getElementById("earnings-per-second");
    if (!earningsCounterElement) {
        // Skip execution if the element is not found
        return;
    }

    const step = (target - currentValue) / 20; // Animation duration divided into steps
    let animationFrame = 0;

    const updateAnimation = () => {
        if (animationFrame < 20) {
            currentValue += step;
            earningsCounterElement.textContent = currentValue.toFixed(2);
            animationFrame++;
            requestAnimationFrame(updateAnimation);
        } else {
            earningsCounterElement.textContent = target.toFixed(2); // Final value
        }
    };

    updateAnimation();
}


// Exported function to set earnings per second
export function setEarningsPerSecond(value) {
    const earningsCounterElement = document.getElementById("earnings-per-second");
    if (!earningsCounterElement) {
        console.warn("Earnings counter element not found. Skipping setEarningsPerSecond.");
        return;
    }
    animateEarningsCounter(value, parseFloat(earningsCounterElement.textContent) || 0);
}

// Start a live update interval
setInterval(() => {
    currentEarningsValue += earningsPerSecond;
    animateEarningsCounter(currentEarningsValue, currentEarningsValue - earningsPerSecond); // Update incrementally
}, 1000);

function calculateEarningsPerSecond(currentBalance) {
    const timeInterval = 1; // Interval in seconds for calculations
    const earnings = (currentBalance - lastBalance) / timeInterval;
    lastBalance = currentBalance; // Update last balance for next calculation
    return earnings;
}

// Open High Roller
export function openHighRoller() {
    const modal = document.createElement('div');
    modal.id = 'high-roller-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.textAlign = 'center';

    modal.innerHTML = `
        <h2>Select a Game Mode</h2>
        <div id="game-mode-selection" style="display: flex; gap: 20px; justify-content: center;">
            <img src="/images/GameSelect0.png" alt="Mode 0" style="width: 150px; cursor: pointer;" data-mode="0" />
            <img src="/images/GameSelect1.png" alt="Heads or Tails" style="width: 150px; cursor: pointer;" data-mode="1" />
        </div>
        <button onclick="closeModal()" style="margin-top: 20px;">Close</button>
    `;

    document.body.appendChild(modal);

    // Attach event listeners dynamically
    const gameModeImages = modal.querySelectorAll('#game-mode-selection img');
    gameModeImages.forEach((img) => {
        img.addEventListener('click', (event) => {
            const mode = parseInt(event.target.getAttribute('data-mode'), 10);
            selectMode(mode);
        });
    });
}


export function closeModal() {
    const modal = document.getElementById('high-roller-modal');
    if (modal) modal.remove();
}

export function selectMode(mode) {
    if (mode === 1) {
        // Updated path to the correct location of headsOrTails.html
        window.location.href = '/modules/headsOrTails.html';
    } else {
        alert('This mode is under development.');
    }
    closeModal();
}


// Attach to the global scope
window.selectMode = selectMode;


document.addEventListener('DOMContentLoaded', () => {
    const headsOrTailsImage = document.querySelector('img[alt="Heads or Tails"]');
    if (headsOrTailsImage) {
        headsOrTailsImage.addEventListener('click', () => selectMode(1));
    } else {
        console.warn("Heads or Tails image not found in the DOM.");
    }
});
