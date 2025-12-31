
import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';

interface DialerProps {
  onCall: (number: string) => void;
}

const Dialer: React.FC<DialerProps> = ({ onCall }) => {
  const [number, setNumber] = useState('');

  const keys = [
    { n: '1', l: '' }, { n: '2', l: 'ABC' }, { n: '3', l: 'DEF' },
    { n: '4', l: 'GHI' }, { n: '5', l: 'JKL' }, { n: '6', l: 'MNO' },
    { n: '7', l: 'PQRS' }, { n: '8', l: 'TUV' }, { n: '9', l: 'WXYZ' },
    { n: '*', l: '' }, { n: '0', l: '+' }, { n: '#', l: '' },
  ];

  const handleKeyPress = (val: string) => {
    setNumber(prev => prev + val);
  };

  const handleBackspace = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full flex flex-col px-8 pb-10">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-4xl font-light tracking-tight text-white mb-8 h-12 overflow-hidden whitespace-nowrap">
          {number}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {keys.map((key) => (
          <button
            key={key.n}
            onClick={() => handleKeyPress(key.n)}
            className="w-16 h-16 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex flex-col items-center justify-center transition-transform active:scale-90"
          >
            <span className="text-2xl font-medium text-white">{key.n}</span>
            <span className="text-[8px] font-bold text-slate-500 tracking-widest">{key.l}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-12">
        <div className="w-16"></div>
        <button
          onClick={() => number && onCall(number)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            number ? 'bg-green-500 hover:bg-green-400 active:scale-90 shadow-lg shadow-green-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Phone fill="currentColor" size={28} />
        </button>
        <button
          onClick={handleBackspace}
          className={`w-16 h-16 flex items-center justify-center text-slate-400 hover:text-white transition-opacity ${
            number ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  );
};

export default Dialer;
