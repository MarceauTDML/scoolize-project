const Layout = ({ children }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <header
        style={{
          padding: "1rem",
          backgroundColor: "#f4f4f9",
          borderBottom: "1px solid #ddd",
        }}
      >
        <nav>
          <h1 style={{ margin: 0 }}>Scoolize</h1>
        </nav>
      </header>

      <main style={{ flex: 1, padding: "2rem" }}>{children}</main>

      <footer
        style={{
          padding: "1rem",
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>&copy; 2025 Scoolize</p>
      </footer>
    </div>
  );
};

export default Layout;
