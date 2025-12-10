const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const isPasswordValid = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{11,}$/;
  return regex.test(password);
};

router.post("/", async (req, res) => {
  const {
    role,
    email,
    password,
    first_name,
    last_name,
    description,
    address,
    website,
    phone,
  } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res
      .status(400)
      .json({ message: "Les champs principaux sont obligatoires." });
  }

  if (!isPasswordValid(password)) {
    return res.status(400).json({
      message:
        "Le mot de passe doit contenir au moins 11 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
    });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === "school" ? "school" : "student";
    const userStatus = userRole === "school" ? "pending" : "active";

    const sqlUser =
      "INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.query(sqlUser, [
      email,
      hashedPassword,
      first_name,
      last_name,
      userRole,
      userStatus,
    ]);

    const newUserId = result.insertId;

    if (userRole === "school") {
      const sqlDetails =
        "INSERT INTO school_details (user_id, description, address, website, phone) VALUES (?, ?, ?, ?, ?)";
      await db.query(sqlDetails, [
        newUserId,
        description || "",
        address || "",
        website || "",
        phone || "",
      ]);
    }

    res.status(201).json({
      message:
        userRole === "school"
          ? "Inscription réussie ! Votre compte école est en attente de validation par un administrateur."
          : "Inscription réussie ! Bienvenue.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
});

module.exports = router;