const db = require("../config/db");

exports.getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.query(
      "SELECT * FROM students WHERE user_id = ?",
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Profil étudiant introuvable" });
    }

    const student = students[0];

    const [academicProfiles] = await db.query(
      "SELECT * FROM student_academic_profiles WHERE student_id = ?",
      [student.id]
    );
    const academicProfile =
      academicProfiles.length > 0 ? academicProfiles[0] : null;

    const [specialties] = await db.query(
      "SELECT * FROM student_specialties WHERE student_id = ?",
      [student.id]
    );

    res.json({
      personal: student,
      academic: academicProfile,
      specialties: specialties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, address, city, zip_code, linkedin_url, bio, birth_date } =
      req.body;

    await db.query(
      `UPDATE students 
             SET phone = ?, address = ?, city = ?, zip_code = ?, linkedin_url = ?, bio = ?, birth_date = ? 
             WHERE user_id = ?`,
      [phone, address, city, zip_code, linkedin_url, bio, birth_date, userId]
    );

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAcademicProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      current_level,
      bac_series,
      bac_mention,
      has_graduated,
      specialties,
    } = req.body;

    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );
    if (students.length === 0)
      return res.status(404).json({ message: "Étudiant introuvable" });
    const studentId = students[0].id;

    const [existing] = await db.query(
      "SELECT id FROM student_academic_profiles WHERE student_id = ?",
      [studentId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE student_academic_profiles 
                 SET current_level = ?, bac_series = ?, bac_mention = ?, has_graduated = ? 
                 WHERE student_id = ?`,
        [current_level, bac_series, bac_mention, has_graduated, studentId]
      );
    } else {
      await db.query(
        `INSERT INTO student_academic_profiles (student_id, current_level, bac_series, bac_mention, has_graduated) 
                 VALUES (?, ?, ?, ?, ?)`,
        [studentId, current_level, bac_series, bac_mention, has_graduated]
      );
    }

    if (specialties && Array.isArray(specialties)) {
      await db.query("DELETE FROM student_specialties WHERE student_id = ?", [
        studentId,
      ]);

      for (const spec of specialties) {
        await db.query(
          "INSERT INTO student_specialties (student_id, specialty_name, is_abandoned) VALUES (?, ?, ?)",
          [studentId, spec.name, spec.is_abandoned || false]
        );
      }
    }

    res.json({ message: "Profil académique mis à jour" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );
    if (students.length === 0)
      return res.status(404).json({ message: "Étudiant introuvable" });
    const studentId = students[0].id;

    const query = `
            SELECT f.*, s.name as school_name, s.logo_url 
            FROM favorites fav
            JOIN formations f ON fav.formation_id = f.id
            JOIN schools s ON f.school_id = s.id
            WHERE fav.student_id = ?
        `;

    const [favorites] = await db.query(query, [studentId]);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { formationId } = req.body;

    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );
    const studentId = students[0].id;

    await db.query(
      "INSERT IGNORE INTO favorites (student_id, formation_id) VALUES (?, ?)",
      [studentId, formationId]
    );

    res.json({ message: "Formation ajoutée aux favoris" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { formationId } = req.params;

    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );
    const studentId = students[0].id;

    await db.query(
      "DELETE FROM favorites WHERE student_id = ? AND formation_id = ?",
      [studentId, formationId]
    );

    res.json({ message: "Favori retiré" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAcademicRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );
    if (students.length === 0)
      return res.status(404).json({ message: "Étudiant introuvable" });
    const studentId = students[0].id;

    const [records] = await db.query(
      "SELECT * FROM academic_records WHERE student_id = ? ORDER BY academic_year DESC",
      [studentId]
    );

    const recordsWithGrades = [];
    for (const record of records) {
      const [grades] = await db.query(
        "SELECT * FROM grades WHERE record_id = ?",
        [record.id]
      );
      recordsWithGrades.push({ ...record, grades });
    }

    res.json(recordsWithGrades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
