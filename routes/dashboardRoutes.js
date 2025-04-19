const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController.js").dashboardController;
const authMiddleware = require("../middlewares/authMiddleware.js");

router.use((req, res, next) => {
  authMiddleware(req, res, next);
});

// Dashboard data endpoint (dynamic data for UI)
router.get("/", async (req, res) => {
  await dashboardController.getDashboardData(req, res);
  if (res.statusCode === 500) {
    res.redirect("/login");
  }
});

module.exports = router;
