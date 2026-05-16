require('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const session       = require('express-session');
const MongoStore    = require('connect-mongo').default;
const flash         = require('connect-flash');
const app           = express();

// ── Template engine ───────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// ── Session ───────────────────────────────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// ── Flash ─────────────────────────────────────────────────────────────────────
app.use(flash());

// ── Global flash variables (available in ALL views) ───────────────────────────
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    res.locals.user    = req.session.userId ? { role: req.session.role } : null;
    next();
});

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

app.use('/products', require('./routes/products'));
app.use('/admin',    require('./routes/admin'));
app.use('/',         require('./routes/auth'));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(3000, () => console.log('Server running on http://localhost:3000'));