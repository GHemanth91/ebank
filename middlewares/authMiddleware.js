const { verifyAccessToken } = require('../utils/jwtUtils');

/**
 * Authentication middleware using JWT
 * Verifies the access token from Authorization header
 */
const authMiddleware = (req, res, next) => {
	try {
		// Get the token from the Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			// For API routes, return 401 Unauthorized
			if (req.path.startsWith('/api/')) {
				return res.status(401).json({ error: 'Access denied. No token provided.' });
			}
			// For web routes, redirect to login
			return res.redirect('/login');
		}

		// Extract the token
		const token = authHeader.split(' ')[1];

		// Verify the token
		const decoded = verifyAccessToken(token);
		if (!decoded) {
			// For API routes, return 401 Unauthorized
			if (req.path.startsWith('/api/')) {
				return res.status(401).json({ error: 'Invalid token.' });
			}
			// For web routes, redirect to login
			return res.redirect('/login');
		}

		// Set the user in the request object
		req.user = decoded;
		next();
	} catch (error) {
		console.error('Authentication error:', error.message);
		// For API routes, return 500 Internal Server Error
		if (req.path.startsWith('/api/')) {
			return res.status(500).json({ error: 'Internal server error during authentication.' });
		}
		// For web routes, redirect to login
		return res.redirect('/login');
	}
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param {String|Array} roles - Required role(s) to access the route
 */
const authorizeRoles = (roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Access denied. Not authenticated.' });
		}

		const userRole = req.user.role || 'user';
		const allowedRoles = Array.isArray(roles) ? roles : [roles];

		if (!allowedRoles.includes(userRole)) {
			return res.status(403).json({ error: 'Access denied. Not authorized.' });
		}

		next();
	};
};

/**
 * Session-based authentication middleware (simplified)
 */
const sessionAuth = (req, res, next) => {
	// Check if the user is already authenticated
	if (req.user) {
		console.log("User already authenticated");
		return next();
	}

	// Check for user in session (primary method)
	if (req.session && req.session.user) {
		req.user = req.session.user;
		console.log("Passed Session Authentication");
		return next();
	}

	console.log("Redirect to login (no session found)");
	return res.redirect("/login-basic");
};

module.exports = {
	authMiddleware,
	authorizeRoles,
	sessionAuth
};
