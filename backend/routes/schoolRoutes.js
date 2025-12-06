const express = require("express");
const router = express.Router();
const {
  getSchoolProfile,
  updateSchoolProfile,
  createFormation,
  getMyFormations,
  updateFormation,
  deleteFormation,
  getCandidates,
  updateCandidateStatus,
  postNews,
} = require("../controllers/schoolController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("school"));

router.get("/profile", getSchoolProfile);
router.put("/profile", updateSchoolProfile);

router.post("/formations", createFormation);
router.get("/formations", getMyFormations);
router.put("/formations/:id", updateFormation);
router.delete("/formations/:id", deleteFormation);

router.get("/candidates", getCandidates);
router.put("/candidates/:applicationId", updateCandidateStatus);

router.post("/news", postNews);

module.exports = router;
