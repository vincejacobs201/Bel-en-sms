
import React, { useState } from 'react';
import { ChatThread, Contact } from '../types';
import { Plus, Search, X } from 'lucide-react';

interface MessagesProps {
  threads: ChatThread[];
  contacts: Contact[];
  onSelectThread: (id: string) => void;
  onNewMessage: (number: string, name: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ threads, contacts, onSelectThread, onNewMessage }) => {
  const [isPickingContact, setIsPickingContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.number.includes(searchQuery)
  );

  return (
    <div className="px-6 pb-6 relative h-full flex flex-col">
      <div className="flex justify-between items-center pt-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <button 
          onClick={() => setIsPickingContact(true)}
          className="p-2 bg-blue-500 rounded-full text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
          <p className="max-w-[200px]">No messages yet. Tap the + icon to start a new chat!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className="w-full flex items-center gap-4 p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-left"
            >
              <img
                src={`https://picsum.photos/seed/${thread.contactName}/200`}
                alt={thread.contactName}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-semibold text-white truncate">{thread.contactName}</div>
                  <div className="text-[10px] text-slate-500 whitespace-nowrap">{formatTime(thread.timestamp)}</div>
                </div>
                <div className="text-sm text-slate-400 truncate">
                  {thread.lastMessage || 'No messages yet'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Message / Contact Picker Overlay */}
      {isPickingContact && (
        <div className="absolute inset-0 bg-slate-900 z-[60] flex flex-col pt-4">
          <div className="flex items-center gap-4 px-6 mb-6">
            <button onClick={() => setIsPickingContact(false)} className="text-slate-400">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white">New Message</h2>
          </div>

          <div className="px-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="To: Name or number"
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Suggestions</div>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onNewMessage(contact.number, contact.name);
                    setIsPickingContact(false);
                  }}
                  className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                  <div>
                    <div className="text-white font-medium">{contact.name}</div>
                    <div className="text-xs text-slate-500">{contact.number}</div>
                  </div>
                </button>
              ))
            ) : (
              searchQuery.length > 0 && (
                <button
                  onClick={() => {
                    onNewMessage(searchQuery, searchQuery);
                    setIsPickingContact(false);
                  }}
                  className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left text-blue-400"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Message "{searchQuery}"</div>
                    <div className="text-xs opacity-70">Start conversation with new number</div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
