// ============================================================
// app.js — Cocktailpedia
// ============================================================

let allCocktails  = [];
let activeCategory = null;

const FAV_KEY = 'cp-favorites';

async function fetchCocktails() {
  const res = await fetch('../data/cocktails.json');
  if (!res.ok) throw new Error('cocktails.json konnte nicht geladen werden');
  return res.json();
}

function diffClass(d) {
  return { einfach: 'diff-einfach', mittel: 'diff-mittel', anspruchsvoll: 'diff-anspruchsvoll' }[d] ?? 'diff-einfach';
}

// ── Favorites ───────────────────────────────────────────────
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]'); }
  catch { return []; }
}

function toggleFav(id, el) {
  const favs = getFavs();
  const idx  = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
    el.classList.add('active');
    el.title = 'Aus Favoriten entfernen';
  } else {
    favs.splice(idx, 1);
    el.classList.remove('active');
    el.title = 'Zu Favoriten hinzufügen';
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  if (activeCategory === '__favorites__') applyFilters();
}

// ── Surprise Me ─────────────────────────────────────────────
async function surpriseMe() {
  const btn = document.getElementById('surprise-btn');
  if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
  try {
    const list = allCocktails.length ? allCocktails : await fetchCocktails();
    const pick = list[Math.floor(Math.random() * list.length)];
    window.location.href = `cocktail.html?id=${pick.id}`;
  } catch(e) {
    if (btn) { btn.textContent = '🎲 Überrasch mich'; btn.disabled = false; }
  }
}

// ── Cocktail card ────────────────────────────────────────────
function createCard(cocktail, index = 0) {
  const favs  = getFavs();
  const isFav = favs.includes(cocktail.id);
  const cats  = cocktail.categories.map(c => `<span class="tag">${c}</span>`).join('');

  return `
    <article class="ccard" style="animation-delay:${index * 0.07}s">
      <div class="ccard__img">
        <img src="${cocktail.image}" alt="${cocktail.name}"
             onerror="this.src='cocktails/images/mojito.jpg'">
        <div class="ccard__img-grad"></div>
        <div class="ccard__badge">
          <span class="diff-badge ${diffClass(cocktail.difficulty)}">${cocktail.difficulty}</span>
        </div>
        <button class="fav-btn${isFav ? ' active' : ''}"
                onclick="toggleFav(${cocktail.id},this)"
                title="${isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}"
                aria-label="Favorit">♡</button>
      </div>
      <div class="ccard__body">
        <div class="ccard__cats">${cats}</div>
        <h3 class="ccard__name">${cocktail.name}</h3>
        <p class="ccard__desc">${cocktail.description}</p>
        <div class="ccard__meta">
          <span>⏱ ${cocktail.preparationTime} Min.</span>
          <span>🍸 ${cocktail.alcohol}</span>
        </div>
        <div class="ccard__cta">
          <a href="cocktail.html?id=${cocktail.id}" class="btn-primary btn-sm">Details ansehen</a>
        </div>
      </div>
    </article>`;
}

// ── Grid renderer ────────────────────────────────────────────
function renderCocktails(list) {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  grid.innerHTML = list.map((c, i) => createCard(c, i)).join('');
}

function showError() {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🍹</div>
      <p class="empty-msg">Cocktails konnten nicht geladen werden.<br>Bitte öffne die Seite über einen lokalen Server.</p>
    </div>`;
}

// ── Filter pills ─────────────────────────────────────────────
function renderCategoryFilters() {
  const wrap = document.getElementById('category-filters');
  if (!wrap) return;
  const cats = [...new Set(allCocktails.flatMap(c => c.categories))].sort();
  const favs = getFavs();

  const allPill = `<button class="filter-pill${!activeCategory ? ' active' : ''}" onclick="setCategory(null)">Alle</button>`;
  const favPill = favs.length
    ? `<button class="filter-pill${activeCategory === '__favorites__' ? ' active' : ''}" onclick="setCategory('__favorites__')">♡ Favoriten (${favs.length})</button>`
    : '';
  const catPills = cats.map(cat =>
    `<button class="filter-pill${activeCategory === cat ? ' active' : ''}" onclick="setCategory('${cat}')">${cat}</button>`
  ).join('');

  wrap.innerHTML = allPill + favPill + catPills;
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategoryFilters();
  applyFilters();
}

// ── Combined filter ──────────────────────────────────────────
function applyFilters() {
  const q   = (document.getElementById('search-input')?.value ?? '').trim().toLowerCase();
  let   res = allCocktails;

  if (activeCategory === '__favorites__') {
    const favs = getFavs();
    res = res.filter(c => favs.includes(c.id));
    if (!res.length) { showNoFavorites(); return; }
  } else if (activeCategory) {
    res = res.filter(c => c.categories.includes(activeCategory));
  }

  if (q) res = res.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.ingredients.some(i => i.toLowerCase().includes(q)) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );

  res.length ? renderCocktails(res) : showNoResults(q || activeCategory);
}

function clearSearch() {
  const inp = document.getElementById('search-input');
  if (inp) inp.value = '';
  activeCategory = null;
  renderCategoryFilters();
  renderCocktails(allCocktails);
  inp?.focus();
}

function showNoResults(hint) {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  const safe = String(hint).replace(/</g,'&lt;').replace(/>/g,'&gt;');
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <p class="empty-msg">Nichts gefunden für <strong>"${safe}"</strong>.</p>
      <button class="btn-ghost btn-sm" onclick="clearSearch()">Filter zurücksetzen</button>
    </div>`;
}

