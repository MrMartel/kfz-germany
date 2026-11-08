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

    const item = platesData.find(d => d.state === state);
    const landId = item ? (item.landId || '').toLowerCase().trim() : '';
    const stateClean = (state || '').toLowerCase().trim();

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

        const str = attrString.toLowerCase();
        let isMatch = false;

        if (stateClean === '') {
            isMatch = true;
        } else {
            if (landId === 'bw' || stateClean.includes('bade') || stateClean.includes('baden')) {
                isMatch = /\b(de[-_]?bw|bw|baden|w[uüe]+r[t]+emberg)\b/i.test(str) || str.includes('bw') || str.includes('baden');
            } else if (landId === 'bayern' || stateClean.includes('bav')) {
                isMatch = /\b(de[-_]?by|by|bayern|bavaria|baviere|bavière)\b/i.test(str);
            } else if (landId === 'berlin' || stateClean === 'berlin') {
                isMatch = /\b(de[-_]?be|be|berlin)\b/i.test(str) && !str.includes('berg');
            } else if (landId === 'brandenburg' || stateClean.includes('brand')) {
                isMatch = /\b(de[-_]?bb|bb|brandenburg|brandebourg)\b/i.test(str);
            } else if (landId === 'bremen' || stateClean.includes('brê') || stateClean.includes('brem')) {
                isMatch = /\b(de[-_]?hb|hb|bremen|breme|brême)\b/i.test(str);
            } else if (landId === 'hamburg' || stateClean.includes('hamb')) {
                isMatch = /\b(de[-_]?hh|hh|hamburg|hambourg)\b/i.test(str);
            } else if (landId === 'hessen' || stateClean.includes('hess')) {
                isMatch = /\b(de[-_]?he|he|hessen|hesse)\b/i.test(str) && !/\brhein\b/i.test(str);
            } else if (landId === 'mv' || stateClean.includes('meckl')) {
                isMatch = /\b(de[-_]?mv|mv|mecklenburg|mecklemburg|vorpommern|pomeranie)\b/i.test(str);
            } else if (landId === 'niedersachsen' || stateClean.includes('basse')) {
                isMatch = /\b(de[-_]?ni|ni|niedersachsen|basse[-_]?saxe|lower[-_]?saxony)\b/i.test(str);
            } else if (landId === 'nrw' || stateClean.includes('nord')) {
                isMatch = /\b(de[-_]?nw|de[-_]?nrw|nw|nrw|nordrhein|westfalen)\b/i.test(str);
            } else if (landId === 'rlp' || stateClean.includes('palat')) {
                isMatch = (/\b(de[-_]?rp|rp|rlp|rheinland|pfalz|palatinat)\b/i.test(str)) && !/\bvorpommern\b/i.test(str);
            } else if (landId === 'saarland' || stateClean.includes('sarr')) {
                isMatch = /\b(de[-_]?sl|sl|saarland|sarre)\b/i.test(str);
            } else if (landId === 'sachsen' || stateClean === 'saxe') {
                isMatch = /\b(de[-_]?sn|sn|sachsen|saxe)\b/i.test(str) && !/\b(anhalt|nieder|basse)\b/i.test(str);
            } else if (landId === 'st' || stateClean.includes('anhalt')) {
                isMatch = /\b(de[-_]?st|st|anhalt)\b/i.test(str) && !/\bholstein\b/i.test(str);
            } else if (landId === 'sh' || stateClean.includes('schles')) {
                isMatch = /\b(de[-_]?sh|sh|schleswig|holstein)\b/i.test(str);
            } else if (landId === 'thueringen' || stateClean.includes('thur')) {
                isMatch = /\b(de[-_]?th|th|thüringen|thueringen|thuringe)\b/i.test(str);
            } else if (landId === 'bund' || stateClean.includes('fédér')) {
                isMatch = /\b(bund)\b/i.test(str);
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

function openPlateModal(item) {
    const modal = document.getElementById('plateModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    document.getElementById('modalPrefix').textContent = item.prefix;
    document.getElementById('modalCity').textContent = item.city;
    document.getElementById('modalState').textContent = item.state;
    document.getElementById('modalLandId').textContent = item.landId ? item.landId.toUpperCase() : '-';
    document.getElementById('modalRegion').textContent = item.region;

    const filterBtn = document.getElementById('modalFilterBtn');
    if (filterBtn) {
        filterBtn.onclick = () => {
            selectState(item.state);
            closePlateModal();
        };
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closePlateModal() {
    const modal = document.getElementById('plateModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

// Écouteurs pour fermer la modale au clic sur le fond ou avec Échap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlateModal();
});

const modalContainer = document.getElementById('plateModal');
if (modalContainer) {
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) closePlateModal();
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
        
        // Clic sur la carte -> Ouvre la modale en grand
        card.onclick = () => openPlateModal(item);

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