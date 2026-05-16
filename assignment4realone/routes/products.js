const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

const PAGE_SIZE = 8;

router.get('/', async (req, res) => {
    try {
        const page     = parseInt(req.query.page)    || 1;
        const search   = req.query.search            || '';
        const category = req.query.category          || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
        const sortBy   = req.query.sortBy            || 'name';

        // Build the filter object dynamically
        const filter = {};

        if (search) {
            // Case-insensitive partial match on name
            filter.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            filter.category = { $regex: `^${category}$`, $options: 'i' };
        }

        // Price range — only add upper bound if user supplied it
        filter.price = { $gte: minPrice };
        if (req.query.maxPrice) {
            filter.price.$lte = maxPrice;
        }

        // Sorting map
        const sortMap = {
            name:       { name: 1 },
            price_asc:  { price: 1 },
            price_desc: { price: -1 },
            rating:     { rating: -1 }
        };
        const sort = sortMap[sortBy] || { name: 1 };

        // Count total matching docs for pagination maths
        const total    = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / PAGE_SIZE);
        const skip     = (page - 1) * PAGE_SIZE;

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(PAGE_SIZE);

        // Grab distinct categories for the filter dropdown
        const categories = await Product.distinct('category');

        res.render('products', {
            products,
            categories,
            currentPage: page,
            totalPages,
            total,
            // Pass query params back so the form retains its state
            query: {
                search,
                category,
                minPrice: req.query.minPrice || '',
                maxPrice: req.query.maxPrice || '',
                sortBy
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
