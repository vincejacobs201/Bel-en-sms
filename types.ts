
export enum AppScreen {
  DIALER = 'DIALER',
  CONTACTS = 'CONTACTS',
  RECENTS = 'RECENTS',
  MESSAGES = 'MESSAGES',
  CHAT = 'CHAT',
  IN_CALL = 'IN_CALL',
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  avatar: string;
}

export interface CallLog {
  id: string;
  name: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
}

export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: Date;
}

export interface ChatThread {
  id: string;
  contactName: string;
  number: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export interface AudioProcessingRefs {
  nextStartTime: number;
  sources: Set<AudioBufferSourceNode>;
}
