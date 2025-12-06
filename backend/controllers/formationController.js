const db = require("../config/db");

exports.searchFormations = async (req, res) => {
  try {
    const { q, domain, city, study_mode, type } = req.query;

    let query = `
            SELECT f.*, s.name as school_name, s.logo_url 
            FROM formations f
            JOIN schools s ON f.school_id = s.id
            WHERE 1=1
        `;

    const params = [];

    if (q) {
      query += ` AND (f.name LIKE ? OR s.name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (domain) {
      query += ` AND f.domain = ?`;
      params.push(domain);
    }

    if (city) {
      query += ` AND f.city = ?`;
      params.push(city);
    }

    if (study_mode) {
      query += ` AND f.study_mode = ?`;
      params.push(study_mode);
    }

    if (type) {
      query += ` AND f.diploma_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY f.name ASC LIMIT 50`;

    const [formations] = await db.query(query, params);
    res.json(formations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFormationById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
            SELECT f.*, s.name as school_name, s.logo_url, s.website_url, s.contact_email, s.address as school_address
            FROM formations f
            JOIN schools s ON f.school_id = s.id
            WHERE f.id = ?
        `;

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Formation introuvable" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFormationReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
            SELECT r.*, s.first_name, s.last_name 
            FROM reviews r
            JOIN students s ON r.student_id = s.id
            WHERE r.formation_id = ?
            ORDER BY r.created_at DESC
        `;

    const [reviews] = await db.query(query, [id]);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrendingFormations = async (req, res) => {
  try {
    const query = `
            SELECT f.id, f.name, f.city, s.name as school_name, s.logo_url,
            (SELECT COUNT(*) FROM favorites fav WHERE fav.formation_id = f.id) as like_count
            FROM formations f
            JOIN schools s ON f.school_id = s.id
            ORDER BY like_count DESC
            LIMIT 6
        `;

    const [trending] = await db.query(query);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
