const db = require("../database.js");
const AccountModel = require("./accountModel.js").AccountModel;

// Get the connection pool from our database module
const client = db;

const UserModel = {
  create: async (userData) => {
    // Check if user already exists
    const [users] = await client.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [userData.email, userData.username],
    );

    if (users.length > 0) {
      console.log("User already exists");
      return users[0];
    }

    let id = 0;

    // Get count of users; query returns rows directly
    const [countRows] = await client.query(
      "SELECT COUNT(*) AS count FROM users",
    );
    id = countRows[0].count + 1;

    const newUser = {
      ...userData,
      accountType: userData.accountType,
      id: String(id),
      createdAt: new Date(),
    };

    // Insert new user
    await client.query(
      "INSERT INTO users (id, fullName, email, phone, address, city, state, zipCode, username, password, createdAt, accountType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        newUser.accountType,
      ],
    );

    // Add an account for the user
    await AccountModel.create({
      userId: newUser.id,
      type: newUser.accountType,
      balance: 1000.0,
    });

    return newUser;
  },

  findByEmail: async (email) => {
    try {
      const [users] = await client.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );
      return users.length > 0 ? users[0] : undefined;
    } catch (err) {
      console.error("Error finding user by email:", err);
      return null;
    }
  },

  findByUsername: async (username) => {
    try {
      // Ensure the parameter is passed as an array
      const [users] = await client.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
      );
      return users.length > 0 ? users[0] : undefined;
    } catch (err) {
      console.error("Error finding user by username:", err);
      return null;
    }
  },

  findById: async (id) => {
    try {
      const [users] = await client.query("SELECT * FROM users WHERE id = ?", [
        id,
      ]);
      return users.length > 0 ? users[0] : undefined;
    } catch (err) {
      console.error("Error finding user by ID:", err);
      return null;
    }
  },
};

module.exports = { UserModel };
