let platesData = [];
let selectedState = '';

async function loadData() {
    try {
        const response = await fetch('data.json');
        platesData = await response.json();
        initStatesFilter();
        displayResults(platesData);
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

function initStatesFilter() {
    const container = document.getElementById('statesFilterContainer');
    const states = [...new Set(platesData.map(item => item.state))].sort();

    const allBtn = document.createElement('button');
    allBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
    allBtn.textContent = 'Tous les Länder';
    allBtn.onclick = () => {
        selectedState = '';
        updateActiveFilterButton(allBtn);
        filterData();
    };
    container.appendChild(allBtn);

    states.forEach(state => {
        const btn = document.createElement('button');
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/40';
        btn.textContent = state;
        btn.onclick = () => {
            selectedState = state;
            updateActiveFilterButton(btn);
            filterData();
        };
        container.appendChild(btn);
    });
}

function updateActiveFilterButton(activeBtn) {
    const container = document.getElementById('statesFilterContainer');
    Array.from(container.children).forEach(child => {
        child.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/40';
    });
    activeBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-blue-600 text-white shadow-md shadow-blue-600/30';
}

function displayResults(data) {
    const grid = document.getElementById('resultsGrid');
    const countLabel = document.getElementById('resultCount');
    grid.innerHTML = '';
    
    countLabel.textContent = `${data.length} résultat(s)`;

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-span-2 text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p class="text-slate-400 font-medium">Aucun résultat trouvé pour votre recherche.</p>
            </div>`;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/70 p-5 flex items-center space-x-5 hover:border-slate-500 transition-all group';
        
        card.innerHTML = `
            <!-- Style réaliste de la plaque allemande -->
            <div class="flex border-2 border-slate-700 rounded-xl overflow-hidden bg-white shadow-md shrink-0 w-32 h-16 group-hover:scale-105 transition-transform">
                <div class="bg-blue-800 text-white w-7 flex flex-col items-center justify-between py-1.5 text-[10px] font-bold">
                    <span>D</span>
                    <span class="text-[7px] leading-[3px] text-amber-300">★★★★★<br>★★★★★</span>
                </div>
                <div class="flex-1 flex items-center justify-center font-black tracking-widest text-2xl text-slate-900 bg-white">
                    ${item.prefix}
                </div>
            </div>
            <!-- Informations textuelles -->
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

document.getElementById('searchInput').addEventListener('input', filterData);

loadData();