import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAiChatResponse } from '../services/aiService';
import { Send, Bot } from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, onAddMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    // Add user message to UI immediately
    onAddMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Call Real AI Service (Gemini)
    // We pass the current message AND the existing history so the AI has context
    const aiText = await getAiChatResponse(userMsg.text, messages);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: aiText,
      timestamp: Date.now()
    };
    
    setIsTyping(false);
    onAddMessage(aiMsg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[600px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Bot className="text-primary w-6 h-6" />
        </div>
        <div>
            <h3 className="text-white font-bold">FitGenie Coach</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
               <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
            </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <p>Ask me anything about your workout or diet plan!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-slate-800 rounded-2xl p-4 rounded-bl-none flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-primary hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-primary text-white p-3 rounded-xl transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
