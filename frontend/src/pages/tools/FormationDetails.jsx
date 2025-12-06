import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/Loader";

const FormationDetails = () => {
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData = {
          id: id,
          title: "Master Data Science & IA",
          school: "Tech Institute Paris",
          price: 8500,
          duration: "2 ans",
          location: "Paris (75)",
          description:
            "Devenez un expert de la donnée. Ce master forme aux technologies de pointe en Big Data, Machine Learning et Intelligence Artificielle. Vous apprendrez à collecter, traiter et valoriser les données pour aider les entreprises à prendre des décisions stratégiques.",
          program: [
            "Semestre 1 : Bases de données SQL/NoSQL & Python",
            "Semestre 2 : Machine Learning & Statistiques avancées",
            "Semestre 3 : Deep Learning, NLP & Computer Vision",
            "Semestre 4 : Projet de fin d'études & Stage (6 mois)",
          ],
          stats: {
            employmentRate: 95,
            avgSalary: 42000,
            satisfaction: 4.8,
          },
          reviews: [
            {
              user: "Thomas A.",
              rating: 5,
              text: "Excellente formation, profs très compétents.",
            },
            {
              user: "Sarah L.",
              rating: 4,
              text: "Rythme intense mais ça vaut le coup.",
            },
            {
              user: "Karim B.",
              rating: 5,
              text: "J'ai trouvé un CDI avant même la fin du stage.",
            },
          ],
          image:
            "https://placehold.co/1200x400/007bff/ffffff?text=Data+Science",
        };

        setFormation(mockData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!formation) return <div style={styles.error}>Formation introuvable.</div>;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.hero, backgroundImage: `url(${formation.image})` }}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>{formation.title}</h1>
          <p style={styles.heroSchool}>{formation.school}</p>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.mainColumn}>
          <div style={styles.tabs}>
            <button
              style={activeTab === "overview" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("overview")}
            >
              Présentation
            </button>
            <button
              style={activeTab === "program" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("program")}
            >
              Programme
            </button>
            <button
              style={activeTab === "reviews" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("reviews")}
            >
              Avis ({formation.reviews.length})
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === "overview" && (
              <div>
                <h3 style={styles.subTitle}>À propos de la formation</h3>
                <p style={styles.text}>{formation.description}</p>

                <h3 style={styles.subTitle}>Chiffres Clés</h3>
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <span style={styles.statNumber}>
                      {formation.stats.employmentRate}%
                    </span>
                    <span style={styles.statLabel}>Taux d'emploi (6 mois)</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statNumber}>
                      {formation.stats.avgSalary} €
                    </span>
                    <span style={styles.statLabel}>Salaire moyen sortie</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statNumber}>
                      ⭐ {formation.stats.satisfaction}/5
                    </span>
                    <span style={styles.statLabel}>Satisfaction anciens</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "program" && (
              <div>
                <h3 style={styles.subTitle}>Le cursus détaillé</h3>
                <ul style={styles.programList}>
                  {formation.program.map((item, index) => (
                    <li key={index} style={styles.programItem}>
                      <span style={styles.checkIcon}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 style={styles.subTitle}>Ce qu'en pensent les étudiants</h3>
                <div style={styles.reviewsList}>
                  {formation.reviews.map((review, index) => (
                    <div key={index} style={styles.reviewCard}>
                      <div style={styles.reviewHeader}>
                        <strong>{review.user}</strong>
                        <span style={styles.stars}>
                          {"★".repeat(review.rating)}
                        </span>
                      </div>
                      <p style={styles.reviewText}>"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.stickyCard}>
            <h3 style={styles.cardTitle}>Informations Pratiques</h3>
            <div style={styles.infoRow}>
              <span>📍 Lieu :</span>
              <strong>{formation.location}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>⏱ Durée :</span>
              <strong>{formation.duration}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>💰 Frais :</span>
              <strong>{formation.price} € / an</strong>
            </div>

            <div style={styles.separator}></div>

            <button style={styles.applyBtn}>Candidater maintenant</button>
            <button style={styles.favBtn}>❤️ Ajouter aux favoris</button>

            <div style={styles.helpText}>
              Besoin d'aide ? <Link to="/contact">Contacter l'école</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  container: {
    paddingBottom: "40px",
  },
  hero: {
    height: "300px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
  },
  heroOverlay: {
    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
    width: "100%",
    padding: "30px 20px",
    color: "#fff",
  },
  heroTitle: {
    fontSize: "2.5rem",
    margin: 0,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  heroSchool: {
    fontSize: "1.2rem",
    opacity: 0.9,
    margin: "5px 0 0 0",
  },
  contentWrapper: {
    display: "flex",
    flexWrap: "wrap",
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "0 20px",
    gap: "40px",
  },
  mainColumn: {
    flex: 2,
    minWidth: "300px",
  },
  sidebar: {
    flex: 1,
    minWidth: "280px",
  },
  tabs: {
    display: "flex",
    borderBottom: "2px solid #eee",
    marginBottom: "30px",
  },
  tab: {
    padding: "15px 25px",
    border: "none",
    background: "none",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#666",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
  },
  activeTab: {
    padding: "15px 25px",
    border: "none",
    background: "none",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#007bff",
    fontWeight: "bold",
    borderBottom: "3px solid #007bff",
    marginBottom: "-2px",
  },
  subTitle: {
    color: "#2c3e50",
    marginBottom: "15px",
    fontSize: "1.4rem",
  },
  text: {
    lineHeight: "1.6",
    color: "#444",
    marginBottom: "30px",
  },
  statsGrid: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid #e9ecef",
  },
  statNumber: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  programList: {
    listStyle: "none",
    padding: 0,
  },
  programItem: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
  },
  checkIcon: {
    color: "#28a745",
    marginRight: "10px",
    fontWeight: "bold",
  },
  reviewCard: {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  stars: {
    color: "#ffc107",
  },
  reviewText: {
    fontStyle: "italic",
    color: "#555",
    margin: 0,
  },
  stickyCard: {
    position: "sticky",
    top: "20px",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#333",
    textAlign: "center",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    borderBottom: "1px dashed #eee",
    paddingBottom: "10px",
  },
  separator: {
    height: "1px",
    backgroundColor: "#ddd",
    margin: "20px 0",
  },
  applyBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "10px",
  },
  favBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#fff",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  helpText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "0.9rem",
    color: "#777",
  },
  error: {
    textAlign: "center",
    padding: "50px",
    color: "#dc3545",
    fontSize: "1.2rem",
  },
};

export default FormationDetails;
