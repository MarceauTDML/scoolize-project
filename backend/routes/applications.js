const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.post("/", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  const { school_id, motivation_letter, answers } = req.body;

  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Seuls les élèves peuvent postuler." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [countResult] = await connection.query(
      "SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status != 'withdrawn'",
      [studentId]
    );

    if (countResult[0].count >= 10) {
      await connection.release();
      return res.status(400).json({
        message: "Limite atteinte : vous ne pouvez pas faire plus de 10 vœux.",
      });
    }

    const [exists] = await connection.query(
      "SELECT * FROM applications WHERE student_id = ? AND school_id = ?",
      [studentId, school_id]
    );
    if (exists.length > 0) {
      await connection.release();
      return res.status(409).json({ message: "Vous avez déjà postulé ici." });
    }

    const [result] = await connection.query(
      "INSERT INTO applications (student_id, school_id, motivation_letter) VALUES (?, ?, ?)",
      [studentId, school_id, motivation_letter]
    );
    const applicationId = result.insertId;

    if (answers && answers.length > 0) {
      const values = answers.map((a) => [
        applicationId,
        a.question_id,
        a.answer_text,
      ]);
      await connection.query(
        "INSERT INTO application_answers (application_id, question_id, answer_text) VALUES ?",
        [values]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Candidature envoyée avec succès !" });
  } catch (error) {
    await connection.rollback();
    console.error("Erreur POST /applications :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    connection.release();
  }
});

router.get("/my-student-applications", authMiddleware, async (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Accès refusé" });

  try {
    const query = `
        SELECT 
            a.id, 
            a.status, 
            a.created_at, 
            a.student_id, 
            a.school_id, 
            a.motivation_letter,
            u.first_name as school_name, 
            u.last_name as school_city,
            sd.website as website
        FROM applications a
        LEFT JOIN users u ON a.school_id = u.id
        LEFT JOIN school_details sd ON u.id = sd.user_id
        WHERE a.student_id = ?
        ORDER BY a.created_at DESC
    `;

    const [apps] = await db.query(query, [req.user.id]);
    
    console.log(`[DEBUG] Candidatures récupérées pour l'élève ${req.user.id} :`, apps.length); 
    
    res.json(apps);

  } catch (error) {
    console.error("[ERREUR CRITIQUE] GET /my-student-applications :", error);
    res.status(500).json({ message: "Erreur serveur : " + error.message });
  }
});

router.get("/my-applications", authMiddleware, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(403).json({ message: "Accès refusé" });

  try {
    const [apps] = await db.query(
      `
      SELECT a.*, u.first_name, u.last_name, u.email 
      FROM applications a
      JOIN users u ON a.student_id = u.id
      WHERE a.school_id = ?
      ORDER BY a.created_at DESC
    `,
      [req.user.id]
    );

    for (let app of apps) {
      const [answers] = await db.query(
        `
            SELECT q.question_text, ans.answer_text 
            FROM application_answers ans
            JOIN school_questions q ON ans.question_id = q.id
            WHERE ans.application_id = ?
        `,
        [app.id]
      );
      app.questionnaire_answers = answers;
    }

    res.json(apps);
  } catch (error) {
    console.error("Erreur GET /my-applications :", error);
    res.status(500).json({ message: "Erreur récupération." });
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

    if (app[0].status === 'confirmed' || app[0].status === 'withdrawn') {
        return res.status(400).json({ message: "Impossible de modifier une candidature finalisée par l'étudiant." });
    }

    await db.query("UPDATE applications SET status = ? WHERE id = ?", [
      status,
      applicationId,
    ]);
    res.json({
      message: `Candidature ${status === "accepted" ? "acceptée" : "refusée"}.`,
    });
  } catch (error) {
    console.error("Erreur PUT /status :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/:id/confirm", authMiddleware, async (req, res) => {
  const applicationId = req.params.id;
  const studentId = req.user.id;

  if (req.user.role !== "student")
    return res.status(403).json({ message: "Interdit" });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [app] = await connection.query(
      "SELECT * FROM applications WHERE id = ? AND student_id = ?",
      [applicationId, studentId]
    );

    if (app.length === 0) {
      await connection.release();
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    if (app[0].status !== "accepted") {
      await connection.release();
      return res.status(400).json({
        message: "Vous ne pouvez confirmer qu'une école qui vous a accepté.",
      });
    }

    await connection.query(
      "UPDATE applications SET status = 'confirmed' WHERE id = ?",
      [applicationId]
    );

    await connection.query(
      "UPDATE applications SET status = 'withdrawn' WHERE student_id = ? AND id != ? AND status IN ('pending', 'accepted')",
      [studentId, applicationId]
    );

    await connection.commit();
    res.json({
      message: "Félicitations ! Votre choix définitif est enregistré.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erreur POST /confirm :", error);
    res.status(500).json({ message: "Erreur serveur lors de la confirmation." });
  } finally {
    connection.release();
  }
});

module.exports = router;