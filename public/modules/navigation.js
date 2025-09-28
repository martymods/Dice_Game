const RUN_SPEED = 5; // m/s
const WALK_SPEED = RUN_SPEED / 2;
const CAR_SPEED = RUN_SPEED * 3;
const STAMINA_BASE = 100;
const STAMINA_PER_AGILITY = 10;
const STAMINA_DRAIN_RATE = 5; // stamina per second while running
const STAMINA_REGEN_TIME = 120; // seconds to fully recover stamina while resting/walking
const STUN_BASE = 100;
const STUN_PER_GRIT = 25;
const STUN_GAIN_RATE = 6; // stun per second when overexerting
const STUN_RECOVERY_BASE = 60; // seconds for stun to fall from max to 0 at base capacity
const STUN_CONSCIOUS_THRESHOLD = 0.3; // 30% of stun meter

const map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    preferCanvas: true,
}).setView([40.724, -73.996], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const waterZones = [
    {
        name: 'East River',
        bounds: L.latLngBounds([40.696, -74.023], [40.79, -73.93]),
        connectors: [
            {
                entry: L.latLng(40.706086, -73.996864),
                exit: L.latLng(40.705551, -73.990841),
            },
            {
                entry: L.latLng(40.710109, -73.965555),
                exit: L.latLng(40.711592, -73.961454),
            },
            {
                entry: L.latLng(40.758896, -73.962433),
                exit: L.latLng(40.75773, -73.949242),
            },
        ],
    },
    {
        name: 'Hudson River',
        bounds: L.latLngBounds([40.699, -74.03], [40.88, -73.98]),
        connectors: [
            {
                entry: L.latLng(40.850715, -73.949562),
                exit: L.latLng(40.851011, -73.960507),
            },
            {
                entry: L.latLng(40.742722, -74.01086),
                exit: L.latLng(40.748031, -74.00594),
            },
        ],
    },
];

const waterLayer = L.layerGroup().addTo(map);
waterZones.forEach((zone) => {
    L.rectangle(zone.bounds, {
        color: '#1d4ed8',
        weight: 1,
        fillOpacity: 0.08,
        opacity: 0.4,
    }).addTo(waterLayer);
});

const playerIcon = L.icon({
    iconUrl: '/images/DW_Logo.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    className: 'player-marker',
});

const waypointIcon = L.divIcon({
    className: 'waypoint-marker',
    html: '<div class="waypoint-pin"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

const startingPoint = L.latLng(40.724, -73.996);
const initialDestination = L.latLng(40.739, -73.983);

const playerMarker = L.marker(startingPoint, { icon: playerIcon, draggable: false }).addTo(map);
const destinationMarker = L.marker(initialDestination, { icon: waypointIcon, draggable: true }).addTo(map);

const routeLayer = L.layerGroup().addTo(map);
let routeLine = null;
let messageTimeout = null;

const state = {
    selectedMode: 'run',
    attributes: {
        agility: 0,
        grit: 0,
    },
    stamina: {
        max: STAMINA_BASE,
        current: STAMINA_BASE,
    },
    stun: {
        max: STUN_BASE,
        current: 0,
    },
    status: 'ready',
    pendingTravel: null,
    pendingPreview: null,
    lastOutcome: null,
};

const elements = {
    agilityInput: document.getElementById('agility-input'),
    gritInput: document.getElementById('grit-input'),
    agilityValue: document.getElementById('agility-value'),
    gritValue: document.getElementById('grit-value'),
    staminaValue: document.getElementById('stamina-value'),
    staminaFill: document.getElementById('stamina-fill'),
    stunValue: document.getElementById('stun-value'),
    stunFill: document.getElementById('stun-fill'),
    statusBadge: document.getElementById('status-badge'),
    modeButtons: Array.from(document.querySelectorAll('.mode-toggle__button')),
    travelSummary: document.getElementById('travel-summary'),
    recoveryReadout: document.getElementById('recovery-readout'),
    systemMessage: document.getElementById('system-message'),
    startTravel: document.getElementById('start-travel'),
    restButton: document.getElementById('rest-button'),
};

elements.modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        state.selectedMode = mode;
        updateModeButtons();
        updateRoute();
        if (mode === 'car') {
            pushMessage('Car navigation will hug streets in the next update. Preview unavailable.', 'info');
        }
    });
});

