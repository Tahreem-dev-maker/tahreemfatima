const jwt = require('jsonwebtoken');

/**
 * verifyToken middleware
 * ─────────────────────
 * Extracts the JWT from the Authorization header (Bearer <token>),
 * verifies it against JWT_SECRET, and attaches the decoded payload
 * to req.user so downstream controllers can access user_id and role.
 *
 * HTTP responses:
 *   401 Unauthorized  → no token provided
 *   403 Forbidden     → token present but invalid / expired
 */
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Header must exist and follow "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    // Extract the token part after "Bearer "
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach decoded payload { user_id, role, iat, exp } to request
        req.user = decoded;
        next();
    } catch (err) {
        // jwt.verify throws if token is expired, malformed, or wrong secret
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};
