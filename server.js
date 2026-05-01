// ====================================================
// Car Rentals India — Express Backend Server (MongoDB)
// ====================================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ NEW

const app = express();
const PORT = process.env.PORT || 3000;

// ── MongoDB Connection ───────────────────────────────
mongoose.connect("mongodb://127.0.0.1:27017/car_rental")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

// ── Booking Model ────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  car: String,
  carId: Number,
  city: String,
  address: String,
  pickupDate: String,
  pickupTime: String,
  returnDate: String,
  returnTime: String,
  days: Number,
  pricePerDay: Number,
  totalPrice: Number,
  status: String
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

// ── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Load cars from JSON ─────────────────────────────
const carsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "cars.json"), "utf-8")
);

// ── Routes ──────────────────────────────────────────

// GET /cars
app.get("/cars", (req, res) => {
  let cars = [...carsData];
  const { fuel, seats, category, city, q } = req.query;

  if (q) {
    const term = q.toLowerCase();
    cars = cars.filter((c) => c.name.toLowerCase().includes(term));
  }
  if (fuel) {
    cars = cars.filter((c) => c.fuel.toLowerCase() === fuel.toLowerCase());
  }
  if (seats) {
    cars = cars.filter((c) => c.seats === parseInt(seats));
  }
  if (category) {
    cars = cars.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (city) {
    cars = cars.filter((c) =>
      c.cities.map((ci) => ci.toLowerCase()).includes(city.toLowerCase())
    );
  }

  res.json({ success: true, count: cars.length, cars });
});

// GET /cars/:id
app.get("/cars/:id", (req, res) => {
  const car = carsData.find((c) => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).json({ success: false, message: "Car not found" });
  res.json({ success: true, car });
});

// 🔥 POST /booking (NOW SAVES TO DATABASE)
app.post("/booking", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      carId,
      city,
      address,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    } = req.body;

    if (!name || !phone || !carId || !city || !pickupDate || !returnDate || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const car = carsData.find((c) => c.id === parseInt(carId));
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const pickup = new Date(`${pickupDate}T${pickupTime || "10:00"}`);
    const returnD = new Date(`${returnDate}T${returnTime || "10:00"}`);
    const days = Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)));
    const totalPrice = days * car.price;

    const booking = new Booking({
      name,
      phone,
      email: email || "",
      car: car.name,
      carId: car.id,
      city,
      address,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      days,
      pricePerDay: car.price,
      totalPrice,
      status: "confirmed",
    });

    await booking.save();

    console.log(`✅ Saved to DB: ${booking._id}`);

    res.json({
      success: true,
      booking: {
        id: booking._id
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Database error"
    });
  }
});

// GET /bookings (from DB)
app.get("/bookings", async (req, res) => {
  const data = await Booking.find();
  res.json({ success: true, count: data.length, bookings: data });
});

// POST /contact
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }
  console.log(`📩 Contact: ${name} <${email}> — ${message}`);
  res.json({ success: true, message: "Message received!" });
});

// Catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start
app.listen(PORT, () => {
  console.log(`🚗 Server running at http://localhost:${PORT}`);
});