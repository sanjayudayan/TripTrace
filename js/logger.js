let map, marker;
let currentLat  = null;
let currentLng  = null;
let currentAddr = '';

// ===== INIT MAP =====
function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Click on map to set location
  map.on('click', function(e) {
    placeMarker(e.latlng.lat, e.latlng.lng);
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });
}

// ===== PLACE MARKER =====
function placeMarker(lat, lng) {
  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        width:20px; height:20px;
        background:#6C63FF;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 0 10px rgba(108,99,255,0.8);">
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(map);

  map.setView([lat, lng], 13);
  currentLat = lat;
  currentLng = lng;
}

// ===== REVERSE GEOCODE =====
async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    currentAddr = data.display_name || `${lat}, ${lng}`;
    document.getElementById('location-display').innerHTML =
      '📍 ' + currentAddr;
    fetchWeather(lat, lng);
  } catch (err) {
    currentAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    document.getElementById('location-display').innerHTML =
      '📍 ' + currentAddr;
  }
}

// ===== DETECT LOCATION =====
function getLocation() {
  const btn = event.target;
  btn.innerHTML = '⏳ Detecting...';
  btn.disabled  = true;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        btn.innerHTML = '✅ Location Detected';
        btn.disabled  = false;
      },
      () => {
        showToast('❌ Could not detect location. Try clicking on the map.');
        btn.innerHTML = '📡 Detect My Current Location';
        btn.disabled  = false;
      }
    );
  } else {
    showToast('❌ Geolocation not supported.');
    btn.innerHTML = '📡 Detect My Current Location';
    btn.disabled  = false;
  }
}

// ===== PHOTO PREVIEW =====
function previewPhotos(event) {
  const preview = document.getElementById('photo-preview');
  preview.innerHTML = '';
  Array.from(event.target.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src   = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// ===== UPLOAD PHOTOS =====
async function uploadPhotos(userId) {
  // Storage disabled - return empty array
  return [];
}

// ===== SAVE TRIP =====
async function saveTrip() {
  const name        = document.getElementById('trip-name').value.trim();
  const destination = document.getElementById('trip-destination').value.trim();
  const date        = document.getElementById('trip-date').value;
  const category    = document.getElementById('trip-category').value;
  const notes       = document.getElementById('trip-notes').value.trim();
  const rating      = document.getElementById('trip-rating').value;
  const btn         = document.getElementById('save-btn');
  const msgEl       = document.getElementById('save-msg');

  if (!name)       { showToast('⚠️ Please enter a trip name.'); return; }
  if (!date)       { showToast('⚠️ Please select a date.'); return; }
  if (!currentLat) { showToast('⚠️ Please set a location on the map.'); return; }

  btn.innerHTML = '<span class="loader"></span> Saving...';
  btn.disabled  = true;

  try {
    const user      = auth.currentUser;
    const photoURLs = await uploadPhotos(user.uid);
    const expenses  = getExpenses();
    const total     = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    await db.collection('trips').add({
      userId     : user.uid,
      name       : name,
      destination: destination,
      date       : date,
      category   : category,
      notes      : notes,
      rating     : rating,
      address    : currentAddr,
      lat        : currentLat,
      lng        : currentLng,
      photos     : photoURLs,
      expenses   : expenses,
      totalCost  : total,
      createdAt  : firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast('✅ Trip saved successfully!');
    msgEl.innerHTML = '✅ Trip saved! <a href="history.html" style="color:var(--primary);">View in History →</a>';
    btn.innerHTML   = '💾 Save Trip';
    btn.disabled    = false;

    // Reset form
    document.getElementById('trip-name').value        = '';
    document.getElementById('trip-destination').value = '';
    document.getElementById('trip-date').value        = '';
    document.getElementById('trip-notes').value       = '';
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('expense-list').innerHTML  = '';
    document.getElementById('total-amount').innerText  = '₹0';
    document.getElementById('location-display').innerHTML =
      '📍 Location will appear here after detection';
    document.getElementById('weather-box').classList.remove('show');
    if (marker) map.removeLayer(marker);
    currentLat = null; currentLng = null; currentAddr = '';

    setTimeout(() => { msgEl.innerHTML = ''; }, 5000);

  } catch (err) {
    showToast('❌ Error: ' + err.message);
    btn.innerHTML = '💾 Save Trip';
    btn.disabled  = false;
  }
}

// Initialize map when page loads
window.onload = initMap;