const db = require("../config/db");
const aiService = require("../services/aiService");

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    let systemInstruction =
      "Tu es un conseiller d'orientation expert nommé Scoolize. Tu es bienveillant, précis et encourageant.";

    if (role === "student") {
      const [students] = await db.query(
        "SELECT first_name, city FROM students WHERE user_id = ?",
        [userId]
      );
      if (students.length > 0) {
        const s = students[0];
        systemInstruction += ` Tu parles à un étudiant prénommé ${s.first_name} qui habite à ${s.city}.`;
      }
    }

    const result = await aiService.generateResponse(
      userId,
      role,
      message,
      systemInstruction
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.analyzeMatch = async (req, res) => {
  try {
    const { formationId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "student") {
      return res
        .status(403)
        .json({
          message: "Seuls les étudiants peuvent analyser une compatibilité.",
        });
    }

    const [students] = await db.query(
      "SELECT id, first_name FROM students WHERE user_id = ?",
      [userId]
    );
    const studentId = students[0].id;

    const [formations] = await db.query(
      "SELECT * FROM formations WHERE id = ?",
      [formationId]
    );
    if (formations.length === 0)
      return res.status(404).json({ message: "Formation introuvable." });
    const formation = formations[0];

    const [records] = await db.query(
      "SELECT * FROM academic_records WHERE student_id = ?",
      [studentId]
    );
    const [grades] = await db.query(
      `SELECT g.subject_name, g.student_grade, g.max_value 
             FROM grades g 
             JOIN academic_records r ON g.record_id = r.id 
             WHERE r.student_id = ?`,
      [studentId]
    );

    const prompt = `
            Analyse la compatibilité entre cet étudiant et cette formation.
            
            FORMATION:
            Nom: ${formation.name}
            Domaine: ${formation.domain}
            Critères: ${formation.admission_criteria || "Non spécifié"}

            ÉTUDIANT:
            Moyenne générale dernière période: ${
              records.length > 0 ? records[0].overall_average : "Non connue"
            }
            Notes détaillées: ${grades
              .map(
                (g) => `${g.subject_name}: ${g.student_grade}/${g.max_value}`
              )
              .join(", ")}

            Réponds UNIQUEMENT avec ce format JSON :
            {
                "score": (un nombre entre 0 et 100),
                "explanation": "Une explication courte de 3 phrases max"
            }
        `;

    const aiResult = await aiService.generateResponse(
      userId,
      role,
      prompt,
      "Tu es un algorithme de scoring strict. Réponds uniquement en JSON."
    );

    let parsedResult;
    try {
      const cleanJson = aiResult.reply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (e) {
      parsedResult = {
        score: 50,
        explanation: "Analyse complexe, score estimé. " + aiResult.reply,
      };
    }

    await db.query(
      `INSERT INTO compatibility_scores (student_id, formation_id, match_score, ai_explanation) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), ai_explanation = VALUES(ai_explanation), calculated_at = CURRENT_TIMESTAMP`,
      [studentId, formationId, parsedResult.score, parsedResult.explanation]
    );

    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.simulateFinance = async (req, res) => {
  try {
    const { city } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const [cityStats] = await db.query(
      "SELECT * FROM city_stats WHERE city_name = ?",
      [city]
    );
    let cityData =
      cityStats.length > 0
        ? `Données ville: Loyer moyen ${cityStats[0].avg_rent}€`
        : "Pas de données précises sur la ville.";

    const prompt = `
            Fais une simulation financière pour un étudiant allant vivre à ${city}.
            ${cityData}
            Estime : Loyer, Nourriture, Transport, Sorties.
            Donne le budget total mensuel estimé et un conseil pour économiser.
        `;

    const result = await aiService.generateResponse(
      userId,
      role,
      prompt,
      "Tu es un expert en finances étudiantes."
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
