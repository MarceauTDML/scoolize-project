const { Mistral } = require("@mistralai/mistralai");
const db = require("../config/db");
require("dotenv").config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const ROLE_LIMITS = {
  student: 50000,
  school: 200000,
  moderator: 100000,
  admin: Infinity,
};

async function checkQuota(userId, role) {
  if (role === "admin") return true;

  const [rows] = await db.query(
    "SELECT ai_tokens_used, ai_last_reset FROM users WHERE id = ?",
    [userId]
  );
  if (rows.length === 0) throw new Error("Utilisateur introuvable");

  const user = rows[0];
  const now = new Date();
  const lastReset = user.ai_last_reset
    ? new Date(user.ai_last_reset)
    : new Date(0);

  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    await db.query(
      "UPDATE users SET ai_tokens_used = 0, ai_last_reset = ? WHERE id = ?",
      [now, userId]
    );
    user.ai_tokens_used = 0;
  }

  const limit = ROLE_LIMITS[role] || 0;

  if (user.ai_tokens_used >= limit) {
    throw new Error(`Quota IA dépassé pour ce mois (${limit} tokens max).`);
  }

  return true;
}

async function generateResponse(
  userId,
  role,
  userMessage,
  systemInstruction = "Tu es un assistant utile."
) {
  try {
    await checkQuota(userId, role);

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage },
      ],
    });

    const reply = chatResponse.choices[0].message.content;
    const tokensUsed = chatResponse.usage.totalTokens;

    await db.query(
      "UPDATE users SET ai_tokens_used = ai_tokens_used + ? WHERE id = ?",
      [tokensUsed, userId]
    );

    return {
      reply: reply,
      tokensUsed: tokensUsed,
      remaining: role === "admin" ? "Illimité" : ROLE_LIMITS[role] - tokensUsed,
    };
  } catch (error) {
    console.error("Erreur Service IA:", error);
    throw error;
  }
}

module.exports = { generateResponse };