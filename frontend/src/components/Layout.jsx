import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const getDashboardPath = (role) => {
    if (role === "student") return "/student/dashboard";
    if (role === "school") return "/school/dashboard";
    return "/";
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="/" style={{ ...styles.navLink, ...styles.logo }}>
            Scoolize
          </Link>

          <div style={styles.navActions}>
            {user ? (
              <>
                <Link to={getDashboardPath(user.role)} style={styles.navLink}>
                  Tableau de bord
                </Link>
                <button onClick={logout} style={styles.logoutBtn}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.navLink}>
                  Connexion
                </Link>
                <Link to="/register" style={styles.registerBtn}>
                  Inscription
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>&copy; 2025 Scoolize</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
  },
  header: {
    padding: "1rem 2rem",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#007bff",
  },
  navActions: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#333",
    padding: "8px 12px",
    transition: "color 0.2s",
  },
  registerBtn: {
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#28a745",
    padding: "8px 15px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#dc3545",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    padding: "8px 12px",
  },
  main: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  },
  footer: {
    padding: "1rem",
    backgroundColor: "#343a40",
    color: "#ccc",
    textAlign: "center",
    fontSize: "0.9rem",
  },
};

export default Layout;
