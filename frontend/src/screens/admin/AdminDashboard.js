import React, { useEffect, useState } from "react";
import {
  getPendingSchools,
  validateSchool,
  rejectSchool,
} from "../../api/client";

const AdminDashboard = () => {
  const [pendingSchools, setPendingSchools] = useState([]);

  const fetchPending = async () => {
    try {
      const data = await getPendingSchools();
      setPendingSchools(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleValidate = async (id) => {
    if (window.confirm("Valider cette école ?")) {
      await validateSchool(id);
      fetchPending();
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Refuser et supprimer cette demande ?")) {
      await rejectSchool(id);
      fetchPending();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard Administrateur</h1>
      <h2>Écoles en attente de validation ({pendingSchools.length})</h2>

      {pendingSchools.length === 0 ? (
        <p>Aucune demande en attente.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {pendingSchools.map((school) => (
            <div
              key={school.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                borderLeft: "5px solid #ffc107",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{school.first_name}</h3>
                <p style={{ margin: 0, color: "#666" }}>
                  📍 {school.last_name}
                </p>
                <p style={{ margin: 0, fontSize: "0.9em" }}>
                  ✉️ {school.email}
                </p>
                <p style={{ margin: "5px 0 0", fontStyle: "italic" }}>
                  Site: {school.website || "Non renseigné"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleValidate(school.id)}
                  style={{
                    padding: "10px 15px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Valider
                </button>
                <button
                  onClick={() => handleReject(school.id)}
                  style={{
                    padding: "10px 15px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;