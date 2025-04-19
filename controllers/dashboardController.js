const TransactionModel =
  require("../models/transactionModel.js").TransactionModel;
const AccountModel = require("../models/accountModel.js").AccountModel;

const dashboardController = {
  getDashboardData: async (req, res) => {
    console.log("Getting dashboard data...");
    try {
      const userId = req.user.id; // from auth middleware

      // Get all accounts for the user
      const accounts = await AccountModel.findByUserId(userId);
      console.log("Accounts:", accounts);

      // For each account, get recent transactions (limit to 5 for demonstration)
      const accountsWithTransactions = await Promise.all(
        accounts.map(async (account) => {
          const transactions = await TransactionModel.findByAccountId(
            account.id,
          );
          return {
            ...account,
            transactions: transactions.slice(0, 5), // recent 5 transactions
          };
        }),
      );

      // Calculate a simple financial summary (this can be made more detailed)
      let totalBalance = 0;
      accounts.forEach((account) => {
        totalBalance += account.balance;
      });

      res.status(200).json({
        accounts: accountsWithTransactions,
        summary: {
          totalBalance,
          monthlySpending: 1245.62, // Dummy values; compute as needed
          monthlyIncome: 3850.0,
          savingsGoal: 10000.0,
          savingsProgress: Math.round((totalBalance / 10000.0) * 100),
          creditScore: 760,
        },
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ error: "Server error retrieving dashboard data" });
    }
  },
};

module.exports = { dashboardController };