function showNoFavorites() {
  const grid = document.getElementById('cocktail-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">♡</div>
      <p class="empty-msg">Du hast noch keine Favoriten gespeichert.<br>Klick auf das ♡-Icon auf einer Karte.</p>
      <button class="btn-ghost btn-sm" onclick="clearSearch()">Zurück zur Übersicht</button>
    </div>`;
}

// ── Cocktail list page ───────────────────────────────────────
async function initCocktailList() {
  try {
    allCocktails = await fetchCocktails();
    const preset = new URLSearchParams(window.location.search).get('kategorie');
    if (preset) activeCategory = preset;
    renderCategoryFilters();
    applyFilters();
    document.getElementById('search-input')?.addEventListener('input', applyFilters);
  } catch(e) {
    console.error(e);
    showError();
  }
}

// ── Categories page ──────────────────────────────────────────
const CAT_EMOJI = {
  Klassiker: '🏆', Sommer: '☀️', Exotisch: '🌴',
  Party: '🎉', Aperitif: '🥂'
};

async function initCategories() {
  try {
    allCocktails = await fetchCocktails();
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    const cats = [...new Set(allCocktails.flatMap(c => c.categories))].sort();
    grid.innerHTML = cats.map(cat => {
      const n = allCocktails.filter(c => c.categories.includes(cat)).length;
      const emoji = CAT_EMOJI[cat] ?? '🍸';
      return `
        <a href="cocktails.html?kategorie=${encodeURIComponent(cat)}" class="cat-card">
          <span class="cat-icon">${emoji}</span>
          <span class="cat-name">${cat}</span>
          <span class="cat-count">${n} Cocktail${n !== 1 ? 's' : ''}</span>
        </a>`;
    }).join('');
  } catch(e) { console.error(e); }
}

// ── Detail page ──────────────────────────────────────────────
function renderDetail(cocktail) {
  const wrap = document.getElementById('cocktail-detail');
  if (!wrap) return;
  document.title = `${cocktail.name} – Cocktailpedia`;

  const catBadges = cocktail.categories.map(c => `<span class="tag">${c}</span>`).join('');
  const ings      = cocktail.ingredients.map(i => `<div class="ing-item">${i}</div>`).join('');

  wrap.innerHTML = `
    <nav class="bc">
      <a href="index.html">Home</a>
      <span class="bc-sep">/</span>
      <a href="cocktails.html">Cocktails</a>
      <span class="bc-sep">/</span>
      <span>${cocktail.name}</span>
    </nav>

    <div class="detail-hero">
      <img src="${cocktail.image}" alt="${cocktail.name}"
           onerror="this.src='cocktails/images/mojito.jpg'">
      <div class="detail-hero__overlay">
        <div class="detail-meta-row">
          ${catBadges}
          <span class="diff-badge ${diffClass(cocktail.difficulty)}">${cocktail.difficulty}</span>
        </div>
        <h1 class="detail-title">${cocktail.name}</h1>
        <div class="detail-meta-row">
          <span class="detail-meta-item">🥂 ${cocktail.glass}</span>
          <span class="detail-meta-item">⏱ ${cocktail.preparationTime} Min.</span>
          <span class="detail-meta-item">🍸 ${cocktail.alcohol}</span>
        </div>
      </div>
    </div>

    <p class="prep-text" style="margin-bottom:1.5rem;padding:0 0.25rem;font-size:0.96rem;color:var(--tx-m)">
      ${cocktail.description}
    </p>

    <div class="detail-body">
      <div class="glass-panel">
        <h3 class="panel-title">Zutaten</h3>
        <div class="ing-list">${ings}</div>
      </div>
      <div class="glass-panel">
        <h3 class="panel-title">Zubereitung</h3>
        <p class="prep-text">${cocktail.preparation}</p>
      </div>
    </div>

    <a href="cocktails.html" class="btn-ghost btn-sm">← Alle Cocktails</a>`;
}

function showDetailError(msg) {
  const wrap = document.getElementById('cocktail-detail');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🍹</div>
      <p class="empty-msg">${msg}</p>
      <a href="cocktails.html" class="btn-primary btn-sm">← Zurück zur Übersicht</a>
    </div>`;
}

async function initCocktailDetail() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id) { showDetailError('Kein Cocktail ausgewählt.'); return; }
  try {
    const list = await fetchCocktails();
    const c = list.find(x => x.id === id);
    c ? renderDetail(c) : showDetailError(`Cocktail #${id} nicht gefunden.`);
  } catch(e) {
    console.error(e);
    showDetailError('Cocktail konnte nicht geladen werden. Bitte öffne die Seite über einen lokalen Server.');
  }
}

