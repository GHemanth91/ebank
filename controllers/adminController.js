// src/controllers/adminController.js

const db = require("../database");

// Dummy credentials (for now)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

// Admin login GET
const getLogin = (req, res) => {
	res.render("adminLogin", { error: null });
};

// Admin login POST
const postLogin = (req, res) => {
	const { username, password } = req.body;
	if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
		req.session.admin = true;
		return res.redirect("/admin/dashboard");
	} else {
		return res.render("adminLogin", { error: "Invalid credentials" });
	}
};

// Admin dashboard
const getDashboard = (_req, res) => {
	res.render("adminDashboard");
};

// View all customers
const getAllCustomers = async (_req, res) => {
	const [rows] = await db.query("SELECT * FROM users");
	res.render("adminCustomers", { customers: rows });
};

// Search customer form
const getSearchPage = (_req, res) => {
	res.render("adminSearch", { customer: null, error: null });
};

// Search customer by ID
const searchCustomer = async (req, res) => {
	const { id } = req.body;
	const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
	if (rows.length > 0) {
		res.render("adminSearch", { customer: rows[0], error: null });
	} else {
		res.render("adminSearch", { customer: null, error: "Customer not found" });
	}
};

// Get edit form
const getEditCustomer = async (req, res) => {
	const { id } = req.params;
	const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
	if (rows.length > 0) {
		res.render("adminEdit", { customer: rows[0] });
	} else {
		res.redirect("/admin/customers");
	}
};

// Update customer
const updateCustomer = async (req, res) => {
	const { id } = req.params;
	const { fullName, email, phone, address, city, state, zipCode } = req.body;

	await db.query(
		`UPDATE users SET fullName = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zipCode = ? WHERE id = ?`,
		[fullName, email, phone, address, city, state, zipCode, id]
	);

	res.redirect("/admin/customers");
};

// Delete customer
const deleteCustomer = async (req, res) => {
	const { id } = req.params;
	await db.query("DELETE FROM users WHERE id = ?", [id]);
	res.redirect("/admin/customers");
};

module.exports = {
	getLogin,
	postLogin,
	getDashboard,
	getAllCustomers,
	getSearchPage,
	searchCustomer,
	getEditCustomer,
	updateCustomer,
	deleteCustomer,
};
