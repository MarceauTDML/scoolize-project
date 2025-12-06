const bcrypt = require("bcrypt");
const db = require("../config/db");
const generateToken = require("../config/token");

exports.register = async (req, res) => {
  const { email, password, role, firstName, lastName, schoolName } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, mot de passe et rôle sont obligatoires." });
  }

  try {
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role]
    );

    const newUserId = result.insertId;

    if (role === "student") {
      if (!firstName || !lastName) {
        await db.query("DELETE FROM users WHERE id = ?", [newUserId]);
        return res
          .status(400)
          .json({ message: "Prénom et Nom sont requis pour un étudiant." });
      }
      await db.query(
        "INSERT INTO students (user_id, first_name, last_name) VALUES (?, ?, ?)",
        [newUserId, firstName, lastName]
      );
    } else if (role === "school") {
      if (!schoolName) {
        await db.query("DELETE FROM users WHERE id = ?", [newUserId]);
        return res
          .status(400)
          .json({ message: "Le nom de l'école est requis." });
      }
      await db.query("INSERT INTO schools (user_id, name) VALUES (?, ?)", [
        newUserId,
        schoolName,
      ]);
    }

    const token = generateToken(newUserId, role);

    res.status(201).json({
      message: "Inscription réussie !",
      token: token,
      user: {
        id: newUserId,
        email: email,
        role: role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    let profileData = {};
    if (user.role === "student") {
      const [students] = await db.query(
        "SELECT * FROM students WHERE user_id = ?",
        [user.id]
      );
      profileData = students[0];
    } else if (user.role === "school") {
      const [schools] = await db.query(
        "SELECT * FROM schools WHERE user_id = ?",
        [user.id]
      );
      profileData = schools[0];
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: "Connexion réussie",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ai_tokens_used: user.ai_tokens_used,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, email, role, ai_tokens_used FROM users WHERE id = ?",
      [req.user.id]
    );
    const user = users[0];

    let profileData = {};
    if (user.role === "student") {
      const [students] = await db.query(
        "SELECT * FROM students WHERE user_id = ?",
        [user.id]
      );
      profileData = students[0];
    } else if (user.role === "school") {
      const [schools] = await db.query(
        "SELECT * FROM schools WHERE user_id = ?",
        [user.id]
      );
      profileData = schools[0];
    }

    res.json({
      user: {
        ...user,
        profile: profileData,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Impossible de récupérer le profil." });
  }
};