// ── Homepage ─────────────────────────────────────────────────
function renderStats(cocktails) {
  const el = document.getElementById('stats-bar');
  if (!el) return;
  const cats = new Set(cocktails.flatMap(c => c.categories));
  const avg  = Math.round(cocktails.reduce((s,c) => s + c.preparationTime, 0) / cocktails.length);
  el.innerHTML = `
    <div class="stat-item"><span class="stat-value">${cocktails.length}</span><span class="stat-label">Cocktails</span></div>
    <div class="stat-item"><span class="stat-value">${cats.size}</span><span class="stat-label">Kategorien</span></div>
    <div class="stat-item"><span class="stat-value">${avg}</span><span class="stat-label">Ø Minuten</span></div>
    <div class="stat-item"><span class="stat-value">100%</span><span class="stat-label">Kostenlos</span></div>`;
}

function initCotd(cocktails) {
  const el = document.getElementById('cotd');
  if (!el || !cocktails.length) return;

  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayIdx = Math.floor((Date.now() - start) / 86400000) % cocktails.length;
  const c = cocktails[dayIdx];

  const cats = c.categories.map(cat => `<span class="tag">${cat}</span>`).join('');

  el.innerHTML = `
    <div class="cotd-card">
      <div class="cotd-img">
        <img src="${c.image}" alt="${c.name}"
             onerror="this.src='cocktails/images/mojito.jpg'">
      </div>
      <div class="cotd-body">
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center">
          ${cats}
          <span class="diff-badge ${diffClass(c.difficulty)}">${c.difficulty}</span>
        </div>
        <h3 class="cotd-name">${c.name}</h3>
        <p class="cotd-desc">${c.description}</p>
        <div class="cotd-meta">
          <span>🥂 ${c.glass}</span>
          <span>⏱ ${c.preparationTime} Min.</span>
          <span>🍸 ${c.alcohol}</span>
        </div>
        <div>
          <a href="cocktail.html?id=${c.id}" class="btn-primary btn-sm">Rezept ansehen</a>
        </div>
      </div>
    </div>`;
}

function renderCatPreview(cocktails) {
  const el = document.getElementById('cat-preview');
  if (!el) return;
  const cats = [...new Set(cocktails.flatMap(c => c.categories))].sort();
  el.innerHTML = cats.map(cat =>
    `<a href="cocktails.html?kategorie=${encodeURIComponent(cat)}" class="filter-pill">${cat}</a>`
  ).join('');
}

async function initHomepage() {
  try {
    allCocktails = await fetchCocktails();
    renderStats(allCocktails);
    initCotd(allCocktails);

    const featGrid = document.getElementById('featured-grid');
    if (featGrid) {
      featGrid.innerHTML = allCocktails.slice(0, 3).map((c,i) => createCard(c,i)).join('');
    }

    renderCatPreview(allCocktails);
  } catch(e) { console.error(e); }
}

// ── Router ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featured-grid'))  initHomepage();
  if (document.getElementById('cocktail-grid'))   initCocktailList();
  if (document.getElementById('cocktail-detail')) initCocktailDetail();
  if (document.getElementById('categories-grid')) initCategories();
});
