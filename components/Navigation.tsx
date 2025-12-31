
import React from 'react';
import { AppScreen } from '../types';
import { Phone, Users, Clock, MessageSquare } from 'lucide-react';

interface NavigationProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeScreen, onNavigate }) => {
  const tabs = [
    { id: AppScreen.RECENTS, label: 'Recents', icon: Clock },
    { id: AppScreen.CONTACTS, label: 'Contacts', icon: Users },
    { id: AppScreen.DIALER, label: 'Keypad', icon: Phone },
    { id: AppScreen.MESSAGES, label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Navigation;
