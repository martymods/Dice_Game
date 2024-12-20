// hustlers.js

export let hustlerInventory = [];

export function addHustler(hustler) {
    if (hustlerInventory.length >= 5) {
        alert('You can only hold 5 Hustlers at a time. Discard one to make space.');
        return;
    }
    hustlerInventory.push(hustler);
    updateHustlerUI();
}

export function applyHustlerEffects(dice1, dice2) {
    let multiplier = 1;
    let cashBonus = 0;

    hustlerInventory.forEach(hustler => {
        if (hustler.name === 'Joker') multiplier += 2;
        if (hustler.name === 'Greedy Joker' && dice1 + dice2 > 6) cashBonus += 5;
        if (hustler.name === 'Wrathful Joker' && dice1 + dice2 < 4) multiplier += 3;
    });

    return { multiplier, cashBonus };
}

export function updateHustlerUI() {
    const hustlerList = document.getElementById('hustler-list');
    hustlerList.innerHTML = '';
    hustlerInventory.forEach((hustler, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${hustler.name} (${hustler.description})
            <button onclick="discardHustler(${index})">Discard</button>
        `;
        hustlerList.appendChild(li);
    });
}

export function discardHustler(index) {
    hustlerInventory.splice(index, 1);
    updateHustlerUI();
}
