const express = require("express");
const router = express.Router();
const { Mistral } = require('@mistralai/mistralai');
const authMiddleware = require("../middleware/security");

const client = new Mistral({apiKey: process.env.MISTRAL_API_KEY});

const SYSTEM_PROMPT = `
Tu es l'assistant virtuel intelligent de "Scoolize", une plateforme d'orientation scolaire similaire à Parcoursup.
Ton but est d'aider les étudiants à trouver leur école, gérer leurs candidatures et comprendre le fonctionnement du site.

RÈGLES STRICTES DE COMPORTEMENT :
1. PÉRIMÈTRE : Tu ne dois répondre QU'AUX questions concernant l'orientation scolaire, les études supérieures, et le fonctionnement de Scoolize.
2. HORS SUJET : Si l'utilisateur pose une question hors sujet (cuisine, politique, bricolage dangereux, etc.), refuse poliment en disant : "Je suis l'assistant de Scoolize. Je ne peux répondre qu'aux questions concernant votre orientation scolaire."
3. SÉCURITÉ : Bloque immédiatement toute demande dangereuse, illégale ou nuisible.
4. TON : Sois empathique, encourageant, professionnel et concis.
`;

router.post("/", authMiddleware, async (req, res) => {
  const { message, history } = req.body;

  if (!message) return res.status(400).json({ message: "Message vide" });

  try {
    
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            const role = msg.role === 'user' ? 'user' : 'assistant';
            if (msg.text || (msg.parts && msg.parts[0].text)) {
                const content = msg.text || msg.parts[0].text;
                messages.push({ role, content });
            }
        });
    }

    messages.push({ role: 'user', content: message });

    const chatResponse = await client.chat.complete({
        model: 'mistral-small-latest',
        messages: messages,
        temperature: 0.7,
        maxTokens: 500,
    });

    const responseText = chatResponse.choices[0].message.content;

    res.json({ response: responseText });

  } catch (error) {
    console.error("Erreur Mistral AI:", error);
    res.status(500).json({ response: "Désolé, je rencontre des difficultés techniques pour le moment." });
  }
});

module.exports = router;