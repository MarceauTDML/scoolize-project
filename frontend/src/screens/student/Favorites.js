import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  toggleFavorite,
  getFavoriteIds,
} from "../../api/client";

const COLORS = {
  primary: "#6C2BD9",
  textDark: "#1d1d1f",
  textMedium: "#636366",
  background: "#f4f4f6",
  cardBackground: "#ffffff",
  border: "#e5e5ea",
  tagBackground: "#f2f2f7",
  success: "#27ae60",
  warning: "#f2994a",
  heart: "#ff4b5c",
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
        color: COLORS.primary,
        alignItems: "center",
      }}
    >
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx}>{idx < rounded ? "★" : "☆"}</span>
      ))}
    </div>
  );
};

const Favorites = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const favIds = await getFavoriteIds();
      setFavorites(new Set(favIds));

      const response = await getFavorites();
      setSchools(response.data || response);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFavorite = async (e, schoolId) => {
    e.stopPropagation();

    try {
      await toggleFavorite(schoolId);

      setSchools((prevSchools) =>
        prevSchools.filter((school) => school.id !== schoolId)
      );

      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.delete(schoolId);
        return newFavorites;
      });
    } catch (err) {
      alert("Erreur lors de la modification des favoris");
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        Chargement de vos écoles favorites...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.background,
        minHeight: "100vh",
        padding: "24px 32px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            margin: "0 0 24px 0",
            fontSize: "1.9rem",
            fontWeight: 700,
            color: COLORS.textDark,
          }}
        >
          Mes Écoles Favorites ({schools.length})
        </h1>

        {schools.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: COLORS.textMedium,
              backgroundColor: COLORS.cardBackground,
              borderRadius: 18,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                marginBottom: 8,
                fontWeight: 600,
                color: COLORS.textDark,
              }}
            >
              Vous n'avez pas encore d'écoles favorites.
            </h3>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              Cliquez sur le cœur (♡) dans les fiches d'école pour les ajouter
              ici.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {schools.map((school) => {
              const isPrivate =
                school.school_type &&
                school.school_type.toLowerCase().includes("privé");
              const rating = parseFloat(school.average_rating) || 0;
              const typeColor = isPrivate ? COLORS.warning : COLORS.success;

              return (
                <div
                  key={school.id}
                  className="school-card"
                  style={{
                    position: "relative",
                    backgroundColor: COLORS.cardBackground,
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 280,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onClick={() => navigate(`/school/${school.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 26px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 18px rgba(0,0,0,0.06)";
                  }}
                >
                  <button
                    onClick={(e) => handleToggleFavorite(e, school.id)}
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: COLORS.cardBackground,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: COLORS.heart,
                      zIndex: 10,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                    title={"Retirer des favoris"}
                  >
                    ❌
                  </button>

                  <div
                    style={{
                      width: "100%",
                      height: 140,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg,#f2f2f7 0%,#e5e5ea 100%)",
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.8rem", color: COLORS.textMedium }}
                    >
                      (Placeholder Image Etablissement)
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 4,
                      alignItems: "flex-start",
                      flexGrow: 1,
                    }}
                  >
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: COLORS.textDark,
                          lineHeight: 1.4,
                        }}
                      >
                        {school.first_name}
                      </h3>
                      {school.last_name && (
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "0.85rem",
                            color: COLORS.textMedium,
                            fontWeight: 500,
                          }}
                        >
                          {school.last_name}
                        </p>
                      )}
                    </div>

                    {school.school_type && (
                      <span
                        style={{
                          alignSelf: "flex-start",
                          padding: "4px 10px",
                          borderRadius: 999,
                          backgroundColor: typeColor,
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {school.school_type}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                      marginBottom: 16,
                    }}
                  >
                    {school.region && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 10px",
                          borderRadius: 999,
                          backgroundColor: COLORS.tagBackground,
                          color: COLORS.textMedium,
                          fontWeight: 500,
                        }}
                      >
                        {school.region}
                      </span>
                    )}
                    {rating > 0 && renderStars(rating)}
                  </div>

                  <button
                    style={{
                      marginTop: "auto",
                      padding: "10px 0",
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: COLORS.tagBackground,
                      color: COLORS.textDark,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
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
      </div>
    </div>
  );
};

export default Favorites;
