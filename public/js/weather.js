// Weather Dashboard
const API_KEY = 'demo'; // Will be set from server
const WEATHER_CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const LOCATIONS_KEY = 'weather-saved-locations';

let currentWeather = null;
let currentLocation = { lat: null, lon: null, name: 'Current Location' };
let savedLocations = [];
let cache = {};

document.addEventListener('DOMContentLoaded', () => {
  initializeWeather();
  setupEventListeners();
  loadSavedLocations();
});

function initializeWeather() {
  // Get API key from data attribute
  const apiKey = document.body.getAttribute('data-api-key');
  if (apiKey && apiKey !== 'demo') {
    window.API_KEY = apiKey;
  }

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.lat = position.coords.latitude;
        currentLocation.lon = position.coords.longitude;
        getWeatherByCoords(currentLocation.lat, currentLocation.lon);
      },
      () => {
        // Fallback to default location
        getWeatherByCity('New York');
      }
    );
  } else {
    getWeatherByCity('New York');
  }
}

function setupEventListeners() {
  const searchBtn = document.querySelector('.btn-search');
  const searchInput = document.querySelector('.search-input');
  const geoBtn = document.querySelector('.btn-geo');
  const themeToggle = document.querySelector('.theme-toggle-weather');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const city = searchInput.value.trim();
      if (city) {
        getWeatherByCity(city);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
          getWeatherByCity(city);
        }
      }
    });
  }

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        geoBtn.disabled = true;
        geoBtn.innerHTML = '<span class="spinner"></span>';
        navigator.geolocation.getCurrentPosition(
          (position) => {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            geoBtn.disabled = false;
            geoBtn.innerHTML = '📍 My Location';
          },
          () => {
            showAlert('Could not get your location', 'danger');
            geoBtn.disabled = false;
            geoBtn.innerHTML = '📍 My Location';
          }
        );
      }
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

async function getWeatherByCity(city) {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) searchInput.value = '';

  showLoading();

  try {
    const response = await fetch(`/api/weather/city?q=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error('City not found');
    }
    const data = await response.json();
    displayWeather(data);
    showAlert(`Weather for ${data.city} loaded!`, 'success');
  } catch (error) {
    showAlert(error.message, 'danger');
    hideLoading();
  }
}

async function getWeatherByCoords(lat, lon) {
  showLoading();

  try {
    const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      throw new Error('Could not fetch weather data');
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    showAlert(error.message, 'danger');
    hideLoading();
  }
}

function displayWeather(data) {
  currentWeather = data;

  // Update current weather
  document.querySelector('.location-info h2').textContent = data.city;
  document.querySelector('.location-info p').textContent = data.country || '';
  document.querySelector('.temperature-large').textContent = Math.round(data.current.temp) + '°';
  document.querySelector('.weather-icon').textContent = getWeatherIcon(data.current.main);
  document.querySelector('.weather-description').textContent = data.current.description;

  // Update weather details
  document.querySelector('[data-detail="feels-like"]').textContent = Math.round(data.current.feels_like) + '°';
  document.querySelector('[data-detail="humidity"]').textContent = data.current.humidity + '%';
  document.querySelector('[data-detail="wind"]').textContent = Math.round(data.current.wind_speed) + ' m/s';
  document.querySelector('[data-detail="pressure"]').textContent = data.current.pressure + ' hPa';
  document.querySelector('[data-detail="visibility"]').textContent = (data.current.visibility / 1000).toFixed(1) + ' km';
  document.querySelector('[data-detail="uv"]').textContent = data.current.uvi?.toFixed(1) || 'N/A';

  // Update sunrise/sunset
  document.querySelector('[data-detail="sunrise"]').textContent = new Date(data.current.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  document.querySelector('[data-detail="sunset"]').textContent = new Date(data.current.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Update forecast
  displayForecast(data.forecast);
  hideLoading();
}

function displayForecast(forecast) {
  const forecastGrid = document.querySelector('.forecast-grid');
  forecastGrid.innerHTML = '';

  forecast.slice(0, 8).forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
    card.innerHTML = `
      <div class="forecast-date">${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
      <div class="forecast-icon">${getWeatherIcon(day.weather[0].main)}</div>
      <div class="forecast-temp">${Math.round(day.main.temp_max)}°</div>
      <div class="forecast-temp-range">${Math.round(day.main.temp_min)}° • ${day.weather[0].main}</div>
    `;
    forecastGrid.appendChild(card);
  });
}

function getWeatherIcon(weather) {
  const iconMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '💨',
    'Haze': '🌫️',
    'Dust': '🌪️',
    'Fog': '🌫️',
    'Sand': '🏜️',
    'Ash': '🌋',
    'Squall': '🌪️',
    'Tornado': '🌪️'
  };
  return iconMap[weather] || '🌡️';
}

function saveLocation() {
  if (!currentWeather) return;
  
  const location = {
    name: currentWeather.city,
    lat: currentWeather.lat,
    lon: currentWeather.lon
  };

  // Check if already saved
  if (!savedLocations.some(l => l.lat === location.lat && l.lon === location.lon)) {
    savedLocations.push(location);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(savedLocations));
    renderSavedLocations();
    showAlert(`${location.name} saved!`, 'success');
  } else {
    showAlert('Location already saved!', 'warning');
  }
}

function removeLocation(index) {
  savedLocations.splice(index, 1);
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(savedLocations));
  renderSavedLocations();
}

function loadSavedLocations() {
  const saved = localStorage.getItem(LOCATIONS_KEY);
  if (saved) {
    savedLocations = JSON.parse(saved);
    renderSavedLocations();
  }
}

function renderSavedLocations() {
  const container = document.querySelector('.saved-locations');
  container.innerHTML = '';

  savedLocations.forEach((location, index) => {
    const btn = document.createElement('div');
    btn.className = 'location-btn';
    btn.innerHTML = `
      <span>${location.name}</span>
      <button onclick="removeLocation(${index})" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">×</button>
    `;
    btn.addEventListener('click', (e) => {
      if (!e.target.textContent.includes('×')) {
        getWeatherByCoords(location.lat, location.lon);
      }
    });
    container.appendChild(btn);
  });
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('weather-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function showLoading() {
  const currentCard = document.querySelector('.current-weather');
  currentCard.innerHTML = '<div class="loading"><div class="spinner"></div>&nbsp;Loading weather...</div>';
}

function hideLoading() {
  // Handled by displayWeather
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  const container = document.querySelector('.weather-container');
  container.insertBefore(alert, container.firstChild);
  setTimeout(() => alert.remove(), 3000);
}

// Initialize theme
const savedTheme = localStorage.getItem('weather-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
}
