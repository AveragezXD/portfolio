const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');

// Simple in-memory cache
const cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mock data for demo mode
const MOCK_WEATHER_DATA = {
  'new york': {
    city: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.0060,
    current: {
      temp: 22,
      feels_like: 20,
      humidity: 65,
      pressure: 1013,
      visibility: 10000,
      wind_speed: 5.5,
      main: 'Clouds',
      description: 'Partly Cloudy',
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 14400,
      uvi: 6.5
    },
    forecast: [
      { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp_max: 24, temp_min: 18 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp_max: 26, temp_min: 20 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp_max: 25, temp_min: 19 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp_max: 23, temp_min: 17 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp_max: 27, temp_min: 21 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 518400, main: { temp_max: 25, temp_min: 19 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 604800, main: { temp_max: 22, temp_min: 16 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 691200, main: { temp_max: 24, temp_min: 18 }, weather: [{ main: 'Clouds' }] }
    ]
  },
  'london': {
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    current: {
      temp: 18,
      feels_like: 16,
      humidity: 72,
      pressure: 1015,
      visibility: 9000,
      wind_speed: 4.2,
      main: 'Clouds',
      description: 'Overcast',
      sunrise: Math.floor(Date.now() / 1000) - 25200,
      sunset: Math.floor(Date.now() / 1000) + 10800,
      uvi: 4.2
    },
    forecast: [
      { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp_max: 20, temp_min: 15 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp_max: 19, temp_min: 14 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp_max: 21, temp_min: 16 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp_max: 19, temp_min: 14 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp_max: 22, temp_min: 17 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 518400, main: { temp_max: 20, temp_min: 15 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 604800, main: { temp_max: 18, temp_min: 13 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 691200, main: { temp_max: 19, temp_min: 14 }, weather: [{ main: 'Clouds' }] }
    ]
  },
  'tokyo': {
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    current: {
      temp: 28,
      feels_like: 30,
      humidity: 78,
      pressure: 1008,
      visibility: 8000,
      wind_speed: 6.1,
      main: 'Thunderstorm',
      description: 'Thunderstorm with rain',
      sunrise: Math.floor(Date.now() / 1000) - 36000,
      sunset: Math.floor(Date.now() / 1000) + 3600,
      uvi: 7.8
    },
    forecast: [
      { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp_max: 29, temp_min: 24 }, weather: [{ main: 'Thunderstorm' }] },
      { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp_max: 31, temp_min: 26 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp_max: 30, temp_min: 25 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp_max: 28, temp_min: 23 }, weather: [{ main: 'Rain' }] },
      { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp_max: 32, temp_min: 27 }, weather: [{ main: 'Clear' }] },
      { dt: Math.floor(Date.now() / 1000) + 518400, main: { temp_max: 30, temp_min: 25 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 604800, main: { temp_max: 29, temp_min: 24 }, weather: [{ main: 'Clouds' }] },
      { dt: Math.floor(Date.now() / 1000) + 691200, main: { temp_max: 31, temp_min: 26 }, weather: [{ main: 'Clear' }] }
    ]
  }
};

// Helper function to make HTTPS requests
function fetchFromAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper function to format weather data
function formatWeatherData(city, current, forecast) {
  return {
    city: city,
    country: current.sys?.country || '',
    lat: current.coord?.lat,
    lon: current.coord?.lon,
    current: {
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      visibility: current.visibility,
      wind_speed: current.wind.speed,
      main: current.weather[0].main,
      description: current.weather[0].description,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      uvi: current.clouds?.all || 0
    },
    forecast: forecast.list.filter((_, i) => i % 8 === 0).map(item => ({
      dt: item.dt,
      main: item.main,
      weather: item.weather
    }))
  };
}

// Route: Get weather by city name
router.get('/city', async (req, res) => {
  try {
    const city = req.query.q?.toLowerCase();
    if (!city) {
      return res.status(400).json({ error: 'City name required' });
    }

    // Check mock data first
    if (MOCK_WEATHER_DATA[city]) {
      return res.json(MOCK_WEATHER_DATA[city]);
    }

    // Check cache
    if (cache[city] && Date.now() - cache[city].timestamp < CACHE_DURATION) {
      return res.json(cache[city].data);
    }

    // If no API key or demo mode, return mock data
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'demo') {
      return res.status(404).json({ error: 'City not found in demo data. Try: New York, London, or Tokyo' });
    }

    // Fetch from API
    const currentUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;

    const currentData = await fetchFromAPI(currentUrl);
    const forecastData = await fetchFromAPI(forecastUrl);

    const formatted = formatWeatherData(currentData.name, currentData, forecastData);
    cache[city] = { data: formatted, timestamp: Date.now() };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
  }
});

// Route: Get weather by coordinates
router.get('/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const cacheKey = `${lat},${lon}`;

    // Check cache
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return res.json(cache[cacheKey].data);
    }

    // If no API key or demo mode, use mock data for approximate locations
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'demo') {
      const mockCity = MOCK_WEATHER_DATA['new york'];
      return res.json(mockCity);
    }

    // Fetch from API
    const currentUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;

    const currentData = await fetchFromAPI(currentUrl);
    const forecastData = await fetchFromAPI(forecastUrl);

    const formatted = formatWeatherData(currentData.name, currentData, forecastData);
    cache[cacheKey] = { data: formatted, timestamp: Date.now() };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
  }
});

module.exports = router;
