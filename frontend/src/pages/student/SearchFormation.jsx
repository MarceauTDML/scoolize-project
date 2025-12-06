import { useState, useEffect } from "react";
import FormationCard from "../../components/FormationCard";
import Loader from "../../components/Loader";
import api from "../../services/api";

const SearchFormation = () => {
  const [query, setQuery] = useState("");
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

  const filteredSchools = schools.filter((school) => {
    const searchLower = query.toLowerCase();
    return (
      school.name.toLowerCase().includes(searchLower) ||
      (school.city && school.city.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Trouver une école</h2>
        <p style={styles.subtitle}>Explorez les établissements disponibles.</p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Rechercher une école ou une ville..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </header>

      <div style={styles.resultsInfo}>
        {filteredSchools.length} établissement(s) trouvé(s)
      </div>

      <div style={styles.grid}>
        {filteredSchools.map((school) => (
          <FormationCard
            key={school.id}
            formation={school}
            onClick={(id) => console.log("Voir détails:", id)}
          />
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div style={styles.noResults}>
          <p>Aucune école ne correspond à votre recherche.</p>
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
