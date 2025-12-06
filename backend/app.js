const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const formationRoutes = require("./routes/formationRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Scoolize v1",
    status: "online",
    timestamp: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/formation", formationRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route API non trouvée." });
});

app.use((err, req, res, next) => {
  console.error("Erreur Serveur :", err.stack);
  res.status(500).json({
    message: "Une erreur interne est survenue.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

db.getConnection()
  .then((connection) => {
    console.log("Connecté à MariaDB avec succès !");
    connection.release();

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Serveur Scoolize démarré sur le port ${PORT}`);
      console.log(`URL locale : http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Impossible de se connecter à la Base de Données :",
      err.message
    );
  });

module.exports = app;
