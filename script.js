let platesData = [];

// Chargement des données JSON
async function loadData() {
    try {
        const response = await response = await fetch('data.json');
        platesData = await response.json();
        displayResults(platesData);
    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
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

// Gestion de la recherche en temps réel
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = platesData.cases ? platesData : platesData.filter(item => 
        item.prefix.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term) ||
        item.state.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term)
    );
    displayResults(filtered);
});

// Lancement au chargement
loadData();