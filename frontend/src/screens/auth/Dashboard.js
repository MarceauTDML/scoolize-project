import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyApplications,
  getStudentApplications,
  updateApplicationStatus,
  getFavorites,
  toggleFavorite,
} from "../../api/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [schoolApplications, setSchoolApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    if (userData.role === "school") {
      fetchSchoolApplications();
    } else if (userData.role === "student") {
      fetchStudentApplications();
      fetchFavorites();
    }
  }, [navigate]);

  const fetchSchoolApplications = async () => {
    try {
      const data = await getMyApplications();
      setSchoolApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const data = await getStudentApplications();
      setMyApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setMyFavorites(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      fetchSchoolApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveFavorite = async (schoolId) => {
    if (window.confirm("Retirer des favoris ?")) {
      try {
        await toggleFavorite(schoolId);
        fetchFavorites();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return { color: "#28a745", label: "Admis", bg: "#d4edda" };
      case "rejected":
        return { color: "#dc3545", label: "Refusé", bg: "#f8d7da" };
      default:
        return { color: "#856404", label: "En attente", bg: "#fff3cd" };
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Bonjour, {user.first_name}</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Déconnexion
        </button>
      </div>

      {user.role === "school" && (
        <div>
          <h2>Candidatures reçues ({schoolApplications.length})</h2>

          {schoolApplications.length === 0 ? (
            <p>Aucune candidature pour le moment.</p>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {schoolApplications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    borderLeft:
                      app.status === "pending"
                        ? "5px solid #ffc107"
                        : app.status === "accepted"
                        ? "5px solid #28a745"
                        : "5px solid #dc3545",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 5px" }}>
                      {app.first_name} {app.last_name}
                    </h3>
                    <p style={{ margin: 0, color: "#666" }}>{app.email}</p>
                    <p style={{ margin: "5px 0 0", fontWeight: "bold" }}>
                      Statut :{" "}
                      {app.status === "pending"
                        ? "En attente"
                        : app.status === "accepted"
                        ? "Admis"
                        : "Refusé"}
                    </p>
                  </div>

                  {app.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleStatusChange(app.id, "accepted")}
                        style={{
                          padding: "8px 12px",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, "rejected")}
                        style={{
                          padding: "8px 12px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === "student" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Mes Candidatures ({myApplications.length})</h2>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Postuler ailleurs
            </button>
          </div>

          {myApplications.length === 0 ? (
            <p style={{ marginTop: "20px", color: "#666" }}>
              Vous n'avez pas encore postulé à une école.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
              {myApplications.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                  <div
                    key={app.id}
                    style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>
                        {app.school_name}
                      </h3>
                      <p style={{ margin: 0, color: "#666" }}>
                        {app.school_city}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0",
                          fontSize: "0.9em",
                          color: "#888",
                        }}
                      >
                        Envoyé le :{" "}
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          padding: "8px 15px",
                          borderRadius: "20px",
                          backgroundColor: badge.bg,
                          color: badge.color,
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        {badge.label}
                      </span>

                      {app.website && (
                        <div style={{ marginTop: "10px" }}>
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.85em", color: "#007bff" }}
                          >
                            Visiter le site
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <hr style={{ borderTop: "1px solid #ddd", margin: "40px 0" }} />

          <h2>Mes Écoles Favorites ({myFavorites.length})</h2>
          {myFavorites.length === 0 ? (
            <p style={{ color: "#666" }}>
              Vous n'avez ajouté aucune école en favori.
            </p>
          ) : (
            <div className="schools-grid" style={{ marginTop: "20px" }}>
              {myFavorites.map((fav) => (
                <div
                  key={fav.id}
                  className="school-card"
                  style={{ position: "relative" }}
                >
                  <button
                    onClick={() => handleRemoveFavorite(fav.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                    title="Retirer des favoris"
                  >
                    ❌
                  </button>
                  <h3 style={{ margin: "0 0 10px", minHeight: "50px" }}>
                    {fav.first_name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    <span>{fav.last_name}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/school/${fav.id}`)}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "10px",
                      background: "#e9ecef",
                      color: "#333",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#dbe2e8")}
                    onMouseOut={(e) => (e.target.style.background = "#e9ecef")}
                  >
                    Voir la fiche
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
