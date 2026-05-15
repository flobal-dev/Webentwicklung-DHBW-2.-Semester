// ============================================================
// app.js — Cocktailpedia
// ============================================================

let allCocktails   = [];
let activeCategory = null;
let activeSort     = 'default';

const FAV_KEY     = 'cp-favorites';
const HISTORY_KEY = 'cp-search-history';

async function fetchCocktails() {
  const res = await fetch('../data/cocktails.json');
  if (!res.ok) throw new Error('cocktails.json konnte nicht geladen werden');
  return res.json();
}

function diffClass(d) {
  return { einfach: 'diff-einfach', mittel: 'diff-mittel', anspruchsvoll: 'diff-anspruchsvoll' }[d] ?? 'diff-einfach';
}

// ── Scroll Reveal ────────────────────────────────────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const sel = [
    '.section-header', '.stats-glass', '.search-panel',
    '.glass-panel', '.team-card', '.tech-row', '.cotd-card'
  ].join(', ');

  const els = document.querySelectorAll(sel);
  const vph = window.innerHeight;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'none';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  els.forEach(el => {
    if (el.getBoundingClientRect().top >= vph * 0.88) {
      el.style.cssText += ';opacity:0;transform:translateY(22px);transition:opacity 0.6s ease,transform 0.6s ease';
      observer.observe(el);
    }
  });
}

// ── Favorites ────────────────────────────────────────────────
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

// ── Ingredient checklist ─────────────────────────────────────
function toggleIngCheck(cocktailId, idx, el) {
  const key   = `cp-check-${cocktailId}`;
  const state = (() => { try { return JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { return {}; } })();
  const item  = el.closest('.ing-item');
  if (el.checked) { state[idx] = true; item.classList.add('checked'); }
  else            { delete state[idx]; item.classList.remove('checked'); }
  localStorage.setItem(key, JSON.stringify(state));
}

function resetIngChecks(cocktailId) {
  localStorage.removeItem(`cp-check-${cocktailId}`);
  document.querySelectorAll('.ing-item').forEach(item => {
    item.classList.remove('checked');
    const cb = item.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = false;
  });
}

// ── Surprise Me ──────────────────────────────────────────────
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

// ── Share ────────────────────────────────────────────────────
async function shareRecipe(name) {
  const url = window.location.href;
  const btn = document.getElementById('share-btn');
  if (navigator.share) {
    try { await navigator.share({ title: `${name} – Cocktailpedia`, url }); }
    catch(e) { /* cancelled */ }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    if (btn) {
      btn.textContent = '✓ Kopiert!';
      setTimeout(() => { btn.textContent = '↗ Teilen'; }, 2000);
    }
  }
}

// ── Sort ─────────────────────────────────────────────────────
function setSort(val) {
  activeSort = val;
  applyFilters();
}

function sortCocktails(list) {
  const s = [...list];
  const diffOrder = { einfach: 1, mittel: 2, anspruchsvoll: 3 };
  switch (activeSort) {
    case 'az':    return s.sort((a,b) => a.name.localeCompare(b.name, 'de'));
    case 'za':    return s.sort((a,b) => b.name.localeCompare(a.name, 'de'));
    case 'quick': return s.sort((a,b) => a.preparationTime - b.preparationTime);
    case 'hard':  return s.sort((a,b) => (diffOrder[b.difficulty]??0) - (diffOrder[a.difficulty]??0));
    default:      return s;
  }
}

// ── Search history ───────────────────────────────────────────
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
  catch { return []; }
}

function saveSearch(query) {
  const history  = getSearchHistory().filter(h => h !== query);
  history.unshift(query);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const el = document.getElementById('search-history');
  if (!el) return;

  const q       = (document.getElementById('search-input')?.value ?? '').trim();
  const history = getSearchHistory();

  if (!history.length || q) { el.style.display = 'none'; return; }

  el.style.display = 'flex';
  el.innerHTML = `
    <span class="history-label">Zuletzt:</span>
    ${history.map((h, i) => `<button class="history-chip" data-idx="${i}">${h}</button>`).join('')}
    <button class="history-chip history-clear" data-action="clear">✕ Löschen</button>`;

  el.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById('search-input');
      if (inp) { inp.value = getSearchHistory()[+btn.dataset.idx] ?? ''; applyFilters(); updateHistoryDisplay(); }
    });
  });
  el.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    updateHistoryDisplay();
  });
}

let searchSaveTimer = null;

function handleSearchInput() {
  applyFilters();
  updateHistoryDisplay();
  const q = (document.getElementById('search-input')?.value ?? '').trim();
  clearTimeout(searchSaveTimer);
  if (q.length >= 2) {
    searchSaveTimer = setTimeout(() => saveSearch(q), 700);
  }
}

// ── Cocktail card ────────────────────────────────────────────
function createCard(cocktail, index = 0) {
  const isFav = getFavs().includes(cocktail.id);
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

// ── Combined filter + sort ────────────────────────────────────
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

  res.length ? renderCocktails(sortCocktails(res)) : showNoResults(q || activeCategory);
}