elements.agilityInput.addEventListener('input', () => {
    const value = clampNumber(Number(elements.agilityInput.value), 0, 99);
    elements.agilityInput.value = value;
    setAttribute('agility', value);
});

elements.gritInput.addEventListener('input', () => {
    const value = clampNumber(Number(elements.gritInput.value), 0, 99);
    elements.gritInput.value = value;
    setAttribute('grit', value);
});

elements.startTravel.addEventListener('click', () => {
    if (!state.pendingTravel) {
        pushMessage('No active route. Tap the map to set a waypoint.', 'warning');
        return;
    }

    if (state.status === 'fainted') {
        const { toConscious } = computeRecoveryTimes();
        pushMessage(`You are unconscious. Wake-up ETA ${formatTime(toConscious)}.`, 'danger');
        return;
    }

    const snapshot = snapshotState();
    const outcome = simulateTravel(snapshot, state.pendingTravel);
    applyOutcome(outcome, state.pendingTravel);
    if (!outcome.fainted) {
        pushMessage(`Travel complete in ${formatTime(outcome.timeSpent)}.`, 'success');
    } else {
        pushMessage(`Collapsed after ${formatTime(outcome.timeBeforeFaint)}. Recover before continuing.`, 'danger');
    }
    updateRoute();
});

elements.restButton.addEventListener('click', () => {
    advanceTime(10);
});

map.on('click', (event) => {
    destinationMarker.setLatLng(event.latlng);
    updateRoute();
});

destinationMarker.on('dragend', () => {
    updateRoute();
});

function setAttribute(attribute, value) {
    if (attribute === 'agility') {
        state.attributes.agility = value;
        const ratio = state.stamina.current / state.stamina.max || 0;
        state.stamina.max = STAMINA_BASE + value * STAMINA_PER_AGILITY;
        state.stamina.current = clampNumber(ratio * state.stamina.max, 0, state.stamina.max);
    }

    if (attribute === 'grit') {
        state.attributes.grit = value;
        const ratio = state.stun.current / state.stun.max || 0;
        state.stun.max = STUN_BASE + value * STUN_PER_GRIT;
        state.stun.current = clampNumber(ratio * state.stun.max, 0, state.stun.max);
    }

    elements.agilityValue.textContent = state.attributes.agility;
    elements.gritValue.textContent = state.attributes.grit;
    updateBars();
    updateRecoveryReadout();
    updateRoute();
}

function updateRoute() {
    if (state.selectedMode === 'car') {
        state.pendingTravel = null;
        state.pendingPreview = null;
        routeLayer.clearLayers();
        updateSummary();
        return;
    }

    const start = playerMarker.getLatLng();
    const destination = destinationMarker.getLatLng();

    if (!start || !destination) {
        return;
    }

    if (start.equals(destination)) {
        state.pendingTravel = null;
        state.pendingPreview = null;
        routeLayer.clearLayers();
        updateSummary({ placeholder: 'You are already at the waypoint.' });
        return;
    }

    const pathPoints = buildPath(start, destination);
    routeLayer.clearLayers();
    const color = state.selectedMode === 'run' ? '#f97373' : '#38bdf8';
    routeLine = L.polyline(pathPoints, {
        color,
        weight: 4,
        opacity: 0.9,
        dashArray: state.selectedMode === 'walk' ? '6 8' : null,
    }).addTo(routeLayer);

    const distance = pathDistance(pathPoints);
    const speed = state.selectedMode === 'run' ? RUN_SPEED : WALK_SPEED;
    const baseTime = distance / speed;
    const adjustedTime = baseTime * 0.3; // Reduce real world time by 70%

    state.pendingTravel = {
        mode: state.selectedMode,
        path: pathPoints,
        distance,
        time: adjustedTime,
        baseTime,
        speed,
    };

    state.pendingPreview = simulateTravel(snapshotState(), state.pendingTravel);
    updateSummary();
}

