const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const search = req.query.search || "";
  const city = req.query.city || "";
  const type = req.query.type || "";

  try {
    let whereConditions = ["u.role = 'school'"];
    let queryParams = [];

    if (search) {
      whereConditions.push("u.first_name LIKE ?");
      queryParams.push(`%${search}%`);
    }

    if (city) {
      whereConditions.push("u.last_name LIKE ?");
      queryParams.push(`%${city}%`);
    }

    if (type) {
      whereConditions.push("d.school_type LIKE ?");
      queryParams.push(`%${type}%`);
    }

    const whereSql = "WHERE " + whereConditions.join(" AND ");

    const countQuery = `
            SELECT COUNT(*) as total 
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            ${whereSql}
        `;

    const [countResult] = await db.query(countQuery, queryParams);
    const totalSchools = countResult[0].total;
    const totalPages = Math.ceil(totalSchools / limit);

    const dataQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, 
                   d.school_type, d.region, d.department
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            ${whereSql}
            LIMIT ? OFFSET ?
        `;

    const [schools] = await db.query(dataQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    res.json({
      data: schools,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSchools: totalSchools,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la recherche." });
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
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du détail." });
  }
});

module.exports = router;
