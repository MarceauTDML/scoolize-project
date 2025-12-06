import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import api from "../../services/api";

const MyCandidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        const { data } = await api.get("/student/applications");
        setCandidatures(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatures();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepté":
        return {
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
        };
      case "Refusé":
        return {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        };
      case "Entretien":
        return {
          backgroundColor: "#cce5ff",
          color: "#004085",
          border: "1px solid #b8daff",
        };
      default:
        return {
          backgroundColor: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeeba",
        };
    }
  };

  const handleWithdraw = async (id) => {
    if (window.confirm("Voulez-vous vraiment retirer cette candidature ?")) {
      try {
        await api.delete(`/student/applications/${id}`);
        setCandidatures((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Mes Candidatures</h2>
        <p style={styles.subtitle}>
          Suivez l'avancement de vos dossiers d'admission.
        </p>
      </header>

      {candidatures.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Vous n'avez aucune candidature en cours.</p>
          <Link to="/student/search" style={styles.linkButton}>
            Rechercher une école
          </Link>
        </div>
      ) : (
        <div style={styles.list}>
          {candidatures.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.formationTitle}>
                    {item.formation_name || item.formation}
                  </h3>
                  <p style={styles.schoolName}>
                    {item.school_name || item.school}
                  </p>
                </div>
                <span
                  style={{ ...styles.badge, ...getStatusStyle(item.status) }}
                >
                  {item.status}
                </span>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.date}>
                  Candidaté le :{" "}
                  {new Date(
                    item.submitted_at || item.date
                  ).toLocaleDateString()}
                </p>
                {item.message && (
                  <div style={styles.messageBox}>
                    <strong>Note de l'école :</strong> {item.message}
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                <button style={styles.secondaryButton}>Voir le détail</button>
                {item.status === "En attente" && (
                  <button
                    style={styles.dangerButton}
                    onClick={() => handleWithdraw(item.id)}
                  >
                    Retirer ma candidature
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "2rem",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#7f8c8d",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
  },
  linkButton: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  formationTitle: {
    margin: "0 0 5px 0",
    fontSize: "1.2rem",
    color: "#333",
  },
  schoolName: {
    margin: 0,
    color: "#666",
    fontWeight: "500",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  cardBody: {
    marginBottom: "15px",
  },
  date: {
    fontSize: "0.9rem",
    color: "#888",
    marginBottom: "10px",
  },
  messageBox: {
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "0.95rem",
    color: "#444",
  },
  cardFooter: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },
  secondaryButton: {
    padding: "8px 16px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#333",
  },
  dangerButton: {
    padding: "8px 16px",
    backgroundColor: "#fff",
    border: "1px solid #dc3545",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#dc3545",
  },
};

export default MyCandidatures;
