const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../../models/User');

/**
 * POST /api/v1/auth/login
 * ────────────────────────
 * Public endpoint. Accepts { email, password } in the request body.
 * On success, returns a signed JWT containing { user_id, role }.
 *
 * Example request body:
 * {
 *   "email": "user@example.com",
 *   "password": "secret123"
 * }
 *
 * Example success response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ── Validate request body ───────────────────────────────────────────
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // ── Find user in DB ─────────────────────────────────────────────────
        const user = await User.findOne({ email });
        if (!user) {
            // Use a generic message — don't reveal whether email exists
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // ── Compare password with stored hash ───────────────────────────────
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // ── Sign JWT with user_id and role in payload ───────────────────────
        const token = jwt.sign(
            { user_id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token
        });

    } catch (err) {
        console.error('API Login error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
