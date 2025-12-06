const express = require("express");
const router = express.Router();
const {
  searchFormations,
  getFormationById,
  getFormationReviews,
  getTrendingFormations,
} = require("../controllers/formationController");

router.get("/", searchFormations);
router.get("/trending", getTrendingFormations);
router.get("/:id", getFormationById);
router.get("/:id/reviews", getFormationReviews);

module.exports = router;
