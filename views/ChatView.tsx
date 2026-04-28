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
    const cleanInput = input.trim().slice(0, 1200);
    if (!cleanInput) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: cleanInput,
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
    <div className="flex h-[calc(100vh-180px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:h-[650px]">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Bot className="text-primary w-6 h-6" />
        </div>
        <div>
            <h3 className="text-slate-950 font-black">FitGenie Coach</h3>
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
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-700 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-slate-100 rounded-lg p-4 rounded-bl-none flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about workouts, meals, or recovery..."
          maxLength={1200}
          className="input-shell flex-1 rounded-xl px-4 py-3 placeholder:text-slate-400"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="rounded-xl bg-primary p-3 text-white transition-colors hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-primary"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
