import React, { useEffect, useState } from "react";
import { getSchools, toggleFavorite, getFavoriteIds } from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schools, setSchools] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);
  const [favorites, setFavorites] = useState(new Set());

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentCity = searchParams.get("city") || "";
  const currentType = searchParams.get("type") || "";

  const [filters, setFilters] = useState({
    search: currentSearch,
    city: currentCity,
    type: currentType,
  });

  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSchools({
          page: currentPage,
          search: currentSearch,
          city: currentCity,
          type: currentType,
        });

        setSchools(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalSchools(response.pagination.totalSchools);
        setInputPage(currentPage);

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const favIds = await getFavoriteIds();
            setFavorites(new Set(favIds));
          } catch (err) {
            console.error(err);
          }
        }

        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
  }, [currentPage, currentSearch, currentCity, currentType]);

  const handleToggleFavorite = async (e, schoolId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await toggleFavorite(schoolId);
      const newFavorites = new Set(favorites);
      if (response.isFavorite) {
        newFavorites.add(schoolId);
      } else {
        newFavorites.delete(schoolId);
      }
      setFavorites(newFavorites);
    } catch (err) {
      alert("Erreur lors de la modification des favoris");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      page: 1,
      search: filters.search,
      city: filters.city,
      type: filters.type,
    });
  };

  const handleReset = () => {
    setFilters({ search: "", city: "", type: "" });
    setSearchParams({ page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({
        page: newPage,
        search: currentSearch,
        city: currentCity,
        type: currentType,
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#2c3e50" }}
        >
          Trouvez votre établissement
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem", margin: 0 }}>
          {totalSchools} établissements disponibles
        </p>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginBottom: "30px",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
        >
          <div style={{ flex: 2, minWidth: "200px" }}>
            <input
              type="text"
              name="search"
              placeholder="Nom de l'école (ex: Sorbonne, Lycée...)"
              value={filters.search}
              onChange={handleFilterChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <input
              type="text"
              name="city"
              placeholder="Ville (ex: Lyon)"
              value={filters.city}
              onChange={handleFilterChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #ddd",
                background: "white",
              }}
            >
              <option value="">Tous les types</option>
              <option value="Public">Public</option>
              <option value="Privé">Privé</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "12px 25px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "12px 15px",
              background: "#e9ecef",
              color: "#666",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Effacer
          </button>
        </form>
      </div>

      {schools.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          <h3>Aucun résultat trouvé</h3>
          <p>Essayez de modifier vos filtres.</p>
        </div>
      ) : (
        <div className="schools-grid">
          {schools.map((school) => {
            const isPrivate =
              school.school_type &&
              school.school_type.toLowerCase().includes("privé");
            const badgeColor = isPrivate ? "#ffc107" : "#17a2b8";
            const isFav = favorites.has(school.id);

            return (
              <div
                key={school.id}
                className="school-card"
                style={{ position: "relative" }}
              >
                <button
                  onClick={(e) => handleToggleFavorite(e, school.id)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    zIndex: 10,
                    color: isFav ? "#e74c3c" : "#ccc",
                  }}
                  title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#333",
                    minHeight: "50px",
                    fontSize: "1.1rem",
                    paddingRight: "30px",
                  }}
                >
                  {school.first_name}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "15px",
                  }}
                >
                  {school.school_type && (
                    <span
                      style={{
                        backgroundColor: badgeColor,
                        color: isPrivate ? "#333" : "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {school.school_type}
                    </span>
                  )}
                  {school.region && (
                    <span
                      style={{
                        backgroundColor: "#e9ecef",
                        color: "#495057",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {school.region}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#666",
                    marginBottom: "5px",
                    fontSize: "0.95rem",
                  }}
                >
                  <span>{school.last_name}</span>
                </div>

                <button
                  style={{
                    marginTop: "15px",
                    width: "100%",
                    padding: "10px",
                    background: "#e9ecef",
                    color: "#333",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#dbe2e8")}
                  onMouseOut={(e) => (e.target.style.background = "#e9ecef")}
                  onClick={() => navigate(`/school/${school.id}`)}
                >
                  Voir la fiche
                </button>
              </div>
            );
          })}
        </div>
      )}

      {schools.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "40px",
            gap: "15px",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "10px 20px",
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            &lt;
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>Page</span>
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={() => handlePageChange(parseInt(inputPage))}
              onKeyDown={(e) =>
                e.key === "Enter" && handlePageChange(parseInt(inputPage))
              }
              min="1"
              max={totalPages}
              style={{
                width: "50px",
                padding: "8px",
                textAlign: "center",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <span style={{ color: "#666" }}>/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "10px 20px",
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;