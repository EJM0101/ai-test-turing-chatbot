// Importation des modules nécessaires
import { Configuration, OpenAIApi } from 'openai';

// Initialisation de la configuration OpenAI via variable d’environnement
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Faux humain : liste de réponses prédéfinies
const fakeReplies = [
  "Bonne question ! Qu'en penses-tu, toi ?",
  "Je suis d'accord, c’est assez complexe à dire.",
  "Je crois que cela dépend du contexte.",
  "Haha, pas sûr de pouvoir te répondre là-dessus.",
  "Tu poses toujours des questions intéressantes !",
  "Je me demande si la réponse est vraiment si simple...",
  "Je t’avoue que je ne sais pas trop.",
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Rejette les requêtes non POST
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message, role } = req.body;

  // Vérifie si les champs sont valides
  if (!message || !role) {
    return res.status(400).json({ error: 'Message ou rôle manquant.' });
  }

  let reply = '';

  if (role === 'fake') {
    // Simule une réponse humaine en piochant une réponse aléatoire
    const index = Math.floor(Math.random() * fakeReplies.length);
    reply = fakeReplies[index];
  } else if (role === 'gpt') {
    try {
      // Appel à l’API OpenAI (modèle gpt-3.5-turbo)
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es un assistant amical et intelligent.' },
          { role: 'user', content: message },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      reply = completion.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erreur GPT :', error);
      return res.status(500).json({ error: 'Erreur serveur GPT' });
    }
  } else {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  // Envoie la réponse au frontend
  res.status(200).json({ reply });
}
