
import React, { useState, useCallback, useMemo } from 'react';
import { AppScreen, Contact, CallLog, ChatThread, Message } from './types';
import Dialer from './components/Dialer';
import Contacts from './components/Contacts';
import Recents from './components/Recents';
import Messages from './components/Messages';
import ChatView from './components/ChatView';
import InCall from './components/InCall';
import Navigation from './components/Navigation';
import { GoogleGenAI } from "@google/genai";

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Gemini Assistant', number: '001', avatar: 'https://picsum.photos/seed/gemini/200' },
  { id: '2', name: 'John Doe', number: '+31 6 12345678', avatar: 'https://picsum.photos/seed/john/200' },
  { id: '3', name: 'Jane Smith', number: '+1 555 0199', avatar: 'https://picsum.photos/seed/jane/200' },
  { id: '4', name: 'Tech Support', number: '800-AI-HELP', avatar: 'https://picsum.photos/seed/tech/200' },
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DIALER);
  const [activeCallNumber, setActiveCallNumber] = useState<string | null>(null);
  const [activeCallName, setActiveCallName] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const activeThread = useMemo(() => 
    threads.find(t => t.id === activeThreadId), 
  [threads, activeThreadId]);

  const startCall = useCallback((number: string, name?: string) => {
    setActiveCallNumber(number);
    setActiveCallName(name || number);
    setCurrentScreen(AppScreen.IN_CALL);
    
    const newLog: CallLog = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Unknown',
      number: number,
      type: 'outgoing',
      timestamp: new Date(),
    };
    setCallLogs(prev => [newLog, ...prev]);
  }, []);

  const endCall = useCallback(() => {
    setCurrentScreen(AppScreen.DIALER);
    setActiveCallNumber(null);
    setActiveCallName(null);
  }, []);

  const openChat = useCallback((number: string, name?: string) => {
    const existingThread = threads.find(t => t.number === number);
    if (existingThread) {
      setActiveThreadId(existingThread.id);
    } else {
      const newThread: ChatThread = {
        id: Math.random().toString(36).substr(2, 9),
        contactName: name || number,
        number: number,
        lastMessage: '',
        timestamp: new Date(),
        messages: []
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    }
    setCurrentScreen(AppScreen.CHAT);
  }, [threads]);

  const sendMessage = async (text: string) => {
    if (!activeThreadId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'me',
      text,
      timestamp: new Date()
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [...t.messages, newMessage],
          lastMessage: text,
          timestamp: new Date()
        };
      }
      return t;
    }));

    // Generate AI response
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const currentThread = threads.find(t => t.id === activeThreadId);
      const contactName = currentThread?.contactName || 'Unknown';

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `De gebruiker stuurde: "${text}". Antwoord als ${contactName} in een kort SMS-bericht (maximaal 2 zinnen).`,
        config: {
          systemInstruction: `Je bent een persoon in een chatgesprek genaamd ${contactName}. Reageer kort en bondig in het Nederlands, alsof je een SMS stuurt.`
        }
      });

      const replyText = response.text || 'Geen gehoor.';
      const replyMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'them',
        text: replyText,
        timestamp: new Date()
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, replyMessage],
            lastMessage: replyText,
            timestamp: new Date()
          };
        }
        return t;
      }));
    } catch (error) {
      console.error('Error generating message response:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="relative w-full max-w-md h-[800px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>
        <div className="px-8 pt-4 pb-2 flex justify-between text-xs font-semibold text-white/70">
          <span>9:41</span>
          <div className="flex gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3v18h-3v-18h3zm-5 5v13h-3v-13h3zm-5 5v8h-3v-8h3zm-5 5v3h-3v-3h3z"/></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pt-4 relative">
          {currentScreen === AppScreen.DIALER && <Dialer onCall={startCall} />}
          {currentScreen === AppScreen.CONTACTS && <Contacts contacts={MOCK_CONTACTS} onCall={startCall} onMessage={openChat} />}
          {currentScreen === AppScreen.RECENTS && <Recents logs={callLogs} />}
          {currentScreen === AppScreen.MESSAGES && (
            <Messages 
              threads={threads} 
              contacts={MOCK_CONTACTS}
              onSelectThread={(id) => { setActiveThreadId(id); setCurrentScreen(AppScreen.CHAT); }} 
              onNewMessage={openChat}
            />
          )}
          {currentScreen === AppScreen.CHAT && activeThread && <ChatView thread={activeThread} onBack={() => setCurrentScreen(AppScreen.MESSAGES)} onSendMessage={sendMessage} />}
          {currentScreen === AppScreen.IN_CALL && (
            <InCall 
              number={activeCallNumber || ''} 
              name={activeCallName || 'Unknown'} 
              onEnd={endCall} 
            />
          )}
        </div>
        {![AppScreen.IN_CALL, AppScreen.CHAT].includes(currentScreen) && (
          <Navigation 
            activeScreen={currentScreen} 
            onNavigate={setCurrentScreen} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
