import React from "react";
import { Link, useLocation } from "react-router-dom";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const COLORS = {
  primary: "#7F54FF", // Violet mis à jour
  textDark: "#1d1d1f",
  textMedium: "#636366",
  background: "#ffffff",
  tagBackground: "#f2f2f7",
};

// Styles pour un élément de menu
const menuItemStyle = (isActive) => ({
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: 8,
  margin: "4px 0",
  // Style actif : Fond violet (primary) si actif, couleur texte blanc
  backgroundColor: isActive ? COLORS.primary : "transparent",
  color: isActive ? COLORS.background : COLORS.textDark, // Couleur du texte
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.2s ease, color 0.2s ease",
});

// Style pour l'icône de déconnexion
const logoutStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px 0",
  marginTop: "40px",
  color: COLORS.textDark,
  fontWeight: 500,
  cursor: "pointer",
  backgroundColor: "transparent",
  border: "none",
  width: "100%",
  textAlign: "left",
};

// Le composant SideMenu
const SideMenu = ({ isOpen, onClose, userRole, handleLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Items basés sur le prototype (Accueil, Profil, Classement, Calendrier)
  const menuItems = [
    {
      path: "/",
      label: "Accueil",
      icon: <HomeRoundedIcon />,
      roles: ["student", "admin", "public"],
    },
    {
      path: "/dashboard",
      label: "Profil",
      icon: <PersonRoundedIcon />,
      roles: ["student", "admin"],
    },
    { path: "/grades", label: "Classement", icon: <EmojiEventsRoundedIcon />, roles: ["student"] },
    { path: "/calendar", label: "Calendrier", icon: <CalendarMonthRoundedIcon />, roles: ["student"] },
    // Laissez l'admin visible si l'utilisateur a ce rôle
    { path: "/admin", label: "Dashboard Admin", icon: <SettingsRoundedIcon />, roles: ["admin"] },
  ];
  const isAuthenticated = userRole !== "public";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 101,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Menu principal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 260,
          height: "100%",
          backgroundColor: COLORS.background,
          boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
          zIndex: 102,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          padding: "24px 16px",
          boxSizing: "border-box",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            margin: "0 0 40px 0",
            color: COLORS.textDark,
            fontSize: "1.8rem",
            fontWeight: 700,
            textAlign: "left",
          }}
        >
          Menu
        </h2>

        {/* Liens de navigation */}
        <div style={{ flexGrow: 1 }}>
          {menuItems
            .filter((item) => item.roles.includes(userRole || "public"))
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={menuItemStyle(currentPath === item.path)}
              >
                <span style={{ marginRight: 12, fontSize: "1.2rem" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
        </div>
        {/* Bouton de déconnexion (si authentifié) */}
        {isAuthenticated && (
          <button
            onClick={() => {
              onClose();
              handleLogout();
            }}
            style={logoutStyle}
            title="Me déconnecter"
          >
            <span
              style={{
                marginRight: 12,
                fontSize: "1.2rem",
                transform: "scaleX(-1)",
              }}
            >
              →
            </span>
            Me déconnecter
          </button>
        )}
      </div>
    </>
  );
};

export default SideMenu;
