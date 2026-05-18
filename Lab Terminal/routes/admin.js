const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const Product = require('../models/Product');
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin = require('../middleware/isAdmin');

router.use('/', isLoggedIn, isAdmin);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // saved inside public so Express can serve it
    },
    filename: function (req, file, cb) {
        // Make filename unique: timestamp + original extension
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Images only'), false);
};

const upload = multer({ storage, fileFilter });

// ── DASHBOARD — list all products ────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        // flash message support (simple query param approach)
        const message = req.query.message || null;
        res.render('admin/dashboard', { products, message });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ── NEW — show the add product form ──────────────────────────────────────────
router.get('/new', (req, res) => {
    res.render('admin/new', { errors: [] });
});

// ── CREATE — handle form POST, with optional image upload ─────────────────────
router.post('/new', upload.single('image'), async (req, res) => {
    const { name, category, price, rating, stock } = req.body;

    // Server-side validation
    const errors = [];
    if (!name.trim())     errors.push('Name is required');
    if (!category.trim()) errors.push('Category is required');
    if (!price)           errors.push('Price is required');
    if (!stock)           errors.push('Stock is required');
    if (isNaN(price) || Number(price) < 0) errors.push('Price must be a positive number');
    if (isNaN(stock) || Number(stock) < 0) errors.push('Stock must be a positive number');
    if (rating && (isNaN(rating) || rating < 0 || rating > 5)) errors.push('Rating must be between 0 and 5');

    if (errors.length > 0) {
        return res.render('admin/new', { errors });
    }

    try {
        await Product.create({
            name:     name.trim(),
            category: category.trim(),
            price:    Number(price),
            rating:   Number(rating) || 0,
            stock:    Number(stock),
            image:    req.file ? req.file.filename : ''
        });
        res.redirect('/admin?message=Product added successfully');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ── EDIT — show edit form populated with existing data ────────────────────────
router.get('/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('admin/edit', { product, errors: [] });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ── UPDATE — save edited product ──────────────────────────────────────────────
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { name, category, price, rating, stock } = req.body;

    const errors = [];
    if (!name.trim())     errors.push('Name is required');
    if (!category.trim()) errors.push('Category is required');
    if (!price)           errors.push('Price is required');
    if (!stock)           errors.push('Stock is required');
    if (isNaN(price) || Number(price) < 0) errors.push('Price must be a positive number');
    if (isNaN(stock) || Number(stock) < 0) errors.push('Stock must be a positive number');
    if (rating && (isNaN(rating) || rating < 0 || rating > 5)) errors.push('Rating must be between 0 and 5');

    if (errors.length > 0) {
        const product = await Product.findById(req.params.id);
        return res.render('admin/edit', { product, errors });
    }

    try {
        const updateData = {
            name:     name.trim(),
            category: category.trim(),
            price:    Number(price),
            rating:   Number(rating) || 0,
            stock:    Number(stock)
        };
        // Only update image if a new one was uploaded
        if (req.file) updateData.image = req.file.filename;

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin?message=Product updated successfully');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ── DELETE — remove product ───────────────────────────────────────────────────
// HTML forms only support GET and POST, so we use POST with ?_method=DELETE
// or simply a POST route for delete
router.post('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin?message=Product deleted');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
