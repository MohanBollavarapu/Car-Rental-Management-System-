# 🚗 Car Rentals India

A full-stack car rental web application built for the Indian middle-class market.

## 📂 Project Structure

```
car-rentals-india/
├── index.html      ← Homepage (hero, search, car listings, slider)
├── contact.html    ← Contact page (form + WhatsApp)
├── style.css       ← Global styles (dark + glassmorphism)
├── script.js       ← Frontend logic (search, filter, booking modal)
├── server.js       ← Express backend (REST API)
├── cars.json       ← Indian car data
└── package.json    ← Node.js dependencies
```

## 🚀 Quick Start

### Option A — With Backend (full features)
```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start
# → Visit http://localhost:3000
```

### Option B — Without Backend (demo mode)
Just open `index.html` in your browser — the app uses fallback car data built into `script.js`.

---

## 🔌 API Endpoints

| Method | Endpoint     | Description                        |
|--------|-------------|-------------------------------------|
| GET    | `/cars`      | List all cars (with optional filters)|
| GET    | `/cars/:id`  | Get single car by ID                |
| POST   | `/booking`   | Create a booking                    |
| GET    | `/bookings`  | List all bookings (admin)           |
| POST   | `/contact`   | Submit contact form                 |

### GET /cars — Query Parameters
- `?q=Nexon` — search by name
- `?fuel=Diesel` — filter by fuel
- `?seats=7` — filter by seats
- `?category=budget` — budget / family
- `?city=Mumbai` — city availability

### POST /booking — Body
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@email.com",
  "carId": 7,
  "city": "Hyderabad",
  "pickupDate": "2024-03-15",
  "pickupTime": "10:00",
  "returnDate": "2024-03-18",
  "returnTime": "10:00"
}
```

---

## 🚗 Indian Cars Included

### Sedans
- Maruti Suzuki Dzire — ₹1,200/day
- Honda Amaze — ₹1,400/day
- Hyundai Aura (CNG) — ₹1,300/day
- Tata Tigor EV — ₹1,250/day
- Honda City — ₹1,800/day

### SUVs
- Tata Nexon — ₹1,900/day
- Hyundai Creta — ₹2,200/day
- Maruti Brezza — ₹1,700/day
- Mahindra XUV300 — ₹2,000/day
- Kia Sonet — ₹2,100/day
- Mahindra Scorpio (7-seater) — ₹2,800/day
- Tata Punch — ₹1,500/day

---

## 🎨 Design Features
- Dark theme + glassmorphism cards
- Saffron (#FF6B00) accent (Indian flag palette)
- Syne + DM Sans fonts
- Smooth infinite car carousel/slider
- Responsive mobile layout
- Skeleton loading states
- Toast notifications
- Booking modal with price preview