function buildPath(start, end) {
    let segments = [[start, end]];

    waterZones.forEach((zone) => {
        const updatedSegments = [];
        segments.forEach(([a, b]) => {
            if (segmentIntersectsZone(a, b, zone.bounds)) {
                const detour = createDetour(a, b, zone);
                for (let i = 1; i < detour.length; i += 1) {
                    updatedSegments.push([detour[i - 1], detour[i]]);
                }
            } else {
                updatedSegments.push([a, b]);
            }
        });
        segments = updatedSegments;
    });

    const path = [segments[0][0]];
    for (let i = 0; i < segments.length; i += 1) {
        path.push(segments[i][1]);
    }
    return path;
}

function createDetour(start, end, zone) {
    if (!zone.connectors || zone.connectors.length === 0) {
        return [start, end];
    }

    let bestPath = null;
    let bestDistance = Infinity;

    zone.connectors.forEach((connector) => {
        const options = [
            [connector.entry, connector.exit],
            [connector.exit, connector.entry],
        ];
        options.forEach(([first, second]) => {
            const candidate = [start, first, second, end];
            const length = pathDistance(candidate);
            if (length < bestDistance) {
                bestDistance = length;
                bestPath = candidate;
            }
        });
    });

    return bestPath || [start, end];
}

function segmentIntersectsZone(a, b, bounds) {
    if (bounds.contains(a) || bounds.contains(b)) {
        return true;
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const nw = L.latLng(ne.lat, sw.lng);
    const se = L.latLng(sw.lat, ne.lng);

    const edges = [
        [sw, nw],
        [nw, ne],
        [ne, se],
        [se, sw],
    ];

    return edges.some(([p1, p2]) => segmentsIntersect(a, b, p1, p2));
}

function segmentsIntersect(p1, q1, p2, q2) {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
}

function orientation(p, q, r) {
    const val = (q.lng - p.lng) * (r.lat - q.lat) - (q.lat - p.lat) * (r.lng - q.lng);
    if (Math.abs(val) < 1e-12) {
        return 0;
    }
    return val > 0 ? 1 : 2;
}

function onSegment(p, q, r) {
    return (
        Math.min(p.lng, r.lng) - 1e-12 <= q.lng &&
        Math.max(p.lng, r.lng) + 1e-12 >= q.lng &&
        Math.min(p.lat, r.lat) - 1e-12 <= q.lat &&
        Math.max(p.lat, r.lat) + 1e-12 >= q.lat
    );
}

function pathDistance(points) {
    let distance = 0;
    for (let i = 1; i < points.length; i += 1) {
        distance += map.distance(points[i - 1], points[i]);
    }
    return distance;
}

function snapshotState() {
    return {
        attributes: { ...state.attributes },
        stamina: { ...state.stamina },
        stun: { ...state.stun },
        status: state.status,
    };
}

function simulateTravel(snapshot, travelPlan) {
    const result = {
        mode: travelPlan.mode,
        distance: travelPlan.distance,
        baseTime: travelPlan.baseTime,
        time: travelPlan.time,
        speed: travelPlan.speed,
        staminaUsed: 0,
        staminaRecovered: 0,
        staminaAfter: snapshot.stamina.current,
        stunGain: 0,
        stunDrop: 0,
        stunAfter: snapshot.stun.current,
        completed: true,
        fainted: false,
        timeSpent: travelPlan.time,
        timeBeforeFaint: 0,
        partialDistance: travelPlan.distance,
    };

    if (travelPlan.mode === 'walk') {
        const regenRate = snapshot.stamina.max / STAMINA_REGEN_TIME;
        const recoveryDuration = computeRecoveryDuration(snapshot.stun.max);
        const dropRate = snapshot.stun.max / recoveryDuration;
        const staminaRecovered = regenRate * travelPlan.time;
        const stunDrop = dropRate * travelPlan.time;

        result.staminaRecovered = staminaRecovered;
        result.staminaAfter = clampNumber(snapshot.stamina.current + staminaRecovered, 0, snapshot.stamina.max);
        result.stunDrop = Math.min(stunDrop, snapshot.stun.current);
        result.stunAfter = clampNumber(snapshot.stun.current - result.stunDrop, 0, snapshot.stun.max);
        return result;
    }

    const staminaAvailable = snapshot.stamina.current;
    const staminaTime = staminaAvailable / STAMINA_DRAIN_RATE;

    if (travelPlan.time <= staminaTime) {
        result.staminaUsed = travelPlan.time * STAMINA_DRAIN_RATE;
        result.staminaAfter = clampNumber(snapshot.stamina.current - result.staminaUsed, 0, snapshot.stamina.max);
        result.stunAfter = snapshot.stun.current;
        return result;
    }

    const overexertTime = travelPlan.time - staminaTime;
    const stunCapacity = snapshot.stun.max - snapshot.stun.current;
    const timeToFaint = stunCapacity / STUN_GAIN_RATE;

    result.staminaUsed = staminaAvailable;
    result.staminaAfter = 0;

    if (overexertTime >= timeToFaint) {
        result.fainted = true;
        result.completed = false;
        result.timeBeforeFaint = staminaTime + timeToFaint;
        result.timeSpent = result.timeBeforeFaint;
        result.partialDistance = travelPlan.speed * result.timeBeforeFaint;
        result.stunGain = stunCapacity;
        result.stunAfter = snapshot.stun.max;
        return result;
    }

    result.stunGain = overexertTime * STUN_GAIN_RATE;
    result.stunAfter = clampNumber(snapshot.stun.current + result.stunGain, 0, snapshot.stun.max);
    return result;
}

function applyOutcome(outcome, travelPlan) {
    state.stamina.current = clampNumber(outcome.staminaAfter, 0, state.stamina.max);
    state.stun.current = clampNumber(outcome.stunAfter, 0, state.stun.max);
    state.lastOutcome = { ...outcome };

    if (outcome.mode === 'walk') {
        // walking time regenerates stamina and reduces stun already in outcome
    }

    if (outcome.completed) {
        playerMarker.setLatLng(travelPlan.path[travelPlan.path.length - 1]);
    } else {
        const partialPoint = locatePointAlongPath(travelPlan.path, outcome.partialDistance);
        playerMarker.setLatLng(partialPoint);
        map.panTo(partialPoint);
    }

    if (outcome.fainted) {
        state.status = 'fainted';
    } else if (state.stun.current > state.stun.max * STUN_CONSCIOUS_THRESHOLD) {
        state.status = 'winded';
    } else {
        state.status = 'ready';
    }

    updateBars();
    updateRecoveryReadout();
    updateSummary();
    updateModeButtons();
}

function locatePointAlongPath(pathPoints, distanceTarget) {
    let remaining = distanceTarget;
    for (let i = 1; i < pathPoints.length; i += 1) {
        const segmentLength = map.distance(pathPoints[i - 1], pathPoints[i]);
        if (remaining <= segmentLength) {
            const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
            const lat = pathPoints[i - 1].lat + (pathPoints[i].lat - pathPoints[i - 1].lat) * ratio;
            const lng = pathPoints[i - 1].lng + (pathPoints[i].lng - pathPoints[i - 1].lng) * ratio;
            return L.latLng(lat, lng);
        }
        remaining -= segmentLength;
    }
    return pathPoints[pathPoints.length - 1];
}

function advanceTime(seconds) {
    if (seconds <= 0) return;

    const staminaGain = (state.stamina.max / STAMINA_REGEN_TIME) * seconds;
    const recoveryDuration = computeRecoveryDuration(state.stun.max);
    const dropRate = state.stun.max / recoveryDuration;
    const stunDrop = dropRate * seconds;

    state.stamina.current = clampNumber(state.stamina.current + staminaGain, 0, state.stamina.max);
    const previousStun = state.stun.current;
    state.stun.current = clampNumber(state.stun.current - stunDrop, 0, state.stun.max);

    if (state.status === 'fainted' && state.stun.current <= state.stun.max * STUN_CONSCIOUS_THRESHOLD) {
        state.status = 'winded';
        pushMessage('You come to. Movement restored, but go easy until the stun drops lower.', 'success');
    } else if (previousStun > 0 && state.stun.current === 0) {
        state.status = 'ready';
        pushMessage('You feel completely recovered.', 'success');
    } else {
        pushMessage(`Rested ${seconds}s.`, 'info');
        if (state.status !== 'fainted') {
            state.status = state.stun.current > state.stun.max * STUN_CONSCIOUS_THRESHOLD ? 'winded' : 'ready';
        }
    }

    updateBars();
    updateRecoveryReadout();
    updateSummary();
    updateModeButtons();
}

function updateBars() {
    const staminaPercent = (state.stamina.current / state.stamina.max) * 100;
    const stunPercent = (state.stun.current / state.stun.max) * 100;
    elements.staminaFill.style.width = `${Math.max(0, Math.min(100, staminaPercent))}%`;
    elements.stunFill.style.width = `${Math.max(0, Math.min(100, stunPercent))}%`;
    elements.staminaValue.textContent = `${Math.round(state.stamina.current)} / ${Math.round(state.stamina.max)}`;
    elements.stunValue.textContent = `${Math.round(state.stun.current)} / ${Math.round(state.stun.max)}`;
    updateStatusBadge();
}

function updateStatusBadge() {
    elements.statusBadge.textContent = state.status === 'winded' ? 'Recovering' : state.status.charAt(0).toUpperCase() + state.status.slice(1);
    elements.statusBadge.classList.remove('status-badge--ready', 'status-badge--winded', 'status-badge--fainted');
    if (state.status === 'fainted') {
        elements.statusBadge.classList.add('status-badge--fainted');
    } else if (state.status === 'winded') {
        elements.statusBadge.classList.add('status-badge--winded');
    } else {
        elements.statusBadge.classList.add('status-badge--ready');
    }
}

function updateModeButtons() {
    elements.modeButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.mode === state.selectedMode);
    });
}

