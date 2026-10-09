import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Sparkles, MessageSquare, Coffee, Compass, GraduationCap, Mic, MicOff } from 'lucide-react';
import { playWavBase64 } from '../utils/audio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioBase64?: string;
  timestamp: string;
}

interface ConversationalConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onQuickPromptClick: (prompt: string) => void;
  isLiveConnected: boolean;
}

export const ConversationalConsole: React.FC<ConversationalConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onQuickPromptClick,
  isLiveConnected,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handlePlayAudio = (id: string, base64Audio?: string) => {
    if (!base64Audio) return;
    setPlayingAudioId(id);
    playWavBase64(base64Audio, () => {
      setPlayingAudioId(null);
    });
  };

  const toggleMicInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setIsRecording(false);
        if (transcript) {
          setInputText(transcript);
          onSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      setIsRecording(false);
    }
  };

  const curatedPrompts = [
    {
      label: 'Luxury Marketing Vision',
      prompt: 'How does your double master’s in international marketing at HWR Berlin and ESCE Paris shape your vision for the luxury sector?',
      icon: GraduationCap,
    },
    {
      label: 'Villa Neukölln Leadership',
      prompt: 'What did managing service at Villa Neukölln in Berlin teach you about operational leadership?',
      icon: Compass,
    },
    {
      label: 'The Black Coffee Manifesto',
      prompt: 'Why do you take your coffee black and your navy blue background so seriously?',
      icon: Coffee,
    },
    {
      label: 'Charming French Deflection',
      prompt: 'Pourrais-tu m’expliquer la formule de régression d’un modèle d’audit chez KPMG ?',
      icon: Sparkles,
    },
    {
      label: 'Bilingual Higher Education',
      prompt: 'Erzähl mir von deiner Rolle als Botschafter der Deutsch-Französischen Hochschule.',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto rounded-2xl bg-[#091122]/90 border border-[#1a2b50]/60 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#162544] bg-[#070d1a]/80">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#dfb87a] animate-pulse" />
          <h2 className="font-serif-luxury text-lg tracking-wider text-[#f1f5f9] font-medium">
            Salon de Conversation
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
          <span className="font-mono text-[11px] tracking-wide text-[#c59e5e]">
            {isLiveConnected ? 'Live Audio Mode Active' : 'Interactive Dialogue'}
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-3 border-b border-[#14213d] bg-[#0a1326]/50">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#94a3b8] mb-2 font-sans font-medium">
          Conversational Inquiries
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {curatedPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onQuickPromptClick(item.prompt)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101b36] hover:bg-[#1a2c56] border border-[#1e335f] text-xs text-[#cbd5e1] hover:text-[#dfb87a] transition-all whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-[#dfb87a]/80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto px-6 py-5 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#94a3b8]">
            <p className="font-serif-luxury text-2xl text-[#cbd5e1] italic font-light mb-2">
              "A refined conversation is an art form."
            </p>
            <p className="text-xs text-[#64748b] max-w-md font-sans">
              Engage Cano through live voice or select an inquiry above. Expect concise remarks delivered with unhurried poise.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-[#64748b]">
                <span className="font-medium text-[#94a3b8]">
                  {msg.role === 'user' ? 'You' : 'Cano'}
                </span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#142347] border border-[#233a70] text-[#f8fafc] rounded-tr-none'
                    : 'bg-[#0c162d] border border-[#1b2d56] text-[#e2e8f0] font-serif-luxury text-lg tracking-wide rounded-tl-none shadow-lg'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.role === 'assistant' && msg.audioBase64 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1a2c54] flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.audioBase64)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16274e] hover:bg-[#20376d] text-xs font-sans text-[#dfb87a] transition-all cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{playingAudioId === msg.id ? 'Playing Voice...' : 'Listen to Cano'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-[#0c162d] border border-[#1b2d56] rounded-2xl rounded-tl-none px-5 py-3.5 shadow-lg flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-[#dfb87a] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#dfb87a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#dfb87a] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-sans text-[#94a3b8] italic">
                Cano is formulating a witty reply...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-[#162544] bg-[#070d1a]/90 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMicInput}
          title={isRecording ? 'Stop speech recognition' : 'Speak to Cano'}
          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer border ${
            isRecording
              ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
              : 'bg-[#0d172e] border-[#1e325c] text-[#dfb87a] hover:border-[#dfb87a]'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRecording ? 'Listening to your speech...' : 'Speak or write to Cano in English, German, or French...'}
          disabled={isLoading}
          className="flex-1 bg-[#0d172e] border border-[#1e325c] focus:border-[#dfb87a] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#dfb87a] text-[#070d18] hover:bg-[#eed099] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
