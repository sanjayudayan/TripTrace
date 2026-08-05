let allTrips    = [];
let activeFilter = 'all';

// ===== LOAD TRIPS =====
auth.onAuthStateChanged((user) => {
  if (user) loadTrips(user.uid);
});

function loadTrips(userId) {
  db.collection('trips')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      allTrips = [];
      let totalSpent    = 0;
      let categoryCount = {};

      snapshot.forEach((doc) => {
        const trip = { id: doc.id, ...doc.data() };
        allTrips.push(trip);
        totalSpent += parseFloat(trip.totalCost || 0);
        categoryCount[trip.category] =
          (categoryCount[trip.category] || 0) + 1;
      });

      // Update stats
      document.getElementById('total-trips').innerText  = allTrips.length;
      document.getElementById('trip-count').innerText   = allTrips.length;
      document.getElementById('total-spent').innerText  =
        '₹' + totalSpent.toLocaleString('en-IN');

      const topCat = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0];
      document.getElementById('top-category').innerText =
        topCat ? getCategoryEmoji(topCat[0]) : '--';

      renderTrips(allTrips);
    });
}

// ===== RENDER TRIPS =====
function renderTrips(trips) {
  const listEl = document.getElementById('trip-list');

  if (trips.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🗺️</span>
        <h3>No Trips Found</h3>
        <p>Start logging your adventures!</p>
        <a href="logger.html" class="btn btn-primary"
           style="margin-top:16px; display:inline-flex;">
          ➕ Log First Trip
        </a>
      </div>`;
    return;
  }

  listEl.innerHTML = '';
  trips.forEach((trip) => {
    const card  = document.createElement('div');
    card.className = 'trip-card';

    const thumb = trip.photos && trip.photos.length > 0
      ? `<img class="trip-thumb" src="${trip.photos[0]}" alt="Trip"/>`
      : `<div class="trip-thumb-placeholder">
           ${getCategoryEmoji(trip.category)}
         </div>`;

    const stars = '⭐'.repeat(parseInt(trip.rating || 5));

    card.innerHTML = `
      ${thumb}
      <div class="trip-info">
        <div class="trip-name">${trip.name}</div>
        <div class="trip-location">
          📍 ${trip.address || trip.destination || 'Location not set'}
        </div>
        <div class="trip-meta">
          <span class="trip-date">📅 ${formatDate(trip.date)}</span>
          <span class="trip-category">
            ${getCategoryEmoji(trip.category)} ${trip.category || 'Other'}
          </span>
        </div>
        <div class="trip-meta" style="margin-top:4px;">
          <span class="trip-rating">${stars}</span>
          ${trip.totalCost > 0
            ? `<span class="trip-expense">
                 💸 ₹${parseFloat(trip.totalCost).toLocaleString('en-IN')}
               </span>`
            : ''}
        </div>
      </div>`;

    listEl.appendChild(card);
  });
}

// ===== FILTER BY CATEGORY =====
function setFilter(category, el) {
  activeFilter = category;
  document.querySelectorAll('.filter-tab')
    .forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  filterTrips();
}

// ===== SEARCH + FILTER =====
function filterTrips() {
  const query = document.getElementById('search-input')
    .value.toLowerCase();

  let filtered = allTrips.filter((trip) => {
    const matchSearch =
      trip.name?.toLowerCase().includes(query) ||
      trip.destination?.toLowerCase().includes(query) ||
      trip.address?.toLowerCase().includes(query) ||
      trip.notes?.toLowerCase().includes(query);

    const matchFilter =
      activeFilter === 'all' || trip.category === activeFilter;

    return matchSearch && matchFilter;
  });

  renderTrips(filtered);
}

// ===== HELPERS =====
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function getCategoryEmoji(category) {
  const map = {
    adventure: '🏔️', beach: '🏖️', cultural: '🏛️',
    food: '🍜', nature: '🌿', religious: '🕌',
    'road-trip': '🚗', other: '✈️'
  };
  return map[category] || '✈️';
}