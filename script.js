let platesData = [];
let selectedState = '';

async function loadData() {
    // 1. Chargement indépendant de la carte SVG
    loadSVGMap();

    // 2. Chargement sécurisé de la base de données JSON
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Fichier data.json introuvable (Code HTTP ${response.status})`);
        }
        
        platesData = await response.json();
        initStatesFilter();
        displayResults(platesData);
    } catch (error) {
        console.error("Erreur de chargement data.json :", error);
        const grid = document.getElementById('resultsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300">
                    <p class="font-bold text-sm">Erreur de chargement des données</p>
                    <p class="text-xs text-red-400/80 mt-1">${error.message}. Vérifiez le nom exact du fichier dans votre dépôt Git.</p>
                </div>`;
        }
    }
}

async function loadSVGMap() {
    const container = document.getElementById('svgContainer');
    if (!container) return;

    // Test successif des deux noms de fichiers possibles
    const mapFiles = ['germany-map.svg.svg', 'germany-map.svg'];
    let svgText = null;

    for (const file of mapFiles) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                svgText = await response.text();
                break;
            }
        } catch (e) {
            // Continuation vers le nom suivant
        }
    }

    if (svgText) {
        container.innerHTML = svgText;
        const svgElement = container.querySelector('svg');
        if (svgElement) {
            svgElement.id = 'germanyMap';
            svgElement.classList.add('w-full', 'max-w-[240px]', 'h-auto');
        }
        highlightMapState(selectedState);
    } else {
        container.innerHTML = `<span class="text-xs text-amber-400 text-center">Carte SVG introuvable sur le serveur</span>`;
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

    const mapAliases = {
        'bade-wurtemberg': ['bw', 'de-bw', 'de.bw', 'de_bw', 'de1', 'baden-württemberg', 'baden-wuerttemberg', 'baden-wurtemberg', 'bade-wurtemberg', 'bade-würtemberg', 'baden_wuerttemberg', 'baden-wurttemberg', 'path_de-bw', 'land_bw'],
        'bavière': ['bayern', 'by', 'de-by', 'de.by', 'de_by', 'de2', 'bavaria', 'bavière', 'baviere', 'path_de-by', 'land_by'],
        'berlin': ['berlin', 'be', 'de-be', 'de.be', 'de_be', 'de3', 'path_de-be', 'land_be'],
        'brandebourg': ['brandenburg', 'bb', 'de-bb', 'de.bb', 'de_bb', 'de4', 'brandebourg', 'path_de-bb', 'land_bb'],
        'brême': ['bremen', 'hb', 'de-hb', 'de.hb', 'de_hb', 'de5', 'brême', 'breme', 'path_de-hb', 'land_hb'],
        'hambourg': ['hamburg', 'hh', 'de-hh', 'de.hh', 'de_hh', 'de6', 'hambourg', 'path_de-hh', 'land_hh'],
        'hesse': ['hessen', 'he', 'de-he', 'de.he', 'de_he', 'de7', 'hesse', 'path_de-he', 'land_he'],
        'mecklemburg-poméranie-occidentale': ['mv', 'de-mv', 'de.mv', 'de_mv', 'de8', 'mecklenburg-vorpommern', 'mecklenburg_vorpommern', 'mecklenburg-pomeranie-occidentale', 'mecklemburg-poméranie-occidentale', 'mecklembourg-poméranie-occidentale', 'pomeranie'],
        'mecklembourg-poméranie-occidentale': ['mv', 'de-mv', 'de.mv', 'de_mv', 'de8', 'mecklenburg-vorpommern', 'mecklenburg_vorpommern', 'mecklenburg-pomeranie-occidentale', 'mecklemburg-poméranie-occidentale', 'mecklembourg-poméranie-occidentale', 'pomeranie'],
        'basse-saxe': ['niedersachsen', 'ni', 'de-ni', 'de.ni', 'de_ni', 'de9', 'basse-saxe', 'lower-saxony', 'path_de-ni', 'land_ni'],
        'rhénanie-du-nord-westphalie': ['nrw', 'nw', 'de-nw', 'de.nw', 'de_nw', 'dea', 'nordrhein-westfalen', 'nordrhein_westfalen', 'rhénanie-du-nord-westphalie', 'rhenanie-du-nord-westphalie', 'path_de-nw', 'land_nw'],
        'rhénanie-palatinat': ['rlp', 'rp', 'de-rp', 'de.rp', 'de_rp', 'deb', 'rheinland-pfalz', 'rheinland_pfalz', 'rhénanie-palatinat', 'rhenanie-palatinat', 'path_de-rp', 'land_rp'],
        'sarre': ['saarland', 'sl', 'de-sl', 'de.sl', 'de_sl', 'dec', 'sarre', 'path_de-sl', 'land_sl'],
        'saxe': ['sachsen', 'sn', 'de-sn', 'de.sn', 'de_sn', 'ded', 'saxe', 'saxony', 'path_de-sn', 'land_sn'],
        'saxe-anhalt': ['sachsen-anhalt', 'st', 'de-st', 'de.st', 'de_st', 'dee', 'saxe-anhalt', 'sachsen_anhalt', 'path_de-st', 'land_st'],
        'schleswig-holstein': ['schleswig-holstein', 'sh', 'de-sh', 'de.sh', 'de_sh', 'def', 'schleswig_holstein', 'path_de-sh', 'land_sh'],
        'thuringe': ['thüringen', 'thueringen', 'th', 'de-th', 'de.th', 'de_th', 'deg', 'thuringe', 'thuringen', 'path_de-th', 'land_th'],
        'fédéral': ['bund', 'de-bund', 'de_bund', 'fédéral', 'federal']
    };

    const stateKey = (state || '').toLowerCase().trim();
    const targetAliases = stateKey ? (mapAliases[stateKey] || [stateKey]) : [];

    const shapes = svg.querySelectorAll('path, polygon, rect, circle, use');

    shapes.forEach(el => {
        let tokens = new Set();
        let current = el;
        while (current && current !== svg && current.tagName !== 'svg') {
            if (current.id) tokens.add(current.id.toLowerCase().trim());
            if (current.getAttribute('name')) tokens.add(current.getAttribute('name').toLowerCase().trim());
            if (current.getAttribute('class')) {
                current.getAttribute('class').toLowerCase().trim().split(/\s+/).forEach(c => tokens.add(c));
            }
            if (current.dataset) {
                if (current.dataset.state) tokens.add(current.dataset.state.toLowerCase().trim());
                if (current.dataset.land) tokens.add(current.dataset.land.toLowerCase().trim());
                if (current.dataset.landId) tokens.add(current.dataset.landId.toLowerCase().trim());
            }
            current = current.parentElement;
        }

        const isMatch = stateKey !== '' && targetAliases.some(alias => tokens.has(alias));

        if (isMatch) {
            el.style.setProperty('fill', '#2563eb', 'important');
            el.style.setProperty('stroke', '#ffffff', 'important');
            el.style.setProperty('stroke-width', '1.5px', 'important');
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('transition', 'all 0.3s ease', 'important');
        } else {
            el.style.removeProperty('fill');
            el.style.removeProperty('stroke');
            el.style.removeProperty('stroke-width');
            el.style.removeProperty('opacity');
            el.style.removeProperty('transition');
        }
    });
}