function updateSummary(options = {}) {
    if (options.placeholder) {
        elements.travelSummary.innerHTML = `<p class="summary-panel__placeholder">${options.placeholder}</p>`;
        return;
    }

    if (state.selectedMode === 'car') {
        elements.travelSummary.innerHTML = `
            <p class="summary-panel__note">Car routing is being wired up next. Expect 3× run speed and street-following GPS paths.</p>
        `;
        return;
    }

    if (!state.pendingTravel || !state.pendingPreview) {
        elements.travelSummary.innerHTML = '<p class="summary-panel__placeholder">Pick a travel mode to preview the route.</p>';
        return;
    }

    const travel = state.pendingTravel;
    const preview = state.pendingPreview;
    const rows = [];
    rows.push(summaryRow('Mode', travel.mode === 'run' ? 'Run' : 'Walk'));
    rows.push(summaryRow('Distance', formatDistance(travel.distance)));
    rows.push(summaryRow('Est. time (after 70% cut)', formatTime(travel.time)));

    if (travel.mode === 'run') {
        rows.push(summaryRow('Stamina required', `${preview.staminaUsed.toFixed(1)} / ${state.stamina.current.toFixed(1)} available`));
        rows.push(summaryRow('Projected stun', `${preview.stunAfter.toFixed(1)} / ${state.stun.max.toFixed(1)}`));
        if (preview.fainted) {
            rows.push(`<p class="summary-panel__alert">⚠️ Collapse expected ${formatDistance(preview.partialDistance)} in (${formatTime(preview.timeBeforeFaint)}). Recover stamina or adjust route.</p>`);
        } else if (preview.stunGain > 0) {
            rows.push(`<p class="summary-panel__note">Running beyond stamina will add ~${preview.stunGain.toFixed(1)} stun.</p>`);
        }
    } else {
        rows.push(summaryRow('Stamina regen', `+${preview.staminaRecovered.toFixed(1)}`));
        rows.push(summaryRow('Stun decay', `-${preview.stunDrop.toFixed(1)}`));
    }

    if (state.lastOutcome) {
        rows.push('<div class="summary-divider"></div>');
        rows.push(`<strong>Last travel</strong>`);
        rows.push(summaryRow('Completed', state.lastOutcome.completed ? 'Yes' : 'No'));
        rows.push(summaryRow('Elapsed', formatTime(state.lastOutcome.timeSpent)));
        rows.push(summaryRow('Distance covered', formatDistance(state.lastOutcome.partialDistance)));
        if (state.lastOutcome.fainted) {
            rows.push(`<p class="summary-panel__alert">Collapsed from overexertion. Wait ${formatTime(computeRecoveryTimes().toConscious)} to regain control.</p>`);
        }
    }

    elements.travelSummary.innerHTML = rows.join('');
}

