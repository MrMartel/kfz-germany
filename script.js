let platesData = [];
let filteredPlatesData = [];
let currentModalIndex = -1;
let selectedState = '';
let showOnlyFavorites = false;
let favorites = JSON.parse(localStorage.getItem('kfz_favorites') || '[]');

const stateCoatOfArms = {
    'bw': 'Images/Armoiries_Landers/amr_bw.svg',
    'bayern': 'Images/Armoiries_Landers/amr_by.svg',
    'berlin': 'Images/Armoiries_Landers/amr_be.svg',
    'brandenburg': 'Images/Armoiries_Landers/amr_bb.svg',
    'bremen': 'Images/Armoiries_Landers/amr_hb.svg',
    'hamburg': 'Images/Armoiries_Landers/amr_hh.svg',
    'hessen': 'Images/Armoiries_Landers/amr_he.svg',
    'mv': 'Images/Armoiries_Landers/amr_mv.svg',
    'niedersachsen': 'Images/Armoiries_Landers/amr_ni.svg',
    'nrw': 'Images/Armoiries_Landers/amr_nrw.svg',
    'rlp': 'Images/Armoiries_Landers/amr_rlp.svg',
    'saarland': 'Images/Armoiries_Landers/amr_sl.svg',
    'sachsen': 'Images/Armoiries_Landers/amr_sn.svg',
    'st': 'Images/Armoiries_Landers/amr_st.svg',
    'sh': 'Images/Armoiries_Landers/amr_sh.svg',
    'thueringen': 'Images/Armoiries_Landers/amr_th.svg',
    'bund': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Coat_of_arms_of_Germany.svg'
};

async function loadData() {
    initTheme();
    loadSVGMap();

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Fichier data.json introuvable (HTTP ${response.status})`);
        }
        
        platesData = await response.json();
        filteredPlatesData = [...platesData];
        initStatesFilter();
        displayResults(filteredPlatesData);
        setupSearchControls();
        setupMapClearControl();
        setupBackToTop();
        setupModalNavigation();
        initServiceWorker();
    } catch (error) {
        console.error("Erreur de chargement data.json :", error);
        const grid = document.getElementById('resultsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300">
                    <p class="font-bold text-sm">Erreur de chargement des données</p>
                    <p class="text-xs text-red-400/80 mt-1">${error.message}. Vérifiez le fichier data.json.</p>
                </div>`;
        }
    }
}

/* --- GESTION DU THÈME CLAIR / SOMBRE --- */
function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const icon = document.getElementById('themeToggleIcon');
    const savedTheme = localStorage.getItem('kfz_theme') || 'dark';

    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        if (icon) icon.textContent = '☀️';
    } else {
        document.documentElement.classList.add('dark');
        if (icon) icon.textContent = '🌙';
    }

    if (themeBtn) {
        themeBtn.onclick = () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('kfz_theme', isDark ? 'dark' : 'light');
            if (icon) icon.textContent = isDark ? '🌙' : '☀️';
        };
    }
}

/* --- GESTION DES FAVORIS (LOCALSTORAGE) --- */
function toggleFavorite(prefix, event) {
    if (event) event.stopPropagation();

    const index = favorites.indexOf(prefix);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(prefix);
    }
    localStorage.setItem('kfz_favorites', JSON.stringify(favorites));

    const favBtn = document.getElementById('btn-favorites');
    if (favBtn) {
        favBtn.textContent = `★ Mes plaques favorites (${favorites.length})`;
    }

    if (currentModalIndex !== -1 && filteredPlatesData[currentModalIndex]) {
        updateModalFavButton(filteredPlatesData[currentModalIndex].prefix);
    }

    filterData();
}

function updateModalFavButton(prefix) {
    const favBtn = document.getElementById('modalFavBtn');
    const favIcon = document.getElementById('modalFavIcon');
    if (!favBtn || !favIcon) return;

    const isFav = favorites.includes(prefix);
    favIcon.textContent = isFav ? '★' : '☆';
    
    if (isFav) {
        favBtn.className = 'px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/30';
    } else {
        favBtn.className = 'px-3 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5';
    }
}

