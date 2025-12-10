const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/security");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Seuls les PDF et les images sont acceptés."));
        }
    }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM student_profiles WHERE user_id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.json({ hasProfile: false });
    
    res.json({ hasProfile: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/:studentId", authMiddleware, async (req, res) => {
    if (req.user.role !== 'school') return res.status(403).json({ message: "Interdit" });

    try {
      const [rows] = await db.query(
        "SELECT * FROM student_profiles WHERE user_id = ?",
        [req.params.studentId]
      );
      if (rows.length === 0) return res.json({});
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
});

router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  const { 
    gender, birth_name, used_name, birth_date, birth_place,
    address, phone,
    ine_number, jdc_status,
    current_status, current_school, bac_date, specialties,
    parent_address, parent_job, siblings_count, is_scholarship,
    specific_info, bio 
  } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM student_profiles WHERE user_id = ?", [userId]);

    if (existing.length > 0) {
      const sqlUpdate = `
        UPDATE student_profiles SET 
        gender=?, birth_name=?, used_name=?, birth_date=?, birth_place=?,
        address=?, phone=?, ine_number=?, jdc_status=?,
        current_status=?, current_school=?, bac_date=?, specialties=?,
        parent_address=?, parent_job=?, siblings_count=?, is_scholarship=?,
        specific_info=?, bio=?
        WHERE user_id=?
      `;
      await db.query(sqlUpdate, [
        gender, birth_name, used_name, birth_date || null, birth_place,
        address, phone, ine_number, jdc_status,
        current_status, current_school, bac_date || null, specialties,
        parent_address, parent_job, siblings_count, is_scholarship,
        specific_info, bio,
        userId
      ]);
    } else {
      const sqlInsert = `
        INSERT INTO student_profiles 
        (user_id, gender, birth_name, used_name, birth_date, birth_place, address, phone, ine_number, jdc_status, current_status, current_school, bac_date, specialties, parent_address, parent_job, siblings_count, is_scholarship, specific_info, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(sqlInsert, [
        userId, gender, birth_name, used_name, birth_date || null, birth_place,
        address, phone, ine_number, jdc_status,
        current_status, current_school, bac_date || null, specialties,
        parent_address, parent_job, siblings_count, is_scholarship,
        specific_info, bio
      ]);
    }
    res.json({ message: "Profil mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur save profile:", error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde du profil." });
  }
});

router.post("/upload/:type", authMiddleware, upload.single("file"), async (req, res) => {
    const userId = req.user.id;
    const type = req.params.type;
    
    if (!req.file) return res.status(400).json({ message: "Aucun fichier fourni." });

    let column = "";
    if (type === 'brevet') column = "diploma_brevet";
    else if (type === 'bac_francais') column = "diploma_bac_francais";
    else if (type === 'bac_terminale') column = "diploma_bac_terminale";
    else return res.status(400).json({ message: "Type de document invalide." });

    try {
        const [existing] = await db.query("SELECT * FROM student_profiles WHERE user_id = ?", [userId]);
        if (existing.length === 0) {
            await db.query("INSERT INTO student_profiles (user_id) VALUES (?)", [userId]);
        }

        await db.query(`UPDATE student_profiles SET ${column} = ? WHERE user_id = ?`, [req.file.filename, userId]);

        res.json({ message: "Fichier envoyé avec succès !", filename: req.file.filename });
    } catch (error) {
        console.error("Erreur upload:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'upload." });
    }
});

router.get("/download/:filename", async (req, res) => {
    const filepath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).send("Fichier introuvable");
    }
});

module.exports = router;