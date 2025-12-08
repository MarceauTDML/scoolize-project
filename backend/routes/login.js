const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const tokenConfig = require('../config/token');

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        const token = tokenConfig.generateToken(user);

        res.json({
            message: "Connexion réussie",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
});

module.exports = router;