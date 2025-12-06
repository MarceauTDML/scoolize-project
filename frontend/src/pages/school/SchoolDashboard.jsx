import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import api from "../../services/api";

const SchoolDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeFormations: 0,
    pendingReviews: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, formationsRes] = await Promise.all([
          api.get("/school/candidates"),
          api.get("/school/formations"),
        ]);

        const candidates = candidatesRes.data;
        const formations = formationsRes.data;

        setStats({
          totalCandidates: candidates.length,
          activeFormations: formations.length,
          pendingReviews: candidates.filter(
            (c) => c.status === "En attente" || c.status === "Nouveau"
          ).length,
        });

        const formattedCandidates = candidates.slice(0, 5).map((c) => ({
          id: c.application_id,
          name: `${c.first_name} ${c.last_name}`,
          formation: c.formation_name,
          date: new Date(c.submitted_at).toLocaleDateString(),
          status: c.status,
        }));

        setRecentCandidates(formattedCandidates);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          Espace Administration - {user?.profile?.name || user?.name || "École"}
        </h1>
        <p style={styles.subtitle}>
          Gérez vos formations et suivez vos recrutements.
        </p>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalCandidates}</div>
          <div style={styles.statLabel}>Candidats Totaux</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.activeFormations}</div>
          <div style={styles.statLabel}>Formations en ligne</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #e67e22" }}>
          <div style={{ ...styles.statValue, color: "#e67e22" }}>
            {stats.pendingReviews}
          </div>
          <div style={styles.statLabel}>Dossiers à traiter</div>
        </div>
      </section>

      <div style={styles.dashboardGrid}>
        <div style={styles.mainContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Dernières Candidatures</h2>
            <Link to="/school/candidates" style={styles.linkBtn}>
              Voir tout
            </Link>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Candidat</th>
                  <th style={styles.th}>Formation</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((candidat) => (
                  <tr key={candidat.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{candidat.name}</strong>
                    </td>
                    <td style={styles.td}>{candidat.formation}</td>
                    <td style={styles.td}>{candidat.date}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            candidat.status === "Nouveau"
                              ? "#d1ecf1"
                              : "#f8f9fa",
                          color:
                            candidat.status === "Nouveau" ? "#0c5460" : "#333",
                        }}
                      >
                        {candidat.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to="/school/candidates" style={styles.actionBtn}>
                        🔍
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentCandidates.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      Aucune candidature récente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Actions Rapides</h3>
            <div style={styles.actionList}>
              <Link to="/school/manage-formations" style={styles.sidebarBtn}>
                ➕ Ajouter une formation
              </Link>
              <Link to="/school/candidates" style={styles.sidebarBtn}>
                👥 Gérer les listes
              </Link>
              <button style={styles.sidebarBtn}>📊 Télécharger rapport</button>
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: "20px" }}>
            <h3 style={styles.cardTitle}>Infos Système</h3>
            <p style={styles.infoText}>
              Prochaine maintenance prévue le 15/12 à 02h00.
            </p>
            <p style={styles.infoText}>Version: 1.0.4</p>
          </div>
        </aside>
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
    marginBottom: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#7f8c8d",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderLeft: "5px solid #007bff",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    color: "#666",
    marginTop: "5px",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "30px",
  },
  mainContent: {
    flex: 1,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    color: "#333",
  },
  linkBtn: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #eee",
    color: "#555",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "15px",
    fontSize: "0.95rem",
    color: "#333",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  actionBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    textDecoration: "none",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  cardTitle: {
    fontSize: "1.1rem",
    marginBottom: "15px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sidebarBtn: {
    display: "block",
    width: "100%",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "5px",
    textAlign: "left",
    color: "#333",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  infoText: {
    fontSize: "0.85rem",
    color: "#777",
    marginBottom: "5px",
  },
};

export default SchoolDashboard;
