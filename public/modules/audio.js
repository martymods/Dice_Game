export function playSound(sounds, randomize = false) {
    const soundFile = Array.isArray(sounds) && randomize
        ? sounds[Math.floor(Math.random() * sounds.length)]
        : sounds;

    const audio = new Audio(soundFile);

    // Resume audio context if necessary
    if (typeof audio.resume === "function") {
        audio.resume().catch(err => console.error("Audio context resume error:", err));
    }

    audio.play().catch(err => console.error('Audio play error:', err));
}

export function playSound(soundFile) {
    const audio = new Audio(soundFile);

    audio.addEventListener('error', (e) => {
        console.error(`Failed to load or play sound: ${soundFile}`, e);
    });

    audio.play().catch(err => {
        console.error(`Audio play error: ${soundFile}`, err);
    });
}
