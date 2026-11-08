let platesData = [];
let selectedState = '';

async function loadData() {
    try {
        const response = await fetch('data.json');
        platesData = await response.json();
        
        await loadSVGMap();
        initStatesFilter();
        displayResults(platesData);
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

async function loadSVGMap() {
    const container = document.getElementById('svgContainer');
    if (!container) return;

    try {
        let svgResponse = await fetch('germany-map.svg.svg');
        if (!svgResponse.ok) {
            svgResponse = await fetch('germany-map.svg');
        }

        if (svgResponse.ok) {
            const svgText = await svgResponse.text();
            container.innerHTML = svgText;
            const svgElement = container.querySelector('svg');
            if (svgElement) {
                svgElement.id = 'germanyMap';
                svgElement.classList.add('w-full', 'max-w-[240px]', 'h-auto');
            }
            highlightMapState(selectedState);
        }
    } catch (e) {
        console.warn("Impossible de charger la carte SVG.", e);
    }
}

function initStatesFilter() {
    const container = document.getElementById('statesFilterContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const states = [...new Set(platesData.map(item => item.state))].sort();

    const allBtn = document.createElement('button');
    allBtn.id = 'btn-all';
    allBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
    allBtn.textContent = '🇩🇪 Tous les Länder';
    allBtn.onclick = () => selectState('');
    container.appendChild(allBtn);

    states.forEach(state => {
        const btn = document.createElement('button');
        btn.dataset.state = state;
        btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-700/80 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-600/60';
        btn.textContent = state;
        btn.onclick = () => selectState(state);
        container.appendChild(btn);
    });
}

function selectState(state) {
    selectedState = state;
    
    const buttons = document.querySelectorAll('.state-btn');
    const allBtn = document.getElementById('btn-all');
    const label = document.getElementById('mapHoverLabel');
    if (label) label.textContent = state || 'Toutes les régions';

    buttons.forEach(btn => {
        if (btn.dataset.state === state) {
            btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
        } else {
            btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-700/80 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-600/60';
        }
    });

    if (allBtn) {
        allBtn.className = state === '' 
            ? 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-700/80 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-600/60';
    }

    highlightMapState(state);
    filterData();
}

function highlightMapState(state) {
    const svg = document.getElementById('germanyMap');
    if (!svg) return;

    // Dictionnaire d'alias stricts par Land
    const mapAliases = {
        'bade-wurtemberg': ['bw', 'de-bw', 'de.bw', 'de_bw', 'de1', 'baden-württemberg', 'baden-wuerttemberg', 'baden-wurtemberg', 'bade-wurtemberg', 'bade-würtemberg', 'baden_wuerttemberg', 'baden-wurttemberg', 'path_de-bw', 'land_bw'],
        'bavière': ['bayern', 'by', 'de-by', 'de.by', 'de_by', 'de2', 'bavaria', 'bavière', 'baviere', 'path_de-by', 'land_by'],
        'berlin': ['berlin', 'be', 'de-be', 'de.be', 'de_be', 'de3', 'path_de-be', 'land_be'],
        'brandebourg': ['brandenburg', 'bb', 'de-bb', 'de.bb', 'de_bb', 'de4', 'brandebourg', 'path_de-bb', 'land_bb'],
        'brême': ['bremen', 'hb', 'de-hb', 'de.hb', 'de_hb', 'de5', 'brême', 'breme', 'path_de-hb', 'land_hb'],
        'hambourg': ['hamburg', 'hh', 'de-hh', 'de.hh', 'de_hh', 'de6', 'hambourg', 'path_de-hh', 'land_hh'],
        'hesse': ['hessen', 'he', 'de-he', 'de.he', 'de_he', 'de7', 'hesse', 'path_de-he', 'land_he'],
        'mecklemburg-poméranie-occidentale': ['mv', 'de-mv', 'de.mv', 'de_mv', 'de8', 'mecklenburg-vorpommern', 'mecklenburg_vorpommern', 'mecklenburg-pomeranie-occidentale', 'mecklemburg-poméranie-occidentale', 'mecklembourg-poméranie-occidentale', 'path_de-mv', 'land_mv'],
        'basse-saxe': ['niedersachsen', 'ni', 'de-ni', 'de.ni', 'de_ni', 'de9', 'basse-saxe', 'lower-saxony', 'path_de-ni', 'land_ni'],
        'rhénanie-du-nord-westphalie': ['nrw', 'nw', 'de-nw', 'de.nw', 'de_nw', 'dea', 'nordrhein-westfalen', 'nordrhein_westfalen', 'rhénanie-du-nord-westphalie', 'rhenanie-du-nord-westphalie', 'path_de-nw', 'land_nw'],
        'rhénanie-palatinat': ['rlp', 'rp', 'de-rp', 'de.rp', 'de_rp', 'deb', 'rheinland-pfalz', 'rheinland_pfalz', 'rhénanie-palatinat', 'rhenanie-palatinat', 'path_de-rp', 'land_rp'],
        'sarre': ['saarland', 'sl', 'de-sl', 'de.sl', 'de_sl', 'dec', 'sarre', 'path_de-sl', 'land_sl'],
        'saxe': ['sachsen', 'sn', 'de-sn', 'de.sn', 'de_sn', 'ded', 'saxe', 'saxony', 'path_de-sn', 'land_sn'],
        'saxe-anhalt': ['sachsen-anhalt', 'st', 'de