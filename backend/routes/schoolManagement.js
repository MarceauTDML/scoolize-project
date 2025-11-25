const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const getSchoolId = async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT id FROM schools WHERE user_id = ?', [req.auth.userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'École introuvable pour ce compte.' });
        req.schoolId = rows[0].id;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

router.get('/requests', auth(['school']), getSchoolId, async (req, res) => {
    try {
        const query = `
            SELECT ss.id, ss.year, ss.status, u.email 
            FROM school_students ss
            JOIN users u ON ss.user_id = u.id
            WHERE ss.school_id = ? AND ss.status = 'pending'
        `;
        const [requests] = await db.execute(query, [req.schoolId]);
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.put('/requests/:id', auth(['school']), getSchoolId, async (req, res) => {
    try {
        const { status } = req.body;
        const requestId = req.params.id;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide.' });
        }

        const [check] = await db.execute('SELECT id FROM school_students WHERE id = ? AND school_id = ?', [requestId, req.schoolId]);
        if (check.length === 0) return res.status(403).json({ message: 'Action non autorisée.' });

        await db.execute('UPDATE school_students SET status = ? WHERE id = ?', [status, requestId]);
        res.status(200).json({ message: `Élève ${status === 'accepted' ? 'accepté' : 'refusé'}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;