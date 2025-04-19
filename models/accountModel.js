const db = require("../database.js");

// Pure JavaScript equivalent of the above TypeScript enum
const AccountType = {
	Checking: "checking",
	Savings: "savings",
	Both: "both",
};

//const Account =  {
//  id,
//  userId,
//  type,
//  balance,
//  createdAt,
//};
// Define the above TS Account class in pure JavaScript with JSDoc

const client = db;

const AccountModel = {
	create: async (
		accountData,
	) => {
		try {
			let id = 0;
			const [count] = await client.query(
				"SELECT COUNT(*) FROM accounts",
			);
			if (count.length > 0) id = count[0]["COUNT(*)"] + 1;

			const newAccount = {
				...accountData,
				id,
				createdAt: new Date(),
			};

			// Check if user already exists
			const [accounts] = await client.query(
				"SELECT * FROM accounts WHERE id = ?",
				[newAccount.id],
			);

			// Check for error from a mysql2 query
			if (accounts == undefined) {
				console.log("SQL Query Error");
				return newAccount;
			}
			if (accounts.length > 0) {
				console.log("Account already exists");
				return accounts[0];
			}

			await client.query(
				"INSERT INTO accounts (id, userId, type, balance, createdAt) VALUES (?, ?, ?, ?, ?)",
				[
					newAccount.id,
					newAccount.userId,
					newAccount.type,
					newAccount.balance,
					newAccount.createdAt,
				],
			);
			console.log("Account created");

			return newAccount;
		} catch (error) {
			console.error("Account Creation error:", error);
			throw new Error("Server error creating account");
		}
	},

	listAll: async () => {
		const [accounts] = await client.query("SELECT * FROM accounts");

		if (accounts == undefined) {
			console.log("SQL Query Error");
			return [];
		}

		return accounts;
	},

	findById: async (id) => {
		const [accounts] = await client.query(
			"SELECT * FROM accounts WHERE id = ?",
			[id],
		);

		if (accounts == undefined) {
			console.log("SQL Query Error");
			return [];
		}

		return accounts.length > 0 ? accounts[0] : undefined;
	},

	findByUserId: async (userId) => {
		const [accounts] = await client.query(
			"SELECT * FROM accounts WHERE userId = ?",
			[userId],
		);

		if (accounts == undefined) {
			console.log("SQL Query Error");
			return [];
		}

		return accounts;
	},

	findTransactions: async (id) => {
		const [transactions] = await client.query(
			"SELECT * FROM transactions WHERE fromId = ?",
			[id],
		);

		if (transactions == undefined) {
			console.log("SQL Query Error");
			return [];
		}

		return transactions;
	},

	updateBalance: async (
		id,
		newBalance,
	) => {
		console.log(
			"UPDATE accounts SET balance = " + newBalance + " WHERE id = " + id,
		);
		await client.query(
			"UPDATE accounts SET balance = ? WHERE id = ?",
			[newBalance, id],
		);

		return AccountModel.findById(id);
	},
};

/**
 * @typedef {Object} Account
 * @property {number} id
 * @property {number} userId
 * @property {string} type
 * @property {number} balance
 * @property {Date} createdAt
 */
module.exports = { AccountModel, AccountType };
