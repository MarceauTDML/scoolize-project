import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormationCard from "../../components/FormationCard";
import Loader from "../../components/Loader";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    candidatures: 0,
    unreadMessages: 0,
    profileCompletion: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        setStats({
          candidatures: 2,
          unreadMessages: 1,
          profileCompletion: 75,
        });

        setRecommendations([
          {
            id: 101,
            title: "Bachelor Marketing Digital",
            description:
              "Devenez expert en stratégie digitale et réseaux sociaux.",
            price: 6500,
            duration: "3 ans",
            image: "https://placehold.co/600x400/ff9f43/ffffff?text=Marketing",
          },
          {
            id: 102,
            title: "Master Data Science",
            description:
              "Analysez les données pour prendre les meilleures décisions.",
            price: 8200,
            duration: "2 ans",
            image: "https://placehold.co/600x400/54a0ff/ffffff?text=Data",
          },
        ]);
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
        <h1 style={styles.welcomeTitle}>
          Bonjour, {user?.name || "Étudiant"} ! 👋
        </h1>
        <p style={styles.subtitle}>
          Voici ce qui se passe sur votre espace aujourd'hui.
        </p>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.candidatures}</div>
          <div style={styles.statLabel}>Candidatures en cours</div>
          <Link to="/student/candidatures" style={styles.link}>
            Voir détails →
          </Link>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.unreadMessages}</div>
          <div style={styles.statLabel}>Message non lu</div>
          <span style={styles.link}>Accéder au chat</span>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statValue,
              color: stats.profileCompletion < 100 ? "#e67e22" : "#2ecc71",
            }}
          >
            {stats.profileCompletion}%
          </div>
          <div style={styles.statLabel}>Profil complété</div>
          <Link to="/student/profile-ocr" style={styles.link}>
            Compléter mon dossier →
          </Link>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recommandé pour vous</h2>
          <Link to="/student/search" style={styles.viewAllBtn}>
            Voir tout le catalogue
          </Link>
        </div>

        <div style={styles.formationsGrid}>
          {recommendations.map((formation) => (
            <FormationCard
              key={formation.id}
              formation={formation}
              onClick={(id) => console.log("Click formation", id)}
            />
          ))}
        </div>
      </section>
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
  },
  welcomeTitle: {
    fontSize: "2rem",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: "5px",
  },
  statLabel: {
    color: "#555",
    marginBottom: "15px",
    fontWeight: "500",
  },
  link: {
    color: "#3498db",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  section: {
    marginTop: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: "#2c3e50",
  },
  viewAllBtn: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    border: "1px solid #007bff",
    padding: "8px 16px",
    borderRadius: "20px",
    transition: "all 0.2s",
  },
  formationsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
};

export default StudentDashboard;
