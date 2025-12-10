import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSchoolById,
  applyToSchool,
  toggleFavorite,
  getFavoriteIds,
  getSchoolNews,
  registerForEvent,
  checkMyEventRegistrations,
  getSchoolReviews,
  checkCanReview,
  createReview,
  getSchoolQuestions,
} from "../api/client";

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [schoolQuestions, setSchoolQuestions] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    motivation: "",
    answers: {},
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getSchoolById(id);
        setSchool(data);

        try {
          const questionsData = await getSchoolQuestions(id);
          setSchoolQuestions(questionsData);
        } catch (e) {
          console.error("Erreur chargement questions", e);
        }

        try {
          const newsData = await getSchoolNews(id);
          setNews(newsData);
        } catch (e) {
          console.error("Erreur news", e);
        }

        try {
          const reviewData = await getSchoolReviews(id);
          setReviews(reviewData.reviews);
          setAverageRating(reviewData.average);
        } catch (e) {
          console.error("Erreur reviews", e);
        }

        const token = localStorage.getItem("token");
        if (token) {
          const ids = await getFavoriteIds();
          if (ids.includes(parseInt(id))) {
            setIsFavorite(true);
          }

          try {
            const myRegs = await checkMyEventRegistrations();
            setMyRegistrations(myRegs);
          } catch (e) {
            console.error(e);
          }

          try {
            const check = await checkCanReview(id);
            setCanReview(check.canReview);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        setError("Impossible de charger les infos de l'école.");
      }
    };
    fetchDetails();
  }, [id]);

  const handleOpenApply = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (
        window.confirm("Vous devez être connecté pour postuler. Se connecter ?")
      ) {
        navigate("/login");
      }
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();

    if (
      !window.confirm(`Confirmer l'envoi du dossier à ${school.first_name} ?`)
    ) {
      return;
    }

    try {
      const formattedAnswers = Object.entries(applicationForm.answers).map(
        ([qId, text]) => ({
          question_id: parseInt(qId),
          answer_text: text,
        })
      );

      await applyToSchool(
        school.id,
        applicationForm.motivation,
        formattedAnswers
      );

      alert(
        "Candidature envoyée avec succès ! Retrouvez-la dans votre Dashboard."
      );
      setShowApplyModal(false);
      setApplicationForm({ motivation: "", answers: {} });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la candidature"
      );
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

  const handleEventRegister = async (eventId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (window.confirm("S'inscrire à cet événement ?")) {
      try {
        await registerForEvent(eventId);
        alert("Inscription demandée !");
        setMyRegistrations([
          ...myRegistrations,
          { event_id: eventId, status: "pending" },
        ]);
        const newsData = await getSchoolNews(id);
        setNews(newsData);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({ school_id: id, ...reviewForm });
      alert("Merci ! Votre avis a été publié anonymement.");

      setCanReview(false);

      const reviewData = await getSchoolReviews(id);
      setReviews(reviewData.reviews);
      setAverageRating(reviewData.average);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(Math.round(rating));
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

          {reviews.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff3cd",
                padding: "5px 10px",
                borderRadius: "20px",
                border: "1px solid #ffc107",
              }}
            >
              <span
                style={{
                  fontSize: "1.1rem",
                  marginRight: "5px",
                  fontWeight: "bold",
                }}
              >
                {averageRating}
              </span>
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                / 5 ({reviews.length} avis)
              </span>
            </div>
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

        {news.length > 0 && (
          <div style={{ marginBottom: "30px", marginTop: "30px" }}>
            <h3
              style={{
                borderBottom: "2px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Actualités & Événements
            </h3>
            <div style={{ display: "grid", gap: "20px" }}>
              {news.map((item) => {
                const myReg = myRegistrations.find(
                  (r) => r.event_id === item.id
                );
                const isFull =
                  item.capacity && item.registered_count >= item.capacity;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: item.type === "jpo" ? "#fff8e1" : "#f8f9fa",
                      padding: "20px",
                      borderRadius: "8px",
                      borderLeft:
                        item.type === "jpo"
                          ? "5px solid #ffc107"
                          : "5px solid #17a2b8",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <strong
                        style={{
                          color: item.type === "jpo" ? "#d39e00" : "#17a2b8",
                          fontSize: "1.1em",
                        }}
                      >
                        {item.type === "jpo" ? "JPO : " : ""} {item.title}
                      </strong>
                      <small style={{ color: "#888" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </small>
                    </div>

                    <p
                      style={{
                        margin: "10px 0",
                        color: "#555",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {item.content}
                    </p>

                    {item.type === "jpo" && (
                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                          Date : {new Date(item.event_date).toLocaleString()}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "0.9em" }}>
                          Places : {item.registered_count}{" "}
                          {item.capacity ? `/ ${item.capacity}` : "inscrits"}
                        </p>
                        <div style={{ marginTop: "10px" }}>
                          {myReg ? (
                            <span
                              style={{
                                padding: "8px 12px",
                                borderRadius: "5px",
                                fontWeight: "bold",
                                background:
                                  myReg.status === "accepted"
                                    ? "#d4edda"
                                    : "#fff3cd",
                                color:
                                  myReg.status === "accepted"
                                    ? "green"
                                    : "#856404",
                              }}
                            >
                              {myReg.status === "accepted"
                                ? "Inscription validée"
                                : "Inscription en attente"}
                            </span>
                          ) : isFull ? (
                            <span style={{ color: "red", fontWeight: "bold" }}>
                              Complet
                            </span>
                          ) : (
                            <button
                              onClick={() => handleEventRegister(item.id)}
                              style={{
                                padding: "8px 15px",
                                background: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                            >
                              S'inscrire à l'événement
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          onClick={handleOpenApply}
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

        <hr style={{ margin: "40px 0", borderTop: "1px solid #ddd" }} />

        <div>
          <h2 style={{ marginBottom: "20px" }}>Avis des étudiants</h2>

          {canReview && (
            <div
              style={{
                background: "#f0f8ff",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "30px",
                border: "1px solid #cce5ff",
              }}
            >
              <h4 style={{ marginTop: 0, color: "#0056b3" }}>
                Vous avez été admis ici ! Donnez votre avis (Anonyme)
              </h4>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontWeight: "bold", marginRight: "10px" }}>
                    Votre Note :{" "}
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: parseInt(e.target.value),
                      })
                    }
                    style={{ padding: "8px", borderRadius: "5px" }}
                  >
                    <option value="5">5 - Excellent ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 - Très bien ⭐⭐⭐⭐</option>
                    <option value="3">3 - Bien ⭐⭐⭐</option>
                    <option value="2">2 - Moyen ⭐⭐</option>
                    <option value="1">1 - Mauvais ⭐</option>
                  </select>
                </div>
                <textarea
                  placeholder="Partagez votre expérience avec les futurs candidats..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    minHeight: "80px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "10px 25px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Publier mon avis
                </button>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              Aucun avis pour le moment.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    paddingBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#333" }}>
                      Anonyme
                    </span>
                    <span style={{ color: "#ffc107", fontSize: "1.1rem" }}>
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "5px 0",
                      color: "#555",
                      lineHeight: "1.5",
                    }}
                  >
                    {review.comment}
                  </p>
                  <small style={{ color: "#999" }}>
                    Publié le {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showApplyModal && (
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
              padding: "25px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#007bff" }}>
              Candidature : {school.first_name}
            </h2>
            <p>Complétez votre dossier pour postuler.</p>

            <form onSubmit={submitApplication}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Lettre de motivation *
                </label>
                <textarea
                  required
                  style={{
                    width: "100%",
                    height: "120px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontFamily: "inherit",
                  }}
                  value={applicationForm.motivation}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      motivation: e.target.value,
                    })
                  }
                  placeholder="Pourquoi voulez-vous rejoindre cette école ? Présentez-vous..."
                />
              </div>

              {schoolQuestions.length > 0 && (
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: "15px",
                      color: "#555",
                    }}
                  >
                    Questions de l'école
                  </h4>
                  {schoolQuestions.map((q) => (
                    <div key={q.id} style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "0.95em",
                        }}
                      >
                        {q.question_text}
                      </label>
                      <input
                        type="text"
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                        value={applicationForm.answers[q.id] || ""}
                        onChange={(e) =>
                          setApplicationForm({
                            ...applicationForm,
                            answers: {
                              ...applicationForm.answers,
                              [q.id]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "12px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Envoyer mon dossier
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDetails;
