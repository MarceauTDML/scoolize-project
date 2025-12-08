const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [schools] = await db.query(
      "SELECT id, first_name, last_name, email FROM users WHERE role = 'school'"
    );
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.get("/:id", async (req, res) => {
  const schoolId = req.params.id;
  try {
    const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, 
                   d.description, d.address, d.website, d.phone,
                   d.school_type, d.region, d.department, d.latitude, d.longitude
            FROM users u 
            LEFT JOIN school_details d ON u.id = d.user_id 
            WHERE u.id = ? AND u.role = 'school'
        `;

    const [result] = await db.query(query, [schoolId]);

    if (result.length === 0) {
      return res.status(404).json({ message: "École introuvable." });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;