const express      = require('express');
const router       = express.Router();
const Order        = require('../../models/Order');
const Product      = require('../../models/Product');
const verifyToken  = require('../../middleware/verifyToken');

/**
 * POST /api/v1/orders
 * ────────────────────
 * Protected endpoint — requires a valid JWT (Bearer token in Authorization header).
 *
 * Request body:
 * {
 *   "items": [
 *     { "productId": "<mongo_id>", "quantity": 2 },
 *     { "productId": "<mongo_id>", "quantity": 1 }
 *   ]
 * }
 *
 * What this does:
 *  1. Validates each productId exists in the DB.
 *  2. Checks that requested quantity does not exceed available stock.
 *  3. Calculates totalPrice using the current product price.
 *  4. Creates the Order document linked to the authenticated user.
 *  5. Returns the created order.
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { items } = req.body;

        // ── Basic validation ────────────────────────────────────────────────
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item. Provide an "items" array.'
            });
        }

        // ── Validate each item and build order items array ──────────────────
        const orderItems = [];
        let totalPrice   = 0;

        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have a valid productId and quantity (min 1).'
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with id "${productId}" not found.`
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${quantity}.`
                });
            }

            orderItems.push({
                product:      product._id,
                quantity:     quantity,
                priceAtOrder: product.price        // snapshot the price
            });

            totalPrice += product.price * quantity;
        }

        // ── Create the order — user_id comes from the verified JWT payload ──
        const order = await Order.create({
            user:       req.user.user_id,
            items:      orderItems,
            totalPrice: parseFloat(totalPrice.toFixed(2))
        });

        // Populate product details for the response
        await order.populate('items.product', 'name category price');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            order
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format in items.'
            });
        }
        console.error('API Orders error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
