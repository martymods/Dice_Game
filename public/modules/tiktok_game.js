document.addEventListener('DOMContentLoaded', () => {
    const cardTitle = document.getElementById('card-title');
    const cardText = document.getElementById('card-text');
  
    const challenges = [
      { category: 'Take a Shot', text: "Take a shot if you've ever texted your ex while drunk!" },
      { category: 'I Dare You', text: 'I dare you to post an embarrassing TikTok, or take a shot!' },
      { category: 'Wild Card', text: 'Call your crush and confess your feelings, or take three shots!' }
    ];
  
    const buttons = {
      takeShot: document.getElementById('take-shot-btn'),
      iDareYou: document.getElementById('i-dare-you-btn'),
      wildCard: document.getElementById('wild-card-btn')
    };
  
    // Change card content based on button clicked
    buttons.takeShot.addEventListener('click', () => showRandomChallenge('Take a Shot'));
    buttons.iDareYou.addEventListener('click', () => showRandomChallenge('I Dare You'));
    buttons.wildCard.addEventListener('click', () => showRandomChallenge('Wild Card'));
  
    function showRandomChallenge(category) {
      const filteredChallenges = challenges.filter(ch => ch.category === category);
      const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
      cardTitle.textContent = randomChallenge.category;
      cardText.textContent = randomChallenge.text;
    }
  
    // Chat functionality placeholder
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message');
  
    sendMessageBtn.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        const newMessage = document.createElement('p');
        newMessage.textContent = `Player: ${message}`;
        chatMessages.appendChild(newMessage);
        chatInput.value = '';
      }
    });
  });
  