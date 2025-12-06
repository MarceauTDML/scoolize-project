import { useState } from "react";
import Loader from "../../components/Loader";
import api from "../../services/api";

const ProfileOCR = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractedData(null);
      setIsSaved(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const { data } = await api.post("/student/ocr/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExtractedData(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse du document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setExtractedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await api.post("/student/grades", extractedData);
      setIsSaved(true);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement des notes.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Numérisation du Dossier Scolaire</h2>
      <p style={styles.subtitle}>
        Téléchargez vos bulletins de notes. Notre IA extraira automatiquement
        vos résultats.
      </p>

      <div style={styles.card}>
        {!extractedData && !isAnalyzing && (
          <div style={styles.uploadSection}>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              style={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.uploadLabel}>
              {selectedFile
                ? selectedFile.name
                : "📁 Choisir un fichier (PDF, IMG)"}
            </label>

            <button
              onClick={handleAnalyze}
              style={{
                ...styles.button,
                backgroundColor: selectedFile ? "#007bff" : "#ccc",
                cursor: selectedFile ? "pointer" : "not-allowed",
              }}
              disabled={!selectedFile}
            >
              Lancer l'analyse OCR
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div style={styles.loaderContainer}>
            <Loader />
            <p>Analyse du document en cours...</p>
          </div>
        )}

        {extractedData && (
          <div style={styles.resultsSection}>
            <h3 style={styles.sectionTitle}>Résultats extraits</h3>
            <p style={styles.infoText}>
              Veuillez vérifier et corriger les notes si nécessaire.
            </p>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mathématiques</label>
                <input
                  type="number"
                  name="maths"
                  value={extractedData.maths || ""}
                  onChange={handleDataChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Physique-Chimie</label>
                <input
                  type="number"
                  name="physique"
                  value={extractedData.physique || ""}
                  onChange={handleDataChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Anglais</label>
                <input
                  type="number"
                  name="anglais"
                  value={extractedData.anglais || ""}
                  onChange={handleDataChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Français</label>
                <input
                  type="number"
                  name="francais"
                  value={extractedData.francais || ""}
                  onChange={handleDataChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.summaryBox}>
              <span style={styles.summaryLabel}>
                Moyenne Générale détectée :
              </span>
              <span style={styles.summaryValue}>
                {extractedData.generalAvg || "-"} / 20
              </span>
            </div>

            {isSaved ? (
              <div style={styles.successMessage}>
                ✅ Données validées et enregistrées !
              </div>
            ) : (
              <button onClick={handleSave} style={styles.saveButton}>
                Valider et Enregistrer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "40px 0",
    border: "2px dashed #e0e0e0",
    borderRadius: "8px",
  },
  fileInput: {
    display: "none",
  },
  uploadLabel: {
    padding: "10px 20px",
    border: "1px solid #007bff",
    borderRadius: "5px",
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  button: {
    padding: "12px 24px",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    marginTop: "10px",
  },
  loaderContainer: {
    textAlign: "center",
    padding: "20px",
  },
  resultsSection: {
    marginTop: "10px",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: "5px",
    color: "#333",
  },
  infoText: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontSize: "0.9rem",
    color: "#555",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  summaryBox: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderLeft: "5px solid #28a745",
  },
  summaryLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  summaryValue: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#28a745",
  },
  saveButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.1rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
  successMessage: {
    textAlign: "center",
    color: "#28a745",
    fontWeight: "bold",
    padding: "15px",
    backgroundColor: "#d4edda",
    borderRadius: "5px",
  },
};

export default ProfileOCR;
