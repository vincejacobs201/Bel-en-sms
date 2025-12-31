
import React from 'react';
import { Contact } from '../types';
import { Phone, MessageCircle } from 'lucide-react';

interface ContactsProps {
  contacts: Contact[];
  onCall: (number: string, name: string) => void;
  onMessage: (number: string, name: string) => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onCall, onMessage }) => {
  return (
    <div className="px-6 pb-6">
      <h1 className="text-3xl font-bold text-white mb-6 pt-4">Contacts</h1>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
              />
              <div>
                <div className="font-semibold text-white">{contact.name}</div>
                <div className="text-sm text-slate-500">{contact.number}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onMessage(contact.number, contact.name)}
                className="p-3 rounded-full bg-slate-500/10 text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-all"
              >
                <MessageCircle size={20} fill="currentColor" />
              </button>
              <button
                onClick={() => onCall(contact.number, contact.name)}
                className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"
              >
                <Phone size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts;
