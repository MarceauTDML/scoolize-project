import React from "react";
import { useNavigate } from "react-router-dom"; // Import nécessaire pour la navigation
const COLORS = {
  primary: "#7F54FF", // CORRECTION : Nouveau Violet
  background: "#f4f4f6",
  cardBackground: "#ffffff",
  textDark: "#1d1d1f",
  textMedium: "#636366",
  stageLine: "#E5E5EA",
  stage1: "#C527FF", // Étape 1 : Violet Brillant
  stage2: "#830000", // Étape 2 : Rouge Sombre
  stage3: "#006520", // Étape 3 : Vert Sombre
};
// Données statiques basées sur le prototype (INFORMATIONS MISES À JOUR)
const calendarData = [
  {
    stage: "Étape 1",
    title: "Je sélectionne et découvre les formations",
    color: COLORS.stage1,
    tasks: [
      {
        date: "Mercredi 11 décembre 2024",
        description: "Je finalise ma liste d'écoles favorites.",
      },
      {
        date: "Du 12 décembre au 31 décembre 2024",
        description:
          "J'analyse les attendus des formations et j'ajuste mon profil.",
      },
    ],
  },
  {
    stage: "Étape 2",
    title: "Je m'inscris pour l'examen ou j'envoie mon dossier",
    color: COLORS.stage2,
    tasks: [
      {
        date: "Jeudi 1er janvier 2025",
        description:
          "Je lance ma candidature via la plateforme ou le site de l'école.",
      },
      {
        date: "Jusqu'au 20 janvier 2025",
        description:
          "Je paye les frais de dossier et je finalise les pièces jointes.",
      },
    ],
  },
  {
    stage: "Étape 3",
    title: "J'obtiens les résultats et je valide ma décision",
    color: COLORS.stage3,
    tasks: [
      // Tâches basées sur l'analyse complète du prototype Figma
      {
        date: "Mercredi 22 janvier 2025",
        description: "Période d'entretiens (selon les écoles).",
      },
      {
        date: "Jeudi 23 janvier 2025",
        description: "Examen complémentaire si nécessaire (à vérifier).",
      },
      {
        date: "Jeudi 24 février 2025 - (date indicative)",
        description: "Réception des premiers avis et propositions d'admission.",
      },
      {
        date: "Lundi 25 février 2025",
        description: "Je réponds aux propositions reçues (1er tour de vœux).",
      },
      {
        date: "Jusqu'au 15 mars 2025",
        description: "Délai de réponse et confirmation de mon choix final.",
      },
    ],
  },
];
// Composant pour le point de la chronologie (inchangé)
const TimelinePoint = ({ color, isLast }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginRight: 24,
      position: "relative",
    }}
  >
    {/* Point du cercle */}
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: color,
        border: `3px solid ${COLORS.background}`,
        boxShadow: `0 0 0 2px ${color}`,
        flexShrink: 0,
        zIndex: 10,
      }}
    />
    {/* Ligne verticale */}
    {!isLast && (
      <div
        style={{
          width: 2,
          height: "100%",
          backgroundColor: COLORS.stageLine,
          position: "absolute",
          top: 16,
          zIndex: 5,
        }}
      />
    )}
  </div>
);
const StudentCalendar = () => {
  const navigate = useNavigate(); // Hook de navigation
  const handleGoBack = () => {
    navigate("/"); // Redirige vers la page d'accueil
  };
  return (
    <div
      style={{
        backgroundColor: COLORS.background,
        minHeight: "100vh",
        padding: "24px 32px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: COLORS.cardBackground,
          padding: "30px",
          borderRadius: 18,
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Titre et flèche de retour */}
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: COLORS.textDark,
            marginBottom: 30,
            paddingBottom: 10,
            borderBottom: `1px solid ${COLORS.stageLine}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Flèche cliquable */}
          <span
            onClick={handleGoBack}
            style={{
              color: COLORS.primary, // Utilise le nouveau violet #7F54FF
              marginRight: 10,
              cursor: "pointer",
              fontSize: "2rem",
              lineHeight: 1,
              padding: "0 8px 0 0",
              transition: "opacity 0.15s ease",
            }}
            title="Retour à l'accueil"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            &lt;
          </span>
          Calendrier des Admissions
        </h1>
        {/* Chronologie (Timeline) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 35 }}>
          {calendarData.map((stage, index) => (
            <div key={index} style={{ display: "flex" }}>
              {/* Point de la chronologie (gauche) */}
              <TimelinePoint
                color={stage.color}
                isLast={index === calendarData.length - 1}
              />
              {/* Contenu de l'étape (droite) */}
              <div style={{ flexGrow: 1, paddingTop: 0 }}>
                {/* Titre de l'étape */}
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: stage.color,
                  }}
                >
                  {stage.stage}
                </h2>
                {/* Sous-titre descriptif */}
                <p
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: COLORS.textDark,
                    paddingBottom: 5,
                    borderBottom: `1px dashed ${COLORS.stageLine}`,
                  }}
                >
                  {stage.title}
                </p>
                {/* Liste des tâches */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {stage.tasks.map((task, taskIndex) => (
                    <li
                      key={taskIndex}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          color: stage.color,
                          marginRight: 10,
                          fontSize: "1.2rem",
                        }}
                      >
                        •
                      </span>
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: COLORS.textMedium,
                            fontSize: "0.95rem",
                          }}
                        >
                          {task.date}
                        </span>
                        <span
                          style={{
                            color: COLORS.textDark,
                            fontSize: "0.95rem",
                          }}
                        >
                          : {task.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default StudentCalendar;
