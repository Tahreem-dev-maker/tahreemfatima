const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const Product = require('../models/Product');

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // e.g.  1716800000000-croissant.jpg  — unique name, no spaces
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, unique);
    }
});

const upload = multer({ storage });

// ── GET /admin — Dashboard ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.render('admin/dashboard', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ── GET /admin/products/new — Show add form ───────────────────────────────────
router.get('/products/new', (req, res) => {
    res.render('admin/new');
});

// ── POST /admin/products — Save new product ───────────────────────────────────
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, rating, stock } = req.body;

        // Server-side validation — make sure nothing is empty
        if (!name || !category || !price || !stock) {
            return res.status(400).send('All fields are required.');
        }

        const imagePath = req.file ? '/uploads/' + req.file.filename : '';

        await Product.create({
            name,
            category,
            price:  parseFloat(price),
            rating: parseFloat(rating) || 0,
            stock:  parseInt(stock),
            image:  imagePath
        });

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ── GET /admin/products/:id/edit — Show edit form ────────────────────────────
router.get('/products/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.render('admin/edit', { product });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ── POST /admin/products/:id/update — Save edits ─────────────────────────────
router.post('/products/:id/update', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, rating, stock } = req.body;

        const updateData = {
            name,
            category,
            price:  parseFloat(price),
            rating: parseFloat(rating) || 0,
            stock:  parseInt(stock)
        };

        // Only update image if a new file was uploaded
        if (req.file) {
            updateData.image = '/uploads/' + req.file.filename;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ── POST /admin/products/:id/delete — Delete product ─────────────────────────
router.post('/products/:id/delete', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
