const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Middleware to verify JWT token from cookies
 * Protects routes that require authentication
 */
function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({
            msg: 'No authentication token provided',
            success: false
        });
    }

    try {
        const decoded = jwt.verify(token, config.SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).send({
            msg: 'Invalid or expired token',
            success: false
        });
    }
}

/**
 * Optional authentication middleware
 * Allows request to proceed even without token, but attaches user if token exists
 */
function optionalAuth(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, config.SECRET);
            req.user = decoded;
        } catch (error) {
            // Token invalid but we continue anyway
            console.log('Optional auth - invalid token');
        }
    }
    next();
}

module.exports = {
    verifyToken,
    optionalAuth
};
