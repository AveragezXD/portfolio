// Theme Management
const themeToggle = document.querySelector('.theme-toggle');
const htmlElement = document.documentElement;
const bodyElement = document.body;

const THEME_KEY = 'portfolio-theme';

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  if (theme === 'light') {
    bodyElement.classList.add('light-mode');
    themeToggle.textContent = '🌙';
    localStorage.setItem(THEME_KEY, 'light');
  } else {
    bodyElement.classList.remove('light-mode');
    themeToggle.textContent = '☀️';
    localStorage.setItem(THEME_KEY, 'dark');
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

initializeTheme();
