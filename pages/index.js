import { useState } from 'react';
import ChatBox from '../components/ChatBox';

export default function Home() {
  // Liste des messages affichés dans le chat
  const [messages, setMessages] = useState([]);
  // Texte saisi par l’utilisateur
  const [input, setInput] = useState('');
  // Mode de devinette activé après envoi d’un message
  const [guessMode, setGuessMode] = useState(false);
  // Attribution aléatoire : quel bot est GPT ? (ex: ['gpt', 'fake'])
  const [botRoles] = useState(shuffle(['gpt', 'fake']));
  // L’utilisateur a-t-il déjà fait une tentative de devinette ?
  const [guessed, setGuessed] = useState(false);
  // Message affiché après la devinette
  const [reveal, setReveal] = useState(null);

  // Fonction de mélange aléatoire (Fisher-Yates)
  function shuffle(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Envoi du message utilisateur et réception des réponses des 2 bots
  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: 'User', text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput('');
  setGuessMode(true);

  const responses = await Promise.all(
    botRoles.map(async (role, i) => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input, role }),
        });

        const data = await res.json();

        // Debug : log dans la console
        console.log(`Bot ${String.fromCharCode(65 + i)} (${role}) =>`, data);

        return {
          sender: `Bot ${String.fromCharCode(65 + i)}`,
          text: data.reply || "[Erreur : aucune réponse reçue]",
        };
      } catch (err) {
        console.error(`Erreur avec le Bot ${role} :`, err);
        return {
          sender: `Bot ${String.fromCharCode(65 + i)}`,
          text: "[Erreur lors de la récupération de la réponse]",
        };
      }
    })
  );

  setMessages((prev) => [...prev, ...responses]);
};

  // Quand l’utilisateur devine qui est l’IA (Bot A ou B)
  const handleGuess = (guess) => {
    setGuessed(true);
    const correct = botRoles[guess === 'A' ? 0 : 1] === 'gpt';
    setReveal(
      correct
        ? 'Bonne réponse ! Bot ' + guess + ' est l’IA.'
        : 'Raté ! Ce n’était pas le bon.'
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test de Turing - Qui est l’IA ?</h1>

        {/* Zone d’affichage des messages */}
        <ChatBox messages={messages} />

        {/* Boutons de devinette (si activé) */}
        {!guessed && guessMode && (
          <div className="my-4">
            <p className="mb-2 font-medium">Devine qui est l’intelligence artificielle :</p>
            <div className="flex space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleGuess('A')}
              >
                Bot A
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => handleGuess('B')}
              >
                Bot B
              </button>
            </div>
          </div>
        )}

        {/* Message final après devinette */}
        {reveal && (
          <div className="mt-4 text-xl font-semibold text-purple-700">{reveal}</div>
        )}

        {/* Champ de saisie + bouton envoyer */}
        <div className="mt-6 flex">
          <input
            className="flex-grow border border-gray-300 p-2 rounded-l-md focus:outline-none"
            type="text"
            placeholder="Pose une question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-2 rounded-r-md"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}