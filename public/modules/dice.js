// dice.js

export function rollDice() {
    return {
        dice1: Math.floor(Math.random() * 6) + 1,
        dice2: Math.floor(Math.random() * 6) + 1,
    };
}

export function animateDice(dice1, dice2, callback, options = {}) {
    const { onFire = false } = options;
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');

    let counter = 0;
    const interval = setInterval(() => {
        const dice1Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.gif'}`;
        const dice2Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.gif'}`;

        dice1Element.src = dice1Src;
        dice2Element.src = dice2Src;

        // Adjust size for "on fire" state
        if (onFire) {
            dice1Element.style.width = '150px'; // Larger width
            dice1Element.style.height = '150px'; // Larger height
            dice2Element.style.width = '150px';
            dice2Element.style.height = '150px';
        } else {
            dice1Element.style.width = '100px'; // Standard width
            dice1Element.style.height = '100px'; // Standard height
            dice2Element.style.width = '100px';
            dice2Element.style.height = '100px';
        }

        counter++;

        if (counter >= 10) {
            clearInterval(interval);
            dice1Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice1}${onFire ? '.gif' : '.gif'}`;
            dice2Element.src = `/images/${onFire ? 'DiceFire' : 'dice'}${dice2}${onFire ? '.gif' : '.gif'}`;
            callback();
        }
    }, 100);
}


export function playDiceSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);
    audio.play().catch(err => console.error('Audio play error:', err));
}
