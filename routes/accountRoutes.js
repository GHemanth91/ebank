const authMiddleware = require("../middlewares/authMiddleware.js");
const express = require("express");
const accountController = require("../controllers/accountController.js").accountController;

const router = express.Router();

// Apply auth middleware to all account routes
router.use((req, res, next) => {
  authMiddleware(req, res, next);
});

router.get("/", async (req, res) => {
  console.log("Getting all accounts");
  await accountController.getAllAccounts(req, res);
});

router.get("/create", async (req, res) => {
  await accountController.createAccount(req, res);
});

// Get account details
router.get("/:accountId", async (req, res) => {
  await accountController.getAccount(req, res);
});

// Get account transactions
router.get("/:accountId/transactions", async (req, res) => {
  await accountController.getTransactions(req, res);
});

module.exports = router;
