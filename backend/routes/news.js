const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/security');

router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const schoolId = req.user.id;

    if (req.user.role !== 'school') {
        return res.status(403).json({ message: "Seules les écoles peuvent publier des actualités." });
    }

    if (!title || !content) {
        return res.status(400).json({ message: "Le titre et le contenu sont obligatoires." });
    }

    try {
        await db.query(
            "INSERT INTO school_news (school_id, title, content) VALUES (?, ?, ?)",
            [schoolId, title, content]
        );
        res.status(201).json({ message: "Actualité publiée avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const newsId = req.params.id;
    const schoolId = req.user.id;

    try {
        const [news] = await db.query("SELECT * FROM school_news WHERE id = ? AND school_id = ?", [newsId, schoolId]);
        
        if (news.length === 0) {
            return res.status(403).json({ message: "Action non autorisée ou actualité introuvable." });
        }

        await db.query("DELETE FROM school_news WHERE id = ?", [newsId]);
        res.json({ message: "Actualité supprimée." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/school/:schoolId', async (req, res) => {
    try {
        const [news] = await db.query(
            "SELECT * FROM school_news WHERE school_id = ? ORDER BY created_at DESC", 
            [req.params.schoolId]
        );
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;