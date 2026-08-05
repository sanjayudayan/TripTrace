let map, marker;
let currentLat  = null;
let currentLng  = null;
let currentAddr = '';

// ===== INIT MAP =====
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { elementType: 'geometry',
        stylers: [{ color: '#1a1a3e' }] },
      { elementType: 'labels.text.fill',
        stylers: [{ color: '#8ec3b9' }] },
      { elementType: 'labels.text.stroke',
        stylers: [{ color: '#1a3646' }] },
      { featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0d1b2a' }] },
      { featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#304a7d' }] },
    ]
  });

  map.addListener('click', (e) => {
    placeMarker(e.latLng.lat(), e.latLng.lng());
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  });
}

// ===== PLACE MARKER =====
function placeMarker(lat, lng) {
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({
    position : { lat, lng },
    map      : map,
    animation: google.maps.Animation.DROP,
    icon: {
      path        : google.maps.SymbolPath.CIRCLE,
      scale       : 10,
      fillColor   : '#6C63FF',
      fillOpacity : 1,
      strokeColor : '#ffffff',
      strokeWeight: 2,
    }
  });
  map.setCenter({ lat, lng });
  map.setZoom(13);
  currentLat = lat;
  currentLng = lng;
}

// ===== REVERSE GEOCODE =====
function reverseGeocode(lat, lng) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      currentAddr = results[0].formatted_address;
      document.getElementById('location-display').innerHTML =
        '📍 ' + currentAddr;
      fetchWeather(lat, lng);
    }
  });
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
    document.getElementById('location-display').innerHTML = '📍 Location will appear here after detection';
    document.getElementById('weather-box').classList.remove('show');
    if (marker) marker.setMap(null);
    currentLat = null; currentLng = null; currentAddr = '';

    setTimeout(() => { msgEl.innerHTML = ''; }, 5000);

  } catch (err) {
    showToast('❌ Error: ' + err.message);
    btn.innerHTML = '💾 Save Trip';
    btn.disabled  = false;
  }
}