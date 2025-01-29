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

document.getElementById('heads-button').addEventListener('click', function () {
    document.getElementById('heads-img').src = "/images/HT_Button2.png";
    setTimeout(() => {
        document.getElementById('heads-img').src = "/images/HT_Button1.png";
    }, 2000); // Change back after 2 seconds
});

document.getElementById('tails-button').addEventListener('click', function () {
    document.getElementById('tails-img').src = "/images/HT_Button2.png";
    setTimeout(() => {
        document.getElementById('tails-img').src = "/images/HT_Button1.png";
    }, 2000); // Change back after 2 seconds
});
