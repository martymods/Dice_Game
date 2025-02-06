// shop.js

document.addEventListener('DOMContentLoaded', () => {
    const leftButton = document.getElementById('left-button');
    const centerButton = document.getElementById('center-button');
    const rightButton = document.getElementById('right-button');
    const backgroundContainer = document.body;
    const audio = document.getElementById('background-audio');

    // Play background music
    audio.play();

    // Helper function to change background image and execute actions
    function changeBackground(image, callback, duration = 3000) {
        backgroundContainer.style.backgroundImage = `url(${image})`;
        setTimeout(() => {
            if (callback) callback();
        }, duration);
    }

    // Left button functionality
    leftButton.addEventListener('click', () => {
        document.getElementById('button-container').style.display = 'none';
        changeBackground('/images/eStore/eShop_Center_to_Left_0.gif', () => {
            backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Left_Idle_0.gif')";
            audio.src = '/sounds/eShopSFX_Fire_R.mp3';
            audio.play();

            // Add new buttons
            const buyButton = document.createElement('button');
            const returnButton = document.createElement('button');

            buyButton.textContent = 'Buy Item ($3 ETH)';
            returnButton.textContent = 'Return';

            buyButton.classList.add('shop-button');
            returnButton.classList.add('shop-button');

            document.body.appendChild(buyButton);
            document.body.appendChild(returnButton);

            // Buy button functionality
            buyButton.addEventListener('click', () => {
                console.log('Player charged $3 ETH'); // Integrate MetaMask here
            });

            // Return button functionality
            returnButton.addEventListener('click', () => {
                buyButton.remove();
                returnButton.remove();
                changeBackground('/images/eStore/eShop_Left_to_Center_0.gif', () => {
                    backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Center_Idle_0.gif')";
                    audio.src = '/sounds/eShopSFX.mp3';
                    audio.play();
                    document.getElementById('button-container').style.display = 'flex';
                });
            });
        });
    });

    // Center button functionality
    centerButton.addEventListener('click', () => {
        document.getElementById('button-container').style.display = 'none';
        changeBackground('/images/eStore/eShop_Center_to_Logo_0.gif', () => {
            backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Logo_Idle_0.gif')";

            const offeringButton = document.createElement('button');
            const returnButton = document.createElement('button');

            offeringButton.textContent = 'Offer ETH';
            returnButton.textContent = 'Return';

            offeringButton.classList.add('shop-button');
            returnButton.classList.add('shop-button');

            document.body.appendChild(offeringButton);
            document.body.appendChild(returnButton);

            offeringButton.addEventListener('click', () => {
                console.log('ETH offering initiated'); // Integrate ETH offering system
            });

            returnButton.addEventListener('click', () => {
                offeringButton.remove();
                returnButton.remove();
                changeBackground('/images/eStore/eShop_Logo_to_Center_0.gif', () => {
                    backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Center_Idle_0.gif')";
                    document.getElementById('button-container').style.display = 'flex';
                });
            });
        });
    });

    // Right button functionality
    rightButton.addEventListener('click', () => {
        document.getElementById('button-container').style.display = 'none';
        changeBackground('/images/eStore/eShop_Center_to_Right_0.gif', () => {
            backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Right_Idle_0.gif')";
            audio.src = '/sounds/eShopSFX_Fire_L.mp3';
            audio.play();

            const buyButton = document.createElement('button');
            const returnButton = document.createElement('button');

            buyButton.textContent = 'Buy Item ($6 ETH)';
            returnButton.textContent = 'Return';

            buyButton.classList.add('shop-button');
            returnButton.classList.add('shop-button');

            document.body.appendChild(buyButton);
            document.body.appendChild(returnButton);

            buyButton.addEventListener('click', () => {
                console.log('Player charged $6 ETH'); // Integrate MetaMask here
            });

            returnButton.addEventListener('click', () => {
                buyButton.remove();
                returnButton.remove();
                changeBackground('/images/eStore/eShop_Right_to_Center_0.gif', () => {
                    backgroundContainer.style.backgroundImage = "url('/images/eStore/eShop_Center_Idle_0.gif')";
                    audio.src = '/sounds/eShopSFX.mp3';
                    audio.play();
                    document.getElementById('button-container').style.display = 'flex';
                });
            });
        });
    });
});