function clearSearch() {
  const inp = document.getElementById('search-input');
  if (inp) inp.value = '';
  activeCategory = null;
  const sel = document.getElementById('sort-select');
  if (sel) { sel.value = 'default'; activeSort = 'default'; }
  renderCategoryFilters();
  renderCocktails(allCocktails);
  updateHistoryDisplay();
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
    document.getElementById('search-input')?.addEventListener('input', handleSearchInput);
    document.getElementById('sort-select')?.addEventListener('change', e => setSort(e.target.value));
    updateHistoryDisplay();
    initScrollReveal();
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
      const n     = allCocktails.filter(c => c.categories.includes(cat)).length;
      const emoji = CAT_EMOJI[cat] ?? '🍸';
      return `
        <a href="cocktails.html?kategorie=${encodeURIComponent(cat)}" class="cat-card">
          <span class="cat-icon">${emoji}</span>
          <span class="cat-name">${cat}</span>
          <span class="cat-count">${n} Cocktail${n !== 1 ? 's' : ''}</span>
        </a>`;
    }).join('');
    initScrollReveal();
  } catch(e) { console.error(e); }
}

// ── Detail page ──────────────────────────────────────────────
function setMeta(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

function renderDetail(cocktail) {
  const wrap = document.getElementById('cocktail-detail');
  if (!wrap) return;

  document.title = `${cocktail.name} – Cocktailpedia`;
  setMeta('meta[name="description"]',        `${cocktail.name}: ${cocktail.description}`);
  setMeta('meta[property="og:title"]',       `${cocktail.name} – Cocktailpedia`);
  setMeta('meta[property="og:description"]', cocktail.description);
  setMeta('meta[name="twitter:title"]',      `${cocktail.name} – Cocktailpedia`);
  setMeta('meta[name="twitter:description"]', cocktail.description);
  const absImg = new URL(cocktail.image, window.location.href).href;
  setMeta('meta[property="og:image"]',   absImg);
  setMeta('meta[name="twitter:image"]',  absImg);

  const catBadges = cocktail.categories.map(c => `<span class="tag">${c}</span>`).join('');
  const checkState = (() => {
    try { return JSON.parse(localStorage.getItem(`cp-check-${cocktail.id}`) ?? '{}'); }
    catch { return {}; }
  })();

  const ings = cocktail.ingredients.map((ing, idx) => {
    const checked = checkState[idx] === true;
    return `
      <label class="ing-item${checked ? ' checked' : ''}">
        <input type="checkbox" style="display:none" ${checked ? 'checked' : ''}
               onchange="toggleIngCheck(${cocktail.id},${idx},this)">
        <span class="ing-cb"></span>
        <span>${ing}</span>
      </label>`;
  }).join('');

  const safeName = cocktail.name.replace(/'/g, "\\'");

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
        <button class="btn-ghost btn-sm" onclick="resetIngChecks(${cocktail.id})"
                style="margin-top:1rem;width:100%;justify-content:center">↺ Zurücksetzen</button>
      </div>
      <div class="glass-panel">
        <h3 class="panel-title">Zubereitung</h3>
        <p class="prep-text">${cocktail.preparation}</p>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;margin-top:1.75rem;flex-wrap:wrap">
      <a href="cocktails.html" class="btn-ghost btn-sm">← Alle Cocktails</a>
      <button id="share-btn" class="btn-ghost btn-sm" onclick="shareRecipe('${safeName}')">↗ Teilen</button>
    </div>`;

  initScrollReveal();
}

// ── Related cocktails ────────────────────────────────────────
function renderRelated(current, list) {
  const grid    = document.getElementById('related-grid');
  const section = document.getElementById('related-section');
  if (!grid || !section) return;

  const related = list
    .filter(c => c.id !== current.id && c.categories.some(cat => current.categories.includes(cat)))
    .slice(0, 3);

  if (!related.length) return;
  section.style.display = '';
  grid.innerHTML = related.map((c, i) => createCard(c, i)).join('');
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
    const c    = list.find(x => x.id === id);
    if (!c) { showDetailError(`Cocktail #${id} nicht gefunden.`); return; }
    renderDetail(c);
    renderRelated(c, list);
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
  const start  = new Date(new Date().getFullYear(), 0, 0);
  const dayIdx = Math.floor((Date.now() - start) / 86400000) % cocktails.length;
  const c      = cocktails[dayIdx];
  const cats   = c.categories.map(cat => `<span class="tag">${cat}</span>`).join('');
  el.innerHTML = `
    <div class="cotd-card">
      <div class="cotd-img">
        <img src="${c.image}" alt="${c.name}" onerror="this.src='cocktails/images/mojito.jpg'">
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
        <a href="cocktail.html?id=${c.id}" class="btn-primary btn-sm">Rezept ansehen</a>
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
    initScrollReveal();
  } catch(e) { console.error(e); }
}

// ── Router ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featured-grid'))  initHomepage();
  if (document.getElementById('cocktail-grid'))   initCocktailList();
  if (document.getElementById('cocktail-detail')) initCocktailDetail();
  if (document.getElementById('categories-grid')) initCategories();
});
