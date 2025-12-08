const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.post("/toggle", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  const { school_id } = req.body;

  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Seuls les étudiants peuvent avoir des favoris." });
  }

  try {
    const [exists] = await db.query(
      "SELECT id FROM favorites WHERE student_id = ? AND school_id = ?",
      [studentId, school_id]
    );

    if (exists.length > 0) {
      await db.query("DELETE FROM favorites WHERE id = ?", [exists[0].id]);
      res.json({ message: "Retiré des favoris", isFavorite: false });
    } else {
      await db.query(
        "INSERT INTO favorites (student_id, school_id) VALUES (?, ?)",
        [studentId, school_id]
      );
      res.json({ message: "Ajouté aux favoris", isFavorite: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  try {
    const query = `
            SELECT u.id, u.first_name, u.last_name, u.email,
                   d.school_type, d.region, d.department, d.website
            FROM favorites f
            JOIN users u ON f.school_id = u.id
            LEFT JOIN school_details d ON u.id = d.user_id
            WHERE f.student_id = ?
            ORDER BY f.created_at DESC
        `;
    const [favorites] = await db.query(query, [studentId]);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/ids", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT school_id FROM favorites WHERE student_id = ?",
      [studentId]
    );
    const ids = rows.map((row) => row.school_id);
    res.json(ids);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
