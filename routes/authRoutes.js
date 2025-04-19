const express = require("express");
const authController = require("../controllers/authController.js").authController;

const router = express.Router();

// Registration endpoint
router.post("/register", async (req, res) => {
    await authController.register(req, res);
});

// Login endpoint
router.post("/login", async (req, res) => {
  await authController.login(req, res);
});

// Logout endpoint
router.post("/logout", authController.logout);

module.exports = router;
