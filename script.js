let platesData = [];
let selectedState = '';

async function loadData() {
    try {
        // Charger la base de données JSON
        const response = await fetch('data.json');
        platesData = await response.json();
        
        // Charger la carte SVG
        await loadSVGMap();
        
        initStatesFilter();
        initMapEvents();
        displayResults(platesData);
        updateHeroPlate(platesData[0]);
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

async function loadSVGMap() {
    const container = document.getElementById('svgContainer');
    if (!container) return;

    try {
        const svgResponse = await fetch('germany-map.svg');
        if (svgResponse.ok) {
            const svgText = await svgResponse.text();
            container.innerHTML = svgText;
            const svgElement = container.querySelector('svg');
            if (svgElement) {
                svgElement.id = 'germanyMap';
                svgElement.classList.add('w-full', 'max-w-[240px]', 'h-auto');
            }
        }
    } catch (e) {
        console.warn("Impossible de charger germany-map.svg dynamiquement, vérifiez le nom du fichier SVG.", e);
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

function initMapEvents() {
    const paths = document.querySelectorAll('#germanyMap path, #germanyMap .land-path');
    const label = document.getElementById('mapHoverLabel');

    paths.forEach(path => {
        const state = path.dataset.state || path.getAttribute('id') || path.getAttribute('name');
        if (!state) return;
        
        path.classList.add('land-path');

        path.addEventListener('mouseenter', () => {
            if (label) label.textContent = state;
        });
        path.addEventListener('mouseleave', () => {
            if (label) label.textContent = selectedState || 'Toutes les régions';
        });
        path.addEventListener('click', () => {
            selectState(selectedState === state ? '' : state);
        });
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

    const paths = document.querySelectorAll('#germanyMap path');
    paths.forEach(path => {
        const pathState = path.dataset.state || path.getAttribute('id') || path.getAttribute('name');
        if (pathState === state && state !== '') {
            path.classList.add('active');
        } else {
            path.classList.remove('active');
        }
    });

    filterData();
}

function updateHeroPlate(item) {
    const prefixEl = document.getElementById('heroPlatePrefix');
    const cityEl = document.getElementById('heroPlateCity');
    if (prefixEl && cityEl && item) {
        prefixEl.textContent = item.prefix;
        cityEl.textContent = item.city;
    }
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
            <div class="col-span-2 text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p class="text-slate-300 font-medium">Aucun résultat trouvé.</p>
                <p class="text-xs text-slate-500 mt-1">Si la case "Préfixe exact" est cochée, décochez-la pour effectuer une recherche plus large.</p>
            </div>`;
        return;
    }

    // Met à jour la plaque d'accueil avec le 1er résultat trouvé
    updateHeroPlate(data[0]);

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/80 p-5 flex items-center space-x-5 hover:border-blue-500/50 transition-all group cursor-pointer';
        
        card.onclick = () => updateHeroPlate(item);

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