const fs = require("fs");
const pdf = require("pdf-parse");
const Tesseract = require("tesseract.js");

const parseGradesFromText = (text) => {
  const lines = text.split("\n");
  const grades = [];

  const gradeRegex =
    /([a-zA-ZÀ-ÿ\s\-]+)(?:\s|:)(\d+(?:[.,]\d+)?)(?:\s*\/\s*(\d+))?/;

  lines.forEach((line) => {
    if (line.length < 5) return;

    const match = line.match(gradeRegex);
    if (match) {
      const subject = match[1].trim();
      const value = parseFloat(match[2].replace(",", "."));
      const max = match[3] ? parseFloat(match[3]) : 20;

      const forbiddenWords = [
        "classe",
        "moyenne",
        "générale",
        "élève",
        "professeur",
        "trimestre",
        "semestre",
        "année",
        "bulletin",
      ];

      if (
        !forbiddenWords.some((word) => subject.toLowerCase().includes(word)) &&
        subject.length > 2 &&
        value <= max
      ) {
        grades.push({
          subject_name: subject,
          student_grade: value,
          max_value: max,
        });
      }
    }
  });

  return grades;
};

exports.extractData = async (filePath, mimeType) => {
  let text = "";

  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (mimeType.startsWith("image/")) {
      const {
        data: { text: ocrText },
      } = await Tesseract.recognize(filePath, "fra");
      text = ocrText;
    } else {
      throw new Error("Format de fichier non supporté pour l'OCR");
    }

    const grades = parseGradesFromText(text);

    return {
      rawText: text,
      grades: grades,
    };
  } catch (error) {
    throw error;
  }
};
