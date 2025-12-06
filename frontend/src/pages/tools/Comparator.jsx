import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";

const Comparator = () => {
  const [allFormations, setAllFormations] = useState([]);
  const [selectedFormations, setSelectedFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData = [
          {
            id: 1,
            title: "Master Data Science",
            school: "Tech Institute Paris",
            price: 8500,
            duration: "2 ans",
            location: "Paris",
            employment: 95,
            salary: 42000,
            image: "https://placehold.co/100x100/007bff/ffffff?text=Data",
          },
          {
            id: 2,
            title: "Bachelor Marketing Digital",
            school: "Digital Campus Lyon",
            price: 6500,
            duration: "3 ans",
            location: "Lyon",
            employment: 88,
            salary: 35000,
            image: "https://placehold.co/100x100/e67e22/ffffff?text=Mktg",
          },
          {
            id: 3,
            title: "MBA International Business",
            school: "Business School Bordeaux",
            price: 12000,
            duration: "18 mois",
            location: "Bordeaux",
            employment: 92,
            salary: 45000,
            image: "https://placehold.co/100x100/27ae60/ffffff?text=MBA",
          },
          {
            id: 4,
            title: "Bootcamp Fullstack JS",
            school: "Ironhack",
            price: 7500,
            duration: "9 semaines",
            location: "Remote",
            employment: 90,
            salary: 38000,
            image: "https://placehold.co/100x100/8e44ad/ffffff?text=Code",
          },
        ];

        setAllFormations(mockData);
        setSelectedFormations([mockData[0], mockData[1]]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    if (!selectedId) return;

    const formationToAdd = allFormations.find(
      (f) => f.id === parseInt(selectedId)
    );
    if (
      formationToAdd &&
      !selectedFormations.find((f) => f.id === formationToAdd.id)
    ) {
      if (selectedFormations.length >= 3) {
        alert("Vous ne pouvez comparer que 3 formations maximum à la fois.");
        return;
      }
      setSelectedFormations([...selectedFormations, formationToAdd]);
      setSelectedId("");
    }
  };

  const handleRemove = (id) => {
    setSelectedFormations((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Comparateur de Formations</h2>
        <p style={styles.subtitle}>
          Comparez les prix, les débouchés et les programmes côte à côte.
        </p>

        <div style={styles.controls}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Ajouter une formation à comparer --</option>
            {allFormations.map((f) => (
              <option
                key={f.id}
                value={f.id}
                disabled={selectedFormations.find((sf) => sf.id === f.id)}
              >
                {f.title} - {f.school}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            style={styles.addBtn}
            disabled={!selectedId}
          >
            Ajouter
          </button>
        </div>
      </header>

      {selectedFormations.length === 0 ? (
        <div style={styles.emptyState}>
          Sélectionnez des formations ci-dessus pour commencer la comparaison.
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.firstCol}>Critères</th>
                {selectedFormations.map((f) => (
                  <th key={f.id} style={styles.th}>
                    <div style={styles.headerContent}>
                      <button
                        onClick={() => handleRemove(f.id)}
                        style={styles.removeBtn}
                      >
                        ×
                      </button>
                      <img src={f.image} alt={f.title} style={styles.img} />
                      <Link to={`/formation/${f.id}`} style={styles.link}>
                        {f.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>École</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.td}>
                    {f.school}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Prix</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.tdPrice}>
                    {f.price} €
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Durée</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.td}>
                    {f.duration}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Lieu</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.td}>
                    {f.location}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Taux d'emploi</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          f.employment > 90 ? "#d4edda" : "#fff3cd",
                        color: f.employment > 90 ? "#155724" : "#856404",
                      }}
                    >
                      {f.employment}%
                    </span>
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Salaire moyen</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.tdBold}>
                    {f.salary} € / an
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Action</td>
                {selectedFormations.map((f) => (
                  <td key={f.id} style={styles.td}>
                    <button style={styles.actionBtn}>Candidater</button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  select: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    minWidth: "300px",
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "#f9f9f9",
    color: "#666",
    borderRadius: "8px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  firstCol: {
    width: "150px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #ddd",
  },
  th: {
    padding: "20px",
    backgroundColor: "#fff",
    borderBottom: "2px solid #ddd",
    verticalAlign: "top",
    position: "relative",
    width: "28%",
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  img: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    textAlign: "center",
  },
  removeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    color: "#dc3545",
    fontSize: "1.5rem",
    cursor: "pointer",
    lineHeight: 1,
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  firstColLabel: {
    padding: "15px",
    fontWeight: "bold",
    color: "#555",
    backgroundColor: "#f8f9fa",
    borderRight: "1px solid #eee",
  },
  td: {
    padding: "15px",
    textAlign: "center",
    color: "#333",
    verticalAlign: "middle",
    borderRight: "1px solid #eee",
  },
  tdPrice: {
    padding: "15px",
    textAlign: "center",
    color: "#28a745",
    fontWeight: "bold",
    fontSize: "1.1rem",
    verticalAlign: "middle",
    borderRight: "1px solid #eee",
  },
  tdBold: {
    padding: "15px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#2c3e50",
    verticalAlign: "middle",
    borderRight: "1px solid #eee",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  actionBtn: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

export default Comparator;
