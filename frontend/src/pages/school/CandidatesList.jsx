import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import api from "../../services/api";

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data } = await api.get("/school/candidates");

        const formattedData = data.map((c) => ({
          id: c.application_id,
          name: `${c.first_name} ${c.last_name}`,
          formation: c.formation_name,
          score: c.last_average ? Math.round((c.last_average / 20) * 100) : 0,
          date: new Date(c.submitted_at).toLocaleDateString(),
          status: c.status,
        }));

        setCandidates(formattedData.sort((a, b) => b.score - a.score));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/school/candidates/${id}`, { status: newStatus });
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const filteredCandidates =
    filter === "Tous"
      ? candidates
      : candidates.filter((c) => c.status === filter);

  const getScoreColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#17a2b8";
    if (score >= 50) return "#ffc107";
    return "#dc3545";
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Gestion des Candidatures</h2>
          <p style={styles.subtitle}>
            Analysez et triez les profils selon leur pertinence.
          </p>
        </div>

        <div style={styles.filterGroup}>
          {["Tous", "En attente", "Accepté", "Refusé"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === status ? "#007bff" : "#f1f1f1",
                color: filter === status ? "#fff" : "#333",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Candidat</th>
              <th style={styles.th}>Formation visée</th>
              <th style={styles.th}>Moyenne (Estimée)</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Statut Actuel</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.avatarName}>
                    <div style={styles.avatar}>{candidate.name.charAt(0)}</div>
                    <strong>{candidate.name}</strong>
                  </div>
                </td>
                <td style={styles.td}>{candidate.formation}</td>
                <td style={styles.td}>
                  <div style={styles.scoreContainer}>
                    <div
                      style={{
                        ...styles.scoreBar,
                        width: `${candidate.score}%`,
                        backgroundColor: getScoreColor(candidate.score),
                      }}
                    ></div>
                    <span
                      style={{
                        color: getScoreColor(candidate.score),
                        fontWeight: "bold",
                      }}
                    >
                      {candidate.score}%
                    </span>
                  </div>
                </td>
                <td style={styles.td}>{candidate.date}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        candidate.status === "Accepté"
                          ? "#d4edda"
                          : candidate.status === "Refusé"
                          ? "#f8d7da"
                          : "#fff3cd",
                      color:
                        candidate.status === "Accepté"
                          ? "#155724"
                          : candidate.status === "Refusé"
                          ? "#721c24"
                          : "#856404",
                    }}
                  >
                    {candidate.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button
                      onClick={() =>
                        handleStatusChange(candidate.id, "Accepté")
                      }
                      title="Accepter"
                      style={{ ...styles.actionBtn, color: "#28a745" }}
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => handleStatusChange(candidate.id, "Refusé")}
                      title="Refuser"
                      style={{ ...styles.actionBtn, color: "#dc3545" }}
                    >
                      ❌
                    </button>
                    <button style={styles.viewBtn}>Voir profil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCandidates.length === 0 && (
          <div style={styles.empty}>Aucun candidat trouvé pour ce filtre.</div>
        )}
      </div>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#7f8c8d",
    margin: 0,
  },
  filterGroup: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
    color: "#495057",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #e9ecef",
  },
  td: {
    padding: "16px",
    verticalAlign: "middle",
    color: "#333",
  },
  avatarName: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#555",
  },
  scoreContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "120px",
  },
  scoreBar: {
    height: "6px",
    borderRadius: "3px",
    flex: 1,
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "4px",
    transition: "transform 0.1s",
  },
  viewBtn: {
    padding: "5px 10px",
    backgroundColor: "#f1f1f1",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#666",
  },
};

export default CandidatesList;
