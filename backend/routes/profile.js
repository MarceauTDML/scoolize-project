const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/security');

router.get('/', authMiddleware, async (req, res) => {
    const studentId = req.user.id;
    try {
        const [profile] = await db.query("SELECT * FROM student_profiles WHERE user_id = ?", [studentId]);
        
        if (profile.length === 0) {
            return res.json({ hasProfile: false, data: null });
        }
        
        res.json({ hasProfile: true, data: profile[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const studentId = req.user.id;
    
    if (req.user.role !== 'student') return res.status(403).json({ message: "Action réservée aux étudiants." });

    try {
        const [existing] = await db.query("SELECT id FROM student_profiles WHERE user_id = ?", [studentId]);
        
        if (existing.length > 0) {
            return res.status(403).json({ message: "Votre profil est déjà validé et ne peut plus être modifié." });
        }

        const d = req.body;

        const query = `
            INSERT INTO student_profiles 
            (user_id, gender, birth_name, used_name, birth_date, birth_place, address, phone, 
             ine_number, jdc_status, current_status, current_school, bac_date, specialties, 
             parent_address, parent_job, siblings_count, is_scholarship, specific_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            studentId, d.gender, d.birth_name, d.used_name, d.birth_date, d.birth_place, d.address, d.phone,
            d.ine_number, d.jdc_status, d.current_status, d.current_school, d.bac_date, d.specialties,
            d.parent_address, d.parent_job, d.siblings_count, d.is_scholarship, d.specific_info
        ]);

        res.status(201).json({ message: "Profil créé et verrouillé avec succès !" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement." });
    }
});

module.exports = router;