const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.post("/", authMiddleware, async (req, res) => {
  const { school_id, rating, comment } = req.body;
  const studentId = req.user.id;

  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "Seuls les étudiants peuvent noter." });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: "La note doit être entre 1 et 5." });

  try {
    const [app] = await db.query(
      "SELECT * FROM applications WHERE student_id = ? AND school_id = ? AND status = 'accepted'",
      [studentId, school_id]
    );

    if (app.length === 0) {
      return res
        .status(403)
        .json({
          message: "Vous ne pouvez noter que les écoles qui vous ont accepté.",
        });
    }

    const [existing] = await db.query(
      "SELECT * FROM reviews WHERE student_id = ? AND school_id = ?",
      [studentId, school_id]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Vous avez déjà noté cette école." });
    }

    await db.query(
      "INSERT INTO reviews (school_id, student_id, rating, comment) VALUES (?, ?, ?, ?)",
      [school_id, studentId, rating, comment]
    );

    res.json({ message: "Avis publié avec succès (anonymement) !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/school/:schoolId", async (req, res) => {
  try {
    const query = `
            SELECT id, rating, comment, created_at 
            FROM reviews 
            WHERE school_id = ? 
            ORDER BY created_at DESC
        `;
    const [reviews] = await db.query(query, [req.params.schoolId]);

    let average = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      average = (total / reviews.length).toFixed(1);
    }

    res.json({
      reviews: reviews,
      average: average,
      total_reviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/can-review/:schoolId", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  const schoolId = req.params.schoolId;

  try {
    const [app] = await db.query(
      "SELECT * FROM applications WHERE student_id = ? AND school_id = ? AND status = 'accepted'",
      [studentId, schoolId]
    );
    if (app.length === 0)
      return res.json({ canReview: false, reason: "not_accepted" });

    const [review] = await db.query(
      "SELECT * FROM reviews WHERE student_id = ? AND school_id = ?",
      [studentId, schoolId]
    );
    if (review.length > 0)
      return res.json({ canReview: false, reason: "already_reviewed" });

    res.json({ canReview: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur" });
  }
});

module.exports = router;