/* --- GESTION DU SERVICE WORKER --- */
function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    let newWorker = null;
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => {
                reg.addEventListener('updatefound', () => {
                    newWorker = reg.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateToast(newWorker);
                        }
                    });
                });

                if (reg.waiting) {
                    newWorker = reg.waiting;
                    showUpdateToast(newWorker);
                }
            })
            .catch(err => console.error('Erreur Service Worker :', err));
    });
}

function showUpdateToast(worker) {
    const toast = document.getElementById('pwaUpdateToast');
    const btn = document.getElementById('pwaReloadBtn');
    if (!toast || !btn) return;

    toast.classList.remove('hidden');

    btn.onclick = () => {
        if (worker) {
            worker.postMessage({ action: 'SKIP_WAITING' });
        }
    };
}

function setupMapClearControl() {
    const clearMapBtn = document.getElementById('clearMapSelectionBtn');
    if (clearMapBtn) {
        clearMapBtn.addEventListener('click', () => {
            selectState('');
        });
    }
}

function setupBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setupSearchControls() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const exactCb = document.getElementById('exactMatchCheckbox');

    if (searchInput && clearBtn) {
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim().length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
            filterData();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            searchInput.focus();
            filterData();
        });
    }

    if (exactCb) {
        exactCb.addEventListener('change', filterData);
    }
}

async function loadSVGMap() {
    const container = document.getElementById('svgContainer');
    if (!container) return;

    const mapFiles = ['Images/germany-map.svg', 'germany-map.svg.svg', 'germany-map.svg'];
    let svgText = null;

    for (const file of mapFiles) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                svgText = await response.text();
                break;
            }
        } catch (e) {}
    }

    if (svgText) {
        container.innerHTML = svgText;
        const svgElement = container.querySelector('svg');
        if (svgElement) {
            svgElement.id = 'germanyMap';
            svgElement.classList.add('w-full', 'max-w-[240px]', 'h-auto');
            setupMapInteractivity(svgElement);
        }
        highlightMapState(selectedState);
    } else {
        container.innerHTML = `<span class="text-xs text-amber-500 text-center">Carte SVG introuvable</span>`;
    }
}

function matchShapeToState(str) {
    const states = [...new Set(platesData.map(item => item.state))];

    for (const state of states) {
        const item = platesData.find(d => d.state === state);
        const landId = item ? (item.landId || '').toLowerCase().trim() : '';
        const stateClean = state.toLowerCase().trim();

        let isMatch = false;
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
        }

        if (isMatch) return state;
    }
    return null;
}

function setupMapInteractivity(svg) {
    const tooltip = document.getElementById('mapTooltip');
    const tooltipName = document.getElementById('tooltipStateName');
    const tooltipCount = document.getElementById('tooltipPlateCount');

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

        const matchedState = matchShapeToState(attrString.toLowerCase());

        if (matchedState) {
            el.style.cursor = 'pointer';

            el.addEventListener('mousemove', (e) => {
                if (!tooltip) return;
                const plateCount = platesData.filter(d => d.state === matchedState).length;
                tooltipName.textContent = matchedState;
                tooltipCount.textContent = `${plateCount} préfixe(s) enregistré(s)`;
                
                tooltip.style.left = `${e.clientX}px`;
                tooltip.style.top = `${e.clientY - 10}px`;
                tooltip.classList.remove('hidden');
            });

            el.addEventListener('mouseleave', () => {
                if (tooltip) tooltip.classList.add('hidden');
            });

            el.addEventListener('click', () => {
                selectState(matchedState);
            });
        }
    });
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
    allBtn.onclick = () => {
        showOnlyFavorites = false;
        selectState('');
    };
    container.appendChild(allBtn);

    const favBtn = document.createElement('button');
    favBtn.id = 'btn-favorites';
    favBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white';
    favBtn.textContent = `★ Mes plaques favorites (${favorites.length})`;
    favBtn.onclick = () => {
        showOnlyFavorites = true;
        selectedState = '';
        updateFilterButtons();
        filterData();
    };
    container.appendChild(favBtn);

    states.forEach(state => {
        const btn = document.createElement('button');
        btn.dataset.state = state;
        btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-300 dark:border-slate-600/60';
        btn.textContent = state;
        btn.onclick = () => {
            showOnlyFavorites = false;
            selectState(state);
        };
        container.appendChild(btn);
    });
}

