let pollVotes = { heads: 0, tails: 0 };

function updatePollBar() {
    const headsBar = document.getElementById('heads-bar');
    const tailsBar = document.getElementById('tails-bar');
    const totalVotes = pollVotes.heads + pollVotes.tails;

    if (totalVotes > 0) {
        headsBar.style.width = `${(pollVotes.heads / totalVotes) * 100}%`;
        tailsBar.style.width = `${(pollVotes.tails / totalVotes) * 100}%`;
    }
}

function triggerBackground(isWinner) {
    const body = document.body;
    body.style.backgroundImage = `url('${isWinner ? '/images/CoinToss_Winner.gif' : '/images/CoinToss_Loser.gif'}')`;
    setTimeout(() => {
        body.style.backgroundImage = "url('/images/Background_Loop.gif')";
    }, 3000); // Reset background after 3 seconds
}

// Call in Result Logic
triggerBackground(isWinner);


function displayShoutout(username) {
    const shoutout = document.createElement('div');
    shoutout.textContent = `Shoutout to @${username} for guessing correctly!`;
    shoutout.style.position = 'fixed';
    shoutout.style.top = '10px';
    shoutout.style.right = '10px';
    shoutout.style.backgroundColor = 'rgba(0,0,0,0.8)';
    shoutout.style.color = 'white';
    shoutout.style.padding = '10px';
    shoutout.style.borderRadius = '5px';
    document.body.appendChild(shoutout);
    setTimeout(() => {
        shoutout.remove();
    }, 3000);
}

// Example call
if (message.includes("Heads") && isWinner) {
    displayShoutout(message.username);
}

let winStreak = 0;

function checkForUnlocks(isWinner) {
    if (isWinner) winStreak++;
    else winStreak = 0;

    if (winStreak === 5) {
        console.log("Unlock Hidden Background!");
        document.body.style.filter = "hue-rotate(180deg)"; // Example effect
    }
}

// Call in Result Logic
checkForUnlocks(isWinner);

let flipCount = 0;

function celebrateMilestone() {
    if (flipCount % 100 === 0) {
        const milestone = document.createElement('div');
        milestone.textContent = `100 flips reached! 🎉`;
        milestone.style.position = 'fixed';
        milestone.style.top = '50%';
        milestone.style.left = '50%';
        milestone.style.transform = 'translate(-50%, -50%)';
        milestone.style.backgroundColor = 'gold';
        milestone.style.color = 'black';
        milestone.style.padding = '20px';
        milestone.style.borderRadius = '10px';
        document.body.appendChild(milestone);
        setTimeout(() => milestone.remove(), 3000);
    }
}

// Increment flip count in Result Logic
flipCount++;
celebrateMilestone();


function startCountdown(seconds) {
    const overlay = document.createElement('div');
    overlay.textContent = seconds;
    overlay.style.position = 'fixed';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.fontSize = '4rem';
    overlay.style.color = 'white';
    document.body.appendChild(overlay);

    let interval = setInterval(() => {
        seconds--;
        overlay.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            overlay.remove();
            flipCoin(); // Trigger coin flip
        }
    }, 1000);
}

// Call in Result Logic
startCountdown(3);

const headsButton = document.getElementById('heads-button');
const tailsButton = document.getElementById('tails-button');
const headsImg = document.getElementById('heads-img');
const tailsImg = document.getElementById('tails-img');

headsButton.addEventListener('click', function () {
    headsImg.src = "/images/HT_Button2.png"; // Change to clicked image
    tailsImg.src = "/images/HT_Button1.png"; // Reset tails
});

tailsButton.addEventListener('click', function () {
    tailsImg.src = "/images/HT_Button2.png"; // Change to clicked image
    headsImg.src = "/images/HT_Button1.png"; // Reset heads
});

async function placeETHBet() {
    const betAmount = document.getElementById('bet-amount').value;

    if (!betAmount || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    if (typeof window.ethereum === "undefined") {
        alert("MetaMask is required to place bets.");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const playerAddress = await signer.getAddress();

        console.log(`Placing bet: ${betAmount} ETH by ${playerAddress}`);

        const transaction = await signer.sendTransaction({
            to: playerAddress, // **Replace this with a smart contract address if needed**
            value: ethers.utils.parseEther(betAmount.toString())
        });

        console.log("Transaction sent:", transaction.hash);

        // **Wait for the transaction to be confirmed**
        await transaction.wait();

        console.log("Bet placed successfully!");

        // **Start the best-of-3 coin flip**
        startBestOfThreeFlip();

    } catch (error) {
        console.error("Error placing ETH bet:", error);
        alert("Transaction failed. Check console for details.");
    }
}

function startBestOfThreeFlip() {
    let flips = 0;
    let wins = 0;
    let losses = 0;

    function flipCoin() {
        const flipResult = Math.random() < 0.0833 ? "heads" : "tails"; // ~1/12 chance of winning
        const isWinner = userSelection === flipResult;

        if (isWinner) {
            wins++;
        } else {
            losses++;
        }

        flips++;

        console.log(`Flip ${flips}: ${flipResult} (${isWinner ? "Win" : "Lose"})`);

        // **If 3 flips are done, determine final outcome**
        if (flips === 3) {
            if (wins > losses) {
                alert("Congratulations! You won the best-of-3 flip!");
            } else {
                alert("You lost the best-of-3 flip. Better luck next time!");
            }
        } else {
            setTimeout(flipCoin, 2000); // Flip again after 2 seconds
        }
    }

    flipCoin();
}
