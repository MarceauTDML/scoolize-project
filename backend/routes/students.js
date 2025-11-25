const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/my-status', auth(['user']), async (req, res) => {
    try {
        const query = `
            SELECT ss.*, s.name as school_name 
            FROM school_students ss
            JOIN schools s ON ss.school_id = s.id
            WHERE ss.user_id = ?
        `;
        const [rows] = await db.execute(query, [req.auth.userId]);
        
        let myRating = null;
        if (rows.length > 0 && rows[0].status === 'accepted') {
            const [ratings] = await db.execute('SELECT * FROM ratings WHERE user_id = ?', [req.auth.userId]);
            if (ratings.length > 0) myRating = ratings[0];
        }

        res.status(200).json({ 
            membership: rows.length > 0 ? rows[0] : null,
            rating: myRating
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/join', auth(['user']), async (req, res) => {
    try {
        const { schoolId, year } = req.body;
        const [existing] = await db.execute('SELECT * FROM school_students WHERE user_id = ?', [req.auth.userId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Vous avez déjà une demande en cours ou une école.' });
        }

        await db.execute(
            'INSERT INTO school_students (user_id, school_id, year) VALUES (?, ?, ?)',
            [req.auth.userId, schoolId, year]
        );
        res.status(201).json({ message: 'Demande envoyée !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/rate', auth(['user']), async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const [membership] = await db.execute(
            'SELECT school_id FROM school_students WHERE user_id = ? AND status = "accepted"', 
            [req.auth.userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: 'Vous devez être accepté dans une école pour la noter.' });
        }

        const schoolId = membership[0].school_id;

        await db.execute(
            'INSERT INTO ratings (user_id, school_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating=?, comment=?',
            [req.auth.userId, schoolId, rating, comment, rating, comment]
        );

        res.status(200).json({ message: 'Avis enregistré !' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;