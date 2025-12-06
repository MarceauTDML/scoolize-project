import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/Loader";
import api from "../../services/api";

const FormationDetails = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/school/${id}`);
        setSchool(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!school)
    return <div style={styles.error}>Établissement introuvable.</div>;

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.hero,
          backgroundImage: `url(${
            school.image_url ||
            "https://via.placeholder.com/1200x400?text=Ecole"
          })`,
        }}
      >
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>{school.name}</h1>
          <p style={styles.heroSchool}>{school.city}</p>
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
              style={activeTab === "contact" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("contact")}
            >
              Contact & Infos
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === "overview" && (
              <div>
                <h3 style={styles.subTitle}>À propos de l'établissement</h3>
                <p style={styles.text}>
                  {school.description ||
                    "Aucune description disponible pour cet établissement."}
                </p>
              </div>
            )}

            {activeTab === "contact" && (
              <div>
                <h3 style={styles.subTitle}>Coordonnées</h3>
                <ul style={styles.infoList}>
                  {school.address && (
                    <li style={styles.infoItem}>
                      <strong>Adresse :</strong> {school.address},{" "}
                      {school.zip_code} {school.city}
                    </li>
                  )}
                  {school.website_url && (
                    <li style={styles.infoItem}>
                      <strong>Site web :</strong>{" "}
                      <a
                        href={school.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {school.website_url}
                      </a>
                    </li>
                  )}
                  {school.contact_email && (
                    <li style={styles.infoItem}>
                      <strong>Email :</strong> {school.contact_email}
                    </li>
                  )}
                  {school.phone && (
                    <li style={styles.infoItem}>
                      <strong>Téléphone :</strong> {school.phone}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.stickyCard}>
            <h3 style={styles.cardTitle}>Informations Clés</h3>
            <div style={styles.infoRow}>
              <span>📍 Ville :</span>
              <strong>{school.city}</strong>
            </div>

            <div style={styles.separator}></div>

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
  infoList: {
    listStyle: "none",
    padding: 0,
  },
  infoItem: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    color: "#555",
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
