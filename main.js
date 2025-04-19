// Import Libraries
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express(); // ✅ Moved up here (was below adminRoutes before)

// Import middleware
const authMiddleware = require("./middlewares/authMiddleware.js");

// Import Routes
const accountRoutes = require("./routes/accountRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const transactionRoutes = require("./routes/transactionRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js"); // ✅ Fixed casing

const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: "yourSecretKey", // Replace with a strong secret key
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }, // Set to true in production with HTTPS
}));
app.use(cors({
	origin: "http://localhost:3000", // specific origin or '*' for all
	methods: "GET,POST,PUT,DELETE",
	credentials: true,
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

// Routers
app.use("/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes); // ✅ Fixed casing

// Index page
app.get("/", (_req, res) => {
	res.redirect("/dashboard");
});

// Login page
app.get("/login", (_req, res) => {
	res.render("login");
});

app.get("/register", (_req, res) => {
	res.render("register");
});

// Protected Routes
app.use(authMiddleware);
app.get("/dashboard", (req, res) => {
	console.log(req);
	res.render("dashboard", { user: req.session.user.username });
});

app.get("/transfer", (req, res) => {
	res.render("transfer", { user: req.session.user.username });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