function updateFilterButtons() {
    const buttons = document.querySelectorAll('.state-btn');
    const allBtn = document.getElementById('btn-all');
    const favBtn = document.getElementById('btn-favorites');

    if (favBtn) {
        if (showOnlyFavorites) {
            favBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amber-500 text-white shadow-md shadow-amber-500/30';
        } else {
            favBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white';
        }
    }

    if (allBtn) {
        if (!showOnlyFavorites && selectedState === '') {
            allBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
        } else {
            allBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-300 dark:border-slate-600/60';
        }
    }

    buttons.forEach(btn => {
        if (!showOnlyFavorites && btn.dataset.state === selectedState) {
            btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
        } else {
            btn.className = 'state-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-300 dark:border-slate-600/60';
        }
    });
}

function selectState(state) {
    selectedState = state;
    showOnlyFavorites = false;
    
    const label = document.getElementById('mapHoverLabel');
    const clearMapBtn = document.getElementById('clearMapSelectionBtn');

    if (label) label.textContent = state || 'Toutes les régions';

    if (clearMapBtn) {
        if (state !== '') {
            clearMapBtn.classList.remove('hidden');
        } else {
            clearMapBtn.classList.add('hidden');
        }
    }

    updateFilterButtons();

    const mainCoatImg = document.getElementById('stateCoatOfArmsDisplay');
    const mainCoatTitle = document.getElementById('stateCoatOfArmsTitle');
    
    if (mainCoatImg && mainCoatTitle) {
        const item = platesData.find(d => d.state === state);
        const landKey = item ? (item.landId || '').toLowerCase().trim() : 'bund';

        if (state === '') {
            mainCoatImg.src = stateCoatOfArms['bund'];
            mainCoatImg.alt = "République fédérale d'Allemagne";
            mainCoatTitle.textContent = "République fédérale d'Allemagne";
        } else if (stateCoatOfArms[landKey]) {
            mainCoatImg.src = stateCoatOfArms[landKey];
            mainCoatImg.alt = `Armoiries ${state}`;
            mainCoatTitle.textContent = state;
        }
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
                isMatch = false;
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

/* --- MODALE ET ACTIONS --- */
function openPlateModal(item) {
    const modal = document.getElementById('plateModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    currentModalIndex = filteredPlatesData.findIndex(p => p.prefix === item.prefix && p.city === item.city);

    document.getElementById('modalPrefix').textContent = item.prefix;
    document.getElementById('modalCity').textContent = item.city;
    document.getElementById('modalState').textContent = item.state;
    document.getElementById('modalLandId').textContent = item.landId ? item.landId.toUpperCase() : '-';
    document.getElementById('modalRegion').textContent = item.region;

    const landKey = (item.landId || '').toLowerCase().trim();

    const coatImg = document.getElementById('modalCoatOfArms');
    if (coatImg) {
        if (stateCoatOfArms[landKey]) {
            coatImg.src = stateCoatOfArms[landKey];
            coatImg.alt = `Armoiries ${item.state}`;
            coatImg.classList.remove('hidden');
        } else {
            coatImg.classList.add('hidden');
        }
    }

    const sealImg = document.getElementById('modalLandSeal');
    if (sealImg) {
        sealImg.src = stateCoatOfArms[landKey] || stateCoatOfArms['bund'];
    }

    // Gestion du bouton Favori dans la modale
    const modalFavBtn = document.getElementById('modalFavBtn');
    if (modalFavBtn) {
        updateModalFavButton(item.prefix);
        modalFavBtn.onclick = (e) => toggleFavorite(item.prefix, e);
    }

    const filterBtn = document.getElementById('modalFilterBtn');
    if (filterBtn) {
        filterBtn.onclick = () => {
            selectState(item.state);
            closePlateModal();
        };
    }

    // Gestion du bouton Partager (Web Share API)
    const shareBtn = document.getElementById('modalShareBtn');
    if (shareBtn) {
        shareBtn.onclick = async () => {
            const shareData = {
                title: `Plaque d'immatriculation : ${item.prefix} (${item.city})`,
                text: `Préfixe d'immatriculation allemande : ${item.prefix}\nVille : ${item.city}\nLand : ${item.state}\nArrondissement : ${item.region}`,
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Partage annulé :', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
                    alert('Fiche copiée dans le presse-papier !');
                } catch (err) {
                    alert('Impossible de copier automatiquement la fiche.');
                }
            }
        };
    }

    updateModalNavState();

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function setupModalNavigation() {
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');

    if (prevBtn) prevBtn.onclick = () => navigateModal(-1);
    if (nextBtn) nextBtn.onclick = () => navigateModal(1);
}

function navigateModal(direction) {
    if (currentModalIndex === -1 || filteredPlatesData.length === 0) return;

    const newIndex = currentModalIndex + direction;
    if (newIndex >= 0 && newIndex < filteredPlatesData.length) {
        openPlateModal(filteredPlatesData[newIndex]);
    }
}

function updateModalNavState() {
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentModalIndex <= 0;
        prevBtn.style.opacity = currentModalIndex <= 0 ? '0.4' : '1';
        prevBtn.style.cursor = currentModalIndex <= 0 ? 'not-allowed' : 'pointer';
    }

    if (nextBtn) {
        nextBtn.disabled = currentModalIndex >= filteredPlatesData.length - 1;
        nextBtn.style.opacity = currentModalIndex >= filteredPlatesData.length - 1 ? '0.4' : '1';
        nextBtn.style.cursor = currentModalIndex >= filteredPlatesData.length - 1 ? 'not-allowed' : 'pointer';
    }
}

function closePlateModal() {
    const modal = document.getElementById('plateModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        currentModalIndex = -1;
    }, 200);
}

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('plateModal');
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') closePlateModal();
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
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
            <div class="col-span-full text-center py-12 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-300 dark:border-slate-700/50">
                <p class="text-slate-700 dark:text-slate-300 font-medium">Aucun résultat trouvé.</p>
                <p class="text-xs text-slate-500 mt-1">Si la case "Préfixe exact" est cochée, décochez-la pour effectuer une recherche plus large.</p>
            </div>`;
        return;
    }

    data.forEach(item => {
        const isFav = favorites.includes(item.prefix);
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/80 p-5 flex items-center justify-between space-x-4 hover:border-blue-500/50 transition-all group cursor-pointer relative';
        
        card.onclick = () => openPlateModal(item);

        card.innerHTML = `
            <div class="flex items-center space-x-4 overflow-hidden">
                <div class="flex border-[2.5px] border-slate-950 rounded-md overflow-hidden bg-white shadow-md shrink-0 w-32 h-14 items-center group-hover:scale-105 transition-transform p-[1px]">
                    <div class="bg-[#003399] text-white w-6 h-full flex flex-col items-center justify-between py-1 shrink-0 rounded-l-[2px]">
                        <svg class="w-3.5 h-3.5 text-yellow-400 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
                        </svg>
                        <span class="text-[9px] font-black tracking-widest leading-none mb-0.5">D</span>
                    </div>
                    <div class="flex-1 text-center font-bold plate-font text-2xl text-slate-900 uppercase">
                        ${item.prefix}
                    </div>
                </div>
                <div class="overflow-hidden">
                    <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">${item.city}</h3>
                    <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">${item.state}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">${item.region}</p>
                </div>
            </div>

            <!-- Étoile de favori -->
            <button onclick="toggleFavorite('${item.prefix}', event)" title="Ajouter aux favoris" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-xl shrink-0">
                ${isFav ? '★' : '☆'}
            </button>
        `;
        grid.appendChild(card);
    });
}

function filterData() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const exactCheckbox = document.getElementById('exactMatchCheckbox');
    const isExactMatch = exactCheckbox ? exactCheckbox.checked : false;
    
    filteredPlatesData = platesData.filter(item => {
        if (showOnlyFavorites && !favorites.includes(item.prefix)) {
            return false;
        }

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

    displayResults(filteredPlatesData);
}

loadData();