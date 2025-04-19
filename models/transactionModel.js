const db = require("../database.js");

const client = db;

const TransactionModel = {
  create: async (
    transactionData,
  ) => {
    try {
      let id = 0;
      const count = await client.query(
        "SELECT COUNT(*) FROM transactions",
      );
      if (count !== undefined) id = count[0]["COUNT(*)"] + 1;

      const newTransaction = {
        ...transactionData,
        createdAt: new Date(),
        id,
      };

      await client.query(
        "INSERT INTO transactions (id, toId, fromId, type, amount, description, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newTransaction.id,
          newTransaction.fromId,
          newTransaction.toId,
          newTransaction.type,
          newTransaction.amount,
          newTransaction.description,
          newTransaction.balance,
          newTransaction.createdAt,
        ],
      );
      return newTransaction;
    } catch (error) {
      console.error("Transaction creation error:", error);
      return undefined;
    }
  },

  findById: async (id) => {
    const transactions = await client.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    if (transactions == undefined) {
      console.log("SQL Query Error");
      return [];
    }

    return transactions.length > 0 ? transactions[0] : undefined;
  },

  findByUserId: async (userId) => {
    const transactions = await client.query(
      "SELECT * FROM transactions WHERE userId = ?",
      [userId],
    );

    if (transactions == undefined) {
      console.log("SQL Query Error");
      return [];
    }

    return transactions;
  },

  findByAccountId: async (accountId) => {
    const [transactions] = await client.query(
      "SELECT * FROM transactions WHERE fromId = ?",
      [accountId],
    );
    if (transactions.length === 0) {
      console.log("No transactions found");
      return [];
    }

    return transactions;
  },
};

module.exports = { TransactionModel };
