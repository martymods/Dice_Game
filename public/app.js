document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSinglePlayer = urlParams.has('singlePlayer');
    const roomName = urlParams.get('room');
    const playerName = urlParams.get('player');

    if (isSinglePlayer) {
        setupSinglePlayer();
    } else if (roomName && playerName) {
        setupMultiplayer(roomName, playerName);
    } else {
        console.error('Invalid game mode.');
    }
});

// Single Player Setup
function setupSinglePlayer() {
    console.log('Single Player mode active.');
    let balance = 300;
    let currentBet = 0;
    let turns = 0;
    let rent = 400;
    let maxTurns = 6;
    let progression = 1;
    let inventory = [];
    let hasPurchasedThisMonth = false;

    const availableItems = [
        { name: 'Loaded Dice 🎲', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3.' },
        { name: 'Forged Papers 📜', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.' },
        { name: 'Gang Leader’s Blade ⚔️', rarity: 'Very Rare', cost: 200, description: 'Yields DreamCoins +9 each spin.' },
        { name: 'OG’s Manual 📘', rarity: 'Rare', cost: 150, description: 'Boosts payouts for specific symbols.' },
        { name: 'Barrel of Hustlers 🍻', rarity: 'Uncommon', cost: 180, description: 'Summon 7 Street Hustlers.' },
    ];

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const inventoryDisplay = document.getElementById('inventory');
    const itemPopup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');
    const skipButton = document.getElementById('skipButton');

    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !inventoryDisplay || !itemPopup || !itemList || !skipButton) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;

            document.getElementById('dice1').src = `/images/dice${dice1}.png`;
            document.getElementById('dice2').src = `/images/dice${dice2}.png`;

            if (sum === 7 || sum === 11) {
                balance += currentBet * 2;
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet;
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                if (balance <= 0) {
                    alert('Game Over. Your balance is $0.');
                    showLeaderboard(balance);
                }
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            currentBet = 0;
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;

            turns++;
            maxTurns--;
            rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;

            if (maxTurns === 1) {
                rentStatus.style.color = 'orange';
                rentStatus.style.fontWeight = 'bold';
            } else {
                rentStatus.style.color = '';
                rentStatus.style.fontWeight = '';
            }

            if (turns % 3 === 0 && !hasPurchasedThisMonth) {
                showItemPopup();
            }

            if (maxTurns <= 0) {
                if (balance >= rent) {
                    balance -= rent;
                    rent = progression < 9 ? rent * 5 : rent * 6;
                    maxTurns = Math.min(maxTurns + 1, 12);
                    turns = 0;
                    progression++;
                    hasPurchasedThisMonth = false;
                    alert('You paid the rent! Rent has increased!');
                    showItemPopup();
                } else {
                    alert('Game Over. You could not pay the rent.');
                    showLeaderboard(balance);
                }
            }
        } else {
            alert('Place a bet first!');
        }
    });

    skipButton.addEventListener('click', () => {
        itemPopup.style.display = 'none';
    });

    function showItemPopup() {
        itemPopup.style.display = 'block';
        itemList.innerHTML = '';
        const itemsToShow = [...availableItems].sort(() => 0.5 - Math.random()).slice(0, 3);

        itemsToShow.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost.toLocaleString()}`;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            inventory.push(item);
            itemPopup.style.display = 'none';
            displayInventory();
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
        } else {
            alert('Not enough balance to buy this item.');
        }
    }

    function displayInventory() {
        inventoryDisplay.innerHTML = '';
        inventory.forEach(item => {
            const inventoryItem = document.createElement('div');
            inventoryItem.textContent = `${item.name}`;
            inventoryDisplay.appendChild(inventoryItem);
        });
    }

    quitButton.addEventListener('click', quitGame);

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }

    function showLeaderboard(finalScore) {
        // Implement leaderboard logic here
        alert(`Your final score: $${finalScore.toLocaleString()}`);
        quitGame();
    }
}

