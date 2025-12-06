import { useState, useEffect } from "react";
import FormationCard from "../../components/FormationCard";
import Loader from "../../components/Loader";

const SearchFormation = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const mockData = [
          {
            id: 1,
            title: "Développeur Fullstack JS",
            category: "Informatique",
            description:
              "Maîtrisez React, Node.js et les bases de données modernes.",
            price: 5500,
            duration: "6 mois",
            image: "https://placehold.co/600x400/2c3e50/ffffff?text=Fullstack",
          },
          {
            id: 2,
            title: "Master Digital Marketing",
            category: "Marketing",
            description: "Stratégie de marque, SEO, SEA et Social Media.",
            price: 7200,
            duration: "2 ans",
            image: "https://placehold.co/600x400/e67e22/ffffff?text=Marketing",
          },
          {
            id: 3,
            title: "UX/UI Design Expert",
            category: "Design",
            description:
              "Concevez des interfaces utilisateurs intuitives et esthétiques.",
            price: 4500,
            duration: "1 an",
            image: "https://placehold.co/600x400/9b59b6/ffffff?text=Design",
          },
          {
            id: 4,
            title: "Cyber-sécurité Analyst",
            category: "Informatique",
            description:
              "Protégez les systèmes informatiques contre les attaques.",
            price: 6000,
            duration: "18 mois",
            image: "https://placehold.co/600x400/c0392b/ffffff?text=Security",
          },
          {
            id: 5,
            title: "Bachelor Commerce International",
            category: "Business",
            description:
              "Apprenez à négocier et gérer des affaires à l'échelle mondiale.",
            price: 8000,
            duration: "3 ans",
            image: "https://placehold.co/600x400/27ae60/ffffff?text=Business",
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

  const filteredFormations = formations.filter((formation) => {
    const matchesQuery = formation.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesCategory =
      category === "Tous" || formation.category === category;
    return matchesQuery && matchesCategory;
  });

  const categories = [
    "Tous",
    "Informatique",
    "Marketing",
    "Design",
    "Business",
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Trouver une formation</h2>
        <p style={styles.subtitle}>
          Explorez notre catalogue et trouvez l'école qui vous correspond.
        </p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Rechercher (ex: Marketing, Python...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.filterBtn,
                backgroundColor: category === cat ? "#007bff" : "#f1f1f1",
                color: category === cat ? "#fff" : "#333",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div style={styles.resultsInfo}>
        {filteredFormations.length} résultat(s) trouvé(s)
      </div>

      <div style={styles.grid}>
        {filteredFormations.map((formation) => (
          <FormationCard
            key={formation.id}
            formation={formation}
            onClick={(id) => console.log("Voir détails:", id)}
          />
        ))}
      </div>

      {filteredFormations.length === 0 && (
        <div style={styles.noResults}>
          <p>Aucune formation ne correspond à votre recherche.</p>
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
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "20px",
  },
  searchBox: {
    maxWidth: "600px",
    margin: "0 auto 20px auto",
  },
  searchInput: {
    width: "100%",
    padding: "15px",
    fontSize: "1.1rem",
    borderRadius: "30px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    outline: "none",
    textAlign: "center",
  },
  filters: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },
  resultsInfo: {
    marginBottom: "20px",
    color: "#666",
    fontWeight: "bold",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#777",
    fontSize: "1.2rem",
  },
};

export default SearchFormation;
