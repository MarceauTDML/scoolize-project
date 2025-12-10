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
  getGradesByStudent,
  getSchoolQuestions,
  addSchoolQuestion,
  deleteSchoolQuestion,
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

  const [showGradesModal, setShowGradesModal] = useState(false);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState([]);
  const [gradesTab, setGradesTab] = useState("premiere");

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedAppDetails, setSelectedAppDetails] = useState(null);

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
      fetchMyQuestions(userData.id);
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

  const fetchMyNews = async (schoolId) => {
    try {
      const data = await getSchoolNews(schoolId);
      setNewsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyQuestions = async (schoolId) => {
    try {
      const data = await getSchoolQuestions(schoolId);
      setQuestions(data);
    } catch (e) {
      console.error("Erreur questions", e);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addSchoolQuestion(newQuestion);
      setNewQuestion("");
      fetchMyQuestions(user.id);
    } catch (e) {
      alert("Erreur ajout question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (
      window.confirm(
        "Supprimer cette question ? Cela supprimera aussi les réponses associées."
      )
    ) {
      try {
        await deleteSchoolQuestion(id);
        fetchMyQuestions(user.id);
      } catch (e) {
        alert("Erreur suppression");
      }
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

  const handleViewStudentFolder = async (studentId) => {
    try {
      const grades = await getGradesByStudent(studentId);
      setSelectedStudentGrades(grades);
      setShowGradesModal(true);
      setGradesTab("premiere");
    } catch (err) {
      alert("Impossible de charger le dossier scolaire de cet élève.");
    }
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

  const formatContext = (ctx) => {
    const map = {
      premiere_t1: "Trimestre 1",
      premiere_t2: "Trimestre 2",
      premiere_t3: "Trimestre 3",
      premiere_s1: "Semestre 1",
      premiere_s2: "Semestre 2",
      terminale_t1: "Trimestre 1",
      terminale_t2: "Trimestre 2",
      terminale_t3: "Trimestre 3",
      terminale_s1: "Semestre 1",
      terminale_s2: "Semestre 2",
      bac_francais: "Épreuves Anticipées",
      bac_final: "Épreuves Terminales",
    };
    return map[ctx] || ctx;
  };

  const getGradesForTab = (tab) => {
    if (!selectedStudentGrades) return [];
    return selectedStudentGrades.filter((g) => g.context.startsWith(tab));
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
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              marginBottom: "40px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Configuration du Questionnaire de Candidature
            </h3>
            <p style={{ color: "#666", fontSize: "0.9em" }}>
              Définissez ici les questions auxquelles les étudiants devront
              répondre pour postuler dans votre école.
            </p>

            <ul style={{ listStyle: "none", padding: 0 }}>
              {questions.map((q) => (
                <li
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    alignItems: "center",
                  }}
                >
                  <span>{q.question_text}</span>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    style={{
                      color: "red",
                      border: "1px solid red",
                      background: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                      padding: "2px 8px",
                    }}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>

            <form
              onSubmit={handleAddQuestion}
              style={{ display: "flex", marginTop: "15px", gap: "10px" }}
            >
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ex: Pourquoi avez-vous choisi notre spécialité ?"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Ajouter une question
              </button>
            </form>
          </div>

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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "1.1rem" }}>
                          {app.first_name} {app.last_name}
                        </strong>
                        <p style={{ margin: "5px 0", color: "#666" }}>
                          {app.email}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "bold",
                            color:
                              app.status === "pending"
                                ? "#e0a800"
                                : app.status === "accepted"
                                ? "green"
                                : "red",
                          }}
                        >
                          Statut : {app.status}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        {/* BOUTON VOIR DOSSIER SCOLAIRE (EXISTANT) */}
                        <button
                          onClick={() =>
                            handleViewStudentFolder(app.student_id || app.id)
                          }
                          style={{
                            padding: "8px 15px",
                            background: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Voir Notes (Bulletins)
                        </button>

                        {/* BOUTON VOIR CANDIDATURE (NOUVEAU) */}
                        <button
                          onClick={() => setSelectedAppDetails(app)}
                          style={{
                            padding: "8px 15px",
                            background: "#6f42c1",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Voir Motivation & Réponses
                        </button>
                      </div>
                    </div>

                    {app.status === "pending" && (
                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "10px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <button
                          onClick={() => handleStatusChange(app.id, "accepted")}
                          style={{
                            marginRight: "10px",
                            background: "green",
                            color: "white",
                            border: "none",
                            padding: "8px 15px",
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
                            padding: "8px 15px",
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
                  <option value="jpo">Événement / JPO</option>
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
                        Date
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
                        Capacité
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
                          color: news.type === "jpo" ? "#e0a800" : "#17a2b8",
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
                        Supprimer
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
                          Inscrits : <strong>{news.registered_count}</strong>
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
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  width: "600px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h3>Inscrits</h3>
                  <button
                    onClick={() => setSelectedEventId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    Fermer
                  </button>
                </div>
                {eventRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px 0",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {reg.first_name} {reg.last_name} ({reg.email})
                    </span>
                    <div>
                      <strong style={{ marginRight: "10px" }}>
                        {reg.status}
                      </strong>
                      {reg.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleRegistrationStatus(reg.id, "accepted")
                            }
                            style={{ marginRight: "5px" }}
                          >
                            ✅
                          </button>
                          <button
                            onClick={() =>
                              handleRegistrationStatus(reg.id, "rejected")
                            }
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showGradesModal && selectedStudentGrades && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "10px",
                  width: "800px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "10px",
                  }}
                >
                  <h2 style={{ margin: 0, color: "#007bff" }}>
                    Dossier Scolaire
                  </h2>
                  <button
                    onClick={() => setShowGradesModal(false)}
                    style={{
                      cursor: "pointer",
                      padding: "8px 15px",
                      border: "none",
                      background: "#dc3545",
                      color: "white",
                      borderRadius: "5px",
                    }}
                  >
                    Fermer
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    marginBottom: "20px",
                    borderBottom: "2px solid #eee",
                  }}
                >
                  <button
                    onClick={() => setGradesTab("premiere")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background:
                        gradesTab === "premiere" ? "#e3f2fd" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Première
                  </button>
                  <button
                    onClick={() => setGradesTab("terminale")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background:
                        gradesTab === "terminale" ? "#e3f2fd" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Terminale
                  </button>
                  <button
                    onClick={() => setGradesTab("bac")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background:
                        gradesTab === "bac" ? "#e3f2fd" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    BAC
                  </button>
                </div>

                {getGradesForTab(gradesTab).length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    Aucune note disponible pour cette année.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                        <th
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          Contexte
                        </th>
                        <th
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          Matière
                        </th>
                        <th
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getGradesForTab(gradesTab).map((grade, idx) => (
                        <tr key={idx}>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              color: "#666",
                            }}
                          >
                            {formatContext(grade.context)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              fontWeight: grade.is_specialty
                                ? "bold"
                                : "normal",
                            }}
                          >
                            {grade.subject}{" "}
                            {grade.is_specialty && (
                              <span
                                style={{ fontSize: "0.8em", color: "#28a745" }}
                              >
                                (Spé)
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              fontWeight: "bold",
                              color: "#007bff",
                            }}
                          >
                            {grade.grade}/20
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {selectedAppDetails && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1100,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "10px",
                  maxWidth: "700px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <h2 style={{ marginTop: 0, color: "#007bff" }}>
                  Détail de la candidature
                </h2>
                <h3>
                  {selectedAppDetails.first_name} {selectedAppDetails.last_name}
                </h3>

                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Lettre de motivation</h4>
                  <p style={{ whiteSpace: "pre-wrap", color: "#333" }}>
                    {selectedAppDetails.motivation_letter ||
                      "Aucune lettre fournie."}
                  </p>
                </div>

                <h4>Réponses au questionnaire</h4>
                {selectedAppDetails.questionnaire_answers &&
                selectedAppDetails.questionnaire_answers.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {selectedAppDetails.questionnaire_answers.map((qa, idx) => (
                      <li key={idx} style={{ marginBottom: "15px" }}>
                        <div
                          style={{ fontWeight: "bold", marginBottom: "5px" }}
                        >
                          {qa.question_text}
                        </div>
                        <div
                          style={{
                            background: "#e9ecef",
                            padding: "10px",
                            borderRadius: "5px",
                          }}
                        >
                          {qa.answer_text}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#666" }}>
                    Aucune réponse au questionnaire.
                  </p>
                )}

                <button
                  onClick={() => setSelectedAppDetails(null)}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {user.role === "student" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "#e3f2fd",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #90caf9",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#0d47a1" }}>
                Mon Dossier
              </h3>
              <button
                onClick={() => navigate("/student-profile")}
                style={{
                  padding: "10px",
                  width: "100%",
                  background: "#0d47a1",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Gérer mon profil
              </button>
            </div>

            <div
              style={{
                background: "#e8f5e9",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #a5d6a7",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#1b5e20" }}>
                Mes Notes
              </h3>
              <button
                onClick={() => navigate("/student-grades")}
                style={{
                  padding: "10px",
                  width: "100%",
                  background: "#1b5e20",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Importer mes bulletins
              </button>
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
            <h2>Mes Événements & JPO confirmés ({acceptedEvents.length})</h2>

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
