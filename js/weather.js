// =============================================
// Replace YOUR_WEATHER_API_KEY with your key
// from openweathermap.org
// =============================================

const WEATHER_API_KEY = '7f73dfc9f1be09099d32ba4f87f2bef9';

async function fetchWeather(lat, lng) {
  try {
    const url  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) return;

    const temp    = Math.round(data.main.temp);
    const desc    = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const city    = data.name;

    document.getElementById('weather-temp').innerText     = temp + '°C';
    document.getElementById('weather-desc').innerText     =
      desc.charAt(0).toUpperCase() + desc.slice(1);
    document.getElementById('weather-location').innerText = '📍 ' + city;
    document.getElementById('weather-icon').innerText     =
      getWeatherEmoji(iconCode);
    document.getElementById('weather-box').classList.add('show');

  } catch (err) {
    console.log('Weather fetch failed:', err);
  }
}

function getWeatherEmoji(iconCode) {
  const map = {
    '01d': '☀️',  '01n': '🌙',
    '02d': '⛅',  '02n': '⛅',
    '03d': '☁️',  '03n': '☁️',
    '04d': '☁️',  '04n': '☁️',
    '09d': '🌧️',  '09n': '🌧️',
    '10d': '🌦️',  '10n': '🌧️',
    '11d': '⛈️',  '11n': '⛈️',
    '13d': '❄️',  '13n': '❄️',
    '50d': '🌫️',  '50n': '🌫️',
  };
  return map[iconCode] || '🌤️';
}