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

    console.group('[Dice] Starting animation');
    console.log('Final target values', { dice1, dice2, onFire });

    if (!dice1Element || !dice2Element) {
        console.error('[Dice] Dice elements missing in DOM.', { dice1Element, dice2Element });
        console.groupEnd();
        callback?.();
        return;
    }

    console.log('Dice element references', {
        dice1ElementPresent: Boolean(dice1Element),
        dice2ElementPresent: Boolean(dice2Element),
        dice1CurrentSrc: dice1Element?.src,
        dice2CurrentSrc: dice2Element?.src,
    });

    let counter = 0;
    const interval = setInterval(() => {
        const dice1Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.gif'}`;
        const dice2Src = `/images/${onFire ? 'DiceFire' : 'dice'}${Math.floor(Math.random() * 6) + 1}${onFire ? '.gif' : '.gif'}`;

        dice1Element.src = dice1Src;
        dice2Element.src = dice2Src;

        console.debug('[Dice] Animation frame', {
            iteration: counter,
            appliedSources: { dice1Src, dice2Src },
        });

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
            console.log('[Dice] Animation complete. Applying final sources.', {
                finalDice1Src: dice1Element.src,
                finalDice2Src: dice2Element.src,
            });
            console.groupEnd();
            callback();
        }
    }, 100);

    console.log('[Dice] Interval established for animation', { intervalId: interval });
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
