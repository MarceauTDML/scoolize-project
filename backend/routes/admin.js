const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/pending", async (req, res) => {
  try {
    const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                   d.description, d.website
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            WHERE u.role = 'school' AND u.status = 'pending'
        `;
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/validate/:id", async (req, res) => {
  try {
    await db.query("UPDATE users SET status = 'active' WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ message: "École validée avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la validation" });
  }
});

router.delete("/reject/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "École refusée et supprimée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

module.exports = router;
