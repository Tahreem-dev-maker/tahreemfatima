require('dotenv').config();
const fs               = require('fs');
const path             = require('path');
const express          = require('express');
const expressLayouts   = require('express-ejs-layouts');
const mongoose         = require('mongoose');
const session          = require('express-session');
const MongoStore       = require('connect-mongo').default;
const flash            = require('connect-flash');
const Product          = require('./models/Product');
const app              = express();

// ── View engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ── Layouts ───────────────────────────────────────────────────────────────────
app.use(expressLayouts);
app.set('layout', false);

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

app.get('/onsale-products', async (req, res) => {
    try {
        const products = await Product.find({ isOnSale: true });
        const imageFiles = fs.readdirSync(path.join(__dirname, 'public'))
            .filter(name => /^os\d+\.jfif$/i.test(name))
            .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
            .map(name => `/${name}`);

        const saleImages = imageFiles.length > 0 ? imageFiles : [
            '/OS1.jfif', '/OS2.jfif', '/OS3.jfif', '/OS4.jfif',
            '/os5.jfif', '/os6.jfif', '/os7.jfif', '/os8.jfif',
            '/os9.jfif', '/os0.jfif'
        ];

        const saleDescriptions = [
            'A buttery pastry with a crisp exterior and soft interior.',
            'Sweet seasonal treat topped with a rich sugar glaze.',
            'Freshly baked specialty with a hint of vanilla and honey.',
            'Flaky gourmet pastry filled with berry & cream.',
            'Warm bakery favorite with a touch of cinnamon.',
            'Artisan bun layered with caramel and toasted nuts.',
            'Delightful brunch pastry made for sharing.',
            'Elegant dessert roll with a citrus twist.',
            'Rich chocolate pastry for premium indulgence.',
            'Special holiday pastry with festive sweetness.'
        ];

        res.render('onsale', {
            title: 'On-Sale Products',
            products,
            saleImages,
            saleDescriptions,
            bodyClass: 'storefront',
            layout: 'layout'
        });
    } catch (err) {
        console.error('Failed to load on-sale products:', err);
        res.status(500).send('Server Error');
    }
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