function updateRecoveryReadout() {
    const { toConscious, toZero } = computeRecoveryTimes();
    const stunnedPercent = (state.stun.current / state.stun.max) * 100;
    const rows = [];
    rows.push(summaryRow('Current stun', `${stunnedPercent.toFixed(1)}%`));

    if (state.status === 'fainted') {
        rows.push(summaryRow('Wake-up ETA', formatTime(toConscious)));
        rows.push(summaryRow('Fully steady in', formatTime(toZero)));
    } else if (state.stun.current > 0) {
        rows.push(summaryRow('Back to zero', formatTime(toZero)));
        if (state.stun.current > state.stun.max * STUN_CONSCIOUS_THRESHOLD) {
            rows.push(`<p class="summary-panel__note">You can move, but another sprint will knock you out. Wait ~${formatTime(toConscious)}.</p>`);
        }
    } else {
        rows.push('<p class="summary-panel__placeholder">No stun accumulated.</p>');
    }

    elements.recoveryReadout.innerHTML = rows.join('');
}

function computeRecoveryTimes() {
    const recoveryDuration = computeRecoveryDuration(state.stun.max);
    const dropRate = state.stun.max / recoveryDuration;
    if (!Number.isFinite(dropRate) || dropRate <= 0) {
        return { toConscious: 0, toZero: 0 };
    }

    const consciousThreshold = state.stun.max * STUN_CONSCIOUS_THRESHOLD;
    const toZero = state.stun.current / dropRate;
    const toConscious = state.stun.current > consciousThreshold
        ? (state.stun.current - consciousThreshold) / dropRate
        : 0;

    return {
        toConscious: Math.max(0, toConscious),
        toZero: Math.max(0, toZero),
    };
}

