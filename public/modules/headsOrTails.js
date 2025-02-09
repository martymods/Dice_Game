// Initialize WebSocket connection
window.socket = new WebSocket("ws://localhost:8181");

socket.onopen = () => {
    console.log("WebSocket connected!");
    setTimeout(() => {
        const message = {
            type: "bet",  // Ensure there is a type field if required by the server
            username: "TestUser",
            gift: "coins",
            value: 100,
            choice: "HEADS"
        };
        
        if (typeof socket !== "undefined" && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not connected.");
        }
        
    }, 1000);
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket closed!");
};

// Function to check if WebSocket is initialized before sending data
function sendBetData(username, gift, value, choice) {
    if (typeof socket === "undefined") {
        console.error("WebSocket is not initialized.");
    } else {
        socket.send(JSON.stringify({ username, gift, value, choice }));
    }
}

let pollVotes = { heads: 0, tails: 0 };
let leaderboard = [];
let bets = []; // Store all active bets
let userSelection = ""; // Global variable for tracking selection

socket.onmessage = (event) => {
    console.log("📩 Received WebSocket Message:", event.data);
    const data = JSON.parse(event.data);

    if (data.error) {
        console.error("⚠️ Server Error:", data.error);
        return;
    }

    if (data.command === "bet") {
        console.log("🎁 New Bet:", data);
        placeViewerBet(data.username, data.choice, data.value, data.profilePic);
    } else {
        console.warn("⚠️ Unrecognized command:", data.command);
    }
};


// ✅ Function to Place Viewer Bets
function placeViewerBet(username, choice, value, profilePic) {
    // Update Poll Votes
    pollVotes[choice]++;
    updatePollBar();

    // Store Bet
    bets.push({ username, choice, value, profilePic });

    console.log(`📊 ${username} bet ${value} points on ${choice}!`);

    // Update Leaderboard
    updateLeaderboard();
}

// ✅ Function to Update Live Poll Bar
function updatePollBar() {
    const totalVotes = pollVotes.heads + pollVotes.tails;
    if (totalVotes > 0) {
        document.getElementById('heads-bar').style.width = `${(pollVotes.heads / totalVotes) * 100}%`;
        document.getElementById('tails-bar').style.width = `${(pollVotes.tails / totalVotes) * 100}%`;
    }
}

// ✅ Function to Determine the Winner and Process Bets
function processBets() {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    console.log(`🎲 Coin Flip Result: ${result.toUpperCase()}`);

    triggerBackground(result);

    // Process Viewer Bets
    bets.forEach(bet => {
        if (bet.choice === result) {
            updatePlayerScore(bet.username, bet.value, bet.profilePic);
            console.log(`🎉 ${bet.username} won ${bet.value} points!`);
            displayShoutout(bet.username, bet.value);
        } else {
            console.log(`❌ ${bet.username} lost.`);
        }
    });

    // Reset Bets for Next Round
    bets = [];
}

// ✅ Function to Trigger Background Animation Based on Result
function triggerBackground(result) {
    const body = document.body;
    body.style.backgroundImage = `url('${result === "heads" ? '/images/CoinToss_Winner.gif' : '/images/CoinToss_Loser.gif'}')`;

    setTimeout(() => {
        body.style.backgroundImage = "url('/images/Background_Loop.gif')";
    }, 3000);
}

// ✅ Function to Update Leaderboard
function updateLeaderboard() {
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    const top5 = leaderboard.slice(0, 5);

    const leaderboardList = document.getElementById("leaderboard");
    leaderboardList.innerHTML = "";

    top5.forEach((player) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${player.profilePic}" alt="${player.username}" style="width: 40px; border-radius: 50%;">
            <strong>${player.username}</strong> - ${player.totalPoints} pts
        `;
        leaderboardList.appendChild(li);
    });
}

// ✅ Function to Update Player Score
function updatePlayerScore(username, points, profilePic) {
    let player = leaderboard.find(p => p.username === username);

    if (player) {
        player.totalPoints += points;
    } else {
        leaderboard.push({ username, totalPoints: points, profilePic });
    }

    updateLeaderboard();
}

// ✅ Function to Display Shoutouts for Big Wins
function displayShoutout(username, points) {
    const shoutout = document.createElement("div");
    shoutout.innerHTML = `🔥 @${username} won ${points} points!`;
    shoutout.style.position = "fixed";
    shoutout.style.top = "10px";
    shoutout.style.left = "50%";
    shoutout.style.transform = "translateX(-50%)";
    shoutout.style.padding = "10px";
    shoutout.style.background = "gold";
    shoutout.style.color = "black";
    shoutout.style.borderRadius = "5px";
    document.body.appendChild(shoutout);

    setTimeout(() => shoutout.remove(), 3000);
}

// ✅ Function to Start a Countdown Before Processing Bets
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
            processBets(); // Process bets after countdown
        }
    }, 1000);
}

// ✅ Start the Countdown Automatically on Load
startCountdown(3);

// ✅ Event Listeners for Player Selection
const headsButton = document.getElementById('heads-button');
const tailsButton = document.getElementById('tails-button');
const headsImg = document.getElementById('heads-img');
const tailsImg = document.getElementById('tails-img');

headsButton.addEventListener('click', function () {
    userSelection = "heads";
    headsImg.src = "/images/HT_Button2.png"; // Change to clicked image
    tailsImg.src = "/images/HT_Button1.png"; // Reset tails
});

tailsButton.addEventListener('click', function () {
    userSelection = "tails";
    tailsImg.src = "/images/HT_Button2.png"; // Change to clicked image
    headsImg.src = "/images/HT_Button1.png"; // Reset heads
});
