/* ====================================================
   Car Rentals India — Frontend JavaScript
   Handles: car loading, search, filters, slider,
            booking modal, form validation, API calls
   ==================================================== */

// ── State ────────────────────────────────────────────
let allCars = [];          // full car list from API / JSON
let currentCarId = null;   // car selected for booking
let activeFilter = 'all';  // current category/type filter

// ── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setMinDates();
  loadCars();
  initNavToggle();
});

// ── Set min dates to today ───────────────────────────
function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  const fields = ['pickupDate', 'returnDate', 'bPickupDate', 'bReturnDate'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
}

// ── Load Cars from backend (fallback to embedded JSON) ──
async function loadCars() {
  showSkeletons();
  try {
    const res = await fetch('/cars');
    if (!res.ok) throw new Error('Server not available');
    const data = await res.json();
    allCars = data.cars;
  } catch {
    // Fallback: use embedded data (works without server)
    allCars = FALLBACK_CARS;
  }
  renderCars(allCars);
  renderSlider(allCars);
}

// ── Render skeleton loaders ───────────────────────────
function showSkeletons() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="car-card">
      <div class="skeleton" style="height:190px;border-radius:18px 18px 0 0;"></div>
      <div style="padding:1.2rem;display:flex;flex-direction:column;gap:10px;">
        <div class="skeleton" style="height:12px;width:60%;border-radius:4px;"></div>
        <div class="skeleton" style="height:18px;width:80%;border-radius:4px;"></div>
        <div class="skeleton" style="height:12px;width:100%;border-radius:4px;"></div>
        <div class="skeleton" style="height:38px;border-radius:10px;margin-top:8px;"></div>
      </div>
    </div>
  `).join('');
}

// ── Render car cards ──────────────────────────────────
function renderCars(cars) {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  if (!cars.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🔍</div>
        <h3>No Cars Found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
    return;
  }

  grid.innerHTML = cars.map((car, i) => `
    <div class="car-card" style="animation-delay:${i * 0.06}s;">
      <div class="car-img-wrap">
        <img
          src="${car.image}"
          alt="${car.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22300%22%3E%3Crect fill=%22%230d1220%22 width=%22600%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2244%25%22 font-family=%22Arial%22 font-size=%2228%22 fill=%22%23FF6B00%22 text-anchor=%22middle%22%3E%F0%9F%9A%97%3C/text%3E%3Ctext x=%2250%25%22 y=%2262%25%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%237A8599%22 text-anchor=%22middle%22%3EImage unavailable%3C/text%3E%3C/svg%3E';"
        />
        <span class="car-badge badge-${car.category}">${categoryLabel(car.category)}</span>
        <span class="car-fuel-tag">${fuelEmoji(car.fuel)} ${car.fuel}</span>
      </div>
      <div class="car-body">
        <div class="car-type">${car.type}</div>
        <div class="car-name">${car.name}</div>
        <div class="car-specs">
          <span class="spec"><span class="spec-icon">💺</span>${car.seats} Seats</span>
          <span class="spec"><span class="spec-icon">⛽</span>${car.fuel}</span>
          <span class="spec"><span class="spec-icon">📊</span>${car.mileage}</span>
        </div>
        <div class="car-footer">
          <div class="car-price">
            <span class="amount">₹${car.price.toLocaleString('en-IN')}</span>
            <span class="per">/day</span>
          </div>
          <button class="btn-rent" onclick="openBooking(${car.id})">
            🚗 Rent Now
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Build the infinite slider ─────────────────────────
function renderSlider(cars) {
  const track = document.getElementById('sliderTrack');
  if (!track) return;

  // Duplicate list for seamless loop
  const doubled = [...cars, ...cars];
  track.innerHTML = doubled.map(car => `
    <div class="slide-card" onclick="openBooking(${car.id})" style="cursor:pointer;" title="Book ${car.name}">
      <img
        src="${car.image}"
        alt="${car.name}"
        loading="lazy"
        onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22130%22%3E%3Crect fill=%22%230d1220%22 width=%22220%22 height=%22130%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23FF6B00%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E%F0%9F%9A%97%3C/text%3E%3C/svg%3E';"
      />
      <div class="slide-info">
        <div class="slide-name">${car.name}</div>
        <div class="slide-price">₹${car.price.toLocaleString('en-IN')}/day · ${car.mileage}</div>
      </div>
    </div>
  `).join('');
}

// ── Filter Pills ──────────────────────────────────────
document.addEventListener('click', (e) => {
  if (!e.target.matches('.filter-pill')) return;

  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  e.target.classList.add('active');

  const filter = e.target.dataset.filter;
  activeFilter = filter;
  applyFilters();
});

