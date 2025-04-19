function authMiddleware(req, res, next) {
	if (!req.session?.user) {
		console.log("Redirect");
		return res.status(300).redirect("/login");
	}

	req.user = req.session.user;
	console.log("Passed Authentication");
	next();
}

module.exports = authMiddleware;
