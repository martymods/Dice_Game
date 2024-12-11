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
    let items = [];
    const availableItems = [
        { name: 'Loaded Dice', rarity: 'Common', cost: 50, description: 'Boosts rolls of 2 and 3.' },
        { name: 'Forged Papers', rarity: 'Common', cost: 100, description: 'Recruit 3 allies.' },
        { name: 'Old Gang Leader’s Blade', rarity: 'Very Rare', cost: 200, description: 'Yields DreamCoins +9 each spin.' },
        { name: 'Neighborhood OG’s Manual', rarity: 'Rare', cost: 150, description: 'Boosts payouts for specific symbols.' },
        { name: 'Barrel of Hustlers', rarity: 'Uncommon', cost: 180, description: 'Summon 7 Street Hustlers.' },
    ];

    const rollButton = document.getElementById('rollButton');
    const betButton = document.getElementById('betButton');
    const quitButton = document.getElementById('quitButton');
    const bettingStatus = document.getElementById('betting-status');
    const gameStatus = document.getElementById('gameStatus');
    const rentStatus = document.getElementById('rent-status');
    const bet25Button = document.getElementById('bet25Button');
    const bet50Button = document.getElementById('bet50Button');
    const bet100Button = document.getElementById('bet100Button');
    const buyItemButton = document.getElementById('buyItemButton');
    const itemPopup = document.getElementById('itemPopup');
    const itemList = document.getElementById('itemList');

    // Ensure elements exist before using them
    if (!rollButton || !betButton || !quitButton || !bettingStatus || !gameStatus || !rentStatus || !bet25Button || !bet50Button || !bet100Button || !buyItemButton || !itemPopup || !itemList) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;

    // Show buttons
    rollButton.style.display = 'inline-block';
    betButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    bet25Button.style.display = 'inline-block';
    bet50Button.style.display = 'inline-block';
    bet100Button.style.display = 'inline-block';
    buyItemButton.style.display = 'inline-block';

    rollButton.addEventListener('click', () => {
        if (currentBet > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;

            // Display dice
            document.getElementById('dice1').src = `/images/dice${dice1}.png`;
            document.getElementById('dice2').src = `/images/dice${dice2}.png`;

            // Logic for win/lose
            if (sum === 7 || sum === 11) {
                balance += currentBet * 2;  // Double bet on win
                gameStatus.textContent = `You win! 🎉 Roll: ${sum}`;
                showWinAmount(currentBet * 2); // Show winning amount
            } else if (sum === 2 || sum === 3 || sum === 12) {
                balance -= currentBet;  // Deduct bet on loss
                gameStatus.textContent = `You lose! 💔 Roll: ${sum}`;
                showLossAmount(currentBet); // Show loss amount
                if (balance <= 0) {
                    alert('Game Over. Your balance is $0.');
                    quitGame();
                }
            } else {
                gameStatus.textContent = `Roll: ${sum}`;
            }

            currentBet = 0;
            bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;

            turns++;
            if (turns >= maxTurns) {
                if (balance >= rent) {
                    rent = progression < 9 ? rent * 5 : rent * 6;
                    maxTurns = Math.min(maxTurns + 1, 12);
                    rentStatus.textContent = `Rent Due: $${rent} in ${maxTurns} rolls`;
                    turns = 0;
                    progression++;
                    alert(`You paid the rent! Rent has increased! Now, the landlord wants more money. You’re making too much money from dice — pay up!`);
                    showItemPopup();
                } else {
                    alert('Game Over. You could not pay the rent.');
                    quitGame();
                }
            }
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
            bettingStatus.textContent = `Balance: $${balance - currentBet} | Bet: $${currentBet}`;
        }
    }

    function setBet(amount) {
        if (amount > balance) amount = balance;
        currentBet = Math.floor(amount);
        bettingStatus.textContent = `Balance: $${balance - currentBet} | Bet: $${currentBet}`;
    }

    function showWinAmount(amount) {
        const winAmount = document.createElement('div');
        winAmount.textContent = `+ $${amount}`;
        winAmount.style.color = 'green';
        winAmount.style.fontWeight = 'bold';
        winAmount.style.fontSize = '1.5em';
        winAmount.style.position = 'absolute';
        winAmount.style.top = '10px';
        winAmount.style.left = '50%';
        winAmount.style.transform = 'translateX(-50%)';
        document.body.appendChild(winAmount);

        setTimeout(() => {
            document.body.removeChild(winAmount);
        }, 2000);
    }

    function showLossAmount(amount) {
        const lossAmount = document.createElement('div');
        lossAmount.textContent = `- $${amount}`;
        lossAmount.style.color = 'red';
        lossAmount.style.fontWeight = 'bold';
        lossAmount.style.fontSize = '1.5em';
        lossAmount.style.position = 'absolute';
        lossAmount.style.top = '10px';
        lossAmount.style.left = '50%';
        lossAmount.style.transform = 'translateX(-50%)';
        document.body.appendChild(lossAmount);

        setTimeout(() => {
            document.body.removeChild(lossAmount);
        }, 2000);
    }

    function showItemPopup() {
        itemPopup.style.display = 'block';
        itemList.innerHTML = '';
        
        availableItems.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = `${item.name} - $${item.cost}`;
            itemButton.onclick = () => handleItemPurchase(item);
            itemList.appendChild(itemButton);
        });
    }

    function handleItemPurchase(item) {
        if (balance >= item.cost) {
            balance -= item.cost;
            items.push(item);
            alert(`You bought ${item.name}!`);
            itemPopup.style.display = 'none';
            bettingStatus.textContent = `Balance: $${balance} | Bet: $${currentBet}`;
        } else {
            alert('Not enough balance to buy this item.');
        }
    }

    function quitGame() {
        console.log('Returning to the main menu...');
        window.location.href = '/';
    }
}
