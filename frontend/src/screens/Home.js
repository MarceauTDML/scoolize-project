import React, { useEffect, useState } from "react";
import { getSchools } from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [schools, setSchools] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = parseInt(searchParams.get("page") || "1");

  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await getSchools(currentPage);
        setSchools(response.data);
        setTotalPages(response.pagination.totalPages);
        setInputPage(currentPage);

        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchSchools();
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) {
      setSearchParams({ page: currentPage - 1 });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setSearchParams({ page: currentPage + 1 });
    }
  };

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleInputSubmit = () => {
    let newPage = parseInt(inputPage);

    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > totalPages) {
      newPage = totalPages;
    }

    if (newPage !== currentPage) {
      setSearchParams({ page: newPage });
    } else {
      setInputPage(currentPage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem", color: "#2c3e50" }}>
          Établissements disponibles
        </h1>
      </div>

      <p style={{ color: "#666", fontSize: "1.1rem" }}>
        Découvrez les écoles partenaires et postulez directement via Scoolize.
      </p>

      <div className="schools-grid">
        {schools.map((school) => {
          const isPrivate =
            school.school_type &&
            school.school_type.toLowerCase().includes("privé");
          const badgeColor = isPrivate ? "#ffc107" : "#17a2b8";

          return (
            <div key={school.id} className="school-card">
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: "#333",
                  minHeight: "50px",
                }}
              >
                {school.first_name}
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                {school.school_type && (
                  <span
                    style={{
                      backgroundColor: badgeColor,
                      color: isPrivate ? "#333" : "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {school.school_type}
                  </span>
                )}
                {school.region && (
                  <span
                    style={{
                      backgroundColor: "#e9ecef",
                      color: "#495057",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {school.region}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                <span>{school.last_name}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#888",
                  fontSize: "0.9em",
                }}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px",
                  }}
                >
                  {school.email}
                </span>
              </div>

              <button
                style={{
                  marginTop: "15px",
                  width: "100%",
                  padding: "10px",
                  background: "#e9ecef",
                  color: "#333",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#dbe2e8")}
                onMouseOut={(e) => (e.target.style.background = "#e9ecef")}
                onClick={() => navigate(`/school/${school.id}`)}
              >
                Voir la fiche
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "40px",
          gap: "15px",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          style={{
            padding: "10px 20px",
            backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          &lt; Précédent
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ color: "#666" }}>Page</span>
          <input
            type="number"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={handleInputSubmit}
            onKeyDown={handleKeyDown}
            min="1"
            max={totalPages}
            style={{
              width: "60px",
              padding: "8px",
              textAlign: "center",
              fontSize: "1rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <span style={{ color: "#666" }}>sur {totalPages}</span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          style={{
            padding: "10px 20px",
            backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          Suivant &gt;
        </button>
      </div>
    </div>
  );
};

export default Home;