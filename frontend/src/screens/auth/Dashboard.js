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
  confirmApplication,
  getRecommendedSchools,
  getStudentProfileById,
  DIPLOMA_URL_BASE,
} from "../../api/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [schoolApplications, setSchoolApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [recommendedSchools, setRecommendedSchools] = useState([]);

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
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
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

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      const role = userData.role ? userData.role.toLowerCase() : "";

      if (role === "school") {
        fetchSchoolApplications();
        fetchMyNews(userData.id);
        fetchMyQuestions(userData.id);
      } else if (role === "student") {
        fetchStudentApplications();
        fetchFavorites();
        fetchMyEvents();
        fetchRecommendations();
      }
    } catch (e) {
      console.error("Erreur parsing user", e);
    }
  }, [navigate]);

  const fetchRecommendations = async () => {
      try {
          const data = await getRecommendedSchools();
          if(Array.isArray(data)) setRecommendedSchools(data);
      } catch (e) { console.error("Erreur recommendations", e); }
  };

  const fetchSchoolApplications = async () => {
    try {
      const data = await getMyApplications();
      setSchoolApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const data = await getStudentApplications();
      if (Array.isArray(data)) {
        setMyApplications(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setMyApplications(data.data);
      } else {
        setMyApplications([]); 
      }
    } catch (err) {
      console.error("Erreur fetchStudentApplications :", err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setMyFavorites(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchMyEvents = async () => {
    try {
      const data = await getMyEventRegistrations();
      setMyEvents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchMyNews = async (schoolId) => {
    try {
      const data = await getSchoolNews(schoolId);
      setNewsList(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchMyQuestions = async (schoolId) => {
    try {
      const data = await getSchoolQuestions(schoolId);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addSchoolQuestion(newQuestion);
      setNewQuestion("");
      fetchMyQuestions(user.id);
    } catch (e) { alert("Erreur ajout question"); }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Supprimer ?")) {
      try {
        await deleteSchoolQuestion(id);
        fetchMyQuestions(user.id);
      } catch (e) { alert("Erreur suppression"); }
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      fetchSchoolApplications();
    } catch (err) { alert(err.message); }
  };

  const handleRemoveFavorite = async (schoolId) => {
    if (window.confirm("Retirer des favoris ?")) {
      try {
        await toggleFavorite(schoolId);
        fetchFavorites();
      } catch (err) { alert(err.message); }
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNews(newsForm);
      setNewsForm({ ...newsForm, title: "", content: "" }); 
      fetchMyNews(user.id);
      alert("Publié !");
    } catch (err) { alert(err.message); }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm("Supprimer ?")) {
      try {
        await deleteNews(id);
        fetchMyNews(user.id);
      } catch (err) { alert(err.message); }
    }
  };

  const handleViewRegistrations = async (eventId) => {
    setSelectedEventId(eventId);
    try {
      const regs = await getEventRegistrations(eventId);
      setEventRegistrations(regs);
    } catch (e) { alert("Erreur chargement inscrits"); }
  };

  const handleRegistrationStatus = async (regId, status) => {
    try {
      await updateEventRegistration(regId, status);
      const regs = await getEventRegistrations(selectedEventId);
      setEventRegistrations(regs);
    } catch (e) { alert(e.message); }
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
      
      try {
          const profile = await getStudentProfileById(studentId);
          setSelectedStudentProfile(profile);
      } catch(e) {
          console.warn("Pas de profil trouvé ou erreur", e);
          setSelectedStudentProfile(null);
      }

      setShowGradesModal(true);
      setGradesTab("premiere");
    } catch (err) { alert("Erreur chargement dossier."); }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted": return { color: "#28a745", label: "Admis", bg: "#d4edda" };
      case "rejected": return { color: "#dc3545", label: "Refusé", bg: "#f8d7da" };
      case "confirmed": return { color: "#155724", label: "Choix Validé", bg: "#c3e6cb" };
      case "withdrawn": return { color: "#6c757d", label: "Désistement", bg: "#e2e3e5" };
      default: return { color: "#856404", label: "En attente", bg: "#fff3cd" };
    }
  };

  const formatContext = (ctx) => {
    const map = {
      premiere_t1: "Trimestre 1", premiere_t2: "Trimestre 2", premiere_t3: "Trimestre 3",
      premiere_s1: "Semestre 1", premiere_s2: "Semestre 2",
      terminale_t1: "Trimestre 1", terminale_t2: "Trimestre 2", terminale_t3: "Trimestre 3",
      terminale_s1: "Semestre 1", terminale_s2: "Semestre 2",
      bac_francais: "Épreuves Anticipées", bac_final: "Épreuves Terminales",
    };
    return map[ctx] || ctx;
  };

  const getGradesForTab = (tab) => {
    if (!selectedStudentGrades) return [];
    return selectedStudentGrades.filter((g) => g.context.startsWith(tab));
  };

  if (!user) return <div style={{textAlign:'center', marginTop: 50}}>Chargement du profil...</div>;

  const role = user.role ? user.role.toLowerCase() : "";
  const acceptedEvents = myEvents.filter((e) => e.status === "accepted");

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Bonjour, {user.first_name}</h1>
        <button onClick={handleLogout} style={{ padding: "10px", background: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Déconnexion
        </button>
      </div>

      {role === "school" && (
        <div>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
            <h3 style={{ marginTop: 0 }}>Configuration du Questionnaire</h3>
            <p style={{ color: "#666", fontSize: "0.9em" }}>Questions pour les candidats :</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {questions.map((q) => (
                <li key={q.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #eee", alignItems: "center" }}>
                  <span>{q.question_text}</span>
                  <button onClick={() => handleDeleteQuestion(q.id)} style={{ color: "red", border: "1px solid red", background: "white", borderRadius: "4px", cursor: "pointer", padding: "2px 8px" }}>X</button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddQuestion} style={{ display: "flex", marginTop: "15px", gap: "10px" }}>
              <input type="text" required value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Nouvelle question..." style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }} />
              <button type="submit" style={{ background: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>Ajouter</button>
            </form>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h2>Candidatures reçues ({schoolApplications.length})</h2>
            {schoolApplications.length === 0 ? <p>Aucune candidature reçue.</p> : (
              <div style={{ display: "grid", gap: "15px" }}>
                {schoolApplications.map((app) => (
                  <div key={app.id} style={{ background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", borderLeft: "5px solid #007bff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <strong style={{ fontSize: "1.1rem" }}>{app.first_name} {app.last_name}</strong>
                        <p style={{ margin: "5px 0", color: "#666" }}>{app.email}</p>
                        <p style={{ margin: 0, fontWeight: "bold", color: app.status === 'confirmed' ? '#155724' : app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : '#e0a800' }}>
                          Statut : {app.status === 'confirmed' ? '✅ INSCRIT DÉFINITIF' : app.status}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <button onClick={() => handleViewStudentFolder(app.student_id || app.id)} style={{ padding: "8px 15px", background: "#17a2b8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Voir Notes & Dossier</button>
                        <button onClick={() => setSelectedAppDetails(app)} style={{ padding: "8px 15px", background: "#6f42c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Voir Motivation</button>
                      </div>
                    </div>
                    {app.status === "pending" && (
                      <div style={{ marginTop: "15px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                        <button onClick={() => handleStatusChange(app.id, "accepted")} style={{ marginRight: "10px", background: "green", color: "white", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer" }}>Accepter</button>
                        <button onClick={() => handleStatusChange(app.id, "rejected")} style={{ background: "red", color: "white", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer" }}>Refuser</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderTop: "1px solid #ddd", margin: "40px 0" }} />
          
          <div style={{background:'white', padding: 20, borderRadius: 10}}>
             <h3>Mes Publications ({newsList.length})</h3>
             <form onSubmit={handleNewsSubmit} style={{display:'flex', gap: 10, marginBottom: 20}}>
                <input type="text" placeholder="Titre news..." value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} style={{flex:1, padding: 8}} required/>
                <textarea placeholder="Contenu..." value={newsForm.content} onChange={e=>setNewsForm({...newsForm, content:e.target.value})} style={{flex:2, padding: 8}} required/>
                <button type="submit">Publier</button>
             </form>
             {newsList.map(n => (
                 <div key={n.id} style={{borderBottom:'1px solid #eee', padding:'10px 0'}}>
                     <strong>{n.title}</strong> - {n.type} 
                     <button onClick={()=>handleDeleteNews(n.id)} style={{marginLeft: 10, color:'red'}}>X</button>
                     {n.type === 'jpo' && <button onClick={()=>handleViewRegistrations(n.id)}>Inscrits ({n.registered_count})</button>}
                 </div>
             ))}
          </div>

          {selectedAppDetails && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
              <div style={{ background: "white", padding: "25px", borderRadius: "10px", maxWidth: "700px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
                <h2 style={{ marginTop: 0 }}>Dossier Candidat</h2>
                <div style={{ background: "#f8f9fa", padding: "15px", marginBottom: "20px" }}>
                  <h4>Motivation</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{selectedAppDetails.motivation_letter || "Aucune."}</p>
                </div>
                <h4>Questionnaire</h4>
                {selectedAppDetails.questionnaire_answers?.map((qa, i) => (
                    <div key={i} style={{marginBottom: 10}}>
                        <strong>{qa.question_text}</strong><br/>
                        <span>{qa.answer_text}</span>
                    </div>
                ))}
                <button onClick={() => setSelectedAppDetails(null)} style={{ marginTop: "20px", padding: "10px", width:'100%' }}>Fermer</button>
              </div>
            </div>
          )}

          {showGradesModal && selectedStudentGrades && (
             <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1200}}>
                 <div style={{background:'white', padding:30, borderRadius:10, width:800, maxHeight:'90vh', overflowY:'auto'}}>
                     <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <h2 style={{margin:0, color:'#007bff'}}>Dossier Scolaire & Diplômes</h2>
                        <button onClick={()=>setShowGradesModal(false)}>Fermer</button>
                     </div>

                     {selectedStudentProfile && (
                         <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                             {['brevet', 'bac_francais', 'bac_terminale'].map(type => {
                                 const filename = selectedStudentProfile[`diploma_${type}`];
                                 const labels = { brevet: "Brevet", bac_francais: "Bac Français", bac_terminale: "Baccalauréat" };
                                 
                                 return (
                                     <div key={type} style={{ flex: 1, padding: '10px', background: filename ? '#d4edda' : '#f8f9fa', borderRadius: '5px', border: filename ? '1px solid #c3e6cb' : '1px solid #ddd', textAlign: 'center' }}>
                                         <strong>{labels[type]}</strong><br/>
                                         {filename ? (
                                             <a href={`${DIPLOMA_URL_BASE}${filename}`} target="_blank" rel="noreferrer" style={{ color: 'green', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                                 Voir le document 📄
                                             </a>
                                         ) : <span style={{color: '#999', fontSize: '0.8rem'}}>Non fourni</span>}
                                     </div>
                                 )
                             })}
                         </div>
                     )}

                     <div style={{display: "flex", marginBottom: "20px", borderBottom: "2px solid #eee"}}>
                        {['premiere', 'terminale', 'bac'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setGradesTab(tab)}
                                style={{
                                flex: 1, padding: "10px",
                                background: gradesTab === tab ? "#e3f2fd" : "transparent",
                                border: "none", cursor: "pointer", fontWeight: "bold",
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                     </div>

                     {getGradesForTab(gradesTab).length === 0 ? (
                        <p style={{textAlign: "center", color: "#666", fontStyle: "italic"}}>Aucune note disponible pour cette année.</p>
                     ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Contexte</th>
                                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Matière</th>
                                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Note</th>
                            </tr>
                            </thead>
                            <tbody>
                            {getGradesForTab(gradesTab).map((grade, idx) => (
                                <tr key={idx}>
                                <td style={{ padding: "10px", border: "1px solid #ddd", color: "#666" }}>{formatContext(grade.context)}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: grade.is_specialty ? "bold" : "normal" }}>
                                    {grade.subject} {grade.is_specialty && <span style={{ fontSize: "0.8em", color: "#28a745" }}>(Spé)</span>}
                                </td>
                                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", color: "#007bff" }}>{grade.grade}/20</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                     )}
                 </div>
             </div>
          )}

          {selectedEventId && (
              <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1200}}>
                  <div style={{background:'white', padding:30, borderRadius:10}}>
                      <h3>Inscrits</h3>
                      {eventRegistrations.map(r => <div key={r.id}>{r.email} - {r.status}</div>)}
                      <button onClick={()=>setSelectedEventId(null)}>Fermer</button>
                  </div>
              </div>
          )}
        </div>
      )}

      {role === "student" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
            <div style={{ background: "#e3f2fd", padding: "20px", borderRadius: "10px", border: "1px solid #90caf9" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#0d47a1" }}>Mon Dossier</h3>
              <button onClick={() => navigate("/student-profile")} style={{ padding: "10px", width: "100%", background: "#0d47a1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Gérer mon profil</button>
            </div>
            <div style={{ background: "#e8f5e9", padding: "20px", borderRadius: "10px", border: "1px solid #a5d6a7" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#1b5e20" }}>Mes Notes</h3>
              <button onClick={() => navigate("/student-grades")} style={{ padding: "10px", width: "100%", background: "#1b5e20", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Importer mes bulletins</button>
            </div>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h2>✨ Écoles recommandées pour vous (selon vos notes)</h2>
            {recommendedSchools.length === 0 ? (
                <div style={{background:'white', padding: 20, borderRadius: 10}}>
                    <p>Importez vos bulletins de notes pour voir les écoles qui correspondent à votre profil !</p>
                </div>
            ) : (
                <div className="schools-grid">
                    {recommendedSchools.map(school => (
                        <div key={school.id} className="school-card" style={{border: '2px solid #ffc107'}}>
                            <h3 style={{marginTop:0}}>{school.first_name} {school.match_score > 0 && "🔥"}</h3>
                            <p style={{color:'#666'}}>{school.school_type}</p>
                            <p style={{color:'#666'}}>{school.city}</p>
                            <button onClick={() => navigate(`/school/${school.id}`)} style={{width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}>Voir</button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Mes Candidatures ({myApplications.filter((a) => a.status !== "withdrawn").length} / 10)</h2>
            {myApplications.some((app) => app.status === "confirmed") ? (
              <div style={{ padding: "10px 20px", background: "#d4edda", color: "#155724", borderRadius: "5px", fontWeight: "bold" }}>🎉 Choix définitif validé !</div>
            ) : (
              <button
                onClick={() => {
                  if (myApplications.filter((a) => a.status !== "withdrawn").length >= 10) {
                    alert("Vous avez atteint la limite de 10 candidatures.");
                  } else {
                    navigate("/");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  background: myApplications.filter((a) => a.status !== "withdrawn").length >= 10 ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: myApplications.filter((a) => a.status !== "withdrawn").length >= 10 ? "not-allowed" : "pointer",
                }}
              >
                + Postuler ailleurs
              </button>
            )}
          </div>

          {myApplications.length === 0 ? (
            <div style={{ marginTop: "20px", padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
                <p style={{color: "#666"}}>Vous n'avez pas encore postulé à une école.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
              {myApplications.map((app) => {
                const badge = getStatusBadge(app.status);
                const isConfirmed = app.status === "confirmed";
                const isWithdrawn = app.status === "withdrawn";
                const hasConfirmedChoice = myApplications.some((a) => a.status === "confirmed");

                return (
                  <div key={app.id} style={{
                      background: isConfirmed ? "#e3fcec" : isWithdrawn ? "#f8f9fa" : "white",
                      padding: "20px",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: (hasConfirmedChoice && !isConfirmed) || isWithdrawn ? 0.6 : 1,
                      border: isConfirmed ? "2px solid #28a745" : "none",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>{app.school_name} {isConfirmed && "✅"}</h3>
                      <p style={{ margin: 0, color: "#666" }}>{app.school_city}</p>
                      <p style={{ margin: "5px 0 0", fontSize: "0.9em", color: "#888" }}>Envoyé le : {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                      <span style={{ padding: "8px 15px", borderRadius: "20px", backgroundColor: badge.bg, color: badge.color, fontWeight: "bold", fontSize: "0.9rem" }}>{badge.label}</span>
                      
                      {app.status === "accepted" && !hasConfirmedChoice && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`ATTENTION : En confirmant ${app.school_name}, vous renoncez définitivement à tous vos autres vœux. Continuer ?`)) {
                              try {
                                await confirmApplication(app.id);
                                fetchStudentApplications();
                                alert("Félicitations ! Votre inscription est confirmée.");
                              } catch (e) {
                                alert("Erreur : " + (e.response?.data?.message || e.message));
                              }
                            }
                          }}
                          style={{
                            background: "#28a745", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", animation: "pulse 2s infinite",
                          }}
                        >
                          CHOISIR DÉFINITIVEMENT
                        </button>
                      )}
                      {app.website && (
                        <div style={{ marginTop: "10px" }}>
                          <a href={app.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.85em", color: "#007bff" }}>Visiter le site</a>
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
            {acceptedEvents.length === 0 ? <p style={{ color: "#666" }}>Aucune inscription confirmée.</p> : (
              <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
                {acceptedEvents.map((evt) => (
                  <div key={evt.registration_id} style={{ background: "#fff8e1", padding: "20px", borderRadius: "10px", borderLeft: "5px solid #ffc107", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 5px", color: "#d39e00" }}>{evt.title}</h3>
                      <p style={{ margin: 0, color: "#555" }}>{evt.school_name}</p>
                    </div>
                    <button onClick={() => navigate(`/school/${evt.school_id}`)} style={{ padding: "10px 15px", background: "white", border: "1px solid #d39e00", color: "#d39e00", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Voir</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;