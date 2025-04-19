// src/middlewares/adminMiddleware.js

function adminAuth(req, res, next) {
	if (req.session && req.session.admin) {
		return next();
	} else {
		return res.redirect("/admin");
	}
}

module.exports = {
	adminAuth,
};
