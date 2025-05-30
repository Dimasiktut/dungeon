
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Button from './Button';
// import Input from './Input'; // Using a simpler input here for chat - already simplified

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  localPlayerId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, localPlayerId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="bg-purple-800 bg-opacity-70 border-2 border-yellow-400 rounded-lg p-4 flex flex-col h-full shadow-xl">
      <h3 className="text-xl text-yellow-300 font-bold mb-2 text-center game-font-applied">Ye Olde Chat Scroll</h3>
      <div className="flex-grow overflow-y-auto mb-3 pr-2 space-y-2 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-purple-700">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded-md text-sm ${msg.playerId === localPlayerId ? 'bg-yellow-500 bg-opacity-30 text-yellow-100 ml-auto' : (msg.playerId === 'system' ? 'bg-gray-600 text-gray-300 italic' : 'bg-purple-600 bg-opacity-50 text-yellow-200 mr-auto')}`} style={{maxWidth: '80%'}}>
            <span className={`font-bold ${msg.playerId === 'system' ? 'hidden' : ''}`}>{msg.playerName}: </span>
            {msg.text}
            <div className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a missive..."
          className="flex-grow bg-purple-700 shadow-inner border-2 border-yellow-500 rounded-l-lg py-2 px-3 text-yellow-200 focus:outline-none focus:border-yellow-300 placeholder-yellow-500 opacity-80"
        />
        <Button type="submit" variant="primary" size="md" className="rounded-l-none">Send</Button>
      </form>
    </div>
  );
};

export default ChatWindow;