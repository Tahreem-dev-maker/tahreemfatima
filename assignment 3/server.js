require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const app      = express();

// ── Template engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// ── Database connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('index'));

app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Form submission:', { name, email, message });
    res.redirect('/contact');
});

// Products route (all logic lives in routes/products.js)
app.use('/products', require('./routes/products'));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
