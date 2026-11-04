let platesData = [];
let selectedState = '';

// Chargement des données JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        platesData = await response.json();
        initStatesFilter();
        displayResults(platesData);
    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
}

// Initialisation des boutons de filtres par Land
function initStatesFilter() {
    const container = document.getElementById('statesFilterContainer');
    // Récupérer la liste unique des Länder
    const states = [...new Set(platesData.map(item => item.state))].sort();

    // Bouton "Tous"
    const allBtn = document.createElement('button');
    allBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white';
    allBtn.textContent = 'Tous les Länder';
    allBtn.onclick = () => {
        selectedState = '';
        updateActiveFilterButton(allBtn);
        filterData();
    };
    container.appendChild(allBtn);

    states.forEach(state => {
        const btn = document.createElement('button');
        btn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200';
        btn.textContent = state;
        btn.onclick = () => {
            selectedState = state;
            updateActiveFilterButton(btn);
            filterData();
        };
        container.appendChild(btn);
    });
}

// Gestion visuelle du bouton actif
function updateActiveFilterButton(activeBtn) {
    const container = document.getElementById('statesFilterContainer');
    Array.from(container.children).forEach(child => {
        child.className = 'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200';
    });
    activeBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white';
}

// Affichage des cartes de plaques
function displayResults(data) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-2 text-center text-slate-500 py-8">Aucun résultat trouvé.</p>`;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow';
        
        card.innerHTML = `
            <!-- Style visuel de la plaque allemande -->
            <div class="flex border-2 border-slate-800 rounded-lg overflow-hidden bg-white shadow-inner shrink-0 w-28 h-14">
                <div class="bg-blue-700 text-white w-6 flex flex-col items-center justify-between py-1 text-[10px] font-bold">
                    <span>D</span>
                    <span class="text-[8px]">★★★★★<br>★★★★★</span>
                </div>
                <div class="flex-1 flex items-center justify-center font-bold tracking-wider text-xl text-slate-900 bg-white">
                    ${item.prefix}
                </div>
            </div>
            <!-- Informations -->
            <div class="overflow-hidden">
                <h3 class="font-bold text-lg text-slate-900 truncate">${item.city}</h3>
                <p class="text-sm text-blue-600 font-medium">${item.state}</p>
                <p class="text-xs text-slate-500 truncate">${item.region}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtrage combiné (Recherche textuelle + Filtre par Land)
function filterData() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    
    const filtered = platesData.filter(item => {
        const matchesSearch = 
            item.prefix.toLowerCase().includes(term) ||
            item.city.toLowerCase().includes(term) ||
            item.state.toLowerCase().includes(term) ||
            item.region.toLowerCase().includes(term);
        
        const matchesState = selectedState === '' || item.state === selectedState;

        return matchesSearch && matchesState;
    });

    displayResults(filtered);
}

// Écouteur sur la barre de recherche
document.getElementById('searchInput').addEventListener('input', filterData);

// Lancement au chargement
loadData();