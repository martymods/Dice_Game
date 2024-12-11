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
    let months = 1; // Track months in the game
    let rollsLeft = maxTurns;
    let items = [];
    const availableItems = [
        { name: 'Loaded Dice', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3.', emoji: '🎲' },
        { name: 'Forged Papers', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.', emoji: '📜' },
        { name: 'Old Gang Leader’s Blade', rarity: 'Very Rare', cost: 200, description: 'Yields DreamCoins +9 each spin.', emoji: '🗡️' }
    ];

    // Get DOM elements
    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const monthCounter = document.getElementById('month-counter');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const buyItemButton = document.getElementById('buyItemButton');
    const itemPopup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');

    // Ensure required elements exist
    const requiredElements = [rollButton, betButton, quitButton, bettingStatus, gameStatus, rentStatus, bet25Button, bet50Button, bet100Button, monthCounter, itemPopup, itemList];
    for (let element of requiredElements) {
        if (!element) {
            console.error('One or more required elements are missing in the DOM.');
            return;
        }
    }

    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
    rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${rollsLeft} rolls`;
    monthCounter.textContent = `Month: ${months}`;

    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';

    // Event listeners
    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            // 2-second dice roll animation
            animateDiceRoll();

            setTimeout(() => {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                const sum = dice1 + dice2;

                // Update dice images
                document.getElementById('dice1').src = `/images/dice${dice1}.png`;
                document.getElementById('dice2').src = `/images/dice${dice2}.png`;

                // Win or loss conditions
                if (sum === 7 || sum === 11) {
                    balance += currentBet * 2; // Win doubles the bet
                    gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                    gameStatus.style.color = 'green';
                    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
                } else if (sum === 2 || sum === 3 || sum === 12) {
                    balance -= currentBet; // Loss deducts the bet
                    gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                    gameStatus.style.color = 'red';
                    bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
                    if (balance <= 0) {
                        alert('Game Over. Your balance is $0.');
                        quitGame();
                    }
                } else {
                    gameStatus.textContent = `Roll: ${sum}`;
                }

                currentBet = 0; // Reset the bet
                turns++;
                rollsLeft--; // Decrease rolls

                if (turns >= maxTurns) {
                    if (balance >= rent) {
                        rent = progression < 9 ? rent * 5 : rent * 6;
                        maxTurns = Math.min(maxTurns + 1, 12);
                        rentStatus.textContent = `Rent Due: $${rent.toLocaleString()} in ${maxTurns} rolls`;
                        rollsLeft = maxTurns;
                        progression++;
                        months++; // Increase month after rent is paid
                        monthCounter.textContent = `Month: ${months}`;
                        alert(`You paid the rent! Rent has increased! Now the landlord demands more!`);
                        showItemPopup();
                    } else {
                        alert('Game Over. You could not pay the rent.');
                        quitGame();
                    }
                }
            }, 2000);
        } else {
            alert('Place a bet first!');
        }
    });

    betButton.addEventListener('click', () => placeBet());
    bet25Button.addEventListener('click', () => setBet(0.25 * balance));
    bet50Button.addEventListener('click', () => setBet(0.5 * balance));
    bet100Button.addEventListener('click', () => {
        setBet(balance);
        if (currentBet === balance && balance <= 0) {
            alert('Game Over. You lost all your money.');
            quitGame();
        }
    });

    buyItemButton.addEventListener('click', () => buyItem());
    quitButton.addEventListener('click', quitGame);

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
        } else {
            currentBet = betAmount;
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
    }

    function showItemPopup() {
        itemPopup.style.display = 'block';
        itemList.innerHTML = '';
        
        availableItems.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.emoji} ${item.name} - $${item.cost.toLocaleString()}`;
            const itemDescription = document.createElement('p');
            itemDescription.textContent = item.description;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
            itemList.appendChild(itemDescription);
        });
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            items.push(item);
            alert(`You bought ${item.name}!`);
            itemPopup.style.display = 'none';
            bettingStatus.textContent = `Balance: $${balance.toLocaleString()} | Bet: $${currentBet.toLocaleString()}`;
        } else {
            alert('Not enough balance to buy this item.');
        }
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }

    function animateDiceRoll() {
        // Add your 2-second dice animation logic here to create a suspenseful rolling effect.
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');

        dice1.style.animation = 'rotateDice 1s infinite';
        dice2.style.animation = 'rotateDice 1s infinite';

        setTimeout(() => {
            dice1.style.animation = '';
            dice2.style.animation = '';
        }, 2000);
    }
}

