import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import api from "../../services/api";

const Comparator = () => {
  const [allSchools, setAllSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await api.get("/school/list");
        setAllSchools(data);
        if (data.length >= 2) {
          setSelectedSchools([data[0], data[1]]);
        } else {
          setSelectedSchools(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleAdd = () => {
    if (!selectedId) return;

    const schoolToAdd = allSchools.find((s) => s.id === parseInt(selectedId));
    if (schoolToAdd && !selectedSchools.find((s) => s.id === schoolToAdd.id)) {
      if (selectedSchools.length >= 3) {
        alert("Vous ne pouvez comparer que 3 établissements maximum.");
        return;
      }
      setSelectedSchools([...selectedSchools, schoolToAdd]);
      setSelectedId("");
    }
  };

  const handleRemove = (id) => {
    setSelectedSchools((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Comparateur d'Écoles</h2>
        <p style={styles.subtitle}>Comparez les établissements côte à côte.</p>

        <div style={styles.controls}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Ajouter une école --</option>
            {allSchools.map((s) => (
              <option
                key={s.id}
                value={s.id}
                disabled={selectedSchools.find((sel) => sel.id === s.id)}
              >
                {s.name}
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

      {selectedSchools.length === 0 ? (
        <div style={styles.emptyState}>
          Sélectionnez des écoles ci-dessus pour commencer la comparaison.
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.firstCol}>Critères</th>
                {selectedSchools.map((s) => (
                  <th key={s.id} style={styles.th}>
                    <div style={styles.headerContent}>
                      <button
                        onClick={() => handleRemove(s.id)}
                        style={styles.removeBtn}
                      >
                        ×
                      </button>
                      <img
                        src={
                          s.logo_url ||
                          "https://via.placeholder.com/80x80?text=Logo"
                        }
                        alt={s.name}
                        style={styles.img}
                      />
                      <Link to={`/formation/${s.id}`} style={styles.link}>
                        {s.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Ville</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    {s.city}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Adresse</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    {s.address || "-"}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Site Web</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    {s.website_url ? (
                      <a
                        href={s.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.linkSmall}
                      >
                        Visiter
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Email</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    {s.contact_email || "-"}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Téléphone</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    {s.phone || "-"}
                  </td>
                ))}
              </tr>
              <tr style={styles.tr}>
                <td style={styles.firstColLabel}>Action</td>
                {selectedSchools.map((s) => (
                  <td key={s.id} style={styles.td}>
                    <Link to={`/formation/${s.id}`} style={styles.actionBtn}>
                      Voir la fiche
                    </Link>
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
  linkSmall: {
    color: "#007bff",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  actionBtn: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
};

export default Comparator;
