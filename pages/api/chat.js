// Import du fetch compatible Node.js
import fetch from 'node-fetch';

// Liste de réponses du faux humain
const fakeReplies = [
  "Bonne question ! Qu'en penses-tu, toi ?",
  "Je suis d'accord, c’est assez complexe à dire.",
  "Je crois que cela dépend du contexte.",
  "Haha, pas sûr de pouvoir te répondre là-dessus.",
  "Tu poses toujours des questions intéressantes !",
  "Je me demande si la réponse est vraiment si simple...",
  "Je t’avoue que je ne sais pas trop.",
];

// URL du modèle Hugging Face rapide
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/bigscience/bloom-560m";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message, role } = req.body;

  if (!message || !role) {
    return res.status(400).json({ error: 'Message ou rôle manquant.' });
  }

  let reply = '';

  if (role === 'fake') {
    // Réponse aléatoire d'un faux humain
    const index = Math.floor(Math.random() * fakeReplies.length);
    reply = fakeReplies[index];
  } else if (role === 'gpt') {
    try {
      // Vérifie que la clé est présente
      if (!process.env.HF_API_KEY) {
        throw new Error("Clé Hugging Face manquante (HF_API_KEY)");
      }

      // Appel au modèle Hugging Face
      const hfResponse = await fetch(HF_MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: message,
        }),
      });

      const hfData = await hfResponse.json();
      console.log("HF RESPONSE :", hfData);

      if (hfData.error || !hfData[0]) {
        if (hfData.error?.includes("loading") || hfData.estimated_time) {
          reply = "[Le modèle est en cours de chargement. Réessaie dans quelques secondes.]";
        } else {
          reply = `[Erreur Hugging Face : ${hfData.error || "modèle indisponible"}]`;
        }
      } else {
        reply = hfData[0].generated_text || "[Pas de réponse générée]";
      }
    } catch (error) {
      console.error("Erreur Hugging Face:", error);
      reply = `[Erreur réseau Hugging Face : ${error.message || error}]`;
    }
  }

  res.status(200).json({ reply });
}