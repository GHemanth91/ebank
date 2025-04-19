const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { adminAuth } = require("../middlewares/adminMiddleware");

// Login page
router.get("/", adminController.getLogin);
router.post("/", adminController.postLogin);

// Dashboard
router.get("/dashboard", adminAuth, adminController.getDashboard);

// View all customers
router.get("/customers", adminAuth, adminController.getAllCustomers);

// Search customer by ID
router.get("/search", adminAuth, adminController.getSearchPage);
router.post("/search", adminAuth, adminController.searchCustomer);

// Edit customer
router.get("/edit/:id", adminAuth, adminController.getEditCustomer);
router.post("/edit/:id", adminAuth, adminController.updateCustomer);

// Delete customer
router.get("/delete/:id", adminAuth, adminController.deleteCustomer);

module.exports = router;
