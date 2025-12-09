const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/security');
const multer = require('multer');
const pdf = require('pdf-extraction'); // <--- On utilise pdf-extraction ici

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mots-clés pour détecter les spécialités automatiquement
const KNOWN_SPECIALTIES = [
    "Mathématiques", "Physique", "Chimie", "SVT", "Biologie",
    "SES", "Economiques", "HGGSP", "Géopolitique", "Histoire",
    "HLP", "Humanités", "Philosophie", "LLCE", "Anglais", 
    "NSI", "Numérique", "SI", "Ingénieur", "Arts"
];

// Fonction pour extraire une note d'une ligne (ex: "Maths : 15.5" -> 15.5)
const extractGrade = (line) => {
    // Regex : Cherche un nombre entre 0 et 20, avec point ou virgule
    // Ignore les nombres > 20 (souvent des effectifs ou moyennes classe) sauf si c'est 20
    const match = line.match(/\b([0-1]?[0-9]|[2][0])([.,][0-9]{1,2})?\b/); 
    if (match) {
        const val = parseFloat(match[0].replace(',', '.'));
        // Sécurité : On garde la note si elle est valide
        if (val >= 0 && val <= 20) return val;
    }
    return null;
};

// 1. Route d'analyse du PDF
router.post('/parse', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });

    try {
        // Lecture du buffer PDF
        const data = await pdf(req.file.buffer);
        const text = data.text;
        
        const lines = text.split('\n');
        const detected = [];

        lines.forEach(line => {
            const cleanLine = line.trim();
            // On ignore les lignes trop courtes ou sans chiffres
            if (cleanLine.length < 5 || !/\d/.test(cleanLine)) return;

            const grade = extractGrade(cleanLine);
            
            if (grade !== null) {
                // On essaie de récupérer le nom de la matière (tout sauf la note)
                // Ex: "Mathématiques 14.5" -> "Mathématiques"
                let subject = cleanLine.replace(grade.toString().replace('.', ','), '') // Enlève note avec virgule
                                       .replace(grade.toString(), '') // Enlève note avec point
                                       .replace('/20', '')
                                       .trim();
                
                // Nettoyage supplémentaire (enlève les chiffres restants qui trainent)
                subject = subject.replace(/[0-9]/g, '').trim(); 
                
                // Si le nom de la matière est assez long pour être valide
                if (subject.length > 2) {
                    let isSpe = false;
                    
                    // Détection Spécialité
                    if (KNOWN_SPECIALTIES.some(s => subject.includes(s))) {
                        isSpe = true;
                    }

                    // Normalisation des noms pour le BAC de Français
                    if (subject.toLowerCase().includes('oral') && subject.toLowerCase().includes('fran')) {
                        subject = "Français Oral";
                        isSpe = false;
                    }
                    else if ((subject.toLowerCase().includes('ecrit') || subject.toLowerCase().includes('écrit')) && subject.toLowerCase().includes('fran')) {
                        subject = "Français Écrit";
                        isSpe = false;
                    }

                    // On évite les doublons (ex: si la ligne apparait 2 fois)
                    const alreadyExists = detected.find(d => d.subject === subject && d.grade === grade);
                    if (!alreadyExists) {
                        detected.push({
                            subject: subject.substring(0, 50), // Limite taille nom
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

// 2. Sauvegarde des notes validées
router.post('/save', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    // context correspond à : 'premiere_t1', 'bac_francais', etc.
    const { grades, context } = req.body; 

    if (!context || !grades) return res.status(400).json({ message: "Données incomplètes" });

    try {
        // 1. On supprime les anciennes notes de ce contexte pour cet élève (Mise à jour)
        await db.query("DELETE FROM student_grades WHERE user_id = ? AND context = ?", [userId, context]);

        // 2. On insère les nouvelles
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

// 3. Récupérer toutes les notes de l'élève
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_grades WHERE user_id = ?", [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;