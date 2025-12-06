import { useState, useEffect } from "react";
import FormationCard from "../components/FormationCard";
import Loader from "../components/Loader";

const Home = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData = [
          {
            id: 1,
            title: "Introduction à React",
            description:
              "Apprenez les fondamentaux de React, les composants et le state.",
            price: 49.99,
            duration: "10h",
            image: "https://placehold.co/600x400/007bff/ffffff?text=React",
          },
          {
            id: 2,
            title: "Maîtriser Node.js",
            description: "Créez des API performantes avec Node.js et Express.",
            price: 79.99,
            duration: "15h",
            image: "https://placehold.co/600x400/28a745/ffffff?text=Node.js",
          },
          {
            id: 3,
            title: "CSS Avancé & Flexbox",
            description: "Rendez vos sites web responsives et modernes.",
            price: 39.99,
            duration: "8h",
            image: "https://placehold.co/600x400/dc3545/ffffff?text=CSS",
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

  const handleCardClick = (id) => {
    console.log(`Navigation vers la formation ${id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Bienvenue sur notre plateforme e-learning
        </h1>
        <p style={styles.heroSubtitle}>
          Développez vos compétences avec nos meilleurs cours.
        </p>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>Nos Formations Récentes</h2>
        <div style={styles.grid}>
          {formations.map((formation) => (
            <FormationCard
              key={formation.id}
              formation={formation}
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
