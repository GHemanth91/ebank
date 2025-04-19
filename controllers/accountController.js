const AccountModel = require("../models/accountModel.js").AccountModel;

const accountController = {
  createAccount: async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const { type } = req.body;

      console.log("Creating an account");
      if (!type) {
        console.log("Type are required");
        return res.status(400).json({ error: "Name and type are required" });
      }

      const account = await AccountModel.create({
        userId,
        type,
        balance: 1000.0,
      });
      console.log("Account created:", account);

      res.status(201).json({ account });
    } catch (error) {
      console.error("Create account error:", error);
      res.status(500).json({
        error: "Server error creating account",
        details: error.message,
      });
    }
  },

  getAllAccounts: async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const accounts = await AccountModel.findByUserId(userId);

      if (!accounts || accounts.length === 0) {
        return res.status(200).json({ accounts: [] });
      }
      console.log("Accounts:", accounts);

      res.status(200).json({ accounts });
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({
        error: "Server error retrieving accounts",
        details: error.message,
      });
    }
  },

  getAccount: async (req, res) => {
    try {
      const { accountId } = req.params;
      const userId = req.user.id; // From auth middleware

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.status(200).json({ account });
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({
        error: "Server error retrieving account",
        details: error.message,
      });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const { accountId } = req.params;
      const userId = req.user.id; // From auth middleware

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      const transactions = await AccountModel.findTransactions(accountId);

      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get account transactions error:", error);
      res.status(500).json({
        error: "Server error retrieving account transactions",
        details: error.message,
      });
    }
  },
};

module.exports = { accountController };
