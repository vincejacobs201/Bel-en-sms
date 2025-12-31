
import React from 'react';
import { CallLog } from '../types';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';

interface RecentsProps {
  logs: CallLog[];
}

const Recents: React.FC<RecentsProps> = ({ logs }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="px-6 pb-6">
      <h1 className="text-3xl font-bold text-white mb-6 pt-4">Recents</h1>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <PhoneOutgoing size={48} className="mb-4 opacity-20" />
          <p>No recent calls</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex gap-4">
                <div className="mt-1">
                  {log.type === 'incoming' && <PhoneIncoming size={16} className="text-green-500" />}
                  {log.type === 'outgoing' && <PhoneOutgoing size={16} className="text-blue-500" />}
                  {log.type === 'missed' && <PhoneMissed size={16} className="text-red-500" />}
                </div>
                <div>
                  <div className={`font-semibold ${log.type === 'missed' ? 'text-red-400' : 'text-white'}`}>
                    {log.name}
                  </div>
                  <div className="text-xs text-slate-500">{log.number}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recents;
