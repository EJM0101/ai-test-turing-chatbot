import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Réponses fictives pour le faux humain
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
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message, role } = req.body;

  if (!message || !role) {
    return res.status(400).json({ error: 'Message ou rôle manquant.' });
  }

  let reply = '';

  if (role === 'fake') {
    // Faux humain
    const index = Math.floor(Math.random() * fakeReplies.length);
    reply = fakeReplies[index];
  } else if (role === 'gpt') {
    try {
      console.log("OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? 'OK' : 'ABSENTE');
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es un assistant amical et intelligent.' },
          { role: 'user', content: message },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      reply = completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erreur GPT :', error);
      return res.status(500).json({ error: 'Erreur serveur GPT' });
    }
  } else {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  if (!reply) {
    reply = 'Erreur : aucune réponse générée.';
  }

  res.status(200).json({ reply });
}