import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Scoolize
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Accueil
        </Link>
        <Link to="/map" className="nav-link">
          Carte Interactive
        </Link>

        {isAuthenticated ? (
          <>
            {user.role === "student" && (
              <Link to="/calendar" className="nav-link">
                Mon Agenda
              </Link>
            )}

            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="nav-btn-logout">
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Se connecter
            </Link>
            <Link to="/register" className="nav-btn-register">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;