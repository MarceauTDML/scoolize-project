import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

// --- IMPORTATION DE L'IMAGE MARIANNE ---
import MarianneLogo from "./marianne.png"; // Chemin ajusté : remonte d'un dossier (components) et va dans images

// Couleurs Scoolize pour la cohérence
const COLORS = {
  primary: "#7F54FF", // Violet spécifié (#7F54FF)
  textDark: "#1d1d1f",
  textMedium: "#636366",
  textLight: "#8e8e93",
  background: "#ffffff",
  border: "#e5e5ea",
  tagBackground: "#f2f2f7",
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "public";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderProfileIcon = () => {
    if (isAuthenticated) {
      const initials = user.email ? user.email[0].toUpperCase() : "U";
      return (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="navbar-profile-btn"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: COLORS.primary,
            color: COLORS.background,
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 16,
            flexShrink: 0,
          }}
          title="Mon profil"
        >
          {initials}
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <nav
        className="navbar-root"
        style={{
          backgroundColor: COLORS.background,
          height: 64,
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* 1. Bloc Gauche : Icône de Menu ET Logo Marianne */}
        <div
          className="navbar-burger-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            minWidth: 100,
          }}
        >
          {/* Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="navbar-burger-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: COLORS.textDark,
              padding: 4,
            }}
            title="Menu"
          >
            ☰
          </button>
          {/* Logo Marianne (Utilisation de l'import) */}
          <img
            src={MarianneLogo} // <-- UTILISATION DE LA VARIABLE IMPORTÉE
            alt="République Française"
            style={{
              height: 48,
              width: "auto",
              borderRadius: 6,
              objectFit: "contain",
            }}
          />
        </div>

        {/* 2. Logo Central Scoolize */}
        <div
          className="navbar-center"
          style={{
            flexGrow: 1,
            textAlign: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Link
            to="/"
            className="navbar-logo-link"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: COLORS.textDark,
            }}
          >
            <span
              className="navbar-logo-bracket"
              style={{
                color: COLORS.primary, // Nouveau violet
                fontSize: "2rem",
                marginRight: 4,
              }}
            >
              [
            </span>
            <span
              className="navbar-logo-text"
              style={{ color: COLORS.textDark }}
            >
              Scoolize
            </span>
            <span
              className="navbar-logo-bracket"
              style={{
                color: COLORS.primary, // Nouveau violet
                fontSize: "2rem",
                marginLeft: 4,
              }}
            >
              ]
            </span>
          </Link>
        </div>

        {/* 3. Bloc Droit : Navigation & Auth */}
        <div
          className="navbar-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            minWidth: 350,
            justifyContent: "flex-end",
          }}
        >
          {/* LIEN CARTE INTERACTIVE */}
          <Link
            to="/map"
            className="navbar-map-link"
            style={{
              textDecoration: "none",
              color: COLORS.textMedium,
              fontWeight: 500,
              fontSize: "1rem",
              padding: "4px 8px",
              borderBottom: "2px solid transparent",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = COLORS.textDark)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = COLORS.textMedium)
            }
          >
            Carte Interactive
          </Link>

          {/* AUTHENTIFICATION */}
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="navbar-login-link"
                style={{
                  textDecoration: "none",
                  color: COLORS.textDark,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  padding: "8px 16px",
                  borderRadius: 8,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.tagBackground)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="navbar-register-btn"
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "none",
                  background: COLORS.primary, // Nouveau violet
                  color: COLORS.background,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(127, 84, 255, 0.4)", // Ombre ajustée
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                S'inscrire
              </Link>
            </>
          ) : (
            <>
              {/* Si connecté, icônes (loupe, notif, cœur) + profil */}
              <button
                type="button"
                className="navbar-icon-btn"
                onClick={() => navigate("/")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: COLORS.textMedium,
                  transition: "color 0.15s ease",
                  padding: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = COLORS.textDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = COLORS.textMedium)
                }
                title="Rechercher"
              >
                <SearchRoundedIcon />
              </button>
              <button
                type="button"
                className="navbar-icon-btn"
                onClick={() => navigate("/notifications")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: COLORS.textMedium,
                  transition: "color 0.15s ease",
                  padding: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = COLORS.textDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = COLORS.textMedium)
                }
                title="Notifications"
              >
                <NotificationsRoundedIcon />
              </button>
              <button
                type="button"
                className="navbar-icon-btn"
                onClick={() => navigate("/favorites")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: COLORS.textMedium,
                  transition: "color 0.15s ease",
                  padding: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = COLORS.textDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = COLORS.textMedium)
                }
                title="Mes favoris"
              >
                <FavoriteRoundedIcon />
              </button>
              {renderProfileIcon()}
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
