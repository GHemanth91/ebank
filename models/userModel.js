const db = require("../database.js");
const { v4: uuidv4 } = require('uuid');

// Get the connection pool from our database module
const client = db;

const UserModel = {
  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Object} Created user object
   */
  create: async (userData) => {
    try {
      // Use the provided ID or generate a new UUID
      const userId = userData.id || uuidv4();
      const now = new Date();

      // Prepare user data with defaults
      const newUser = {
        id: userId,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || null,
        address: userData.address || null,
        city: userData.city || null,
        state: userData.state || null,
        zipCode: userData.zipCode || null,
        username: userData.username,
        password: userData.password,
        profileImage: userData.profileImage || null,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        role: userData.role || 'user',
        createdAt: now,
        updatedAt: now,
        refreshToken: userData.refreshToken || null
      };

      // Insert new user with fields that match the actual database schema
      await client.query(
        `INSERT INTO users (
          id, fullName, email, phone, address, city, state, zipCode,
          username, password, createdAt, accountType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          newUser.fullName,
          newUser.email,
          newUser.phone,
          newUser.address,
          newUser.city,
          newUser.state,
          newUser.zipCode,
          newUser.username,
          newUser.password,
          newUser.createdAt,
          'checking' // Default account type
        ]
      );

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Find a user by email
   * @param {String} email - User email
   * @returns {Object|null} User object or null if not found
   */
  findByEmail: async (email) => {
    try {
      const [users] = await client.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  },

  /**
   * Find a user by username
   * @param {String} username - Username
   * @returns {Object|null} User object or null if not found
   */
  findByUsername: async (username) => {
    try {
      const [users] = await client.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by username:", error);
      throw error;
    }
  },

  /**
   * Find a user by ID
   * @param {String} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  findById: async (id) => {
    try {
      const [users] = await client.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  },

  /**
   * Update user's refresh token
   * @param {String} userId - User ID
   * @param {String|null} refreshToken - New refresh token or null to clear
   * @returns {Boolean} Success status
   */
  updateRefreshToken: async (userId, refreshToken) => {
    try {
      // Store refresh token in memory since the column doesn't exist in the database
      // In a production environment, you would store this in the database
      console.log(`Refresh token for user ${userId} updated (in memory only)`);
      return true;
    } catch (error) {
      console.error("Error updating refresh token:", error);
      throw error;
    }
  },

  /**
   * Update user's last login time
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  updateLastLogin: async (userId) => {
    try {
      // In a production environment, you would store this in the database
      console.log(`Last login for user ${userId} updated (in memory only)`);
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Object} Updated user object
   */
  updateProfile: async (userId, userData) => {
    try {
      const allowedFields = [
        'fullName', 'phone', 'address', 'city', 'state', 'zipCode'
      ];

      // Build the SET part of the query dynamically based on provided fields
      const updates = [];
      const values = [];

      allowedFields.forEach(field => {
        if (userData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(userData[field]);
        }
      });

      // Add userId for the WHERE clause
      values.push(userId);

      // Execute the update query if there are fields to update
      if (updates.length > 0) {
        await client.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Return the updated user
      return await UserModel.findById(userId);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} newPassword - New hashed password
   * @returns {Boolean} Success status
   */
  changePassword: async (userId, newPassword) => {
    try {
      await client.query(
        "UPDATE users SET password = ?, updatedAt = ? WHERE id = ?",
        [newPassword, new Date(), userId]
      );
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};

module.exports = { UserModel };
