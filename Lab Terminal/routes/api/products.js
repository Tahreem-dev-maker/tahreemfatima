const express  = require('express');
const router   = express.Router();
const Product  = require('../../models/Product');

const PAGE_SIZE = 8;

/**
 * GET /api/v1/products
 * ─────────────────────
 * Public endpoint. Returns a paginated, filterable list of products as JSON.
 *
 * Query params (all optional):
 *   page      - page number (default: 1)
 *   search    - partial name match (case-insensitive)
 *   category  - exact category match (case-insensitive)
 *   minPrice  - minimum price filter
 *   maxPrice  - maximum price filter
 *   sortBy    - name | price_asc | price_desc | rating (default: name)
 *
 * Example: GET /api/v1/products?category=Beverages&sortBy=rating&page=1
 */
router.get('/', async (req, res) => {
    try {
        const page     = parseInt(req.query.page)         || 1;
        const search   = req.query.search                 || '';
        const category = req.query.category               || '';
        const minPrice = parseFloat(req.query.minPrice)   || 0;
        const maxPrice = parseFloat(req.query.maxPrice)   || Infinity;
        const sortBy   = req.query.sortBy                 || 'name';

        // ── Build filter object ─────────────────────────────────────────────
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            filter.category = { $regex: `^${category}$`, $options: 'i' };
        }

        filter.price = { $gte: minPrice };
        if (req.query.maxPrice) {
            filter.price.$lte = maxPrice;
        }

        // ── Sort map ────────────────────────────────────────────────────────
        const sortMap = {
            name:       { name: 1 },
            price_asc:  { price: 1 },
            price_desc: { price: -1 },
            rating:     { rating: -1 }
        };
        const sort = sortMap[sortBy] || { name: 1 };

        // ── Pagination ──────────────────────────────────────────────────────
        const total      = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / PAGE_SIZE);
        const skip       = (page - 1) * PAGE_SIZE;

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(PAGE_SIZE);

        res.status(200).json({
            success: true,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts: total,
                pageSize: PAGE_SIZE
            },
            products
        });

    } catch (err) {
        console.error('API Products error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

/**
 * GET /api/v1/products/:id
 * ─────────────────────────
 * Public endpoint. Returns a single product by its MongoDB _id.
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        res.status(200).json({ success: true, product });

    } catch (err) {
        // Catches CastError when :id is not a valid ObjectId
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format.'
            });
        }
        console.error('API Product by ID error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
