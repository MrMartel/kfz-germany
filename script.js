let platesData = [];
let selectedState = '';

async function loadData() {
    loadSVGMap();

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Fichier data.json introuvable (HTTP ${response.status})`);
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
                    <p class="text-xs text-red-400/80 mt-1">${error.message}. Vérifiez la casse du fichier sur GitHub Pages.</p>
                </div>`;
        }
    }
}

async function loadSVGMap() {
    const container = document.getElementById('svgContainer');
    if (!container) return;

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
            // Continuation
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
        container.innerHTML = `<span class="text-xs text-amber-400 text-center">Carte SVG introuvable</span>`;
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

    // Définition de motifs d'expressions régulières stricts (\b = mot entier) pour chaque Land
    const statePatterns = {
        'bade-wurtemberg': [/\bde[-_]?bw\b/i, /\bbw\b/i, /\bbaden\b/i, /\bw[uüa]rt[t]?emberg\b/i],
        'bavière': [/\bde[-_]?by\b/i, /\bby\b/i, /\bbayern\b/i, /\bbavaria\b/i, /\bbavi[eè]re\b/i],
        'berlin': [/\bde[-_]?be\b/i, /\bbe\b/i, /\bberlin\b/i],
        'brandebourg': [/\bde[-_]?bb\b/i, /\bbb\b/i, /\bbrandenburg\b/i, /\bbrandebourg\b/i],
        'brême': [/\bde[-_]?hb\b/i, /\bhb\b/i, /\bbremen\b/i, /\bbr[eê]me\b/i],
        'hambourg': [/\bde[-_]?hh\b/i, /\bhh\b/i, /\bhamburg\b/i, /\bhambourg\b/i],
        'hesse': [/\bde[-_]?he\b/i, /\bhe\b/i, /\bhessen\b/i, /\bhesse\b/i],
        'mecklemburg-poméranie-occidentale': [/\bde[-_]?mv\b/i, /\bmv\b/i, /\bmecklenburg\b/i, /\bvorpommern\b/i, /\bpomeranie\b/i],
        'mecklembourg-poméranie-occidentale': [/\bde[-_]?mv\b/i, /\bmv\b/i, /\bmecklenburg\b/i, /\bvorpommern\b/i, /\bpomeranie\b/i],
        'basse-saxe': [/\bde[-_]?ni\b/i, /\bni\b/i, /\bniedersachsen\b/i, /\bbasse[-_]?saxe\b/i],
        'rhénanie-du-nord-westphalie': [/\bde[-_]?nw\b/i, /\bnw\b/i, /\bnrw\b/i, /\bnordrhein\b/i, /\bwestfalen\b/i],
        'rhénanie-palatinat': [/\bde[-_]?rp\b/i, /\brp\b/i, /\brlp\b/i, /\brheinland\b/i, /\bpfalz\b/i, /\bpalatinat\b/i],
        'sarre': [/\bde[-_]?sl\b/i, /\bsl\b/i, /\bsaarland\b/i, /\bsarre\b/i],
        'saxe': [/\bde[-_]?sn\b/i, /\bsn\b/i, /\bsachsen\b/i, /\bsaxe\b/i],
        'saxe-anhalt': [/\bde[-_]?st\b/i, /\bst\b/i, /\banhalt\b/i],
        'schleswig-holstein': [/\bde[-_]?sh\b/i, /\bsh\b/i, /\bschleswig\b/i, /\bholstein\b/i],
        'thuringe': [/\bde[-_]?th\b/i, /\bth\b/i, /\bth[uü]ringen\b/i, /\bthuringe\b/i],
        'fédéral': [/\bbund\b/i]
    };

    const key = (state || '').toLowerCase().trim();
    const patterns = statePatterns[key] || [];

    const shapes = svg.querySelectorAll('path, polygon, rect, circle, use');

    shapes.forEach(el => {
        let attrString = '';
        let current = el;
        while (current && current !== svg && current.tagName !== 'svg') {
            if (current.id) attrString += ' ' + current.id;
            if (current.getAttribute('name')) attrString += ' ' + current.getAttribute('name');
            if (current.getAttribute('class')) attrString += ' ' + current.getAttribute('class');
            if (current.dataset) {
                if (current.dataset.state) attrString += ' ' + current.dataset.state;
                if (current.dataset.land) attrString += ' ' + current.dataset.land;
                if (current.dataset.landId) attrString += ' ' + current.dataset.landId;
            }
            current = current.parentElement;
        }

        let isMatch = false;

        if (key !== '' && patterns.length > 0) {
            const hasExclusion = (
                (key === 'saxe' && (/\banhalt\b/i.test(attrString) || /\bnieder\b/i.test(attrString) || /\bbasse\b/i.test(attrString))) ||
                (key === 'hesse' && /\brhein\b/i.test(attrString)) ||
                (key === 'rhénanie-palatinat' && /\bvorpommern\b/i.test(attrString))
            );

            if (!hasExclusion) {
                isMatch = patterns.some(pattern => pattern.test(attrString));
            }
        }

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