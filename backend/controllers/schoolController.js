const db = require("../config/db");

exports.getSchoolProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [schools] = await db.query(
      "SELECT * FROM schools WHERE user_id = ?",
      [userId]
    );

    if (schools.length === 0) {
      return res.status(404).json({ message: "École introuvable" });
    }

    res.json(schools[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSchoolProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, website_url, address, city, contact_email } =
      req.body;

    await db.query(
      `UPDATE schools 
             SET name = ?, description = ?, website_url = ?, address = ?, city = ?, contact_email = ? 
             WHERE user_id = ?`,
      [name, description, website_url, address, city, contact_email, userId]
    );

    res.json({ message: "Profil école mis à jour" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFormation = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      domain,
      diploma_type,
      study_mode,
      tuition_fees_per_year,
      city,
      admission_criteria,
    } = req.body;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    if (schools.length === 0)
      return res.status(404).json({ message: "École introuvable" });
    const schoolId = schools[0].id;

    await db.query(
      `INSERT INTO formations (school_id, name, description, domain, diploma_type, study_mode, tuition_fees_per_year, city, admission_criteria)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schoolId,
        name,
        description,
        domain,
        diploma_type,
        study_mode,
        tuition_fees_per_year,
        city,
        admission_criteria,
      ]
    );

    res.status(201).json({ message: "Formation créée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyFormations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    if (schools.length === 0)
      return res.status(404).json({ message: "École introuvable" });
    const schoolId = schools[0].id;

    const [formations] = await db.query(
      "SELECT * FROM formations WHERE school_id = ? ORDER BY created_at DESC",
      [schoolId]
    );

    res.json(formations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, admission_criteria, tuition_fees_per_year } =
      req.body;
    const userId = req.user.id;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    const schoolId = schools[0].id;

    const [result] = await db.query(
      "UPDATE formations SET name = ?, description = ?, admission_criteria = ?, tuition_fees_per_year = ? WHERE id = ? AND school_id = ?",
      [
        name,
        description,
        admission_criteria,
        tuition_fees_per_year,
        id,
        schoolId,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(403)
        .json({
          message: "Modification non autorisée ou formation introuvable",
        });
    }

    res.json({ message: "Formation mise à jour" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    const schoolId = schools[0].id;

    const [result] = await db.query(
      "DELETE FROM formations WHERE id = ? AND school_id = ?",
      [id, schoolId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Suppression non autorisée" });
    }

    res.json({ message: "Formation supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const userId = req.user.id;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    if (schools.length === 0)
      return res.status(404).json({ message: "École introuvable" });
    const schoolId = schools[0].id;

    const query = `
            SELECT a.id as application_id, a.status, a.school_tier_ranking, a.submitted_at,
                   s.first_name, s.last_name, s.city as student_city,
                   f.name as formation_name,
                   (SELECT overall_average FROM academic_records ar WHERE ar.student_id = s.id ORDER BY ar.created_at DESC LIMIT 1) as last_average
            FROM applications a
            JOIN formations f ON a.formation_id = f.id
            JOIN students s ON a.student_id = s.id
            WHERE f.school_id = ?
            ORDER BY a.submitted_at DESC
        `;

    const [candidates] = await db.query(query, [schoolId]);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status, tier } = req.body;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    const schoolId = schools[0].id;

    const [check] = await db.query(
      `
            SELECT a.id FROM applications a 
            JOIN formations f ON a.formation_id = f.id 
            WHERE a.id = ? AND f.school_id = ?`,
      [applicationId, schoolId]
    );

    if (check.length === 0) {
      return res
        .status(403)
        .json({ message: "Candidature introuvable pour votre école" });
    }

    if (status) {
      await db.query("UPDATE applications SET status = ? WHERE id = ?", [
        status,
        applicationId,
      ]);
    }
    if (tier) {
      await db.query(
        "UPDATE applications SET school_tier_ranking = ? WHERE id = ?",
        [tier, applicationId]
      );
    }

    res.json({ message: "Dossier mis à jour" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postNews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, type, image_url } = req.body;

    const [schools] = await db.query(
      "SELECT id FROM schools WHERE user_id = ?",
      [userId]
    );
    const schoolId = schools[0].id;

    await db.query(
      "INSERT INTO school_news (school_id, title, content, type, image_url) VALUES (?, ?, ?, ?, ?)",
      [schoolId, title, content, type || "news", image_url]
    );

    res.status(201).json({ message: "Actualité publiée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
