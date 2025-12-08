const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

router.post('/', async (req, res) => {
    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
        await db.query(sql, [email, hashedPassword, first_name, last_name, role || 'student']);

        res.status(201).json({ message: "Inscription réussie ! Bienvenue sur Scoolize." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
});

module.exports = router;