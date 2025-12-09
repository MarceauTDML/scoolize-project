const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/security');
const multer = require('multer');
const pdf = require('pdf-extraction');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const KNOWN_SPECIALTIES = [
    "Mathématiques", "Physique", "Chimie", "SVT", "Biologie",
    "SES", "Economiques", "HGGSP", "Géopolitique", "Histoire",
    "HLP", "Humanités", "Philosophie", "LLCE", "Anglais", 
    "NSI", "Numérique", "SI", "Ingénieur", "Arts"
];

const extractGrade = (line) => {
    const match = line.match(/\b([0-1]?[0-9]|[2][0])([.,][0-9]{1,2})?\b/); 
    if (match) {
        const val = parseFloat(match[0].replace(',', '.'));
        if (val >= 0 && val <= 20) return val;
    }
    return null;
};

router.post('/parse', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });

    try {
        const data = await pdf(req.file.buffer);
        const text = data.text;
        
        const lines = text.split('\n');
        const detected = [];

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine.length < 5 || !/\d/.test(cleanLine)) return;

            const grade = extractGrade(cleanLine);
            
            if (grade !== null) {
                let subject = cleanLine.replace(grade.toString().replace('.', ','), '')
                                       .replace(grade.toString(), '')
                                       .replace('/20', '')
                                       .trim();
                
                subject = subject.replace(/[0-9]/g, '').trim(); 
                
                if (subject.length > 2) {
                    let isSpe = false;
                    
                    if (KNOWN_SPECIALTIES.some(s => subject.includes(s))) {
                        isSpe = true;
                    }

                    if (subject.toLowerCase().includes('oral') && subject.toLowerCase().includes('fran')) {
                        subject = "Français Oral";
                        isSpe = false;
                    }
                    else if ((subject.toLowerCase().includes('ecrit') || subject.toLowerCase().includes('écrit')) && subject.toLowerCase().includes('fran')) {
                        subject = "Français Écrit";
                        isSpe = false;
                    }

                    const alreadyExists = detected.find(d => d.subject === subject && d.grade === grade);
                    if (!alreadyExists) {
                        detected.push({
                            subject: subject.substring(0, 50),
                            grade: grade,
                            is_specialty: isSpe
                        });
                    }
                }
            }
        });

        res.json({ detected });

    } catch (error) {
        console.error("Erreur parsing:", error);
        res.status(500).json({ message: "Erreur lors de l'analyse du fichier PDF." });
    }
});

router.post('/save', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { grades, context } = req.body; 

    if (!context || !grades) return res.status(400).json({ message: "Données incomplètes" });

    try {
        await db.query("DELETE FROM student_grades WHERE user_id = ? AND context = ?", [userId, context]);

        for (const item of grades) {
            if (item.subject && item.grade !== '' && item.grade !== null) {
                await db.query(
                    "INSERT INTO student_grades (user_id, context, subject, grade, is_specialty) VALUES (?, ?, ?, ?, ?)",
                    [userId, context, item.subject, item.grade, item.is_specialty || false]
                );
            }
        }
        res.json({ message: "Notes enregistrées avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde." });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_grades WHERE user_id = ?", [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/student/:studentId', authMiddleware, async (req, res) => {
    const studentId = req.params.studentId;
    
    if (req.user.role === 'student' && req.user.id != studentId) {
        return res.status(403).json({ message: "Accès interdit." });
    }

    try {
        const [grades] = await db.query(
            "SELECT * FROM student_grades WHERE user_id = ? ORDER BY context, subject", 
            [studentId]
        );
        res.json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;