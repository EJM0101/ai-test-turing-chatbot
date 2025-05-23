export const config = {
  runtime: 'nodejs' // Désactive le mode Edge
};
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_KEY);

// Faux humain
const fakeReplies = [
  "Bonne question ! Qu'en penses-tu, toi ?",
  "Je suis d'accord, c’est assez complexe à dire.",
  "Je crois que cela dépend du contexte.",
  "Haha, pas sûr de pouvoir te répondre là-dessus.",
  "Tu poses toujours des questions intéressantes !"
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
    const index = Math.floor(Math.random() * fakeReplies.length);
    reply = fakeReplies[index];
  } else if (role === 'gpt') {
    try {
  const result = await hf.textGeneration({
    model: 'gpt2',
    inputs: message,
    parameters: {
      max_new_tokens: 100,
      temperature: 0.7,
      return_full_text: false
    }
  });

  reply = result?.generated_text || "[Pas de réponse générée]";
} catch (error) {
  console.error("Erreur Hugging Face:", error);
  reply = `[Erreur Hugging Face : ${error.message || error.toString()}]`;
}
  }

  res.status(200).json({ reply });
}