// Legend data extracted from the Metro 2033 Universe Map
const LEGEND_DATA = [
    // === FACTIONS ===
    { category: "Factions & Political Entities" },
    { symbol: "circle", color: "#c8a84e", label: "Commonwealth of the Stations of the Ring Line (Hanza)" },
    { symbol: "circle", color: "#cc3333", label: "Red Line" },
    { symbol: "circle", color: "#3366cc", label: "Polis" },
    { symbol: "circle", color: "#555555", label: "Fourth Reich" },
    { symbol: "circle", color: "#66aa55", label: "Arbat Confederation" },
    { symbol: "circle", color: "#cc6633", label: "VDNKh Commonwealth" },
    { symbol: "circle", color: "#996633", label: "Year 1905 Confederation" },
    { symbol: "circle", color: "#aa5577", label: "Baumanskaya Alliance" },
    { symbol: "circle", color: "#7744aa", label: "Kalininskaya Confederation" },
    { symbol: "circle", color: "#448866", label: "Pechatniki Confederation" },
    { symbol: "circle", color: "#779944", label: "Yasenevskyaya Community" },
    { symbol: "circle", color: "#886644", label: "1st of May Republic" },
    { symbol: "circle", color: "#446688", label: '"Europe"' },
    { symbol: "circle", color: "#884444", label: "Savage Cannibals of the Great Worm Cult" },
    { symbol: "circle", color: "#6a5acd", label: "Huliajpole Republic" },
    { symbol: "circle", color: "#2e8b57", label: "Sevastopolskaya Hydroelectric Station" },
    { symbol: "circle", color: "#4682b4", label: "Moscow State University (Emerald City)" },
    { symbol: "circle", color: "#8b7355", label: "Farms and Factories" },
    { symbol: "circle", color: "#b8860b", label: "Antiquarians" },
    { symbol: "circle", color: "#556b2f", label: "The Northern Emirate" },
    { symbol: "circle", color: "#bc8f8f", label: "Skaven Stations Commonwealth" },
    { symbol: "circle", color: "#cd853f", label: "Altuf'yevo Libertines" },
    { symbol: "circle", color: "#a0522d", label: "Trade Outposts" },
    { symbol: "circle", color: "#808000", label: "Smithy Technicians" },
    { symbol: "circle", color: "#708090", label: "Human-Mutant Society" },
    { symbol: "circle", color: "#9acd32", label: "Free City of Tushino" },

    // === IDEOLOGICAL GROUPS ===
    { category: "Ideological Groups & Organizations" },
    { symbol: "circle", color: "#dc143c", label: "Trotskyist Bases (Revolutionaries)" },
    { symbol: "circle", color: "#8b0000", label: "Satanists" },
    { symbol: "circle", color: "#483d8b", label: "Ryazan Community" },
    { symbol: "circle", color: "#2f4f4f", label: "Mitino Commonwealth" },
    { symbol: "circle", color: "#daa520", label: "Pagans" },
    { symbol: "circle", color: "#d2b48c", label: "Independent Stations" },
    { symbol: "circle", color: "#f5f5dc", border: "#999", label: "Inhabited Stations" },
    { symbol: "circle", color: "#778899", label: "Organized Crime (Bandits)" },
    { symbol: "circle", color: "#ff69b4", label: "Feminists" },
    { symbol: "circle", color: "#ffa500", label: 'Tsoi Cult (Sun Worshippers)' },
    { symbol: "circle", color: "#696969", label: "Bunkers" },
    { symbol: "circle", color: "#4169e1", label: 'Academic Dormitory ("Five")' },
    { symbol: "circle", color: "#8fbc8f", label: '"New Babylon" (Cherkizovsky Market)' },

    // === LOCATIONS ===
    { category: "Locations & Settlements" },
    { symbol: "square", color: "#808080", label: 'Gorbushkin Dvor Marketplace ("Gorbushka")' },
    { symbol: "square", color: "#555555", label: "German Embassy" },
    { symbol: "square", color: "#8b4513", label: "Raiders" },
    { symbol: "square", color: "#556b2f", label: "Bunker GO-42" },
    { symbol: "square", color: "#4682b4", label: "Ded Moroz's Estate" },
    { symbol: "square", color: "#654321", label: "Hermit's Shelter" },
    { symbol: "square", color: "#daa520", label: "Militant-Orthodox Community" },
    { symbol: "square", color: "#8b0000", label: "Rublev Community" },
    { symbol: "square", color: "#228b22", label: "Children of the Dragon" },
    { symbol: "square", color: "#c0c0c0", label: '"The Ring"' },
    { symbol: "square", color: "#a0522d", label: "Abode (Underground Shelter)" },
    { symbol: "square", color: "#d2b48c", label: "Inhabited Settlement" },
    { symbol: "square", color: "#778899", label: "Cleaners" },

    // === PEOPLE & GROUPS ===
    { category: "People & Creatures" },
    { symbol: "diamond", color: "#cc3333", label: "Cannibals (The Rippers)" },
    { symbol: "diamond", color: "#daa520", label: '"Templars" (Temple Dwellers)' },
    { symbol: "diamond", color: "#4682b4", label: "Railwaymen" },
    { symbol: "diamond", color: "#556b2f", label: "Settlement on the Moscow Sea" },
    { symbol: "diamond", color: "#228b22", label: "Swamp (Forest) Community" },
    { symbol: "diamond", color: "#808080", label: "Shopping Center" },
    { symbol: "diamond", color: "#daa520", label: "Kolonia (Community)" },
    { symbol: "diamond", color: "#8b4513", label: "Valley-Dwellers" },
    { symbol: "diamond", color: "#696969", label: "Cavemen" },
    { symbol: "diamond", color: "#2e8b57", label: "Amazons" },
    { symbol: "diamond", color: "#8b0000", label: "Pygmies" },

    // === STATION STATUS ===
    { category: "Station & Tunnel Status" },
    { symbol: "circle", color: "#ffffff", border: "#666", label: "Transit Stations" },
    { symbol: "circle", color: "#999999", label: "Abandoned Stations" },
    { symbol: "circle", color: "#4682b4", label: "Flooded Stations" },
    { symbol: "circle", color: "#8b0000", label: "Destroyed Stations" },
    { symbol: "square", color: "#ff4500", label: "Dangerous Tunnels" },
    { symbol: "square", color: "#808080", label: "Depot" },
    { symbol: "square", color: "#a9a9a9", label: "Surface Railway" },
    { symbol: "square", color: "#696969", label: "Maintenance Tunnels" },
    { symbol: "square", color: "#333333", label: "Underground Passage" },
    { symbol: "square", color: "#4b0082", label: "Entrance to Metro-2 (Government Communications)" },

    // === HAZARDS ===
    { category: "Hazards & Anomalies" },
    { symbol: "triangle", color: "#ffff00", label: "Radiation Hazard" },
    { symbol: "triangle", color: "#00cc00", label: "Biological Hazard" },
    { symbol: "triangle", color: "#cc00cc", label: "Mental Hazard" },
    { symbol: "triangle", color: "#ff6600", label: "Tunnel Collapse Hazard" },
    { symbol: "triangle", color: "#cc3333", label: "Various Hazards" },
    { symbol: "triangle", color: "#884488", label: "Great Worm Cultists" },
    { symbol: "triangle", color: "#666666", label: 'Jehovah\'s Witnesses ("The Watchtower")' },
    { symbol: "triangle", color: "#ff0000", label: "Dangerous Chemicals" },
    { symbol: "triangle", color: "#aaaaaa", label: "Ghost Train" },
    { symbol: "square", color: "#222222", border: "#888", label: '"Blacks" (Dark Ones)' },
    { symbol: "square", color: "#8b4513", label: "Krishnaites" },
    { symbol: "square", color: "#654321", label: "The Bonds of Strength" },

    // === LOCATIONS STATUS ===
    { category: "Area Status" },
    { symbol: "circle", color: "#8b0000", border: "#ff0000", label: "Locations Overrun by Mutants" },
    { symbol: "square", color: "#c0c0c0", border: "#333", label: "Bunkers in Leningradsky" },
    { symbol: "square", color: "#2e8b57", label: "Swamp" },
    { symbol: "square", color: "#666666", label: "FOO" },
    { symbol: "circle", color: "#ffcccc", border: "#cc0000", label: "Abandoned District/Town" },
    { symbol: "circle", color: "#ff6666", border: "#cc0000", label: "Destroyed District/Town" },
    { symbol: "circle", color: "#ffaa00", label: "Unexplored Station" },
];

function renderLegend() {
    const grid = document.getElementById('legend-grid');
    grid.innerHTML = '';

    LEGEND_DATA.forEach(item => {
        if (item.category) {
            const cat = document.createElement('div');
            cat.className = 'legend-category';
            cat.textContent = item.category;
            grid.appendChild(cat);
            return;
        }

        const el = document.createElement('div');
        el.className = 'legend-item';

        const sym = document.createElement('span');
        sym.className = 'legend-symbol';

        if (item.symbol === 'circle') {
            sym.style.background = item.color;
            if (item.border) sym.style.border = `2px solid ${item.border}`;
        } else if (item.symbol === 'square') {
            sym.classList.add('square');
            sym.style.background = item.color;
            if (item.border) sym.style.border = `2px solid ${item.border}`;
        } else if (item.symbol === 'diamond') {
            sym.classList.add('diamond');
            sym.style.background = item.color;
        } else if (item.symbol === 'triangle') {
            sym.classList.add('triangle');
            sym.style.color = item.color;
        }

        const lbl = document.createElement('span');
        lbl.textContent = item.label;

        el.appendChild(sym);
        el.appendChild(lbl);
        grid.appendChild(el);
    });
}
