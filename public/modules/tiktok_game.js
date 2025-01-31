// Adding the animated card interactions for the game
// Ensure these cards are styled and function dynamically

// Load the cards and define their behavior
document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.querySelector(".card-container"); // Add this div in your HTML
    
    const cardData = [
        {
            type: "TAKE A SHOT!",
            image: "/images/SocialGameImages/RR_Cards_0.gif",
            backImage: "/images/SocialGameImages/RR_Cards_Back.gif",
            questions: ["Take a shot with the person next to you!", "Take two shots and name your favorite drink."]
        },
        {
            type: "WILD CARD!",
            image: "/images/SocialGameImages/RR_Cards_1.gif",
            backImage: "/images/SocialGameImages/RR_Cards_Back.gif",
            questions: ["Wild Card: Sing a song of your choice.", "Wild Card: Switch seats with anyone in the group."]
        },
        {
            type: "I DARE YOU!",
            image: "/images/SocialGameImages/RR_Cards_0.gif",
            backImage: "/images/SocialGameImages/RR_Cards_Back.gif",
            questions: ["I Dare You to dance for 1 minute!", "I Dare You to call a random friend."]
        }
    ];
    

    cardData.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${card.backImage}" alt="Card Back">
                </div>
                <div class="card-back">
                    <img src="${card.image}" alt="${card.type}">
                    <div class="card-text">${card.questions[Math.floor(Math.random() * card.questions.length)]}</div>
                </div>
            </div>
        `;

        cardElement.addEventListener("click", () => {
            cardElement.classList.toggle("flipped");
        });

        cardContainer.appendChild(cardElement);
    });

    // Add animations using CSS and JS based on main.js's dynamic animations
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("mouseover", () => {
            card.style.transform = "scale(1.05)";
            card.style.transition = "transform 0.3s ease";
        });

        card.addEventListener("mouseout", () => {
            card.style.transform = "scale(1)";
        });
    });

    // Responsive animation inspired from main.js
    window.addEventListener("resize", () => {
        const cardWidth = Math.min(window.innerWidth / 5, 150); // Resizing dynamically
        cards.forEach((card) => {
            card.style.width = `${cardWidth}px`;
        });
    });
});

  
