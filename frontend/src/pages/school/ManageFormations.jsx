import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import api from "../../services/api";

const ManageFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    id: null,
    name: "",
    domain: "Informatique",
    tuition_fees_per_year: "",
    study_mode: "",
    diploma_type: "",
    city: "",
    admission_criteria: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchFormations = async () => {
    try {
      const { data } = await api.get("/school/formations");
      setFormations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await api.put(`/school/formations/${formData.id}`, formData);
      } else {
        await api.post("/school/formations", formData);
      }
      await fetchFormations();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleEdit = (formation) => {
    setFormData(formation);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")
    ) {
      try {
        await api.delete(`/school/formations/${id}`);
        setFormations((prev) => prev.filter((f) => f.id !== id));
      } catch (error) {
        console.error(error);
        alert("Impossible de supprimer cette formation.");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setShowForm(false);
    setIsEditing(false);
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Gestion des Formations</h2>
          <p style={styles.subtitle}>
            Ajoutez, modifiez ou supprimez vos fiches de cours.
          </p>
        </div>
        {!showForm && (
          <button style={styles.addButton} onClick={() => setShowForm(true)}>
            + Nouvelle Formation
          </button>
        )}
      </header>

      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>
            {isEditing ? "Modifier la formation" : "Créer une formation"}
          </h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Nom de la formation</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Domaine</label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="Informatique">Informatique</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Santé">Santé</option>
                  <option value="Ingénierie">Ingénierie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Type de diplôme</label>
                <input
                  type="text"
                  name="diploma_type"
                  value={formData.diploma_type}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="ex: Master, Licence, BTS"
                  required
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Mode d'étude</label>
                <input
                  type="text"
                  name="study_mode"
                  value={formData.study_mode}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="ex: Initial, Alternance"
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Frais de scolarité (€/an)</label>
                <input
                  type="number"
                  name="tuition_fees_per_year"
                  value={formData.tuition_fees_per_year}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Critères d'admission</label>
              <input
                type="text"
                name="admission_criteria"
                value={formData.admission_criteria}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="ex: Bac+3 validé, Dossier, Entretien"
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={styles.textarea}
                rows="3"
                required
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelBtn}
              >
                Annuler
              </button>
              <button type="submit" style={styles.submitBtn}>
                {isEditing ? "Mettre à jour" : "Publier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.listContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Domaine</th>
              <th style={styles.th}>Diplôme</th>
              <th style={styles.th}>Frais</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formations.map((formation) => (
              <tr key={formation.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{formation.name}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{formation.domain}</span>
                </td>
                <td style={styles.td}>{formation.diploma_type}</td>
                <td style={styles.td}>{formation.tuition_fees_per_year} €</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(formation)}
                    style={styles.editBtn}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(formation.id)}
                    style={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {formations.length === 0 && (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: "center" }}>
                  Aucune formation enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#7f8c8d",
    margin: 0,
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    border: "1px solid #e0e0e0",
  },
  formTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  group: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "250px",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "500",
    color: "#555",
    fontSize: "0.9rem",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  select: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    resize: "vertical",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#333",
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },
  th: {
    textAlign: "left",
    padding: "15px",
    backgroundColor: "#f1f2f6",
    borderBottom: "2px solid #ddd",
    color: "#555",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "15px",
    color: "#333",
    verticalAlign: "middle",
  },
  badge: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.85rem",
  },
  editBtn: {
    backgroundColor: "#ffc107",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    color: "#fff",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#fff",
  },
};

export default ManageFormations;
