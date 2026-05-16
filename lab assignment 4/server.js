require('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const session       = require('express-session');
const MongoStore    = require('connect-mongo').default;
const flash         = require('connect-flash');
const app           = express();

// ── View engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static('public'));

// ── Body parsers ──────────────────────────────────────────────────────────────
// urlencoded for EJS form submissions
app.use(express.urlencoded({ extended: false }));
// JSON for API clients (mobile apps, React, Postman, etc.)
app.use(express.json());

// ── Session (used by EJS routes only) ────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// ── Flash messages ────────────────────────────────────────────────────────────
app.use(flash());

// ── Locals for EJS templates ──────────────────────────────────────────────────
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    res.locals.user    = req.session.userId ? { role: req.session.role } : null;
    next();
});

// ── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

// ── EJS / Session-based routes (existing) ────────────────────────────────────
app.get('/', (req, res) => res.render('index'));
app.get('/contact', (req, res) => res.render('contact'));
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Form submission:', { name, email, message });
    res.redirect('/contact');
});
app.use('/admin',    require('./routes/admin'));
app.use('/products', require('./routes/products'));
app.use('/',         require('./routes/auth'));

// ── REST API routes (JWT-based, returns JSON) ─────────────────────────────────
// All API endpoints are prefixed with /api/v1
app.use('/api/v1', require('./routes/api/index'));

// ── 404 handler for unknown API routes ───────────────────────────────────────
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found.' });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

