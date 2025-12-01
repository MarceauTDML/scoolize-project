const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT 
                schools.*, 
                users.email,
                IFNULL(AVG(ratings.rating), 0) as average_rating,
                COUNT(ratings.id) as rating_count
            FROM schools 
            JOIN users ON schools.user_id = users.id
            LEFT JOIN ratings ON schools.id = ratings.school_id
            WHERE schools.status = 'approved'
            GROUP BY schools.id
            LIMIT ? OFFSET ?
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM schools 
            WHERE status = 'approved'
        `;

        const [schools] = await db.execute(query, [limit.toString(), offset.toString()]);
        const [countResult] = await db.execute(countQuery);
        
        const totalSchools = countResult[0].total;
        const totalPages = Math.ceil(totalSchools / limit);

        res.status(200).json({
            data: schools,
            meta: {
                totalSchools,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const schoolId = req.params.id;

        const query = `
            SELECT 
                schools.*, 
                IFNULL(AVG(ratings.rating), 0) as average_rating,
                COUNT(ratings.id) as rating_count
            FROM schools 
            LEFT JOIN ratings ON schools.id = ratings.school_id
            WHERE schools.id = ? AND schools.status = 'approved'
            GROUP BY schools.id
        `;

        const [rows] = await db.execute(query, [schoolId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'École introuvable.' });
        }

        const [reviews] = await db.execute(`
            SELECT ratings.rating, ratings.comment, users.email 
            FROM ratings 
            JOIN users ON ratings.user_id = users.id 
            WHERE ratings.school_id = ? 
            ORDER BY ratings.created_at DESC LIMIT 5
        `, [schoolId]);

        res.status(200).json({ school: rows[0], reviews });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;