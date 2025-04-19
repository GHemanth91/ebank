const db = require("../database.js");
const { TransactionModel } = require("../models/transactionModel.js");
const { AccountModel } = require("../models/accountModel.js");

const client = db;

const transactionController = {
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

      const transactions = await TransactionModel.findByAccountId(accountId);

      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        error: "Server error retrieving transactions",
        details: error.message,
      });
    }
  },

  getTransactionHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const [transactions] = await client.query(
        `SELECT * FROM transactions
       WHERE accountId IN (SELECT id FROM accounts WHERE userId = ?)
       AND type = 'transfer'`,
        [userId],
      );
      res.json({ transactions });
    } catch (error) {
      // Handle error
      console.error("Transaction history error:", error);
    }
  },

  createTransaction: async (req, res) => {
    try {
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const userId = req.user.id; // From auth middleware
      const amountNum = Number(amount);

      // Validate input
      if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid transfer details" });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          error: "Same Sender and Receiver accounts",
        });
      }

      // Get sender account and check ownership
      const senderAccount = await AccountModel.findById(fromAccountId);
      if (!senderAccount || senderAccount.userId !== userId) {
        return res.status(404).json({ error: "Sender account not found" });
      }

      // Get receiver account
      const receiverAccount = await AccountModel.findById(toAccountId);
      if (!receiverAccount) {
        return res.status(404).json({ error: "Receiver account not found" });
      }

      // Check for sufficient funds
      if (senderAccount.balance < amount) {
        return res.status(400).json({
          error: "Insufficient funds for transfer",
        });
      }

      console.log("Creating transaction...");
      console.log("From Account ID:", fromAccountId);
      console.log("To Account ID:", toAccountId);
      console.log("Amount:", amountNum);
      console.log("Description:", description);
      console.log("User ID:", userId);

      await client.query("START TRANSACTION");
	  console.log("Began Transaction");
      const newReceiverBalance = Number(receiverAccount.balance) + amountNum;
      const newSenderBalance = Number(senderAccount.balance) - amountNum;
      console.log(newSenderBalance);
      console.log(newReceiverBalance);

      // Update sender balance
      await AccountModel.updateBalance(fromAccountId, newSenderBalance);

      // Update receiver balance
      await AccountModel.updateBalance(toAccountId, newReceiverBalance);

      // Create a new transaction
      const Transaction = await TransactionModel.create({
        fromId: fromAccountId,
        toId: toAccountId,
        type: "transfer",
        amount,
        description,
        balance: newSenderBalance,
      });
      await client.query("COMMIT");
	  console.log("Commited Transaction");

      res.status(201).json({
        message: "Transfer completed successfully",
        Transaction,
        newSenderBalance,
        newReceiverBalance,
      });
    } catch (error) {
      console.error("Transfer error:", error);
      await client.query("ROLLBACK");
	  console.log("Rolled Back Transaction");
      res.status(500).json({ error: "Server error processing transfer" });
    }
  },
};

module.exports = { transactionController };
