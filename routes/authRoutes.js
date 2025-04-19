const express = require("express");
const authController = require("../controllers/authController.js").authController;
const { verifyAccessToken, generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models/UserModel');

const router = express.Router();

// Registration endpoint
router.post("/register", async (req, res) => {
    await authController.register(req, res);
});

// Login endpoint (JSON API)
router.post("/login", async (req, res) => {
  await authController.login(req, res);
});

// Direct login endpoint (form submission)
router.post("/login-direct", async (req, res) => {
  try {
    console.log("Direct login attempt with:", req.body.username);
    const { username, password } = req.body;

    // Find user by username or email
    let user = await UserModel.findByUsername(username);
    if (!user) {
      user = await UserModel.findByEmail(username);
      if (!user) {
        return res.redirect('/login-simple?error=Invalid username or password');
      }
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.redirect('/login-simple?error=Invalid username or password');
    }

    // Update last login time
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await UserModel.updateRefreshToken(user.id, refreshToken);

    // For backward compatibility, also set session
    if (req.session) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      };
    }

    // Set cookies for authentication
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Set a user cookie for client-side access
    res.cookie('user', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'user'
    }), {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error("Direct login error:", error);
    return res.redirect('/login-simple?error=Server error during login');
  }
});

// Logout endpoint
router.post("/logout", authController.logout);

// Basic login endpoint (simplest possible implementation)
router.post("/login-basic", async (req, res) => {
  try {
    console.log("Basic login attempt with:", req.body.username);
    const { username, password } = req.body;

    // Find user by username
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.redirect('/login-basic?error=Invalid username or password');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.redirect('/login-basic?error=Invalid username or password');
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    };

    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error("Basic login error:", error);
    return res.redirect('/login-basic?error=Server error during login');
  }
});

// Simple logout endpoint (GET for direct link)
router.get("/logout-direct", (req, res) => {
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('user');

  // Clear session
  if (req.session) {
    req.session.destroy();
  }

  // Redirect to login page
  res.redirect('/login-basic');
});

module.exports = router;
