import { useState, useEffect } from "react";
import Loader from "../../components/Loader";

const ManageFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    id: null,
    title: "",
    category: "Informatique",
    price: "",
    duration: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData = [
          {
            id: 1,
            title: "Master Data Science",
            category: "Informatique",
            price: 8500,
            duration: "2 ans",
            description: "Formation avancée en big data.",
          },
          {
            id: 2,
            title: "Bachelor Marketing Digital",
            category: "Marketing",
            price: 6500,
            duration: "3 ans",
            description: "Cursus complet webmarketing.",
          },
          {
            id: 3,
            title: "Bootcamp Cyber-Sécurité",
            category: "Informatique",
            price: 4000,
            duration: "6 mois",
            description: "Formation intensive pentesting.",
          },
        ];

        setFormations(mockData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      setFormations((prev) =>
        prev.map((f) => (f.id === formData.id ? formData : f))
      );
    } else {
      const newFormation = { ...formData, id: Date.now() };
      setFormations((prev) => [...prev, newFormation]);
    }

    resetForm();
  };

  const handleEdit = (formation) => {
    setFormData(formation);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")
    ) {
      setFormations((prev) => prev.filter((f) => f.id !== id));
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
                <label style={styles.label}>Titre de la formation</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="Informatique">Informatique</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Prix (€)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Durée</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="ex: 2 ans"
                  required
                />
              </div>
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
              <th style={styles.th}>Titre</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Prix</th>
              <th style={styles.th}>Durée</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formations.map((formation) => (
              <tr key={formation.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{formation.title}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{formation.category}</span>
                </td>
                <td style={styles.td}>{formation.price} €</td>
                <td style={styles.td}>{formation.duration}</td>
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
  },
  group: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
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
    minWidth: "600px",
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
