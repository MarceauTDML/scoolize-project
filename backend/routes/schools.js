const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [schools] = await db.query("SELECT id, first_name, last_name, email FROM users WHERE role = 'school'");
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des écoles." });
    }
});

module.exports = router;