// ── Search handler ────────────────────────────────────
function handleSearch() {
  applyFilters();
  // Scroll to car listing
  document.getElementById('cars').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── City quick-filter from city chips ────────────────
function filterByCity(city) {
  document.getElementById('searchCity').value = city;
  handleSearch();
}

// ── Central filter function ───────────────────────────
function applyFilters() {
  const q    = (document.getElementById('searchName')?.value || '').toLowerCase().trim();
  const city = document.getElementById('searchCity')?.value  || '';
  const fuel = document.getElementById('searchFuel')?.value  || '';
  const seats= document.getElementById('searchSeats')?.value || '';

  let filtered = allCars.filter(car => {
    // Text search
    if (q && !car.name.toLowerCase().includes(q)) return false;
    // City
    if (city && !car.cities.map(c => c.toLowerCase()).includes(city.toLowerCase())) return false;
    // Fuel
    if (fuel && car.fuel.toLowerCase() !== fuel.toLowerCase()) return false;
    // Seats
    if (seats && car.seats !== parseInt(seats)) return false;
    // Category / type pill
    if (activeFilter && activeFilter !== 'all') {
      if (activeFilter === 'Electric') {
        if (car.fuel !== 'Electric') return false;
      } else if (['budget','family'].includes(activeFilter)) {
        if (car.category !== activeFilter) return false;
      } else {
        // SUV / Sedan type
        if (car.type !== activeFilter) return false;
      }
    }
    return true;
  });

  renderCars(filtered);
}

// Enter key on search inputs
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const focused = document.activeElement;
    if (['searchName','searchCity','searchFuel','searchSeats','pickupDate','returnDate'].includes(focused?.id)) {
      handleSearch();
    }
  }
});

