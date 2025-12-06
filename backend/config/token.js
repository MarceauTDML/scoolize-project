const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    console.error(
      "ERREUR CRITIQUE : JWT_SECRET manquant dans le fichier .env !"
    );
    throw new Error("Configuration serveur invalide");
  }
  const payload = {
    id: id,
    role: role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;
