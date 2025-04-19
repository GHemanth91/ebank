const db = require("../database.js");
const { v4: uuidv4 } = require('uuid');

// Account types enum
const AccountType = {
	Checking: "checking",
	Savings: "savings",
	Investment: "investment"
};

const client = db;

const AccountModel = {
	/**
	 * Create a new account
	 * @param {Object} accountData - Account data
	 * @returns {Object} Created account
	 */
	create: async (accountData) => {
		try {
			// Use provided ID or generate a new UUID
			const accountId = accountData.id || uuidv4();
			const now = new Date();

			// Prepare account data with defaults
			const newAccount = {
				id: accountId,
				userId: accountData.userId,
				type: accountData.type || AccountType.Checking,
				balance: accountData.balance || 0.00,
				createdAt: now
			};

			// Insert new account with fields that match the actual database schema
			await client.query(
				`INSERT INTO accounts (
					id, userId, type, balance, createdAt
				) VALUES (?, ?, ?, ?, ?)`,
				[
					newAccount.id,
					newAccount.userId,
					newAccount.type,
					newAccount.balance,
					newAccount.createdAt
				]
			);
			console.log("Account created:", newAccount.id);

			return newAccount;
		} catch (error) {
			console.error("Account creation error:", error);
			throw error;
		}
	},

	/**
	 * List all accounts
	 * @returns {Array} List of all accounts
	 */
	listAll: async () => {
		try {
			const [accounts] = await client.query("SELECT * FROM accounts");
			return accounts || [];
		} catch (error) {
			console.error("Error listing accounts:", error);
			throw error;
		}
	},

	/**
	 * Find account by ID
	 * @param {String} id - Account ID
	 * @returns {Object|null} Account object or null if not found
	 */
	findById: async (id) => {
		try {
			const [accounts] = await client.query(
				"SELECT * FROM accounts WHERE id = ?",
				[id]
			);
			return accounts.length > 0 ? accounts[0] : null;
		} catch (error) {
			console.error("Error finding account by ID:", error);
			throw error;
		}
	},

	/**
	 * Find account by ID (alternative method)
	 * @param {String} accountId - Account ID
	 * @returns {Object|null} Account object or null if not found
	 */
	findByAccountId: async (accountId) => {
		try {
			const [accounts] = await client.query(
				"SELECT * FROM accounts WHERE id = ?",
				[accountId]
			);
			return accounts.length > 0 ? accounts[0] : null;
		} catch (error) {
			console.error("Error finding account by ID:", error);
			throw error;
		}
	},

	/**
	 * Find accounts by user ID
	 * @param {String} userId - User ID
	 * @returns {Array} List of accounts
	 */
	findByUserId: async (userId) => {
		try {
			const [accounts] = await client.query(
				"SELECT * FROM accounts WHERE userId = ?",
				[userId]
			);
			return accounts || [];
		} catch (error) {
			console.error("Error finding accounts by user ID:", error);
			throw error;
		}
	},

	/**
	 * Find transactions for an account
	 * @param {String} accountId - Account ID
	 * @param {Object} options - Query options (limit, offset, etc.)
	 * @returns {Array} List of transactions
	 */
	findTransactions: async (accountId, options = {}) => {
		try {
			const limit = options.limit || 10;
			const offset = options.offset || 0;

			const [transactions] = await client.query(
				`SELECT * FROM transactions
				WHERE (fromAccountId = ? OR toAccountId = ?)
				ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
				[accountId, accountId, limit, offset]
			);
			return transactions || [];
		} catch (error) {
			console.error("Error finding transactions:", error);
			throw error;
		}
	},

	/**
	 * Update account balance
	 * @param {String} id - Account ID
	 * @param {Number} newBalance - New balance
	 * @returns {Object} Updated account
	 */
	updateBalance: async (id, newBalance) => {
		try {
			await client.query(
				"UPDATE accounts SET balance = ? WHERE id = ?",
				[newBalance, id]
			);
			return await AccountModel.findById(id);
		} catch (error) {
			console.error("Error updating balance:", error);
			throw error;
		}
	},

	/**
	 * Update account status (active/inactive) - Not implemented
	 * @param {String} id - Account ID
	 * @param {Boolean} isActive - Active status
	 * @returns {Object} Updated account
	 */
	updateStatus: async (id, isActive) => {
		try {
			// This is a placeholder since the isActive column doesn't exist
			console.log(`Account status update for ${id} to ${isActive} (not implemented)`);
			return await AccountModel.findById(id);
		} catch (error) {
			console.error("Error updating account status:", error);
			throw error;
		}
	},
};

/**
 * @typedef {Object} Account
 * @property {string} id - Account ID (UUID)
 * @property {string} userId - User ID (UUID)
 * @property {string} accountNumber - Account number
 * @property {string} type - Account type (checking, savings, investment)
 * @property {number} balance - Account balance
 * @property {string} currency - Currency code (USD, EUR, etc.)
 * @property {boolean} isActive - Whether the account is active
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
module.exports = { AccountModel, AccountType };
