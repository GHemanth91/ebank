// Import Libraries
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Database connection test
const db = require("./database.js");
if (typeof db.testConnection === 'function') {
	db.testConnection();
}

const app = express();

// Import middleware
const { authMiddleware, sessionAuth } = require("./middlewares/authMiddleware.js");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware.js");
const { apiLimiter, loginLimiter, registerLimiter } = require("./middlewares/rateLimitMiddleware.js");

// Import Routes
const accountRoutes = require("./routes/accountRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const transactionRoutes = require("./routes/transactionRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// Get port from environment variables
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(morgan('dev')); // HTTP request logger

// Body parsers
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use(cors({
	origin: process.env.CORS_ORIGIN || "http://localhost:5000",
	methods: "GET,POST,PUT,DELETE,PATCH",
	credentials: true,
}));

// Session configuration
app.use(session({
	secret: process.env.JWT_SECRET || "yourSecretKey",
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false, // Set to true in production with HTTPS
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 1 day
	},
	name: 'ebank.sid'
}));

// Add session debugging middleware
app.use((req, _res, next) => {
	console.log('Session ID:', req.sessionID);
	console.log('Session data:', req.session);
	next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// API Routes with rate limiting
app.use("/auth/login", loginLimiter);
app.use("/auth/register", registerLimiter);
app.use("/auth", authRoutes);
app.use("/api", apiLimiter);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Admin routes with authentication
app.use("/admin", authMiddleware, adminRoutes);

// Public routes
app.get("/", (_req, res) => {
	res.redirect("/dashboard");
});

app.get("/login", (_req, res) => {
	res.render("login");
});

app.get("/login-simple", (_req, res) => {
	res.render("login-simple");
});

app.get("/login-basic", (req, res) => {
	res.render("login-basic", { error: req.query.error });
});

app.get("/register", (_req, res) => {
	res.render("register");
});

// Protected web routes using session auth for backward compatibility
app.use(sessionAuth);

app.get("/dashboard", (req, res) => {
	res.render("dashboard", { user: req.user.username });
});

app.get("/transfer", (req, res) => {
	res.render("transfer", { user: req.user.username });
});

app.get("/profile", (req, res) => {
	res.render("profile", { user: req.user });
});

app.get("/budget", (req, res) => {
	res.render("budget", { user: req.user.username });
});

app.get("/savings", (req, res) => {
	res.render("savings", { user: req.user.username });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
