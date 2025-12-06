import { useState, useEffect } from "react";
import FormationCard from "../components/FormationCard";
import Loader from "../components/Loader";
import api from "../services/api";

const Home = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await api.get("/school/list");
        setSchools(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleCardClick = (id) => {
    console.log(`Navigation vers l'école ${id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Bienvenue sur Scoolize</h1>
        <p style={styles.heroSubtitle}>
          Découvrez les établissements disponibles sur notre plateforme.
        </p>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>Liste des Écoles</h2>
        <div style={styles.grid}>
          {schools.map((school) => (
            <FormationCard
              key={school.id}
              formation={school}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
  },
  hero: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "40px 20px",
    backgroundColor: "#e9ecef",
    borderRadius: "8px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#6c757d",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#333",
    paddingLeft: "10px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
};

export default Home;
