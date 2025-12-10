const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");

router.get("/suggestions/recommended", authMiddleware, async (req, res) => {
    console.log("--- Algorithme de recommandation demandé par user:", req.user.id, "---");

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Accès réservé aux étudiants" });
    }

    try {
        const [grades] = await db.query("SELECT * FROM student_grades WHERE user_id = ?", [req.user.id]);
        
        console.log(`Notes trouvées: ${grades.length}`);

        const [schools] = await db.query(`
            SELECT u.id, u.first_name, u.last_name as city, 
                   sd.school_type, sd.keywords, sd.description, '' as logo_url
            FROM users u 
            JOIN school_details sd ON u.id = sd.user_id 
            WHERE u.role = 'school'
        `);

        console.log(`Ecoles analysées: ${schools.length}`);

        if (grades.length === 0 || schools.length === 0) {
            return res.json(schools.slice(0, 5));
        }

        const averages = {};
        grades.forEach(g => {
            let subject = (g.subject || "").toLowerCase();
            if(subject.includes("math")) subject = "maths";
            else if(subject.includes("physique") || subject.includes("chimie")) subject = "physique";
            else if(subject.includes("anglais") || subject.includes("langue")) subject = "langues";
            else if(subject.includes("français") || subject.includes("littérature") || subject.includes("philo")) subject = "lettres";
            else if(subject.includes("ses") || subject.includes("eco") || subject.includes("gestion")) subject = "eco";
            else if(subject.includes("info") || subject.includes("nsi") || subject.includes("numérique")) subject = "informatique";

            if (!averages[subject]) averages[subject] = { sum: 0, count: 0 };
            averages[subject].sum += parseFloat(g.grade);
            averages[subject].count += 1;
        });

        const scoredSchools = schools.map(school => {
            let score = 0;
            const keywords = ((school.keywords || "") + " " + (school.school_type || "")).toLowerCase();

            if (keywords.includes("ingénieur") || keywords.includes("sciences") || keywords.includes("tech")) {
                if (averages["maths"] && (averages["maths"].sum / averages["maths"].count) >= 12) score += 20;
                if (averages["physique"] && (averages["physique"].sum / averages["physique"].count) >= 12) score += 15;
                if (averages["informatique"] && (averages["informatique"].sum / averages["informatique"].count) >= 12) score += 15;
            }

            if (keywords.includes("commerce") || keywords.includes("management") || keywords.includes("business")) {
                if (averages["eco"] && (averages["eco"].sum / averages["eco"].count) >= 12) score += 20;
                if (averages["maths"] && (averages["maths"].sum / averages["maths"].count) >= 10) score += 10;
                if (averages["langues"] && (averages["langues"].sum / averages["langues"].count) >= 12) score += 15;
            }

            if (keywords.includes("art") || keywords.includes("droit") || keywords.includes("lettres") || keywords.includes("politique")) {
                if (averages["lettres"] && (averages["lettres"].sum / averages["lettres"].count) >= 12) score += 20;
                if (averages["langues"] && (averages["langues"].sum / averages["langues"].count) >= 12) score += 10;
            }

            Object.keys(averages).forEach(subj => {
                if (keywords.includes(subj) && (averages[subj].sum / averages[subj].count) >= 14) {
                    score += 5;
                }
            });

            return { ...school, match_score: score };
        });

        scoredSchools.sort((a, b) => b.match_score - a.match_score);
        const recommended = scoredSchools.filter(s => s.match_score > 0).slice(0, 3);
        
        if (recommended.length === 0) {
            res.json(schools.slice(0, 3));
        } else {
            res.json(recommended);
        }

    } catch (error) {
        console.error("ERREUR ROUTE RECOMMANDATION:", error);
        res.status(500).json({ message: "Erreur lors du calcul des recommandations: " + error.message });
    }
});

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

router.get("/:id/questions", async (req, res) => {
  try {
    const [questions] = await db.query(
      "SELECT * FROM school_questions WHERE school_id = ?",
      [req.params.id]
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération questions" });
  }
});

router.post("/questions", authMiddleware, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(403).json({ message: "Interdit" });

  const { question_text } = req.body;
  try {
    await db.query(
      "INSERT INTO school_questions (school_id, question_text) VALUES (?, ?)",
      [req.user.id, question_text]
    );
    res.status(201).json({ message: "Question ajoutée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout question" });
  }
});

router.delete("/questions/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(403).json({ message: "Interdit" });
  try {
    await db.query(
      "DELETE FROM school_questions WHERE id = ? AND school_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Question supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression" });
  }
});

module.exports = router;
