// Theme Toggle — Dark/Light Mode via Bootstrap data-bs-theme

const THEME_KEY = 'cp-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme') ?? 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) ?? 'dark';
  applyTheme(saved);
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
});
