const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.get("/locations", async (req, res) => {
  try {
    const query = `
            SELECT u.id, u.first_name, u.last_name, 
                   d.latitude, d.longitude, d.school_type
            FROM users u
            JOIN school_details d ON u.id = d.user_id
            WHERE u.role = 'school' 
            AND d.latitude IS NOT NULL 
            AND d.longitude IS NOT NULL
            AND d.latitude != ''
        `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement de la carte." });
  }
});

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
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
            SELECT COUNT(DISTINCT u.id) as total 
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            ${whereSql}
        `;
    const [countResult] = await db.query(countQuery, queryParams);
    const totalSchools = countResult[0].total;
    const totalPages = Math.ceil(totalSchools / limit);

    const dataQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, 
                   d.school_type, d.region, d.department,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            LEFT JOIN reviews r ON u.id = r.school_id
            ${whereSql}
            GROUP BY u.id
            LIMIT ? OFFSET ?
        `;

    const [schools] = await db.query(dataQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    res.json({
      data: schools,
      pagination: { currentPage: page, totalPages, totalSchools },
    });
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
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du détail." });
  }
});

router.get('/recommended', authMiddleware, async (req, res) => {
    const studentId = req.user.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Réservé aux étudiants" });
    }

    try {
        const [grades] = await db.query(
            "SELECT subject FROM student_grades WHERE user_id = ? AND is_specialty = 1", 
            [studentId]
        );

        if (grades.length === 0) {
            const [defaultSchools] = await db.query("SELECT * FROM users WHERE role = 'school' LIMIT 20");
            return res.json({ data: defaultSchools, pagination: {}, isRecommendation: false });
        }

        const subjects = grades.map(g => g.subject.toLowerCase());
        let targetTags = [];

        if (subjects.some(s => s.includes('art') || s.includes('hlp') || s.includes('littérature') || s.includes('philo'))) {
            targetTags.push('PROFILE_ART', 'PROFILE_LETTRES');
        }
        if (subjects.some(s => s.includes('math') || s.includes('physique') || s.includes('si') || s.includes('nsi') || s.includes('svt'))) {
            targetTags.push('PROFILE_SCIENCE');
        }
        if (subjects.some(s => s.includes('ses') || s.includes('eco') || s.includes('gestion'))) {
            targetTags.push('PROFILE_ECO');
        }
        if (subjects.some(s => s.includes('svt') || s.includes('biologie'))) {
            targetTags.push('PROFILE_SANTE');
        }

        console.log("Algo cherche les tags :", targetTags);

        if (targetTags.length === 0) {
             const [defaultSchools] = await db.query("SELECT * FROM users WHERE role = 'school' LIMIT 20");
             return res.json({ data: defaultSchools, pagination: {}, isRecommendation: false });
        }

        const likeConditions = targetTags.map(() => "d.description LIKE ?").join(' OR ');
        const queryParams = targetTags.map(tag => `%${tag}%`);

        const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, 
                   d.school_type, d.region, d.department, d.description
            FROM users u
            LEFT JOIN school_details d ON u.id = d.user_id
            WHERE u.role = 'school' AND (${likeConditions})
            LIMIT 50
        `;

        const [schools] = await db.query(query, queryParams);

        const schoolsWithScore = schools.map(s => ({ ...s, match_score: 100 }));

        res.json({
            data: schoolsWithScore,
            pagination: { totalSchools: schools.length },
            isRecommendation: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur algorithme" });
    }
});

module.exports = router;