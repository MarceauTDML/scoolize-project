const express = require("express");
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  updateAcademicProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAcademicRecords,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("student"));

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.put("/academic", updateAcademicProfile);

router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:formationId", removeFavorite);

router.get("/records", getAcademicRecords);

module.exports = router;
