// shop.js

document.addEventListener('DOMContentLoaded', () => {
    const leftButton = document.getElementById('left-button');
    const centerButton = document.getElementById('center-button');
    const rightButton = document.getElementById('right-button');
    const backgroundContainer = document.getElementById('background-container');
    const audio = document.getElementById('background-audio');

    const backgroundLayers = [document.createElement('img'), document.createElement('img')];
    backgroundLayers.forEach(layer => {
        layer.classList.add('background-layer');
        backgroundContainer.appendChild(layer);
    });

    const initialLayer = backgroundLayers[0];
    initialLayer.classList.add('active', 'visible');
    initialLayer.dataset.currentSrc = '/images/eStore/eShop_Center_Idle_0.gif';
    initialLayer.src = '/images/eStore/eShop_Center_Idle_0.gif';

    // Play background music
    audio.play();

    function restartImage(element, image) {
        if (element.dataset.currentSrc === image) {
            element.src = '';
        }

        element.dataset.currentSrc = image;
        element.src = image;
    }

    function setActiveImage(image) {
        const currentActive = backgroundContainer.querySelector('.background-layer.active');

        if (!currentActive) return;

        restartImage(currentActive, image);
    }

    // Helper function to change background image and execute actions
    function changeBackground(image, callback, duration = 3000) {
        const currentActive = backgroundContainer.querySelector('.background-layer.active');
        const currentInactive = backgroundContainer.querySelector('.background-layer:not(.active)');

        if (!currentActive || !currentInactive) {
            if (callback) {
                setTimeout(callback, duration);
            }
            return;
        }

        restartImage(currentInactive, image);

        requestAnimationFrame(() => {
            currentInactive.classList.add('visible', 'active');
            currentActive.classList.remove('visible', 'active');
        });

        setTimeout(() => {
            if (callback) callback();
        }, duration);
    }

    // Left button functionality
    leftButton.addEventListener('click', () => {
        document.getElementById('button-container').style.display = 'none';
        changeBackground('/images/eStore/eShop_Center_to_Left_0.gif', () => {
            setActiveImage('/images/eStore/eShop_Left_Idle_0.gif');
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
                    setActiveImage('/images/eStore/eShop_Center_Idle_0.gif');
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
            setActiveImage('/images/eStore/eShop_Logo_Idle_0.gif');

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
                    setActiveImage('/images/eStore/eShop_Center_Idle_0.gif');
                    document.getElementById('button-container').style.display = 'flex';
                });
            });
        });
    });

    // Right button functionality
    rightButton.addEventListener('click', () => {
        document.getElementById('button-container').style.display = 'none';
        changeBackground('/images/eStore/eShop_Center_to_Right_0.gif', () => {
            setActiveImage('/images/eStore/eShop_Right_Idle_0.gif');
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
                    setActiveImage('/images/eStore/eShop_Center_Idle_0.gif');
                    audio.src = '/sounds/eShopSFX.mp3';
                    audio.play();
                    document.getElementById('button-container').style.display = 'flex';
                });
            });
        });
    });
});