function displayResults(data) {
    const grid = document.getElementById('resultsGrid');
    const countLabel = document.getElementById('resultCount');
    grid.innerHTML = '';
    
    if (countLabel) {
        countLabel.textContent = `${data.length} résultat(s) affiché(s)`;
    }

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p class="text-slate-300 font-medium">Aucun résultat trouvé.</p>
                <p class="text-xs text-slate-500 mt-1">Si la case "Préfixe exact" est cochée, décochez-la pour effectuer une recherche plus large.</p>
            </div>`;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/80 p-5 flex items-center space-x-5 hover:border-blue-500/50 transition-all group cursor-pointer';
        
        card.onclick = () => selectState(item.state);

        card.innerHTML = `
            <div class="flex border-2 border-slate-700 rounded-xl overflow-hidden bg-white shadow-md shrink-0 w-32 h-16 items-center group-hover:scale-105 transition-transform">
                <div class="bg-blue-700 text-white w-7 h-full flex flex-col items-center justify-between py-1.5 shadow-inner">
                    <svg class="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
                    </svg>
                    <span class="text-[10px] font-black tracking-widest">D</span>
                </div>
                <div class="flex-1 flex items-center justify-center font-black tracking-widest text-2xl text-slate-900">
                    ${item.prefix}
                </div>
            </div>
            <div class="overflow-hidden">
                <h3 class="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate">${item.city}</h3>
                <p class="text-xs text-blue-400 font-semibold mt-0.5">${item.state}</p>
                <p class="text-xs text-slate-400 truncate mt-1">${item.region}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterData() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const exactCheckbox = document.getElementById('exactMatchCheckbox');
    const isExactMatch = exactCheckbox ? exactCheckbox.checked : false;
    
    let filtered = platesData.filter(item => {
        const matchesState = selectedState === '' || item.state === selectedState;
        if (!matchesState) return false;

        if (term === '') return true;

        if (isExactMatch) {
            return item.prefix.toLowerCase() === term;
        } else {
            return item.prefix.toLowerCase().includes(term) ||
                   item.city.toLowerCase().includes(term) ||
                   item.state.toLowerCase().includes(term) ||
                   item.region.toLowerCase().includes(term);
        }
    });

    displayResults(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterData);
const exactCb = document.getElementById('exactMatchCheckbox');
if (exactCb) exactCb.addEventListener('change', filterData);

loadData();