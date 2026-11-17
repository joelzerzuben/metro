// Metro 2033 Map - Single Page Application
// Pan, zoom, search, highlight stations & Metro Wiki station modal

(function () {
    'use strict';

    // ===== State =====
    let scale = 1;
    let minScale = 0.1;
    let maxScale = 8;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let highlightedStation = null;
    let activeResultIndex = -1;
    let activeModalRequestId = 0;

    // In-memory cache for Metro Wiki data
    const wikiCache = new Map();

    // Known Metro Wiki page title aliases
    const WIKI_ALIASES = {
        'VDNKh': ['VDNKh', 'Exhibition'],
        'Biblioteka Imeni Lenina': ['Biblioteka imeni Lenina', 'Polis'],
        'Aleksandrovsky Sad': ['Alexandrovsky Sad', 'Aleksandrovsky Sad', 'Polis'],
        'Arbatskaya': ['Arbatskaya', 'Polis'],
        'Borovitskaya': ['Borovitskaya', 'Polis'],
        'Tverskaya': ['Tverskaya', 'Gorkovskaya'],
        'Partizanskaya': ['Partizanskaya', 'Izmailovsky Park'],
        'Izmailovsky Park': ['Izmaylovskaya', 'Izmailovskaya', 'Izmailovsky Park'],
        'Ulitsa Podbelskogo': ['Ulitsa Podbelskogo', "Ulitsa Podbel'skogo", 'Bulvar Rokossovskogo'],
        'Kitay-Gorod': ['Kitai-Gorod', 'Kitay-Gorod'],
        'Kiyevskaya': ['Kievskaya', 'Kiyevskaya'],
        'Alekseyevskaya': ['Alexeyevskaya', 'Alekseyevskaya'],
        'Botanicheskiy Sad': ['Botanichesky Sad', 'Botanicheskiy Sad'],
        'Novye Cheremushki': ['Novye Cheryomushki', 'Novye Cheremushki'],
        'Teply Stan': ['Teply Stan', 'Tyoply Stan'],
        'Novoyasenevskaya': ['Novoyasenevskaya', 'Bitsevsky Park'],
        'Oktyabrskoe Pole': ['Oktyabrskoye Pole', 'Oktyabrskoe Pole'],
        'Polezhaevskaya': ['Polezhayevskaya', 'Polezhaevskaya'],
        'Ploshchad Ilicha': ['Ploshchad Ilyicha', 'Ploshchad Ilicha'],
        'Otradnoe': ['Otradnoye', 'Otradnoe'],
        'Savelovskaya': ['Savyolovskaya', 'Savelovskaya'],
        'Mendeleevskaya': ['Mendeleyevskaya', 'Mendeleevskaya'],
        'Yuzhnya': ['Yuzhnaya', 'Yuzhnya'],
        'Krylatskoe': ['Krylatskoye', 'Krylatskoe'],
        'Molodezhnaya': ['Molodezhnaya', 'Molodyozhnaya'],
        'Pyatnitskoe Shosse': ['Pyatnitskoye Shosse', 'Pyatnitskoe Shosse'],
        'Shchelkovskaya': ['Shchelkovskaya', 'Shchyolkovskaya'],
        'Technopark': ['Tekhnopark', 'Technopark'],
        'Ulitsa Skobelesvskaya': ['Ulitsa Skobelevskaya'],
        'Ostankino Tower': ['Ostankino Tower', 'Ostankino']
    };

    // ===== DOM Elements =====
    const viewport = document.getElementById('map-viewport');
    const container = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    const overlay = document.getElementById('stations-overlay');
    const highlightRing = document.getElementById('highlight-ring');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');
    const legendToggle = document.getElementById('legend-toggle');
    const legendContent = document.getElementById('legend-content');
    const legendArrow = document.getElementById('legend-arrow');

    // Modal DOM Elements
    const stationModal = document.getElementById('station-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalExpandBtn = document.getElementById('modal-expand-btn');
    const modalHeader = stationModal.querySelector('.station-modal-header');
    const modalLineBadge = document.getElementById('modal-line-badge');
    const modalFactionBadge = document.getElementById('modal-faction-badge');
    const modalStationName = document.getElementById('modal-station-name');
    const modalStationSubtitle = document.getElementById('modal-station-subtitle');
    const modalImageLoader = document.getElementById('modal-image-loader');
    const modalStationImage = document.getElementById('modal-station-image');
    const modalImageCaption = document.getElementById('modal-image-caption');
    const modalInfoboxMeta = document.getElementById('modal-infobox-meta');
    const modalTextLoader = document.getElementById('modal-text-loader');
    const modalStationText = document.getElementById('modal-station-text');
    const modalWikiLink = document.getElementById('modal-wiki-link');
    const modalWikiLinkLabel = document.getElementById('modal-wiki-link-label');

    // Artyom Journey DOM Elements & State
    const artyomBtn = document.getElementById('artyom-btn');
    const artyomBtnStatus = document.getElementById('artyom-btn-status');
    const artyomBtnFlag = document.getElementById('artyom-btn-flag');
    const artyomJourneySvg = document.getElementById('artyom-journey-svg');
    const artyomHeadMarker = document.getElementById('artyom-head-marker');
    const artyomFlagMarker = document.getElementById('artyom-flag-marker');
    let artyomStep = 0;

    // Artyom's canonical Metro 2033 journey from VDNKh to Polis and D-6
    const ARTYOM_JOURNEY = [
        { name: 'VDNKh', chapter: 'Ch. 1–2: To the End of the World / Hunter', x: 57.48, y: 19.55, waypoints: [[57.48, 19.55]] },
        { name: 'Alekseyevskaya', chapter: "Ch. 3: If I Don't Come Back", x: 57.48, y: 21.78, waypoints: [[57.48, 21.78]] },
        { name: 'Rizhskaya', chapter: 'Ch. 4: The Voice of the Tunnels', x: 57.48, y: 23.94, waypoints: [[57.48, 23.94]] },
        { name: 'Prospekt Mira', chapter: 'Ch. 5: In Exchange for Cartridges', x: 57.51, y: 25.95, waypoints: [[57.51, 25.95]] },
        { name: 'Sukharevskaya', chapter: 'Ch. 6: Charybdis', x: 56.35, y: 29.04, waypoints: [[56.35, 27.17], [56.35, 29.04]] },
        { name: 'Turgenevskaya', chapter: 'Ch. 7: The Kingdom of Shadows', x: 56.35, y: 34.14, waypoints: [[56.35, 34.14]] },
        { name: 'Kitay-Gorod', chapter: 'Ch. 8: On the Hills of Manchuria', x: 56.35, y: 42.49, waypoints: [[56.35, 42.49]] },
        { name: 'Kuznetsky Most', chapter: 'Ch. 8: On the Hills of Manchuria', x: 53.90, y: 37.56, waypoints: [[58.64, 42.49], [53.90, 37.56]] },
        { name: 'Pushkinskaya', chapter: 'Ch. 9: Fascists', x: 45.70, y: 36.18, waypoints: [[52.65, 36.18], [45.70, 36.18]] },
        { name: 'Tverskaya', chapter: 'Ch. 10: No Pasarán!', x: 47.29, y: 36.18, waypoints: [[47.29, 36.18]] },
        { name: 'Paveletskaya', chapter: 'Ch. 11: Do Not Believe Your Eyes', x: 55.92, y: 53.94, waypoints: [[51.33, 40.34], [51.50, 49.32], [55.92, 53.94]] },
        { name: 'Polyanka', chapter: 'Ch. 12: The Guardian', x: 47.32, y: 48.19, waypoints: [[54.79, 52.72], [52.33, 53.37], [52.33, 55.07], [47.32, 49.85], [47.32, 48.19]] },
        { name: 'Polis', chapter: 'Ch. 13–14: Clinic for the Soul / Bibliophiles', x: 47.69, y: 41.47, waypoints: [[46.51, 42.69], [47.69, 41.47]] },
        { name: 'Kiyevskaya', chapter: 'Ch. 16: Song of the Defeated', x: 37.07, y: 44.59, waypoints: [[45.35, 41.47], [42.30, 41.47], [37.07, 44.59]] },
        { name: 'Park Pobedy', chapter: 'Ch. 17: The Worm', x: 28.31, y: 47.22, waypoints: [[28.31, 47.22]] },
        { name: 'D-6 (Sportivnaya)', chapter: 'Ch. 18–19: Power / The Last Battle', x: 36.61, y: 53.20, waypoints: [[36.61, 53.20]] }
    ];

    // ===== Initialize =====
    function init() {
        if (mapImage.complete && mapImage.naturalWidth) {
            onImageLoaded();
        } else {
            mapImage.onload = onImageLoaded;
        }

        setupPanZoom();
        setupSearch();
        setupLegend();
        setupModal();
        setupArtyomJourney();
        addZoomControls();

        renderLegend();

        // Select / focus the search bar on site load
        searchInput.focus();
        searchInput.select();
        setTimeout(() => {
            searchInput.focus();
        }, 50);
    }

    function onImageLoaded() {
        const imgW = mapImage.naturalWidth || 3709;
        const imgH = mapImage.naturalHeight || 3530;
        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;

        minScale = Math.min(vpW / imgW, vpH / imgH) * 0.9;

        if (vpW <= 768) {
            // Fit the central Koltsevaya Ring Line (circle) to the mobile screen
            const ringWidth = imgW * 0.32;
            const ringHeight = imgH * 0.34;
            const ringCenterX = imgW * 0.503;
            const ringCenterY = imgH * 0.396;
            const fitRingScale = Math.min(vpW / ringWidth, vpH / ringHeight);

            scale = Math.min(Math.max(fitRingScale, minScale), maxScale);
            panX = vpW / 2 - ringCenterX * scale;
            panY = vpH / 2 - ringCenterY * scale;
        } else {
            scale = minScale;
            panX = (vpW - imgW * scale) / 2;
            panY = (vpH - imgH * scale) / 2;
        }

        updateTransform();
        createStationMarkers();
    }

    // ===== Transform =====
    function updateTransform() {
        container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    // ===== Station Markers =====
    function createStationMarkers() {
        overlay.innerHTML = '';

        STATIONS.forEach((station, i) => {
            const marker = document.createElement('div');
            marker.className = 'station-marker';
            marker.setAttribute('data-name', station.name);
            marker.setAttribute('data-index', i);
            marker.style.left = `${station.x}%`;
            marker.style.top = `${station.y}%`;
            marker.style.borderColor = station.color;

            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                selectStation(station, marker);
            });

            overlay.appendChild(marker);
        });
    }

    // ===== Pan & Zoom =====
    function setupPanZoom() {
        viewport.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        viewport.addEventListener('touchstart', onTouchStart, { passive: false });
        viewport.addEventListener('touchmove', onTouchMove, { passive: false });
        viewport.addEventListener('touchend', onTouchEnd);

        viewport.addEventListener('wheel', onWheel, { passive: false });
    }

    function isUIElement(target) {
        return Boolean(
            target.closest('#search-container') ||
            target.closest('#artyom-panel') ||
            target.closest('#legend-panel') ||
            target.closest('#zoom-controls') ||
            target.closest('#station-modal')
        );
    }

    // ===== Artyom's Journey (VDNKh -> Polis -> D-6) =====
    function setupArtyomJourney() {
        // Initialize Artyom's Head SVG Marker & Checkered Flag Marker
        artyomHeadMarker.innerHTML = `
            <div class="artyom-step-label" id="artyom-step-label">VDNKh</div>
            <div class="artyom-head-badge">
                <svg viewBox="0 0 64 64" width="36" height="36">
                    <path d="M12 27 C12 12, 52 12, 52 27 L54 34 C54 44, 46 52, 32 54 C18 52, 10 44, 10 34 Z" fill="#2b3530" stroke="#e2e8f0" stroke-width="2.5"/>
                    <path d="M17 21 C23 14, 41 14, 47 21" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="23" cy="29" r="7.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.4"/>
                    <circle cx="41" cy="29" r="7.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.4"/>
                    <circle cx="23" cy="29" r="5.2" fill="#22c55e"/>
                    <circle cx="41" cy="29" r="5.2" fill="#22c55e"/>
                    <path d="M20 26 A3.5 3.5 0 0 1 25 25" fill="none" stroke="#dcfce7" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M38 26 A3.5 3.5 0 0 1 43 25" fill="none" stroke="#dcfce7" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="30.5" y1="29" x2="33.5" y2="29" stroke="#cbd5e1" stroke-width="2.5"/>
                    <polygon points="7,38 17,34 19,44 9,48" fill="#475569" stroke="#e2e8f0" stroke-width="2" stroke-linejoin="round"/>
                    <polygon points="57,38 47,34 45,44 55,48" fill="#475569" stroke="#e2e8f0" stroke-width="2" stroke-linejoin="round"/>
                    <circle cx="32" cy="44" r="7.5" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.4"/>
                    <circle cx="32" cy="44" r="4" fill="#334155"/>
                    <line x1="32" y1="38.5" x2="32" y2="49.5" stroke="#cbd5e1" stroke-width="1.5"/>
                    <line x1="26.5" y1="44" x2="37.5" y2="44" stroke="#cbd5e1" stroke-width="1.5"/>
                </svg>
            </div>
        `;

        artyomFlagMarker.innerHTML = `
            <svg viewBox="0 0 44 44" width="44" height="44">
                <circle cx="22" cy="22" r="20" fill="#0f172a" stroke="#f59e0b" stroke-width="2.8"/>
                <line x1="12" y1="9" x2="12" y2="35" stroke="#f8fafc" stroke-width="2.8" stroke-linecap="round"/>
                <g stroke="#0f172a" stroke-width="0.6">
                    <rect x="13.5" y="10" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="18.5" y="10" width="5" height="4.2" fill="#0f172a"/>
                    <rect x="23.5" y="10" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="28.5" y="10" width="5" height="4.2" fill="#0f172a"/>
                    <rect x="13.5" y="14.2" width="5" height="4.2" fill="#0f172a"/>
                    <rect x="18.5" y="14.2" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="23.5" y="14.2" width="5" height="4.2" fill="#0f172a"/>
                    <rect x="28.5" y="14.2" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="13.5" y="18.4" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="18.5" y="18.4" width="5" height="4.2" fill="#0f172a"/>
                    <rect x="23.5" y="18.4" width="5" height="4.2" fill="#ffffff"/>
                    <rect x="28.5" y="18.4" width="5" height="4.2" fill="#0f172a"/>
                </g>
            </svg>
        `;

        artyomBtn.addEventListener('click', () => {
            if (artyomStep >= ARTYOM_JOURNEY.length) {
                // Reset journey: hide Artyom's head, checkered flag, and clear path
                artyomStep = 0;
                artyomJourneySvg.innerHTML = '';
                artyomHeadMarker.classList.add('hidden');
                artyomFlagMarker.classList.add('hidden');
                artyomBtnFlag.classList.add('hidden');
                artyomBtn.classList.remove('active', 'completed');
                artyomBtnStatus.textContent = 'Start at VDNKh';

                // Zoom back out to full map overview on reset
                const imgW = mapImage.naturalWidth || 3709;
                const imgH = mapImage.naturalHeight || 3530;
                const vpW = viewport.clientWidth;
                const vpH = viewport.clientHeight;
                const resetScale = minScale;
                const resetPanX = (vpW - imgW * resetScale) / 2;
                const resetPanY = (vpH - imgH * resetScale) / 2;
                animateTo(resetPanX, resetPanY, resetScale);
                return;
            }

            artyomStep++;
            renderArtyomJourney();
        });
    }

    function renderArtyomJourney() {
        const W = 3709;
        const H = 3530;
        const current = ARTYOM_JOURNEY[artyomStep - 1];
        const isFinished = artyomStep === ARTYOM_JOURNEY.length;

        // Collect all polyline points up to current step
        const pts = [];
        for (let i = 0; i < artyomStep; i++) {
            const step = ARTYOM_JOURNEY[i];
            step.waypoints.forEach(wp => {
                pts.push([wp[0] / 100 * W, wp[1] / 100 * H]);
            });
        }

        let svgHtml = '';
        if (pts.length >= 2) {
            const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
            // Outer glow + inner dashed Ranger trail
            svgHtml += `<path d="${d}" fill="none" stroke="#16a34a" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.32"/>`;
            svgHtml += `<path d="${d}" fill="none" stroke="#0f172a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
            svgHtml += `<path d="${d}" fill="none" stroke="#22c55e" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14 8"/>`;
        }

        // Draw visited station waypoint dots
        for (let i = 0; i < artyomStep; i++) {
            const st = ARTYOM_JOURNEY[i];
            const cx = (st.x / 100 * W).toFixed(1);
            const cy = (st.y / 100 * H).toFixed(1);
            svgHtml += `<circle cx="${cx}" cy="${cy}" r="9" fill="#22c55e" stroke="#0f172a" stroke-width="3"/>`;
        }

        artyomJourneySvg.innerHTML = svgHtml;

        // Position Artyom's head marker at current step
        artyomHeadMarker.style.left = `${current.x}%`;
        artyomHeadMarker.style.top = `${current.y}%`;
        artyomHeadMarker.classList.remove('hidden');

        const stepLabelEl = document.getElementById('artyom-step-label');
        if (stepLabelEl) {
            stepLabelEl.innerHTML =
                `<span class="artyom-label-station">${artyomStep}/${ARTYOM_JOURNEY.length} · ${escapeHtml(current.name)}</span>` +
                `<span class="artyom-label-chapter">${escapeHtml(current.chapter)}</span>`;
        }

        // Update button state & checkered flag if all steps are displayed
        if (isFinished) {
            artyomBtn.classList.remove('active');
            artyomBtn.classList.add('completed');
            artyomBtnStatus.textContent = `${artyomStep}/${ARTYOM_JOURNEY.length}: ${current.name} (Click to reset)`;
            artyomBtnFlag.classList.remove('hidden');

            artyomFlagMarker.style.left = `${current.x}%`;
            artyomFlagMarker.style.top = `${current.y}%`;
            artyomFlagMarker.classList.remove('hidden');
        } else {
            artyomBtn.classList.add('active');
            artyomBtn.classList.remove('completed');
            artyomBtnStatus.textContent = `Step ${artyomStep}/${ARTYOM_JOURNEY.length}: ${current.name}`;
            artyomBtnFlag.classList.add('hidden');
            artyomFlagMarker.classList.add('hidden');
        }

        // Zoom in and focus on Artyom's current position just like selecting a station
        const imgW = mapImage.naturalWidth || 3709;
        const imgH = mapImage.naturalHeight || 3530;
        const targetScale = Math.max(1.55, scale);
        const posImgX = (current.x / 100) * imgW;
        const posImgY = (current.y / 100) * imgH;
        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;
        const isModalOpen = !stationModal.classList.contains('hidden');
        const modalOffset = (isModalOpen && vpW > 700) ? 190 : 0;
        const targetPanX = (vpW - modalOffset) / 2 - posImgX * targetScale;
        const targetPanY = vpH / 2 - posImgY * targetScale;

        animateTo(targetPanX, targetPanY, targetScale);
    }

    function onDragStart(e) {
        if (isUIElement(e.target)) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panStartX = panX;
        panStartY = panY;
        viewport.classList.add('dragging');
    }

    function onDragMove(e) {
        if (!isDragging) return;
        panX = panStartX + (e.clientX - dragStartX);
        panY = panStartY + (e.clientY - dragStartY);
        updateTransform();
    }

    function onDragEnd() {
        isDragging = false;
        viewport.classList.remove('dragging');
    }

    // Touch support
    let lastTouchDist = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    function onTouchStart(e) {
        if (isUIElement(e.target)) return;

        if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            panStartX = panX;
            panStartY = panY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            lastTouchDist = getTouchDist(e);
            const center = getTouchCenter(e);
            lastTouchX = center.x;
            lastTouchY = center.y;
        }
    }

    function onTouchMove(e) {
        if (isUIElement(e.target)) return;
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            panX = panStartX + (e.touches[0].clientX - dragStartX);
            panY = panStartY + (e.touches[0].clientY - dragStartY);
            updateTransform();
        } else if (e.touches.length === 2) {
            const dist = getTouchDist(e);
            const center = getTouchCenter(e);
            const zoomFactor = dist / lastTouchDist;

            zoomAt(center.x, center.y, zoomFactor);

            panX += center.x - lastTouchX;
            panY += center.y - lastTouchY;

            lastTouchDist = dist;
            lastTouchX = center.x;
            lastTouchY = center.y;
            updateTransform();
        }
    }

    function onTouchEnd() {
        isDragging = false;
    }

    function getTouchDist(e) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchCenter(e) {
        return {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
    }

    // Wheel zoom
    function onWheel(e) {
        if (
            e.target.closest('#search-results') ||
            e.target.closest('#legend-content') ||
            e.target.closest('#station-modal')
        ) {
            return;
        }
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        zoomAt(e.clientX, e.clientY, zoomFactor);
        updateTransform();
    }

    function zoomAt(clientX, clientY, factor) {
        const newScale = Math.min(Math.max(scale * factor, minScale), maxScale);
        const ratio = newScale / scale;

        panX = clientX - (clientX - panX) * ratio;
        panY = clientY - (clientY - panY) * ratio;
        scale = newScale;
    }

    // ===== Zoom Controls =====
    function addZoomControls() {
        const controls = document.createElement('div');
        controls.id = 'zoom-controls';

        const zoomIn = document.createElement('button');
        zoomIn.textContent = '+';
        zoomIn.title = 'Zoom in';
        zoomIn.addEventListener('click', () => {
            const cx = viewport.clientWidth / 2;
            const cy = viewport.clientHeight / 2;
            zoomAt(cx, cy, 1.4);
            updateTransform();
        });

        const zoomOut = document.createElement('button');
        zoomOut.textContent = '−';
        zoomOut.title = 'Zoom out';
        zoomOut.addEventListener('click', () => {
            const cx = viewport.clientWidth / 2;
            const cy = viewport.clientHeight / 2;
            zoomAt(cx, cy, 1 / 1.4);
            updateTransform();
        });

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '⌂';
        resetBtn.title = 'Reset view';
        resetBtn.addEventListener('click', () => {
            onImageLoaded();
        });

        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        controls.appendChild(resetBtn);
        document.body.appendChild(controls);
    }

    // ===== Search =====
    function setupSearch() {
        searchInput.addEventListener('input', onSearchInput);
        searchInput.addEventListener('keydown', onSearchKeydown);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) onSearchInput();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            searchResults.classList.add('hidden');
            clearHighlight();
            closeStationModal();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#search-container')) {
                searchResults.classList.add('hidden');
            }
        });
    }

    function normalizeGermanSearch(str) {
        return String(str || '')
            .toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[-'’`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stripDiacritics(str) {
        return String(str || '')
            .toLowerCase()
            .replace(/ß/g, 'ss')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[-'’`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function matchesSearchField(fieldValue, rawQuery, normQuery, asciiQuery) {
        if (!fieldValue) return 0;
        const lower = fieldValue.toLowerCase();
        const norm = normalizeGermanSearch(fieldValue);
        const ascii = stripDiacritics(fieldValue);

        const parts = lower.split('|').map(p => p.trim());
        const normParts = norm.split('|').map(p => p.trim());
        const asciiParts = ascii.split('|').map(p => p.trim());

        for (let i = 0; i < parts.length; i++) {
            if (
                parts[i] === rawQuery ||
                normParts[i] === normQuery ||
                asciiParts[i] === asciiQuery
            ) {
                return 3; // Exact match
            }
        }

        for (let i = 0; i < parts.length; i++) {
            if (
                parts[i].startsWith(rawQuery) ||
                normParts[i].startsWith(normQuery) ||
                asciiParts[i].startsWith(asciiQuery)
            ) {
                return 2; // Prefix match
            }
        }

        if (
            lower.includes(rawQuery) ||
            norm.includes(normQuery) ||
            ascii.includes(asciiQuery)
        ) {
            return 1; // Substring match
        }

        return 0;
    }

    function onSearchInput() {
        const query = searchInput.value.trim().toLowerCase();
        activeResultIndex = -1;

        if (!query) {
            searchResults.classList.add('hidden');
            clearBtn.classList.add('hidden');
            return;
        }

        clearBtn.classList.remove('hidden');

        const normQuery = normalizeGermanSearch(query);
        const asciiQuery = stripDiacritics(query);

        const scoredMatches = [];
        UNIQUE_STATIONS.forEach(s => {
            const nameScore = Math.max(
                matchesSearchField(s.name, query, normQuery, asciiQuery),
                matchesSearchField(s.deName, query, normQuery, asciiQuery),
                matchesSearchField(s.ruName, query, normQuery, asciiQuery)
            );
            const factionScore = matchesSearchField(s.faction, query, normQuery, asciiQuery);

            if (nameScore > 0 || factionScore > 0) {
                const rank = nameScore === 3 ? 0 : nameScore === 2 ? 1 : nameScore === 1 ? 2 : 3;
                scoredMatches.push({ station: s, rank });
            }
        });

        scoredMatches.sort((a, b) => a.rank - b.rank);
        const matches = scoredMatches.slice(0, 20).map(m => m.station);

        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No stations found</div>';
            searchResults.classList.remove('hidden');
            return;
        }

        searchResults.innerHTML = '';
        matches.forEach((station, i) => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.setAttribute('data-index', i);

            const dot = document.createElement('span');
            dot.className = 'station-dot';
            dot.style.background = station.color;

            const name = document.createElement('span');
            name.className = 'station-name';
            const idx = station.name.toLowerCase().indexOf(query);
            if (idx >= 0) {
                name.innerHTML =
                    escapeHtml(station.name.substring(0, idx)) +
                    '<strong style="color:#e94560">' +
                    escapeHtml(station.name.substring(idx, idx + query.length)) +
                    '</strong>' +
                    escapeHtml(station.name.substring(idx + query.length));
            } else {
                name.textContent = station.name;
            }

            const line = document.createElement('span');
            line.className = 'station-line';
            line.textContent = station.line;

            item.appendChild(dot);
            item.appendChild(name);
            item.appendChild(line);

            item.addEventListener('click', () => {
                searchInput.value = station.name;
                searchResults.classList.add('hidden');
                selectAndZoomStation(station);
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.remove('hidden');
    }

    function onSearchKeydown(e) {
        const items = searchResults.querySelectorAll('.result-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeResultIndex = Math.min(activeResultIndex + 1, items.length - 1);
            updateActiveResult(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeResultIndex = Math.max(activeResultIndex - 1, 0);
            updateActiveResult(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeResultIndex >= 0 && items[activeResultIndex]) {
                items[activeResultIndex].click();
            } else if (items.length >= 1) {
                items[0].click();
            }
        } else if (e.key === 'Escape') {
            searchResults.classList.add('hidden');
            searchInput.blur();
        }
    }

    function updateActiveResult(items) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === activeResultIndex);
            if (i === activeResultIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Select & Zoom to Station =====
    function focusStationInView(station, onComplete) {
        const imgW = mapImage.naturalWidth || 3709;
        const imgH = mapImage.naturalHeight || 3530;

        // Zoom in less so plenty of map context remains visible
        const targetScale = Math.max(1.15, scale);

        const stationImgX = (station.x / 100) * imgW;
        const stationImgY = (station.y / 100) * imgH;

        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;
        const isExpanded = stationModal.classList.contains('expanded');

        let targetCenterX = vpW / 2;
        let targetCenterY = vpH / 2;

        if (vpW <= 768) {
            // Mobile: modal is at the bottom; keep marker in the unobstructed upper area
            targetCenterY = isExpanded ? Math.max(96, vpH * 0.25) : Math.max(110, (vpH - 140) * 0.48);
        } else {
            // Desktop: modal is open on the right; offset horizontally
            targetCenterX = (vpW - 408) / 2;
        }

        const targetPanX = targetCenterX - stationImgX * targetScale;
        const targetPanY = targetCenterY - stationImgY * targetScale;

        animateTo(targetPanX, targetPanY, targetScale, onComplete);
    }

    function selectAndZoomStation(station) {
        clearHighlight();
        openStationModal(station);

        focusStationInView(station, () => {
            highlightStation(station);
        });
    }

    function selectStation(station, markerEl) {
        clearHighlight();
        highlightStation(station, markerEl);
        openStationModal(station);
        focusStationInView(station);
    }

    function highlightStation(station, clickedMarker) {
        highlightedStation = station;

        const markers = overlay.querySelectorAll('.station-marker');
        markers.forEach(marker => {
            if (marker.getAttribute('data-name') === station.name) {
                marker.classList.add('highlighted');
            }
        });

        highlightRing.classList.remove('hidden');
        highlightRing.style.left = `${station.x}%`;
        highlightRing.style.top = `${station.y}%`;
    }

    function clearHighlight() {
        highlightedStation = null;
        highlightRing.classList.add('hidden');
        overlay.querySelectorAll('.station-marker.highlighted').forEach(m => {
            m.classList.remove('highlighted');
        });
    }

    // ===== Station Modal & Metro Wiki Integration =====
    function toggleStationModalExpand() {
        if (viewport.clientWidth > 768) return;
        const isExpanded = stationModal.classList.toggle('expanded');
        if (modalExpandBtn) {
            modalExpandBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            modalExpandBtn.title = isExpanded ? 'Collapse station details' : 'Expand station details';
        }
        if (highlightedStation) {
            focusStationInView(highlightedStation);
        }
    }

    function setupModal() {
        modalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeStationModal();
        });

        if (modalExpandBtn) {
            modalExpandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleStationModalExpand();
            });
        }

        if (modalHeader) {
            modalHeader.addEventListener('click', (e) => {
                if (e.target.closest('#modal-close-btn') || e.target.closest('#modal-expand-btn')) return;
                toggleStationModalExpand();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !stationModal.classList.contains('hidden')) {
                closeStationModal();
            }
        });
    }

    function closeStationModal() {
        stationModal.classList.add('hidden');
        stationModal.classList.remove('expanded');
        stationModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    async function openStationModal(station) {
        const requestId = ++activeModalRequestId;

        stationModal.classList.remove('hidden');
        stationModal.classList.remove('expanded');
        stationModal.setAttribute('aria-hidden', 'false');
        if (modalExpandBtn) {
            modalExpandBtn.setAttribute('aria-expanded', 'false');
            modalExpandBtn.title = 'Expand station details';
        }
        document.body.classList.add('modal-open');

        // Header badges & titles
        modalLineBadge.textContent = station.line === 'Surface' ? 'Surface Location' : `${station.line} Line`;
        modalLineBadge.style.background = station.color || '#cc3333';

        if (station.faction) {
            modalFactionBadge.textContent = station.faction;
            modalFactionBadge.classList.remove('hidden');
        } else {
            modalFactionBadge.classList.add('hidden');
        }

        modalStationName.textContent = station.name;
        modalStationSubtitle.textContent = station.ruName ? `Russian: ${station.ruName}` : '';

        // Reset image & show loader
        modalStationImage.classList.add('hidden');
        modalStationImage.removeAttribute('src');
        modalImageCaption.classList.add('hidden');
        modalImageLoader.classList.remove('hidden');

        // Show initial infobox & lore immediately while wiki loads
        renderInfoboxMeta(station, {});
        renderStationText(station, null);
        modalTextLoader.classList.remove('hidden');

        const defaultWikiTitle = (station.wikiTitle || station.name).replace(/\s+/g, '_');
        modalWikiLink.href = `https://metrovideogame.fandom.com/wiki/${encodeURIComponent(defaultWikiTitle)}`;
        modalWikiLinkLabel.textContent = 'View on Metro Wiki';

        try {
            const wikiData = await getStationWikiData(station);
            if (requestId !== activeModalRequestId) return;

            modalTextLoader.classList.add('hidden');

            // Update wiki link
            if (wikiData.wikiUrl) {
                modalWikiLink.href = wikiData.wikiUrl;
                modalWikiLinkLabel.textContent = wikiData.wikiSourceLabel || 'View on Metro Wiki';
            }

            // Update infobox metadata
            renderInfoboxMeta(station, wikiData.infobox || {});

            // Update text
            renderStationText(station, wikiData);

            // Display image (with fallback chain)
            displayStationImage(station, wikiData, requestId);
        } catch (err) {
            if (requestId !== activeModalRequestId) return;
            modalTextLoader.classList.add('hidden');
            displayStationImage(station, {}, requestId);
        }
    }

    function renderInfoboxMeta(station, wikiInfobox) {
        const entries = [];
        entries.push({
            label: 'Line / Sector',
            value: station.line === 'Surface' ? 'Moscow Surface' : station.line
        });

        const factionVal = wikiInfobox.Faction || wikiInfobox.Governance || wikiInfobox.Affiliation || station.faction;
        if (factionVal) {
            entries.push({ label: 'Faction / Status', value: factionVal });
        }

        if (wikiInfobox.Status && wikiInfobox.Status !== factionVal) {
            entries.push({ label: 'Condition', value: wikiInfobox.Status });
        }

        if (wikiInfobox.Appearances) {
            entries.push({ label: 'Appearances', value: wikiInfobox.Appearances });
        }

        if (entries.length === 0) {
            modalInfoboxMeta.classList.add('hidden');
            return;
        }

        modalInfoboxMeta.innerHTML = '';
        entries.slice(0, 4).forEach(entry => {
            const div = document.createElement('div');
            div.className = 'infobox-item';

            const lbl = document.createElement('span');
            lbl.className = 'infobox-label';
            lbl.textContent = entry.label;

            const val = document.createElement('span');
            val.className = 'infobox-value';
            val.textContent = entry.value;

            div.appendChild(lbl);
            div.appendChild(val);
            modalInfoboxMeta.appendChild(div);
        });
        modalInfoboxMeta.classList.remove('hidden');
    }

    function renderStationText(station, wikiData) {
        modalStationText.innerHTML = '';

        const hasWikiSections = wikiData && wikiData.sections && wikiData.sections.length > 0;

        if (hasWikiSections) {
            wikiData.sections.forEach(sec => {
                if (sec.heading) {
                    const h4 = document.createElement('h4');
                    h4.textContent = sec.heading;
                    modalStationText.appendChild(h4);
                }
                sec.paragraphs.forEach(pText => {
                    const p = document.createElement('p');
                    p.textContent = pText;
                    modalStationText.appendChild(p);
                });
            });

            // Also include map universe lore if the wiki extract is very brief
            const totalChars = wikiData.sections.reduce(
                (acc, s) => acc + s.paragraphs.join(' ').length,
                0
            );
            if (totalChars < 220 && station.lore) {
                const h4 = document.createElement('h4');
                h4.textContent = 'Metro 2033 Universe Map';
                modalStationText.appendChild(h4);

                const p = document.createElement('p');
                p.textContent = station.lore;
                modalStationText.appendChild(p);
            }
        } else if (station.lore) {
            const p = document.createElement('p');
            p.textContent = station.lore;
            modalStationText.appendChild(p);

            if (wikiData && wikiData.extraSummary) {
                const h4 = document.createElement('h4');
                h4.textContent = 'Station Background';
                modalStationText.appendChild(h4);

                const p2 = document.createElement('p');
                p2.textContent = wikiData.extraSummary;
                modalStationText.appendChild(p2);
            }
        }
    }

    function displayStationImage(station, wikiData, requestId) {
        const candidates = [];
        if (wikiData.imageUrl) {
            candidates.push(wikiData.imageUrl);
            const unscaled = stripFandomScale(wikiData.imageUrl);
            if (unscaled !== wikiData.imageUrl) {
                candidates.push(unscaled);
            }
        }
        if (wikiData.fallbackImageUrl && !candidates.includes(wikiData.fallbackImageUrl)) {
            candidates.push(wikiData.fallbackImageUrl);
            const unscaledFallback = stripFandomScale(wikiData.fallbackImageUrl);
            if (unscaledFallback !== wikiData.fallbackImageUrl) {
                candidates.push(unscaledFallback);
            }
        }

        // Always append SVG station card as final guaranteed fallback
        candidates.push(createStationSvgDataUri(station));

        let idx = 0;

        function tryNext() {
            if (requestId !== activeModalRequestId) return;
            if (idx >= candidates.length) {
                modalImageLoader.classList.add('hidden');
                return;
            }
            const url = candidates[idx++];
            modalStationImage.onload = () => {
                if (requestId !== activeModalRequestId) return;
                modalImageLoader.classList.add('hidden');
                modalStationImage.classList.remove('hidden');
                if (wikiData.imageCaption && !url.startsWith('data:image/svg+xml')) {
                    modalImageCaption.textContent = wikiData.imageCaption;
                    modalImageCaption.classList.remove('hidden');
                } else {
                    modalImageCaption.classList.add('hidden');
                }
            };
            modalStationImage.onerror = () => {
                tryNext();
            };
            modalStationImage.alt = station.name;
            modalStationImage.src = url;
        }

        tryNext();
    }

    function stripFandomScale(url) {
        if (!url || !url.includes('static.wikia.nocookie.net')) return url;
        return url.replace(/\/scale-to-width-down\/\d+/, '');
    }

    function createStationSvgDataUri(station) {
        const color = station.color || '#e94560';
        const title = escapeXml(station.name);
        const ru = escapeXml(station.ruName || '');
        const line = escapeXml(station.line === 'Surface' ? 'SURFACE LOCATION' : `${station.line.toUpperCase()} LINE`);
        const faction = escapeXml(station.faction || 'METRO 2033 UNIVERSE');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#0f172a"/>
                    <stop offset="100%" stop-color="#1e293b"/>
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.32"/>
                    <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <rect width="600" height="340" fill="url(#bg)"/>
            <rect width="600" height="340" fill="url(#glow)"/>
            <!-- Tunnel arch -->
            <path d="M 110 340 A 190 190 0 0 1 490 340" fill="none" stroke="#334155" stroke-width="10"/>
            <path d="M 135 340 A 165 165 0 0 1 465 340" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="12 8" opacity="0.7"/>
            <!-- Tracks perspective -->
            <line x1="220" y1="340" x2="275" y2="235" stroke="#475569" stroke-width="4"/>
            <line x1="380" y1="340" x2="325" y2="235" stroke="#475569" stroke-width="4"/>
            <line x1="230" y1="320" x2="370" y2="320" stroke="#334155" stroke-width="3"/>
            <line x1="245" y1="292" x2="355" y2="292" stroke="#334155" stroke-width="3"/>
            <line x1="260" y1="264" x2="340" y2="264" stroke="#334155" stroke-width="2.5"/>
            <!-- Station emblem -->
            <circle cx="300" cy="115" r="38" fill="#0f172a" stroke="${color}" stroke-width="5"/>
            <circle cx="300" cy="115" r="28" fill="none" stroke="#e2e8f0" stroke-width="1.5" opacity="0.4"/>
            <text x="300" y="123" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="22" font-weight="700">M</text>
            <!-- Labels -->
            <text x="300" y="185" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="24" font-weight="700">${title}</text>
            <text x="300" y="210" text-anchor="middle" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="15">${ru}</text>
            <rect x="190" y="226" width="220" height="24" rx="12" fill="${color}" opacity="0.85"/>
            <text x="300" y="242" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" letter-spacing="1">${line}</text>
            <text x="300" y="274" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600">${faction}</text>
        </svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // ===== Metro Wiki API Pipeline =====
    function getCandidateWikiTitles(station) {
        const set = new Set();
        if (WIKI_ALIASES[station.name]) {
            WIKI_ALIASES[station.name].forEach(t => set.add(t));
        }
        if (station.wikiTitle) set.add(station.wikiTitle);
        set.add(station.name);

        // Add transliteration variations
        const base = station.wikiTitle || station.name;
        set.add(base.replace(/iy\b/g, 'y').replace(/ye/g, 'e'));
        set.add(base.replace(/y\b/g, 'iy'));
        set.add(base.replace(/yo/g, 'e').replace(/e/g, 'yo'));
        set.add(`${base} (station)`);

        return Array.from(set).filter(Boolean);
    }

    async function getStationWikiData(station) {
        const cacheKey = station.name.toLowerCase();
        if (wikiCache.has(cacheKey)) {
            return wikiCache.get(cacheKey);
        }

        const result = {
            imageUrl: null,
            fallbackImageUrl: null,
            imageCaption: null,
            infobox: {},
            sections: [],
            extraSummary: null,
            wikiUrl: null,
            wikiSourceLabel: 'View on Metro Wiki'
        };

        // 1. Query English Metro Wiki (metrovideogame.fandom.com)
        const enTitles = getCandidateWikiTitles(station);
        let matchedEnTitle = await findEnglishMetroWikiPage(enTitles, station);

        if (matchedEnTitle) {
            result.wikiUrl = `https://metrovideogame.fandom.com/wiki/${encodeURIComponent(matchedEnTitle.replace(/\s+/g, '_'))}`;
            result.wikiSourceLabel = `Metro Wiki: ${matchedEnTitle}`;

            const parsed = await fetchAndParseFandomPage('https://metrovideogame.fandom.com/api.php', matchedEnTitle);
            if (parsed) {
                if (parsed.imageUrl) {
                    result.imageUrl = parsed.imageUrl;
                    result.imageCaption = parsed.imageCaption || `${matchedEnTitle} (Metro Wiki)`;
                }
                result.infobox = parsed.infobox || {};
                if (parsed.sections && parsed.sections.length > 0) {
                    result.sections = parsed.sections;
                }
            }
        }

        // 2. If image is still missing, check Russian Metro 2033 Wiki (metro.fandom.com/ru) & English Wikipedia
        if (!result.imageUrl) {
            const [ruImg, wpData] = await Promise.all([
                fetchRussianMetroWikiImage(station),
                fetchWikipediaStationData(station)
            ]);

            if (ruImg) {
                result.imageUrl = ruImg.url;
                result.imageCaption = ruImg.caption;
                if (wpData && wpData.imageUrl) {
                    result.fallbackImageUrl = wpData.imageUrl;
                }
                if (!result.wikiUrl && ruImg.pageUrl) {
                    result.wikiUrl = ruImg.pageUrl;
                    result.wikiSourceLabel = 'View on Metro 2033 Wiki (RU)';
                }
            } else if (wpData && wpData.imageUrl) {
                result.imageUrl = wpData.imageUrl;
                result.imageCaption = `${station.name} Station (Moscow Metro)`;
            }

            if (wpData && wpData.extract) {
                result.extraSummary = wpData.extract;
            }
        } else {
            // Also fetch Wikipedia image in background as fallbackImageUrl in case Fandom thumbnail fails
            fetchWikipediaStationData(station).then(wpData => {
                if (wpData && wpData.imageUrl) {
                    result.fallbackImageUrl = wpData.imageUrl;
                }
            }).catch(() => {});
        }

        wikiCache.set(cacheKey, result);
        return result;
    }

    async function findEnglishMetroWikiPage(candidateTitles, station) {
        try {
            const url = `https://metrovideogame.fandom.com/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&titles=${encodeURIComponent(candidateTitles.join('|'))}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.query && data.query.pages) {
                const pages = Object.values(data.query.pages).filter(p => p.pageid && p.missing === undefined);
                if (pages.length > 0) {
                    // Prefer exact match to first candidate order
                    for (const cand of candidateTitles) {
                        const normCand = normalizeTitle(cand);
                        const found = pages.find(p => normalizeTitle(p.title) === normCand);
                        if (found) return found.title;
                    }
                    return pages[0].title;
                }
            }

            // Fallback: search API on metrovideogame.fandom.com
            const searchQuery = `${station.wikiTitle || station.name} station`;
            const searchUrl = `https://metrovideogame.fandom.com/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=5`;
            const sRes = await fetch(searchUrl);
            const sData = await sRes.json();

            if (sData && sData.query && sData.query.search && sData.query.search.length > 0) {
                const normStation = normalizeTitle(station.wikiTitle || station.name);
                for (const hit of sData.query.search) {
                    const normHit = normalizeTitle(hit.title.replace(/\(.*\)/, '').trim());
                    if (
                        normHit === normStation ||
                        normHit.includes(normStation) ||
                        normStation.includes(normHit)
                    ) {
                        return hit.title;
                    }
                }
            }
        } catch (e) {
            // Ignore network error and fall back gracefully
        }
        return null;
    }

    function normalizeTitle(str) {
        return String(str || '')
            .toLowerCase()
            .replace(/['’`\-]/g, ' ')
            .replace(/iy\b/g, 'y')
            .replace(/ye/g, 'e')
            .replace(/yo/g, 'o')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async function fetchAndParseFandomPage(apiBase, pageTitle) {
        try {
            const [queryRes, parseRes] = await Promise.all([
                fetch(`${apiBase}?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&titles=${encodeURIComponent(pageTitle)}`),
                fetch(`${apiBase}?action=parse&format=json&origin=*&redirects=1&prop=text&page=${encodeURIComponent(pageTitle)}`)
            ]);

            const [queryData, parseData] = await Promise.all([
                queryRes.json(),
                parseRes.json()
            ]);

            let imageUrl = null;
            let imageCaption = null;
            const infobox = {};
            const sections = [];

            if (queryData && queryData.query && queryData.query.pages) {
                const pageObj = Object.values(queryData.query.pages)[0];
                if (pageObj) {
                    if (pageObj.thumbnail && pageObj.thumbnail.source) {
                        imageUrl = pageObj.thumbnail.source;
                    } else if (pageObj.original && pageObj.original.source) {
                        imageUrl = pageObj.original.source;
                    }
                }
            }

            if (parseData && parseData.parse && parseData.parse.text && parseData.parse.text['*']) {
                const html = parseData.parse.text['*'];
                const doc = new DOMParser().parseFromString(html, 'text/html');

                // Extract portable infobox data & image
                const pi = doc.querySelector('.portable-infobox, .infobox');
                if (pi) {
                    if (!imageUrl) {
                        const piImg = pi.querySelector('img');
                        if (piImg) {
                            const rawSrc = piImg.getAttribute('data-src') || piImg.getAttribute('src');
                            if (rawSrc && !rawSrc.startsWith('data:')) {
                                imageUrl = rawSrc;
                            }
                        }
                    }
                    const capEl = pi.querySelector('.pi-caption, figcaption');
                    if (capEl && capEl.textContent.trim()) {
                        imageCaption = capEl.textContent.trim();
                    }

                    pi.querySelectorAll('.pi-item.pi-data').forEach(row => {
                        const labelEl = row.querySelector('.pi-data-label');
                        const valEl = row.querySelector('.pi-data-value');
                        if (labelEl && valEl) {
                            const k = cleanWikiText(labelEl.textContent).replace(/:$/, '');
                            const v = cleanWikiText(valEl.textContent);
                            if (k && v) {
                                infobox[k] = v;
                            }
                        }
                    });
                }

                // If image still not found, check article figures/thumbnails
                if (!imageUrl) {
                    const imgs = doc.querySelectorAll('figure img, .thumb img, .image img');
                    for (const img of imgs) {
                        const w = parseInt(img.getAttribute('width') || '200', 10);
                        if (w < 60) continue;
                        const rawSrc = img.getAttribute('data-src') || img.getAttribute('src');
                        if (rawSrc && !rawSrc.startsWith('data:')) {
                            imageUrl = rawSrc;
                            break;
                        }
                    }
                }

                // Remove non-prose elements before extracting article text
                doc.querySelectorAll(
                    '.portable-infobox, .infobox, aside, table, .navbox, .mbox, .toc, .mw-editsection, sup.reference, .reference, script, style, figure, .thumb, .gallery, .quote, dl'
                ).forEach(el => el.remove());

                const root = doc.querySelector('.mw-parser-output') || doc.body;
                let currentSection = { heading: null, paragraphs: [] };
                let totalParagraphs = 0;

                Array.from(root.children).forEach(node => {
                    if (totalParagraphs >= 6) return;
                    const tag = node.tagName;
                    if (tag === 'H2' || tag === 'H3') {
                        const headingText = cleanWikiText(node.textContent);
                        if (
                            headingText &&
                            !/^(references|trivia|gallery|see also|external links|appearances|notes|behind the scenes)$/i.test(headingText)
                        ) {
                            if (currentSection.paragraphs.length > 0) {
                                sections.push(currentSection);
                            }
                            currentSection = { heading: headingText, paragraphs: [] };
                        }
                    } else if (tag === 'P') {
                        const txt = cleanWikiText(node.textContent);
                        if (txt.length >= 35 && !txt.toLowerCase().startsWith('this article is a stub')) {
                            currentSection.paragraphs.push(txt);
                            totalParagraphs++;
                        }
                    }
                });

                if (currentSection.paragraphs.length > 0) {
                    sections.push(currentSection);
                }
            }

            return { imageUrl, imageCaption, infobox, sections };
        } catch (e) {
            return null;
        }
    }

    async function fetchRussianMetroWikiImage(station) {
        if (!station.ruName) return null;
        try {
            const titles = [
                `${station.ruName} (станция, Москва)`,
                `${station.ruName} (Метро 2033)`,
                `${station.ruName} (станция)`,
                station.ruName
            ];
            const url = `https://metro.fandom.com/ru/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&titles=${encodeURIComponent(titles.join('|'))}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.query && data.query.pages) {
                const pages = Object.values(data.query.pages).filter(p => p.pageid && p.missing === undefined);
                for (const p of pages) {
                    const src = (p.thumbnail && p.thumbnail.source) || (p.original && p.original.source);
                    if (src) {
                        return {
                            url: src,
                            caption: `${station.name} — ${station.ruName} (Metro 2033 Wiki)`,
                            pageUrl: `https://metro.fandom.com/ru/wiki/${encodeURIComponent(p.title.replace(/\s+/g, '_'))}`
                        };
                    }
                }
            }
        } catch (e) {
            // Ignore
        }
        return null;
    }

    async function fetchWikipediaStationData(station) {
        try {
            const base = station.wikiTitle || station.name;
            const titles = [
                `${base} (Moscow Metro)`,
                `${station.name} (Moscow Metro)`,
                base
            ];
            const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|extracts&exintro=1&explaintext=1&pithumbsize=600&titles=${encodeURIComponent(titles.join('|'))}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.query && data.query.pages) {
                const pages = Object.values(data.query.pages).filter(p => p.pageid && p.missing === undefined);
                for (const p of pages) {
                    const img = p.thumbnail && p.thumbnail.source ? p.thumbnail.source : null;
                    const extract = p.extract ? cleanWikiText(p.extract) : null;
                    if (img || extract) {
                        return { imageUrl: img, extract };
                    }
                }
            }
        } catch (e) {
            // Ignore
        }
        return null;
    }

    function cleanWikiText(text) {
        return String(text || '')
            .replace(/\[\d+\]/g, '')
            .replace(/\[citation needed\]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ===== Animation =====
    let activeAnimFrame = null;

    function animateTo(targetPanX, targetPanY, targetScale, callback) {
        if (activeAnimFrame) {
            cancelAnimationFrame(activeAnimFrame);
            activeAnimFrame = null;
        }
        const startPanX = panX;
        const startPanY = panY;
        const startScale = scale;
        const duration = 600;
        const startTime = performance.now();

        function easeInOut(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeInOut(progress);

            panX = startPanX + (targetPanX - startPanX) * ease;
            panY = startPanY + (targetPanY - startPanY) * ease;
            scale = startScale + (targetScale - startScale) * ease;

            updateTransform();

            if (progress < 1) {
                activeAnimFrame = requestAnimationFrame(step);
            } else {
                activeAnimFrame = null;
                if (callback) callback();
            }
        }

        activeAnimFrame = requestAnimationFrame(step);
    }

    // ===== Legend =====
    function setupLegend() {
        legendToggle.addEventListener('click', () => {
            const isExpanded = legendContent.classList.contains('expanded');
            if (isExpanded) {
                legendContent.classList.remove('expanded');
                legendContent.classList.add('collapsed');
                legendArrow.classList.remove('open');
            } else {
                legendContent.classList.remove('collapsed');
                legendContent.classList.add('expanded');
                legendArrow.classList.add('open');
            }
        });
    }

    // ===== Window Resize =====
    window.addEventListener('resize', () => {
        const imgW = mapImage.naturalWidth || 3709;
        const imgH = mapImage.naturalHeight || 3530;
        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;
        minScale = Math.min(vpW / imgW, vpH / imgH) * 0.9;
        if (scale < minScale) {
            scale = minScale;
            updateTransform();
        }
    });

    // ===== Start =====
    init();
})();
