const THEME_KEY = 'cp-theme';

// Scroll progress bar — thin gold line at top of page
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
  }, { passive: true });
}

// Back-to-top button — appears after 400px scroll
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.title = 'Nach oben';
  btn.setAttribute('aria-label', 'Nach oben scrollen');
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-bs-theme') ?? 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  updateNavBg();
}

function updateNavBg() {
  const nav = document.querySelector('.glass-nav');
  if (!nav) return;
  const light = document.documentElement.getAttribute('data-bs-theme') === 'light';
  const scrolled = window.scrollY > 40;
  nav.style.background = light
    ? (scrolled ? 'rgba(240,237,232,0.92)' : 'rgba(240,237,232,0.72)')
    : (scrolled ? 'rgba(7,7,26,0.88)'     : 'rgba(7,7,26,0.55)');
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) ?? 'dark';
  applyTheme(saved);
  initScrollProgress();
  initBackToTop();

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Close mobile nav on outside click
  document.addEventListener('click', e => {
    if (links?.classList.contains('open') && !e.target.closest('.glass-nav')) {
      links.classList.remove('open');
    }
  });
});

window.addEventListener('scroll', updateNavBg, { passive: true });
