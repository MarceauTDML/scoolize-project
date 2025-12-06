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
  listSchools,
  getSchoolById,
} = require("../controllers/schoolController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/list", listSchools);

router.get("/profile", protect, authorize("school"), getSchoolProfile);
router.put("/profile", protect, authorize("school"), updateSchoolProfile);

router.post("/formations", protect, authorize("school"), createFormation);
router.get("/formations", protect, authorize("school"), getMyFormations);
router.put("/formations/:id", protect, authorize("school"), updateFormation);
router.delete("/formations/:id", protect, authorize("school"), deleteFormation);

router.get("/candidates", protect, authorize("school"), getCandidates);
router.put(
  "/candidates/:applicationId",
  protect,
  authorize("school"),
  updateCandidateStatus
);

router.post("/news", protect, authorize("school"), postNews);

router.get("/:id", getSchoolById);

module.exports = router;
