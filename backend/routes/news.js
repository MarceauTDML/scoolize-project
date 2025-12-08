const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.post("/", authMiddleware, async (req, res) => {
  const { title, content, type, event_date, capacity } = req.body;
  const schoolId = req.user.id;

  if (req.user.role !== "school")
    return res.status(403).json({ message: "Interdit." });
  if (!title || !content)
    return res.status(400).json({ message: "Titre et contenu requis." });

  try {
    const sql =
      "INSERT INTO school_news (school_id, title, content, type, event_date, capacity) VALUES (?, ?, ?, ?, ?, ?)";
    await db.query(sql, [
      schoolId,
      title,
      content,
      type || "news",
      event_date || null,
      capacity || null,
    ]);
    res.status(201).json({ message: "Publié avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const newsId = req.params.id;
  const schoolId = req.user.id;
  try {
    const [news] = await db.query(
      "SELECT * FROM school_news WHERE id = ? AND school_id = ?",
      [newsId, schoolId]
    );
    if (news.length === 0)
      return res.status(403).json({ message: "Impossible de supprimer." });
    await db.query("DELETE FROM school_news WHERE id = ?", [newsId]);
    res.json({ message: "Supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/school/:schoolId", async (req, res) => {
  try {
    const query = `
            SELECT n.*, 
            (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = n.id AND r.status = 'accepted') as registered_count
            FROM school_news n 
            WHERE n.school_id = ? 
            ORDER BY n.created_at DESC
        `;
    const [news] = await db.query(query, [req.params.schoolId]);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/:id/register", authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const studentId = req.user.id;

  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "Seuls les étudiants peuvent s'inscrire." });

  try {
    const [event] = await db.query("SELECT * FROM school_news WHERE id = ?", [
      eventId,
    ]);
    if (event.length === 0)
      return res.status(404).json({ message: "Événement introuvable." });

    const evt = event[0];
    if (evt.type !== "jpo")
      return res.status(400).json({ message: "Ce n'est pas un événement." });

    if (evt.capacity) {
      const [count] = await db.query(
        "SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ? AND status = 'accepted'",
        [eventId]
      );
      if (count[0].total >= evt.capacity)
        return res.status(400).json({ message: "Événement complet." });
    }

    const [existing] = await db.query(
      "SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ?",
      [eventId, studentId]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: "Déjà inscrit." });

    await db.query(
      "INSERT INTO event_registrations (event_id, student_id) VALUES (?, ?)",
      [eventId, studentId]
    );
    res.json({ message: "Inscription envoyée, en attente de validation." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/:id/registrations", authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  try {
    const [event] = await db.query(
      "SELECT school_id FROM school_news WHERE id = ?",
      [eventId]
    );
    if (event.length === 0 || event[0].school_id !== req.user.id)
      return res.status(403).json({ message: "Accès refusé." });

    const query = `
            SELECT r.id, r.status, r.created_at, u.first_name, u.last_name, u.email 
            FROM event_registrations r
            JOIN users u ON r.student_id = u.id
            WHERE r.event_id = ?
        `;
    const [regs] = await db.query(query, [eventId]);
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/registration/:regId", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const regId = req.params.regId;

  try {
    await db.query("UPDATE event_registrations SET status = ? WHERE id = ?", [
      status,
      regId,
    ]);
    res.json({ message: "Statut mis à jour." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/my-registrations/check", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT event_id, status FROM event_registrations WHERE student_id = ?",
      [studentId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur" });
  }
});

router.get("/my-registrations", authMiddleware, async (req, res) => {
  const studentId = req.user.id;
  try {
    const query = `
            SELECT r.id as registration_id, r.status,
                   n.id as event_id, n.title, n.event_date, n.content,
                   u.id as school_id, u.first_name as school_name, u.last_name as school_city
            FROM event_registrations r
            JOIN school_news n ON r.event_id = n.id
            JOIN users u ON n.school_id = u.id
            WHERE r.student_id = ?
            ORDER BY n.event_date ASC
        `;
    const [rows] = await db.query(query, [studentId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
