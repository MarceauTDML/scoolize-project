const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/pending-schools', auth(['admin']), async (req, res) => {
    try {
        const query = `
            SELECT schools.id, schools.name, schools.description, schools.address, schools.website, users.email, schools.status
            FROM schools 
            JOIN users ON schools.user_id = users.id
            WHERE schools.status = 'pending'
        `;
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.put('/approve-school/:id', auth(['admin']), async (req, res) => {
    try {
        const schoolId = req.params.id;
        await db.execute("UPDATE schools SET status = 'approved' WHERE id = ?", [schoolId]);
        res.status(200).json({ message: 'École validée avec succès !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la validation.' });
    }
});

router.delete('/reject-school/:id', auth(['admin']), async (req, res) => {
    try {
        const schoolId = req.params.id;
        await db.execute("UPDATE schools SET status = 'rejected' WHERE id = ?", [schoolId]);
        res.status(200).json({ message: 'École rejetée.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du rejet.' });
    }
});

module.exports = router;