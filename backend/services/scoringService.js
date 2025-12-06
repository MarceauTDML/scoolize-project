const db = require("../config/db");

exports.calculateCompatibility = async (studentId, formationId) => {
  try {
    const [students] = await db.query("SELECT * FROM students WHERE id = ?", [
      studentId,
    ]);
    const [formations] = await db.query(
      "SELECT * FROM formations WHERE id = ?",
      [formationId]
    );

    if (students.length === 0 || formations.length === 0) {
      throw new Error("Données manquantes pour le calcul");
    }

    const student = students[0];
    const formation = formations[0];

    const [records] = await db.query(
      "SELECT overall_average FROM academic_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
      [studentId]
    );
    const average = records.length > 0 ? records[0].overall_average : 10;

    let score = 0;
    const breakdown = [];

    const academicScore = Math.min((average / 20) * 50, 50);
    score += academicScore;
    breakdown.push({
      label: "Dossier Scolaire",
      points: Math.round(academicScore),
    });

    let geoScore = 0;
    if (
      student.city &&
      formation.city &&
      student.city.toLowerCase() === formation.city.toLowerCase()
    ) {
      geoScore = 20;
    } else {
      const studentDept = student.zip_code
        ? student.zip_code.substring(0, 2)
        : "";
    }
    score += geoScore;
    breakdown.push({ label: "Proximité géographique", points: geoScore });

    const [specialties] = await db.query(
      "SELECT specialty_name FROM student_specialties WHERE student_id = ?",
      [studentId]
    );

    let domainScore = 10;
    const formationDomain = formation.domain
      ? formation.domain.toLowerCase()
      : "";

    const keywords = {
      informatique: [
        "nsi",
        "numérique",
        "mathématiques",
        "sciences de l'ingénieur",
      ],
      commerce: ["ses", "mathématiques", "llce", "economie"],
      art: ["arts", "humanités", "littérature"],
      scientifique: ["mathématiques", "physique", "svt"],
    };

    let matchFound = false;
    for (const spec of specialties) {
      const specName = spec.specialty_name.toLowerCase();
      for (const key in keywords) {
        if (formationDomain.includes(key)) {
          if (keywords[key].some((k) => specName.includes(k))) {
            matchFound = true;
          }
        }
      }
    }

    if (matchFound) domainScore = 30;
    score += domainScore;
    breakdown.push({ label: "Cohérence du parcours", points: domainScore });

    return {
      total: Math.min(Math.round(score), 100),
      details: breakdown,
    };
  } catch (error) {
    throw error;
  }
};
