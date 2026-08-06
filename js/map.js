let fullMap;

// ===== INIT FULL MAP =====
function initFullMap() {
  fullMap = L.map('fullmap').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(fullMap);

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
        document.getElementById('fullmap').style.display     = 'none';
        document.getElementById('no-trips-msg').style.display = 'block';
        return;
      }

      let count   = 0;
      const cities = new Set();
      const bounds = [];
      let isFirst  = true;

      snapshot.forEach((doc) => {
        const trip = doc.data();
        if (!trip.lat || !trip.lng) return;
        count++;
        if (trip.address) cities.add(trip.address.split(',')[0]);
        bounds.push([trip.lat, trip.lng]);

        const stars = '⭐'.repeat(parseInt(trip.rating || 5));

        const popupContent = `
          <div style="font-family:Poppins,sans-serif;
                      min-width:180px; padding:4px;">
            <strong style="color:#6C63FF; font-size:14px;">
              ${trip.name}
            </strong><br/>
            <small>📍 ${trip.address || ''}</small><br/>
            <small>📅 ${trip.date || ''}</small><br/>
            <small>${stars}</small>
            ${trip.totalCost > 0
              ? `<br/><small style="color:#43E97B;">
                   💸 ₹${parseFloat(trip.totalCost)
                     .toLocaleString('en-IN')}
                 </small>`
              : ''}
          </div>`;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:${isFirst ? '24px' : '18px'};
            height:${isFirst ? '24px' : '18px'};
            background:${isFirst ? '#43E97B' : '#6C63FF'};
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 0 10px rgba(108,99,255,0.6);">
          </div>`,
          iconSize  : [isFirst ? 24 : 18, isFirst ? 24 : 18],
          iconAnchor: [isFirst ? 12 : 9,  isFirst ? 12 : 9]
        });

        L.marker([trip.lat, trip.lng], { icon })
          .addTo(fullMap)
          .bindPopup(popupContent);

        isFirst = false;
      });

      document.getElementById('map-trip-count').innerText = count;
      document.getElementById('map-city-count').innerText = cities.size;

      if (bounds.length > 0) {
        fullMap.fitBounds(bounds, { padding: [30, 30] });
      }
    });
}

// Initialize map when page loads
window.onload = initFullMap;