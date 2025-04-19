const AccountModel = require("../models/accountModel.js").AccountModel;
const UserModel = require("../models/userModel.js").UserModel;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');

const authController = {
  register: async (req, res) => {
    console.log("Registering user...");
    try {
      const {
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        username,
        password,
        accountType,
      } = req.body;

      // Validate input (this should be handled by validation middleware in production)
      if (!fullName || !email || !password || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists by email
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Check if user already exists by username
      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate a UUID for the user
      const userId = uuidv4();

      // Create user with hashed password
      const user = await UserModel.create({
        id: userId,
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        username,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        accountType,
      });

      console.log("User created:", user);

      // Generate account number
      const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      // Create accounts based on accountType
      await AccountModel.create({
        id: uuidv4(),
        userId: user.id,
        type: accountType || 'checking',
        balance: 1000.00, // Starting balance for new accounts
        createdAt: new Date()
      });

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      await UserModel.updateRefreshToken(user.id, refreshToken);

      // Return success response with tokens
      res.status(201).json({
        message: "Account created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  },

  login: async (req, res) => {
    try {
      console.log("Logging in user...");
      const { username, password } = req.body;

      // Find user by username or email
      let user = await UserModel.findByUsername(username);
      if (!user) {
        user = await UserModel.findByEmail(username);
        if (!user) {
          return res.status(401).json({
            error: "Invalid username or password",
          });
        }
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
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

      // Return success response with tokens
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role || 'user'
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  },

  logout: async (req, res) => {
    try {
      // Get user ID from JWT token or session
      const userId = req.user?.id || (req.session?.user?.id);

      if (userId) {
        // Clear refresh token in database
        await UserModel.updateRefreshToken(userId, null);
      }

      // For backward compatibility, also destroy session if it exists
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction error:", err);
          }
          // Clear the session cookie
          res.clearCookie("connect.sid");
        });
      }

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Server error during logout" });
    }
  },

  // Refresh token endpoint
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token is required" });
      }

      // Verify the refresh token (this is done in the JWT utils)
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Get user from database
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check if the refresh token matches the one in the database
      if (user.refreshToken !== refreshToken) {
        return res.status(401).json({ error: "Refresh token is invalid" });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Update refresh token in database
      await UserModel.updateRefreshToken(user.id, newRefreshToken);

      // Return new tokens
      res.status(200).json({
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Server error during token refresh" });
    }
  },
};

module.exports = { authController };
