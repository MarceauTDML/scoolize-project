import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyApplications,
  getStudentApplications,
  updateApplicationStatus,
  getFavorites,
  toggleFavorite,
  createNews,
  deleteNews,
  getSchoolNews,
  getEventRegistrations,
  updateEventRegistration,
  getMyEventRegistrations,
} from "../../api/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [schoolApplications, setSchoolApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    type: "news",
    event_date: "",
    capacity: "",
  });

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);

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
      fetchMyNews(userData.id);
    } else if (userData.role === "student") {
      fetchStudentApplications();
      fetchFavorites();
      fetchMyEvents();
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

  const fetchMyEvents = async () => {
    try {
      const data = await getMyEventRegistrations();
      setMyEvents(data);
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

  const fetchMyNews = async (schoolId) => {
    try {
      const data = await getSchoolNews(schoolId);
      setNewsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNews(newsForm);
      setNewsForm({
        title: "",
        content: "",
        type: "news",
        event_date: "",
        capacity: "",
      });
      fetchMyNews(user.id);
      alert("Publié !");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm("Supprimer cette actualité ?")) {
      try {
        await deleteNews(id);
        fetchMyNews(user.id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleViewRegistrations = async (eventId) => {
    setSelectedEventId(eventId);
    try {
      const regs = await getEventRegistrations(eventId);
      setEventRegistrations(regs);
    } catch (e) {
      alert("Impossible de charger les inscrits");
    }
  };

  const handleRegistrationStatus = async (regId, status) => {
    try {
      await updateEventRegistration(regId, status);
      const regs = await getEventRegistrations(selectedEventId);
      setEventRegistrations(regs);
    } catch (e) {
      alert(e.message);
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

  const acceptedEvents = myEvents.filter((e) => e.status === "accepted");

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
          <div style={{ marginBottom: "40px" }}>
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
                      padding: "15px",
                      borderRadius: "10px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      borderLeft: "5px solid #007bff",
                    }}
                  >
                    <strong>
                      {app.first_name} {app.last_name}
                    </strong>{" "}
                    ({app.email}) - {app.status}
                    {app.status === "pending" && (
                      <div style={{ marginTop: "5px" }}>
                        <button
                          onClick={() => handleStatusChange(app.id, "accepted")}
                          style={{
                            marginRight: "5px",
                            background: "green",
                            color: "white",
                            border: "none",
                            padding: "5px",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "rejected")}
                          style={{
                            background: "red",
                            color: "white",
                            border: "none",
                            padding: "5px",
                            borderRadius: "3px",
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

          <hr style={{ borderTop: "1px solid #ddd", margin: "40px 0" }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Publier une Info ou JPO</h3>
              <form
                onSubmit={handleNewsSubmit}
                style={{ display: "grid", gap: "15px" }}
              >
                <select
                  value={newsForm.type}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, type: e.target.value })
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                    background: "white",
                  }}
                >
                  <option value="news">Actualité classique</option>
                  <option value="jpo">📅 Événement / JPO</option>
                </select>

                <input
                  type="text"
                  placeholder="Titre"
                  value={newsForm.title}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, title: e.target.value })
                  }
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />

                <textarea
                  placeholder="Description..."
                  value={newsForm.content}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, content: e.target.value })
                  }
                  required
                  rows="4"
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                />

                {newsForm.type === "jpo" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.8em", color: "#666" }}>
                        Date de l'événement
                      </label>
                      <input
                        type="datetime-local"
                        value={newsForm.event_date}
                        onChange={(e) =>
                          setNewsForm({
                            ...newsForm,
                            event_date: e.target.value,
                          })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.8em", color: "#666" }}>
                        Capacité Max (optionnel)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 50"
                        value={newsForm.capacity}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, capacity: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    padding: "10px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Publier
                </button>
              </form>
            </div>

            <div>
              <h3>Mes Publications ({newsList.length})</h3>
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                {newsList.map((news) => (
                  <div
                    key={news.id}
                    style={{
                      background: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      borderLeft:
                        news.type === "jpo"
                          ? "5px solid #ffc107"
                          : "5px solid #17a2b8",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong
                        style={{
                          color:
                            news.type === "jpo" ? "#e0a800" : "#17a2b8",
                        }}
                      >
                        {news.type === "jpo" ? "📅 JPO" : "📰 NEWS"} :{" "}
                        {news.title}
                      </strong>
                      <button
                        onClick={() => handleDeleteNews(news.id)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        margin: "5px 0",
                      }}
                    >
                      {news.content}
                    </p>

                    {news.type === "jpo" && (
                      <div
                        style={{
                          marginTop: "10px",
                          background: "#fff3cd",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <small>
                          Le :{" "}
                          {news.event_date
                            ? new Date(news.event_date).toLocaleString()
                            : "Date non définie"}
                        </small>
                        <br />
                        <small>
                          Inscrits : <strong>{news.registered_count}</strong>{" "}
                          {news.capacity ? `/ ${news.capacity}` : ""}
                        </small>
                        <button
                          onClick={() => handleViewRegistrations(news.id)}
                          style={{
                            display: "block",
                            marginTop: "5px",
                            padding: "5px 10px",
                            background: "#333",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "0.8em",
                          }}
                        >
                          Gérer les inscrits
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedEventId && (
            <div
              style={{
                marginTop: "40px",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #333",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3>Inscrits à l'événement</h3>
                <button onClick={() => setSelectedEventId(null)}>
                  Fermer
                </button>
              </div>
              {eventRegistrations.length === 0 ? (
                <p>Aucun inscrit pour le moment.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "10px 0" }}>
                          {reg.first_name} {reg.last_name}
                        </td>
                        <td>{reg.email}</td>
                        <td>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background:
                                reg.status === "accepted"
                                  ? "#d4edda"
                                  : reg.status === "rejected"
                                  ? "#f8d7da"
                                  : "#fff3cd",
                              color:
                                reg.status === "accepted"
                                  ? "green"
                                  : reg.status === "rejected"
                                  ? "red"
                                  : "#856404",
                            }}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          {reg.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleRegistrationStatus(
                                    reg.id,
                                    "accepted"
                                  )
                                }
                                style={{
                                  marginRight: "5px",
                                  cursor: "pointer",
                                }}
                              >
                                ✅
                              </button>
                              <button
                                onClick={() =>
                                  handleRegistrationStatus(
                                    reg.id,
                                    "rejected"
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {user.role === "student" && (
        <div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', border: '1px solid #90caf9' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>📂 Mon Dossier</h3>
                  <button onClick={() => navigate('/student-profile')} style={{ padding: '10px', width:'100%', background: '#0d47a1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Gérer mon profil</button>
              </div>

              <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', border: '1px solid #a5d6a7' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1b5e20' }}>📝 Mes Notes</h3>
                  <button onClick={() => navigate('/student-grades')} style={{ padding: '10px', width:'100%', background: '#1b5e20', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Importer mes bulletins</button>
              </div>
          </div>

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

          <div style={{ marginBottom: "40px" }}>
            <h2>
              Mes Événements & JPO confirmés ({acceptedEvents.length})
            </h2>

            {acceptedEvents.length === 0 ? (
              <p style={{ color: "#666" }}>
                Vous n'avez aucune inscription confirmée pour le moment.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                {acceptedEvents.map((evt) => (
                  <div
                    key={evt.registration_id}
                    style={{
                      background: "#fff8e1",
                      padding: "20px",
                      borderRadius: "10px",
                      borderLeft: "5px solid #ffc107",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px", color: "#d39e00" }}>
                        {evt.title}
                      </h3>
                      <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>
                        {new Date(evt.event_date).toLocaleString()}
                      </p>
                      <p style={{ margin: 0, color: "#555" }}>
                        {evt.school_name} ({evt.school_city})
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/school/${evt.school_id}`)}
                      style={{
                        padding: "10px 15px",
                        background: "white",
                        border: "1px solid #d39e00",
                        color: "#d39e00",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Voir l'école
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderTop: "1px solid #ddd", margin: "40px 0" }} />

          <h2>Mes Écoles Favorites ({myFavorites.length}) ❤️</h2>
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
                    <span style={{ marginRight: "8px" }}>📍</span>
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
                    onMouseOver={(e) =>
                      (e.target.style.background = "#dbe2e8")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.background = "#e9ecef")
                    }
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