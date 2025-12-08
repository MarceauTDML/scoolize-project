import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSchoolById, applyToSchool, toggleFavorite, getFavoriteIds } from "../api/client";

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getSchoolById(id);
        setSchool(data);

        const token = localStorage.getItem("token");
        if (token) {
          const ids = await getFavoriteIds();
          if (ids.includes(parseInt(id))) {
            setIsFavorite(true);
          }
        }
      } catch (err) {
        setError("Impossible de charger les infos de l'école.");
      }
    };
    fetchDetails();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (
        window.confirm(
          "Vous devez être connecté pour postuler. Voulez-vous vous connecter ?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    if (
      window.confirm(
        `Voulez-vous vraiment envoyer votre dossier à ${school.first_name} ?`
      )
    ) {
      try {
        await applyToSchool(school.id);
        alert(
          "Candidature envoyée avec succès ! Retrouvez-la dans votre Dashboard."
        );
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await toggleFavorite(id);
      setIsFavorite(response.isFavorite);
    } catch (err) {
      alert("Erreur lors de la modification des favoris");
    }
  };

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        {error}
      </div>
    );
  if (!school)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Chargement des informations...
      </div>
    );

  const isPrivate =
    school.school_type && school.school_type.toLowerCase().includes("privé");
  const badgeColor = isPrivate ? "#ffc107" : "#17a2b8";

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ← Retour à la liste
      </button>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        <button
          onClick={handleToggleFavorite}
          style={{
            position: "absolute",
            top: "30px",
            right: "30px",
            fontSize: "2rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isFavorite ? "#e74c3c" : "#ccc",
            zIndex: 10,
          }}
          title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>

        <h1 style={{ color: "#007bff", marginTop: 0, marginBottom: "10px" }}>
          {school.first_name}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#555", fontWeight: "normal", margin: 0 }}>
            {school.last_name}
          </h3>

          {school.school_type && (
            <span
              style={{
                backgroundColor: badgeColor,
                color: isPrivate ? "#333" : "white",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {school.school_type}
            </span>
          )}

          {school.region && (
            <span style={{ color: "#888", fontStyle: "italic" }}>
              ({school.region})
            </span>
          )}
        </div>

        <hr
          style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }}
        />

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px" }}>À propos</h4>
          <p style={{ lineHeight: "1.6", color: "#444" }}>
            {school.description ||
              "Aucune description disponible pour le moment."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "30px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <div>
            <strong>Adresse :</strong>
            <p style={{ margin: "5px 0 0", color: "#666" }}>
              {school.address || "Non renseignée"}
            </p>
            {school.department && (
              <p
                style={{ margin: "2px 0 0", fontSize: "0.9em", color: "#888" }}
              >
                Département : {school.department}
              </p>
            )}
          </div>
          <div>
            <strong>Contact :</strong>
            <p style={{ margin: "5px 0 0", color: "#666" }}>{school.email}</p>
            <p style={{ margin: "5px 0 0", color: "#666" }}>
              {school.phone || "Non renseigné"}
            </p>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <strong>Site Web :</strong>
            <p style={{ margin: "5px 0 0" }}>
              {school.website ? (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#007bff", fontWeight: "bold" }}
                >
                  {school.website}
                </a>
              ) : (
                "Non renseigné"
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleApply}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "30px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
        >
          Postuler à cette école
        </button>
      </div>
    </div>
  );
};

export default SchoolDetails;