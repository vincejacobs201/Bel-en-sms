
import React, { useState, useRef, useEffect } from 'react';
import { ChatThread } from '../types';
import { ChevronLeft, Send, Phone } from 'lucide-react';

interface ChatViewProps {
  thread: ChatThread;
  onBack: () => void;
  onSendMessage: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ thread, onBack, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread.messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col z-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md">
        <button onClick={onBack} className="p-1 -ml-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={`https://picsum.photos/seed/${thread.contactName}/200`}
            alt={thread.contactName}
            className="w-10 h-10 rounded-full border border-slate-700"
          />
          <div className="flex-1 truncate">
            <div className="font-semibold text-white text-sm truncate">{thread.contactName}</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Online</div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Phone size={20} />
        </button>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {thread.messages.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-10">
            Dit is het begin van je chat met {thread.contactName}
          </div>
        ) : (
          thread.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'me'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div className={`text-[9px] mt-1 opacity-50 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-white/5">
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2 border border-white/5 focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type een bericht..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-1.5 rounded-full transition-all ${
              inputText.trim() ? 'bg-blue-500 text-white scale-110' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={18} fill={inputText.trim() ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
