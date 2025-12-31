
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Video } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface InCallProps {
  number: string;
  name: string;
  onEnd: () => void;
}

const InCall: React.FC<InCallProps> = ({ number, name, onEnd }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioRefs = useRef<{
    inputAudioContext: AudioContext | null;
    outputAudioContext: AudioContext | null;
    nextStartTime: number;
    sources: Set<AudioBufferSourceNode>;
    stream: MediaStream | null;
    scriptProcessor: ScriptProcessorNode | null;
  }>({
    inputAudioContext: null,
    outputAudioContext: null,
    nextStartTime: 0,
    sources: new Set(),
    stream: null,
    scriptProcessor: null,
  });

  const sessionRef = useRef<any>(null);

  // Helper functions for audio encoding/decoding as required by guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    const initCall = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        audioRefs.current.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioRefs.current.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioRefs.current.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              const source = audioRefs.current.inputAudioContext!.createMediaStreamSource(audioRefs.current.stream!);
              audioRefs.current.scriptProcessor = audioRefs.current.inputAudioContext!.createScriptProcessor(4096, 1, 1);
              
              audioRefs.current.scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Audio level visualization logic
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                setAudioLevel(Math.sqrt(sum / inputData.length) * 100);

                if (!isMuted) {
                  const pcmBlob = createBlob(inputData);
                  sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                  });
                }
              };

              source.connect(audioRefs.current.scriptProcessor);
              audioRefs.current.scriptProcessor.connect(audioRefs.current.inputAudioContext!.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && audioRefs.current.outputAudioContext) {
                const ctx = audioRefs.current.outputAudioContext;
                audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, ctx.currentTime);
                
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                  audioRefs.current.sources.delete(source);
                });
                
                source.start(audioRefs.current.nextStartTime);
                audioRefs.current.nextStartTime += buffer.duration;
                audioRefs.current.sources.add(source);
              }

              if (message.serverContent?.interrupted) {
                audioRefs.current.sources.forEach(s => s.stop());
                audioRefs.current.sources.clear();
                audioRefs.current.nextStartTime = 0;
              }
            },
            onerror: (e) => console.error('Gemini error:', e),
            onclose: () => onEnd(),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `Je bent een vriendelijke telefonische assistent voor een app genaamd Gemini Voice Link. 
            De gebruiker heeft zojuist nummer ${number} gedraaid (Naam: ${name}). 
            Doe alsof je de persoon bent die ze bellen of een virtuele operator die hen helpt. 
            Houd het gesprek natuurlijk en responsief. Spreek Nederlands.`,
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to init call:', err);
        onEnd();
      }
    };

    initCall();

    return () => {
      clearInterval(timer);
      if (sessionRef.current) sessionRef.current.close();
      if (audioRefs.current.stream) audioRefs.current.stream.getTracks().forEach(t => t.stop());
      if (audioRefs.current.inputAudioContext) audioRefs.current.inputAudioContext.close();
      if (audioRefs.current.outputAudioContext) audioRefs.current.outputAudioContext.close();
    };
  }, [number, name, onEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col p-8 transition-all duration-500">
      <div className="flex-1 flex flex-col items-center pt-12">
        <div className="relative mb-8">
          {/* Animated rings for call activity */}
          <div 
            className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
            style={{ animationDuration: '3s' }}
          ></div>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
            <img 
              src={`https://picsum.photos/seed/${name}/300`} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Audio Visualizer Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full shadow-lg flex gap-1 items-center">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-white/80 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, audioLevel * (0.5 + Math.random()))}%` }}
              />
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{name}</h2>
        <p className="text-slate-400 font-medium mb-1">{number}</p>
        <p className="text-blue-400 font-mono text-lg font-semibold tracking-wider">
          {isConnecting ? 'Connecting...' : formatTime(duration)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 pb-12">
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mute</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center transition-all">
            <Volume2 size={24} />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Speaker</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center cursor-not-allowed">
            <Video size={24} />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video</span>
        </div>
      </div>

      <div className="flex justify-center pb-8">
        <button
          onClick={onEnd}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 shadow-2xl shadow-red-500/30 flex items-center justify-center transition-all"
        >
          <PhoneOff size={32} fill="white" className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default InCall;
