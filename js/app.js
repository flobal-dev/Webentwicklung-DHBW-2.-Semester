// ============================================================
// app.js — Übersichtsliste + Detailseite aus cocktails.json
// ============================================================

// Holt alle Cocktails aus der JSON-Datei
async function fetchCocktails() {
  const response = await fetch('../data/cocktails.json');
  if (!response.ok) throw new Error('cocktails.json konnte nicht geladen werden');
  return response.json();
}

// Gibt die Bootstrap-Farbe für den Schwierigkeitsgrad zurück
function difficultyColor(difficulty) {
  return { 'einfach': 'success', 'mittel': 'warning', 'anspruchsvoll': 'danger' }[difficulty] ?? 'secondary';
}

// Baut das HTML für eine einzelne Cocktail-Card (Übersichtsseite)
function createCard(cocktail) {

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
            <span class="badge bg-${difficultyColor(cocktail.difficulty)} ms-2">${cocktail.difficulty}</span>
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

// Einstiegspunkt für die Übersichtsseite
async function initCocktailList() {
  try {
    const cocktails = await fetchCocktails();
    renderCocktails(cocktails);
  } catch (error) {
    console.error('Fehler beim Laden der Cocktails:', error);
    showError();
  }
}

// ============================================================
// DETAILSEITE — cocktail.html?id=X
// ============================================================

// Baut das vollständige HTML für die Detailansicht eines Cocktails
function renderDetail(cocktail) {
  const detail = document.getElementById('cocktail-detail');
  if (!detail) return;

  const color = difficultyColor(cocktail.difficulty);
  const categoryBadges = cocktail.categories
    .map(cat => `<span class="badge bg-secondary">${cat}</span>`)
    .join('');
  const ingredientItems = cocktail.ingredients
    .map(ing => `<li class="list-group-item">${ing}</li>`)
    .join('');

  // Seitentitel im Browser-Tab aktualisieren
  document.title = `${cocktail.name} – Cocktailpedia`;

  detail.innerHTML = `
    <!-- Breadcrumb: zeigt wo man sich befindet -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
        <li class="breadcrumb-item"><a href="cocktails.html">Cocktails</a></li>
        <li class="breadcrumb-item active" aria-current="page">${cocktail.name}</li>
      </ol>
    </nav>

    <div class="row g-4">
      <!-- Bild (links auf Desktop, oben auf Mobile) -->
      <div class="col-md-5">
        <img
          src="${cocktail.image}"
          class="img-fluid rounded shadow-sm w-100"
          style="max-height: 420px; object-fit: cover;"
          alt="${cocktail.name}"
          onerror="this.src='cocktails/images/mojito.jpg'"
        >
      </div>

      <!-- Alle Infos (rechts auf Desktop) -->
      <div class="col-md-7">
        <!-- Name + Schwierigkeitsgrad -->
        <div class="d-flex align-items-center flex-wrap gap-2 mb-2">
          <h1 class="fw-bold mb-0">${cocktail.name}</h1>
          <span class="badge bg-${color}">${cocktail.difficulty}</span>
        </div>

        <!-- Kurzbeschreibung -->
        <p class="text-muted mb-3">${cocktail.description}</p>

        <!-- Meta: Glas, Zeit, Basis-Alkohol -->
        <div class="d-flex flex-wrap gap-3 mb-3 text-muted small">
          <span>🥂 ${cocktail.glass}</span>
          <span>⏱ ${cocktail.preparationTime} Min.</span>
          <span>🍸 ${cocktail.alcohol}</span>
        </div>

        <!-- Kategorie-Badges -->
        <div class="d-flex flex-wrap gap-1 mb-4">${categoryBadges}</div>

        <!-- Zutaten als Liste -->
        <h4 class="fw-semibold">Zutaten</h4>
        <ul class="list-group list-group-flush mb-4">${ingredientItems}</ul>

        <!-- Zubereitungsanleitung -->
        <h4 class="fw-semibold">Zubereitung</h4>
        <p>${cocktail.preparation}</p>
      </div>
    </div>

    <a href="cocktails.html" class="btn btn-outline-secondary mt-3">← Alle Cocktails</a>
  `;
}

// Zeigt Fehlermeldung wenn ID ungültig oder Cocktail nicht gefunden
function showDetailError(message) {
  const detail = document.getElementById('cocktail-detail');
  if (!detail) return;
  detail.innerHTML = `
    <div class="text-center py-5">
      <p class="fs-1">🍹</p>
      <p class="text-muted">${message}</p>
      <a href="cocktails.html" class="btn btn-primary">← Zurück zur Übersicht</a>
    </div>
  `;
}

// Einstiegspunkt für die Detailseite: liest ?id= aus der URL
async function initCocktailDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) {
    showDetailError('Kein Cocktail ausgewählt.');
    return;
  }

  try {
    const cocktails = await fetchCocktails();
    const cocktail = cocktails.find(c => c.id === id);

    if (!cocktail) {
      showDetailError(`Cocktail mit ID ${id} wurde nicht gefunden.`);
      return;
    }

    renderDetail(cocktail);
  } catch (error) {
    console.error('Fehler beim Laden des Cocktails:', error);
    showDetailError('Cocktail konnte nicht geladen werden. Bitte öffne die Seite über einen lokalen Server.');
  }
}

// ============================================================
// Seiten-Erkennung: je nach vorhandenem Element richtige
// Funktion aufrufen — eine Datei für beide Seiten
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cocktail-grid'))  initCocktailList();
  if (document.getElementById('cocktail-detail')) initCocktailDetail();
});