function computeRecoveryDuration(stunMax) {
    return STUN_RECOVERY_BASE * (stunMax / STUN_BASE);
}

function summaryRow(label, value) {
    return `<div class="summary-row"><span>${label}</span><span>${value}</span></div>`;
}

function pushMessage(message, type = 'info') {
    if (!elements.systemMessage) return;
    elements.systemMessage.textContent = message;
    elements.systemMessage.classList.remove('system-message--info', 'system-message--warning', 'system-message--danger', 'system-message--success');
    elements.systemMessage.classList.add(`system-message--${type}`);
    elements.systemMessage.classList.add('is-visible');

    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }

    messageTimeout = setTimeout(() => {
        elements.systemMessage.classList.remove('is-visible');
    }, 4200);
}

function formatDistance(distanceMeters) {
    if (!Number.isFinite(distanceMeters)) return '—';
    if (distanceMeters < 1000) {
        return `${distanceMeters.toFixed(0)} m`;
    }
    return `${(distanceMeters / 1000).toFixed(2)} km`;
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '—';
    if (seconds < 1) {
        return `${seconds.toFixed(1)} s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins === 0) {
        return `${secs}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

setAttribute('agility', state.attributes.agility);
setAttribute('grit', state.attributes.grit);
updateModeButtons();
updateRoute();
updateBars();
updateRecoveryReadout();
pushMessage('Navigation module initialized. Drag the waypoint or tap the map to plan a run.', 'info');

