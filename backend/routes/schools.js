const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
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
        `;
        
        const [schools] = await db.execute(query);
        res.status(200).json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;