// dice.js

export function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    console.groupCollapsed('[Dice] Generated roll');
    console.log('dice1:', dice1);
    console.log('dice2:', dice2);
    console.trace('Roll stack trace');
    console.groupEnd();

    return {
        dice1,
        dice2,
    };
}

export function animateDice(dice1, dice2, callback, options = {}) {
    const { onFire = false } = options;
    const dice1Element = document.getElementById('dice1');
    const dice2Element = document.getElementById('dice2');

    if (!dice1Element || !dice2Element) {
        console.error('[Dice] Dice elements missing in DOM.', { dice1Element, dice2Element });
        callback?.();
        return;
    }

    const spritePrefix = onFire ? 'DiceFire' : 'dice';
    const spriteExtension = onFire ? '.gif' : '.png';
    let iterations = 0;
    const maxIterations = 10;

    const interval = setInterval(() => {
        const randomDice1 = Math.floor(Math.random() * 6) + 1;
        const randomDice2 = Math.floor(Math.random() * 6) + 1;

        dice1Element.src = `/images/${spritePrefix}${randomDice1}${spriteExtension}`;
        dice2Element.src = `/images/${spritePrefix}${randomDice2}${spriteExtension}`;

        iterations += 1;

        if (iterations >= maxIterations) {
            clearInterval(interval);
            dice1Element.src = `/images/${spritePrefix}${dice1}${spriteExtension}`;
            dice2Element.src = `/images/${spritePrefix}${dice2}${spriteExtension}`;
            callback?.();
        }
    }, 100);
}


export function playDiceSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);
    console.groupCollapsed('[Dice] Playing sound');
    console.log('Source file:', soundFile);
    console.log('Randomized:', randomize);
    audio.play()
        .then(() => {
            console.log('Audio playback started successfully.');
            console.groupEnd();
        })
        .catch(err => {
            console.error('Audio play error:', err);
            console.groupEnd();
        });
}
