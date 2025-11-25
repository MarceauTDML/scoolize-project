const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/profile', auth(), async (req, res) => {
    try {
        const query = `
            SELECT users.id, users.email, users.created_at, roles.name as role_name 
            FROM users 
            JOIN roles ON users.role_id = roles.id 
            WHERE users.id = ?
        `;
        
        const [rows] = await db.execute(query, [req.auth.userId]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'Introuvable' });
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.get('/dashboard-school', auth(['school', 'admin']), (req, res) => {
    res.status(200).json({ 
        message: "Bienvenue dans l'espace gestion des écoles !",
        user: req.auth 
    });
});

router.get('/admin-stats', auth(['admin']), async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, email, role FROM users');
        res.status(200).json({ 
            message: "Espace Admin - Liste complète",
            count: users.length,
            users: users 
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.delete('/delete', auth(), async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.auth.userId]);
        res.status(200).json({ message: 'Compte supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur.' });
    }
});

module.exports = router;