const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `
            SELECT users.id, users.password, roles.name as role_name 
            FROM users 
            JOIN roles ON users.role_id = roles.id 
            WHERE email = ?
        `;
        
        const [users] = await db.execute(query, [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Identifiants incorrects.' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            userId: user.id,
            role: user.role_name,
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;