// ── Booking Modal ─────────────────────────────────────
function openBooking(carId) {
  const car = allCars.find(c => c.id === carId);
  if (!car) return;

  currentCarId = carId;
  document.getElementById('modalCarName').textContent =
    `${car.name} · ₹${car.price.toLocaleString('en-IN')}/day · ${car.mileage}`;
  document.getElementById('priceTotal').textContent = '₹—';
  document.getElementById('priceDays').textContent = 'Select dates to see total';

  // Pre-fill dates from hero search if set
  const hPickup = document.getElementById('pickupDate')?.value;
  const hReturn = document.getElementById('returnDate')?.value;
  if (hPickup) document.getElementById('bPickupDate').value = hPickup;
  if (hReturn) document.getElementById('bReturnDate').value = hReturn;
  if (hPickup && hReturn) calcPrice();

  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on overlay click
document.getElementById('bookingModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Calculate rental price preview ───────────────────
function calcPrice() {
  const car = allCars.find(c => c.id === currentCarId);
  if (!car) return;

  const p = document.getElementById('bPickupDate').value;
  const r = document.getElementById('bReturnDate').value;
  if (!p || !r) return;

  const pickup = new Date(p);
  const ret    = new Date(r);
  const days   = Math.max(1, Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24)));
  const total  = days * car.price;

  document.getElementById('priceDays').textContent =
    `${days} day${days > 1 ? 's' : ''} × ₹${car.price.toLocaleString('en-IN')}`;
  document.getElementById('priceTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// ── Submit Booking ────────────────────────────────────
async function submitBooking() {
  const name       = document.getElementById('bName').value.trim();
  const phone      = document.getElementById('bPhone').value.trim();
  const email      = document.getElementById('bEmail').value.trim();
  const city       = document.getElementById('bCity').value;
  const pickupDate = document.getElementById('bPickupDate').value;
  const pickupTime = document.getElementById('bPickupTime').value;
  const returnDate = document.getElementById('bReturnDate').value;
  const returnTime = document.getElementById('bReturnTime').value;
  const address    = document.getElementById('bAddress').value.trim();

  if (!name || !phone || !city || !pickupDate || !returnDate || !address) {
    showToast('⚠️ Please fill all required fields.', 'error');
    return;
  }

  const payload = {
    name,
    phone,
    email,
    carId: currentCarId,
    city,
    address,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime
  };

  try {
    const res = await fetch('http://localhost:3000/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    console.log("SERVER RESPONSE:", data);

if (data.success) {
      closeModal();
      showToast(`✅ Booking Confirmed! ID: ${data.booking.id}`, 'success');
    } else {
      showToast('❌ Booking failed', 'error');
    }

  } catch (err) {
    console.error(err);
    showToast("❌ Server not reachable", "error");
  }
}
// ── Toast Notification ────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = type === 'success' ? '✅' : '⚠️';
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Nav Toggle (mobile) ───────────────────────────────
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// ── Helpers ───────────────────────────────────────────
function fuelEmoji(fuel) {
  const map = { Petrol: '⛽', Diesel: '🛢️', CNG: '♻️', Electric: '⚡' };
  return map[fuel] || '⛽';
}
function categoryLabel(cat) {
  const map = { budget: '💰 Budget', family: '👨‍👩‍👧 Family', premium: '⭐ Premium' };
  return map[cat] || cat;
}

// ── Fallback car data (no server needed) ─────────────
// Using local SVG placeholder images for all cars
const FALLBACK_CARS = [
  { id:1,  name:"Maruti Suzuki Dzire", type:"Sedan", category:"budget",  price:1200, fuel:"Petrol",   seats:5, mileage:"23.26 kmpl",  image:"/images/Maruti Suzuki Dzire.jpg",   cities:["Hyderabad","Mumbai","Delhi","Bangalore","Chennai","Pune"] },
  { id:2,  name:"Honda Amaze",          type:"Sedan", category:"budget",  price:1400, fuel:"Petrol",   seats:5, mileage:"18.6 kmpl",   image:"/images/Honda Amaze.jpg",  cities:["Hyderabad","Mumbai","Delhi","Bangalore","Kolkata"] },
  { id:3,  name:"Hyundai Aura",         type:"Sedan", category:"budget",  price:1300, fuel:"CNG",      seats:5, mileage:"25.4 km/kg",  image:"/images/Hyundai_Aura.jpg",   cities:["Delhi","Mumbai","Hyderabad","Ahmedabad","Jaipur"] },
  { id:4,  name:"Tata Tigor EV",        type:"Sedan", category:"budget",  price:1250, fuel:"Electric", seats:5, mileage:"306 km range", image:"/images/Tata Tigor EV.jpg",  cities:["Mumbai","Pune","Bangalore","Chennai","Hyderabad"] },
  { id:5,  name:"Honda City",           type:"Sedan", category:"family",  price:1800, fuel:"Petrol",   seats:5, mileage:"17.8 kmpl",   image:"/images/Honda City.jpg",    cities:["Hyderabad","Mumbai","Delhi","Bangalore","Chennai","Kolkata"] },
  { id:6,  name:"Tata Nexon",           type:"SUV",   category:"family",  price:1900, fuel:"Diesel",   seats:5, mileage:"21.5 kmpl",   image:"/images/Tata Nexon.jpg",     cities:["Hyderabad","Mumbai","Delhi","Bangalore","Pune","Jaipur"] },
  { id:7,  name:"Hyundai Creta",        type:"SUV",   category:"family",  price:2200, fuel:"Petrol",   seats:5, mileage:"16.8 kmpl",   image:"/images/Hyundai Creta.jpg",    cities:["Hyderabad","Mumbai","Delhi","Bangalore","Chennai","Kolkata","Ahmedabad"] },
  { id:8,  name:"Maruti Brezza",        type:"SUV",   category:"budget",  price:1700, fuel:"Petrol",   seats:5, mileage:"19.8 kmpl",   image:"/images/Maruti Brezza.jpg",    cities:["Hyderabad","Mumbai","Delhi","Bangalore","Jaipur","Lucknow"] },
  { id:9,  name:"Mahindra XUV300",      type:"SUV",   category:"family",  price:2000, fuel:"Diesel",   seats:5, mileage:"20 kmpl",     image:"/images/Mahindra XUV300.jpg",      cities:["Mumbai","Pune","Delhi","Hyderabad","Chennai"] },
  { id:10, name:"Kia Sonet",            type:"SUV",   category:"family",  price:2100, fuel:"Diesel",   seats:5, mileage:"24.1 kmpl",   image:"/images/Kia Sonet.jpg",       cities:["Hyderabad","Bangalore","Chennai","Delhi","Mumbai"] },
  { id:11, name:"Mahindra Scorpio N",   type:"SUV",   category:"family",  price:2800, fuel:"Diesel",   seats:7, mileage:"15.4 kmpl",   image:"/images/Mahindra Scorpio N.jpg",   cities:["Delhi","Jaipur","Hyderabad","Mumbai","Lucknow","Bhopal"] },
  { id:12, name:"Tata Punch",           type:"SUV",   category:"budget",  price:1500, fuel:"Petrol",   seats:5, mileage:"18.8 kmpl",   image:"/images/Tata Punch.jpg",      cities:["Mumbai","Pune","Hyderabad","Bangalore","Kolkata","Chennai"] },
];
