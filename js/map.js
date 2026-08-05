let fullMap;

// ===== INIT FULL MAP =====
function initFullMap() {
  fullMap = new google.maps.Map(document.getElementById('fullmap'), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      { elementType: 'geometry',
        stylers: [{ color: '#1a1a3e' }] },
      { elementType: 'labels.text.fill',
        stylers: [{ color: '#8ec3b9' }] },
      { featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0d1b2a' }] },
      { featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#304a7d' }] },
    ]
  });

  auth.onAuthStateChanged((user) => {
    if (user) loadTripMarkers(user.uid);
  });
}

// ===== LOAD MARKERS =====
function loadTripMarkers(userId) {
  db.collection('trips')
    .where('userId', '==', userId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        document.getElementById('fullmap').style.display    = 'none';
        document.getElementById('no-trips-msg').style.display = 'block';
        return;
      }

      const bounds  = new google.maps.LatLngBounds();
      let   count   = 0;
      const cities  = new Set();
      let   isFirst = true;

      snapshot.forEach((doc) => {
        const trip = doc.data();
        if (!trip.lat || !trip.lng) return;
        count++;
        if (trip.address) cities.add(trip.address.split(',')[0]);

        const marker = new google.maps.Marker({
          position : { lat: trip.lat, lng: trip.lng },
          map      : fullMap,
          title    : trip.name,
          animation: google.maps.Animation.DROP,
          icon: {
            path        : google.maps.SymbolPath.CIRCLE,
            scale       : isFirst ? 12 : 10,
            fillColor   : isFirst ? '#43E97B' : '#6C63FF',
            fillOpacity : 1,
            strokeColor : '#ffffff',
            strokeWeight: 2,
          }
        });

        const stars = '⭐'.repeat(parseInt(trip.rating || 5));
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:Poppins,sans-serif;
                        padding:8px; min-width:180px;
                        background:#12122A; color:white;
                        border-radius:10px;">
              <strong style="color:#6C63FF; font-size:14px;">
                ${trip.name}
              </strong><br/>
              <small style="color:#aaa;">
                📍 ${trip.address || ''}
              </small><br/>
              <small style="color:#aaa;">📅 ${trip.date || ''}</small><br/>
              <small>${stars}</small>
              ${trip.totalCost > 0
                ? `<br/><small style="color:#43E97B;">
                     💸 ₹${parseFloat(trip.totalCost)
                       .toLocaleString('en-IN')}
                   </small>`
                : ''}
            </div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(fullMap, marker);
        });

        bounds.extend({ lat: trip.lat, lng: trip.lng });
        isFirst = false;
      });

      document.getElementById('map-trip-count').innerText = count;
      document.getElementById('map-city-count').innerText = cities.size;
      fullMap.fitBounds(bounds);
    });
}