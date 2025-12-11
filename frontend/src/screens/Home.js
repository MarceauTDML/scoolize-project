import React, { useEffect, useState } from "react";
import {
  getSchools,
  getRecommendedSchools,
  toggleFavorite,
  getFavoriteIds,
} from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

// Couleurs Scoolize MISES À JOUR
const COLORS = {
  primary: "#7F54FF", // Violet principal
  primaryLight: "#9b51e0", // Gardé pour les dégradés/hover
  background: "#f4f6f6", // Fond général
  cardBackground: "#ffffff",
  textDark: "#1d1d1f",
  textMedium: "#636366",
  textLight: "#8e8e93",
  border: "#e5e5ea",
  tagBackground: "#f2f2f7", // Gris clair pour les boutons reset / tags région
  heart: "#e74c3c", // Rouge pour les favoris actifs

  // NOUVELLES COULEURS POUR LES TYPES
  PRIVATE_DARK: "#830000",   // Rouge Sombre (Texte/Bordure Privé)
  PRIVATE_LIGHT: "#FF7E4B",  // Orange Clair (Fond Badge Privé)
  PUBLIC_DARK: "#006520",    // Vert Sombre (Texte/Bordure Public)
  PUBLIC_LIGHT: "#A5FF5C",   // Vert Clair (Fond Badge Public)

  // Couleurs pour la timeline (si elle était dans Home.js)
  TIMELINE_1: "#C527FF", 
  TIMELINE_2: "#830000", 
  TIMELINE_3: "#006520", 
};

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schools, setSchools] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);
  const [favorites, setFavorites] = useState(new Set());

  const [recommendedIds, setRecommendedIds] = useState(new Set());

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
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const response = await getSchools({
          page: currentPage,
          search: currentSearch,
          city: currentCity,
          type: currentType,
        });

        let schoolsData = [];
        if (Array.isArray(response)) {
          schoolsData = response;
          setTotalPages(1);
          setTotalSchools(response.length);
        } else if (response && response.data) {
          schoolsData = response.data;
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
            setTotalSchools(
              response.pagination.totalSchools || response.data.length
            );
          }
        }

        setSchools(schoolsData || []);
        setInputPage(currentPage);

        if (
          token &&
          user.role === "student" &&
          !currentSearch &&
          !currentCity &&
          !currentType &&
          currentPage === 1
        ) {
          try {
            const recos = await getRecommendedSchools();
            if (Array.isArray(recos)) {
              const ids = new Set(recos.map((s) => s.id));
              setRecommendedIds(ids);
            }
          } catch (e) {
            console.warn("Impossible de charger les recommandations", e);
          }
        } else {
          setRecommendedIds(new Set());
        }

        if (token) {
          try {
            const favIds = await getFavoriteIds();
            setFavorites(new Set(favIds));
          } catch (err) {
            console.error("Erreur favoris", err);
          }
        }

        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Erreur chargement Home:", error);
        setSchools([]);
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

  const Timeline = () => {
    const now = new Date();
    // Les couleurs des étapes sont définies ici pour éviter d'importer COLORS.TIMELINE_X ailleurs
    const stepColors = [
        COLORS.TIMELINE_1, // Étape 1: C527FF
        COLORS.TIMELINE_2, // Étape 2: 830000
        COLORS.TIMELINE_3, // Étape 3: 006520
    ];

    const steps = [
      {
        id: 1,
        title: "Découverte",
        dates: "Oct - Jan",
        details: "Je m'informe",
        start: new Date("2025-10-01"),
        end: new Date("2026-01-18"),
      },
      {
        id: 2,
        title: "Vœux",
        dates: "Jan - Avril",
        details: "Je postule",
        start: new Date("2026-01-19"),
        end: new Date("2026-04-01"),
      },
      {
        id: 3,
        title: "Admission",
        dates: "Juin - Déc",
        details: "Je décide",
        start: new Date("2026-06-02"),
        end: new Date("2026-12-10"),
      },
    ];

    return (
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          marginBottom: "30px",
          position: "relative",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: COLORS.textDark, // Couleur du texte sombre
            textAlign: "center",
          }}
        >
          Calendrier 2026
        </h3>

        <button
          onClick={() => navigate("/calendar-details")}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: `1px solid ${COLORS.primary}`, // Couleur primaire
            color: COLORS.primary, // Couleur primaire
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          En savoir plus →
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            alignItems: "flex-start",
            marginTop: "30px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "15%",
              right: "15%",
              height: "4px",
              background: COLORS.border, // Couleur de bordure/gris clair
              zIndex: 0,
            }}
          ></div>
          {steps.map((step, index) => {
            let status = "upcoming";
            if (now >= step.start && now <= step.end) status = "current";
            else if (now > step.end) status = "completed";

            const color = stepColors[index]; // Utilise la couleur spécifique
            
            // Les couleurs de fond et de badge sont simplifiées et non dépendantes du statut dans ce style
            const bgColor = COLORS.tagBackground; 
            const badgeColor = COLORS.primary;

            return (
              <div
                key={step.id}
                style={{
                  width: "30%",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: bgColor,
                    border: `2px solid ${color}`, // Couleur de l'étape
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px auto",
                    fontWeight: "bold",
                    color: color, // Couleur de l'étape
                  }}
                >
                  {status === "completed" ? "✓" : index + 1}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: COLORS.textDark, // Couleur du texte sombre
                    fontSize: "0.9rem",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: "0.8rem", color: COLORS.textMedium }}>
                  {step.dates}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStars = (rating) => {
    if (!rating || rating <= 0) return null;
    const rounded = Math.round(rating);
    return (
      <div
        style={{
          display: "flex",
          gap: 2,
          fontSize: "0.9rem",
          color: COLORS.primary, // Nouveau violet
          alignItems: "center",
        }}
      >
        {Array.from({ length: 5 }).map((_, idx) => (
          <span key={idx}>{idx < rounded ? "★" : "☆"}</span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "40px 20px" }}> {/* Conteneur de padding */}
      <Timeline />

      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{ margin: "0 0 10px 0", fontSize: "2rem", color: COLORS.textDark }}
        >
          Trouvez votre établissement
        </h1>
        <p style={{ color: COLORS.textMedium, fontSize: "1.1rem", margin: 0 }}>
          {totalSchools} établissements disponibles
          {recommendedIds.size > 0 &&
            " (dont certains recommandés pour vous 🔥)"}
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
                border: `1px solid ${COLORS.border}`,
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
                border: `1px solid ${COLORS.border}`,
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
                border: `1px solid ${COLORS.border}`,
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
              background: COLORS.primary, // Couleur primaire
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
              background: COLORS.tagBackground, // Couleur du bouton effacer
              color: COLORS.textMedium,
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
        <div style={{ textAlign: "center", padding: "50px", color: COLORS.textMedium }}>
          <h3 style={{ color: COLORS.textDark }}>Aucun résultat trouvé</h3>
          <p>Essayez de modifier vos filtres.</p>
        </div>
      ) : (
        <div className="schools-grid">
          {schools.map((school) => {
            const isPrivate =
              school.school_type &&
              school.school_type.toLowerCase().includes("privé");
            
            // Définition des couleurs spécifiques pour le badge
            const badgeBg = isPrivate ? COLORS.PRIVATE_LIGHT : COLORS.PUBLIC_LIGHT;
            const badgeColor = isPrivate ? COLORS.PRIVATE_DARK : COLORS.PUBLIC_DARK;
            
            const isFav = favorites.has(school.id);
            const rating = parseFloat(school.average_rating) || 0;
            const isMatch = recommendedIds.has(school.id);

            return (
              <div
                key={school.id}
                className="school-card"
                onClick={() => navigate(`/school/${school.id}`)}
                style={{
                  position: "relative",
                  // Utilise la bordure si recommandé
                  border: isMatch ? `2px solid ${badgeColor}` : "none", 
                  // Utilise l'ombre si recommandé
                  boxShadow: isMatch
                    ? `0 4px 12px ${isPrivate ? 'rgba(131, 0, 0, 0.2)' : 'rgba(0, 101, 32, 0.2)'}`
                    : "0 2px 8px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {isMatch && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "15px",
                      // Fond dégradé ou couleur spécifique
                      background: badgeColor, 
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      zIndex: 5,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    Recommandé
                  </div>
                )}

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
                    color: isFav ? COLORS.heart : COLORS.textLight,
                  }}
                  title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

                <div style={{ marginRight: "40px" }}>
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      color: COLORS.textDark,
                      minHeight: "50px",
                      fontSize: "1.1rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {school.first_name}
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "15px",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {school.school_type && (
                      <span
                        style={{
                          backgroundColor: badgeBg, // Fond clair
                          color: badgeColor, // Texte foncé
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          // Ajout d'une petite bordure pour le contraste
                          border: `1px solid ${badgeColor}40`,
                        }}
                      >
                        {school.school_type}
                      </span>
                    )}
                    {school.city && (
                      <span
                        style={{
                          backgroundColor: COLORS.tagBackground, // Gris clair
                          color: COLORS.textMedium,
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {school.city}
                      </span>
                    )}
                  </div>

                  {rating > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: COLORS.tagBackground, // Fond gris clair
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        color: COLORS.primary, // Couleur primaire pour l'étoile
                        fontWeight: "bold",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <span style={{ marginRight: "4px", color: COLORS.primary }}>★</span>
                      {rating.toFixed(1)}
                    </div>
                  )}
                </div>

                <button
                  style={{
                    marginTop: "15px",
                    width: "100%",
                    padding: "10px",
                    background: COLORS.tagBackground,
                    color: COLORS.textDark,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = COLORS.border)}
                  onMouseOut={(e) => (e.target.style.background = COLORS.tagBackground)}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/school/${school.id}`);
                  }}
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
              backgroundColor: currentPage === 1 ? COLORS.border : COLORS.primary,
              color: currentPage === 1 ? COLORS.textMedium : "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            &lt;
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: COLORS.textMedium }}>Page</span>
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
                border: `1px solid ${COLORS.border}`,
              }}
            />
            <span style={{ color: COLORS.textMedium }}>/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "10px 20px",
              backgroundColor: currentPage === totalPages ? COLORS.border : COLORS.primary,
              color: currentPage === totalPages ? COLORS.textMedium : "white",
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