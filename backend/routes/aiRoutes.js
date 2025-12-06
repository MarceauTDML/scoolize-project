const express = require("express");
const router = express.Router();
const {
  chat,
  analyzeMatch,
  simulateFinance,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/chat", chat);
router.post("/analyze", analyzeMatch);
router.post("/finance", simulateFinance);

module.exports = router;
