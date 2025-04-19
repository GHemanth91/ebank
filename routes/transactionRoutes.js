const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware.js");
const transactionController =
	require("../controllers/transactionController.js").transactionController;

// Apply auth middleware to all transaction routes
router.use((req, res, next) => {
	console.log("Authenticating new transaction");
	authMiddleware(req, res, next);
});

router.post("/", async (req, res) => {
	await transactionController.createTransaction(req, res);
});

router.post("/history", async (req, res) => {
	await transactionController.getTransactionHistory(req, res);
});

router.post("/:accountId", async (req, res) => {
	await transactionController.getTransactions(req, res);
});

module.exports = router;
