// ============================================================
// app.js — Lädt Cocktails aus der JSON-Datei und zeigt sie an
// ============================================================

// Holt alle Cocktails aus der JSON-Datei
async function fetchCocktails() {
  const response = await fetch('../data/cocktails.json');
  if (!response.ok) throw new Error('cocktails.json konnte nicht geladen werden');
  return response.json();
}

// Baut das HTML für eine einzelne Cocktail-Card
function createCard(cocktail) {
  // Difficulty-Badge: Farbe je nach Schwierigkeitsgrad
  const difficultyColor = {
    'einfach':       'success',
    'mittel':        'warning',
    'anspruchsvoll': 'danger'
  }[cocktail.difficulty] ?? 'secondary';

  return `
    <div class="col">
      <div class="card h-100 shadow-sm border-0">
        <img
          src="${cocktail.image}"
          class="card-img-top"
          alt="${cocktail.name}"
          onerror="this.src='cocktails/images/mojito.jpg'"
        >
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h5 class="card-title mb-0">${cocktail.name}</h5>
            <span class="badge bg-${difficultyColor} ms-2">${cocktail.difficulty}</span>
          </div>
          <p class="card-text text-muted small flex-grow-1">${cocktail.description}</p>
          <div class="d-flex flex-wrap gap-1 mb-3">
            ${cocktail.categories.map(cat => `<span class="badge bg-secondary">${cat}</span>`).join('')}
          </div>
          <a href="cocktail.html?id=${cocktail.id}" class="btn btn-primary mt-auto">
            Details ansehen
          </a>
        </div>
      </div>
    </div>
  `;
}

// Rendert alle Cards in den Grid-Container
function renderCocktails(cocktails) {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  grid.innerHTML = cocktails.map(createCard).join('');
}

// Zeigt eine Fehlermeldung wenn das Laden schiefgeht
function showError() {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <p class="fs-1">🍹</p>
      <p class="text-muted">Cocktails konnten nicht geladen werden.<br>
      Bitte öffne die Seite über einen lokalen Server (z.B. Live Server in VS Code).</p>
    </div>
  `;
}

// Einstiegspunkt: wird aufgerufen sobald das DOM bereit ist
async function initCocktailList() {
  try {
    const cocktails = await fetchCocktails();
    renderCocktails(cocktails);
  } catch (error) {
    console.error('Fehler beim Laden der Cocktails:', error);
    showError();
  }
}

document.addEventListener('DOMContentLoaded', initCocktailList);
