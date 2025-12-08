const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.post("/", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  const { school_id } = req.body;

  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Seuls les élèves peuvent postuler." });
  }

  try {
    const [exists] = await db.query(
      "SELECT * FROM applications WHERE student_id = ? AND school_id = ?",
      [studentId, school_id]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: "Vous avez déjà postulé ici." });
    }

    await db.query(
      "INSERT INTO applications (student_id, school_id) VALUES (?, ?)",
      [studentId, school_id]
    );
    res.status(201).json({ message: "Candidature envoyée !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/my-applications", authMiddleware, async (req, res) => {
  const schoolId = req.user.id;

  if (req.user.role !== "school") {
    return res.status(403).json({ message: "Accès réservé aux écoles." });
  }

  try {
    const query = `
            SELECT a.id, a.status, a.created_at,
                   u.first_name, u.last_name, u.email
            FROM applications a
            JOIN users u ON a.student_id = u.id
            WHERE a.school_id = ?
            ORDER BY a.created_at DESC
        `;
    const [results] = await db.query(query, [schoolId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/:id/status", authMiddleware, async (req, res) => {
  const schoolId = req.user.id;
  const applicationId = req.params.id;
  const { status } = req.body;

  if (req.user.role !== "school") {
    return res.status(403).json({ message: "Accès réservé aux écoles." });
  }

  try {
    const [app] = await db.query(
      "SELECT * FROM applications WHERE id = ? AND school_id = ?",
      [applicationId, schoolId]
    );
    if (app.length === 0) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    await db.query("UPDATE applications SET status = ? WHERE id = ?", [
      status,
      applicationId,
    ]);
    res.json({
      message: `Candidature ${status === "accepted" ? "acceptée" : "refusée"}.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/my-student-applications', authMiddleware, async (req, res) => {
    const studentId = req.user.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Accès réservé aux étudiants." });
    }

    try {
        const query = `
            SELECT a.id, a.status, a.created_at,
                   u.first_name AS school_name, u.last_name AS school_city, u.email AS school_email,
                   d.website
            FROM applications a
            JOIN users u ON a.school_id = u.id
            LEFT JOIN school_details d ON u.id = d.user_id
            WHERE a.student_id = ?
            ORDER BY a.created_at DESC
        `;
        const [results] = await db.query(query, [studentId]);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;