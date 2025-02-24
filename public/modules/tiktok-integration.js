// tiktok-integration.js //

// ✅ Initialize TikTok Chat with Error Handling
async function initializeTikTokChat() {
    try {
        console.log("🔄 Requesting TikTok Access Token...");

        const tokenResponse = await fetch("/api/tiktok/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!tokenResponse.ok) throw new Error(`❌ Token Fetch Failed: ${tokenResponse.statusText}`);

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) throw new Error("❌ Access Token is missing!");

        console.log("✅ TikTok Access Token Received:", accessToken);

        // ✅ Open WebSocket for TikTok chat
        const chatSocket = new WebSocket(`wss://tiktok.live.chat/stream?access_token=${accessToken}`);

        chatSocket.onopen = () => console.log("✅ WebSocket Connection Established!");
        chatSocket.onerror = (error) => console.error("❌ WebSocket Error:", error);
        chatSocket.onmessage = (event) => {
            console.log("📩 Message from TikTok Chat:", event.data);
            const message = JSON.parse(event.data);
            handleChatMessage(message);
        };

    } catch (error) {
        console.error("❌ Error initializing TikTok Chat:", error);
    }
}

// Process Chat Messages
function handleChatMessage(message) {
    const content = message.content || "";
    if (content.includes("Heads")) {
        pollVotes.heads++;
    } else if (content.includes("Tails")) {
        pollVotes.tails++;
    }
    updatePollBar();
}

function updatePollBar() {
    const totalVotes = pollVotes.heads + pollVotes.tails;
    document.getElementById("heads-bar").style.width = `${(pollVotes.heads / totalVotes) * 100}%`;
    document.getElementById("tails-bar").style.width = `${(pollVotes.tails / totalVotes) * 100}%`;
}

const pollVotes = { heads: 0, tails: 0 };

// ✅ TikFinity Integration: Capture Gift Givers and Spawn Players
window.addEventListener("message", (event) => {
    if (event.data?.event === "GiftReceived" && event.data.username) {
        console.log(`🎁 TikTok Gift Received from @${event.data.username}`);

        // ✅ Store username and pass it to the game
        latestTikTokUser = event.data.username;
        addPlayer(latestTikTokUser);
        latestTikTokUser = null; // ✅ Clear after adding
    }
});

// Function to Add TikTok Player
function addTikTokPlayer(username) {
    console.log(`Adding TikTok player: ${username}`);
    
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');

    // Generate random position for the new player
    const player = {
        x: Math.random() * (gameCanvas.width - 20),
        y: gameCanvas.height - 40,
        alive: true,
        name: username
    };

    players.push(player);
    updateLeaderboard(username);
}

// Function to Update Leaderboard
function updateLeaderboard(username) {
    const leaderboard = document.getElementById("leaderboard-list");
    let listItem = document.createElement("li");
    listItem.textContent = username;
    leaderboard.appendChild(listItem);
}

initializeTikTokChat();
