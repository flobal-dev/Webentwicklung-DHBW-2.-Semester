const THEME_KEY = 'cp-theme';

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
