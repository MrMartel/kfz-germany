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

    const mapAliases = {
        'bade-wurtemberg': ['bw', 'de-bw', 'de.bw', 'de_bw', 'de1', 'baden-württemberg', 'baden-wuerttemberg', 'baden-wurtemberg', 'bade-wurtemberg', 'bade-würtemberg', 'baden_wuerttemberg'],
        'bavière': ['bayern', 'de-by', 'de.by', 'de_by', 'de2', 'bavaria', 'bavière', 'baviere', 'by'],
        'berlin': ['berlin', 'de-be', 'de.be', 'de_be', 'de3', 'be'],
        'brandebourg': ['brandenburg', 'de-bb', 'de.bb', 'de_bb', 'de4', 'brandebourg', 'bb'],
        'brême': ['bremen', 'de-hb', 'de.hb', 'de_hb', 'de5', 'brême', 'breme', 'hb'],
        'hambourg': ['hamburg', 'de-hh', 'de.hh', 'de_hh', 'de6', 'hambourg', 'hh'],
        'hesse': ['hessen', 'hesse', 'de-he', 'de.he', 'de_he', 'de7', 'he'],
        'mecklemburg-poméranie-occidentale': ['mv', 'de-mv', 'de.mv', 'de_mv', 'de8', 'mecklenburg-vorpommern', 'mecklenburg_vorpommern', 'mecklenburg', 'mecklemburg', 'mecklembourg-poméranie-occidentale', 'pomeranie'],
        'mecklembourg-poméranie-occidentale': ['mv', 'de-mv', 'de.mv', 'de_mv', 'de8', 'mecklenburg-vorpommern', 'mecklenburg_vorpommern', 'mecklenburg', 'mecklemburg', 'mecklembourg-poméranie-occidentale', 'pomeranie'],
        'basse-saxe': ['niedersachsen', 'de-ni', 'de.ni', 'de_ni', 'de9', 'basse-saxe', 'lower-saxony', 'ni'],
        'rhénanie-du-nord-westphalie': ['nrw', 'de-nw', 'de.nw', 'de_nw', 'dea', 'nordrhein-westfalen', 'nordrhein_westfalen', 'rhénanie-du-nord-westphalie', 'rhenanie-du-nord-westphalie', 'nw'],
        'rhénanie-palatinat': ['rlp', 'de-rp', 'de.rp', 'de_rp', 'deb', 'rheinland-pfalz', 'rheinland_pfalz', 'rhénanie-palatinat', 'rhenanie-palatinat', 'rp'],
        'sarre': ['saarland', 'de-sl', 'de.sl', 'de_sl', 'dec', 'sarre', 'sl'],
        'saxe': ['sachsen', 'de-sn', 'de.sn', 'de_sn', 'ded', 'saxe', 'saxony', 'sn'],
        'saxe-anhalt': ['st', 'de-st', 'de.st', 'de_st', 'dee', 'sachsen-anhalt', 'sachsen_anhalt', 'saxe-anhalt'],
        'schleswig-holstein': ['sh', 'de-sh', 'de.sh', 'de_sh', 'def', 'schleswig-holstein', 'schleswig_holstein', 'schleswig'],
        'thuringe': ['thueringen', 'de-th', 'de.th', 'de_th', 'deg', 'thüringen', 'thuringen', 'thuringe', 'th'],
        'fédéral': ['bund', 'de-bund', 'de_bund', 'fédéral', 'federal']
    };

    const stateKey = (state || '').toLowerCase().trim();
    const targetAliases = stateKey ? (mapAliases[stateKey] || [stateKey]) : [];

    // Sélection de toutes les formes géométriques du SVG
    const shapes = svg.querySelectorAll('path, polygon, rect, circle');

    shapes.forEach(el => {
        // Remonter jusqu'à la racine <svg> pour récupérer les IDs/Classes parents (<g id="DE-SH">)
        let identifiers = [];
        let current = el;
        while (current && current !== svg && current.tagName !== 'svg') {
            if (current.id) identifiers.push(current.id);
            if (current.getAttribute('name')) identifiers.push(current.getAttribute('name'));
            if (current.getAttribute('class')) identifiers.push(current.getAttribute('class'));
            if (current.dataset) {
                if (current.dataset.state) identifiers.push(current.dataset.state);
                if (current.dataset.land) identifiers.push(current.dataset.land);
                if (current.dataset.landId) identifiers.push(current.dataset.landId);
            }
            current = current.parentElement;
        }

        const infoText = identifiers.join(' ').toLowerCase();

        // Analyse par expression régulière exacte
        const isMatch = stateKey !== '' && targetAliases.some(alias => {
            const cleanAlias = alias.toLowerCase().trim();
            const regex = new RegExp(`(?:^|[^a-z0-9])${cleanAlias.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i');
            return regex.test(infoText) || (cleanAlias.length > 3 && infoText.includes(cleanAlias));
        });

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