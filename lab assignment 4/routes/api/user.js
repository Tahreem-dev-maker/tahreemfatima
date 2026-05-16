const express     = require('express');
const router      = express.Router();
const User        = require('../../models/User');
const Order       = require('../../models/Order');
const verifyToken = require('../../middleware/verifyToken');

/**
 * GET /api/v1/user/profile
 * ─────────────────────────
 * Protected endpoint — requires a valid JWT (Bearer token in Authorization header).
 *
 * Returns the authenticated user's profile data plus their order history.
 * The password field is explicitly excluded from the response.
 */
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // req.user.user_id is set by verifyToken middleware from the JWT payload
        const user = await User.findById(req.user.user_id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Fetch order history for this user, newest first
        const orders = await Order.find({ user: req.user.user_id })
            .populate('items.product', 'name category price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
                role:  user.role
            },
            orderHistory: {
                totalOrders: orders.length,
                orders
            }
        });

    } catch (err) {
        console.error('API User Profile error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
