
import React from 'react';

// Composant réutilisable pour afficher la liste des messages
export default function ChatBox({ messages }) {
  return (
    <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-50">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center">Commencez une conversation…</p>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              msg.sender === 'User' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                msg.sender === 'User'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.sender === 'Bot A'
                  ? 'bg-green-200 text-black rounded-bl-none'
                  : 'bg-yellow-100 text-black rounded-bl-none'
              }`}
            >
              {/* Affiche le nom de l’expéditeur */}
              <p className="text-xs font-semibold mb-1">{msg.sender}</p>
              {/* Affiche le contenu du message */}
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}