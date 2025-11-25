const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

const validateRegister = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('6 caractères minimum'),
    body('role').isIn(['user', 'school']).withMessage('Rôle invalide'),
    body('schoolName').if(body('role').equals('school')).notEmpty().withMessage("Le nom de l'école est requis")
];

router.post('/', validateRegister, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, schoolName, description, address, website } = req.body;

    try {
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email déjà utilisé.' });
        }

        const [roleRows] = await db.execute('SELECT id FROM roles WHERE name = ?', [role]);
        const roleId = roleRows[0].id;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await db.execute(
            'INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)', 
            [email, hashedPassword, roleId]
        );
        const newUserId = userResult.insertId;

        if (role === 'school') {
            await db.execute(
                'INSERT INTO schools (user_id, name, description, address, website) VALUES (?, ?, ?, ?, ?)',
                [newUserId, schoolName, description || '', address || '', website || '']
            );
        }

        res.status(201).json({ message: 'Compte créé avec succès !' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;