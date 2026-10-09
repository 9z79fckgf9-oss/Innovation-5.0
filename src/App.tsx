import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { AudioOrb } from './components/AudioOrb';
import { LiveVoiceController } from './components/LiveVoiceController';
import { ConversationalConsole, ChatMessage } from './components/ConversationalConsole';
import { CanBogaDossier } from './components/CanBogaDossier';
import { Footer } from './components/Footer';
import { playWavBase64 } from './utils/audio';

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveStatus, setLiveStatus] = useState({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null as string | null,
  });

  const [externalTrigger, setExternalTrigger] = useState<{ text: string; id: number } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-greeting',
      role: 'assistant',
      content:
        'A pleasure to make your acquaintance. I am Cano, representing Can Boga. Whether we discuss luxury marketing in Paris, team leadership in Berlin, or simply the merits of drinking black coffee, I am entirely at your disposal.',
      timestamp: 'Just now',
    },
  ]);

  const [isChatLoading, setIsChatLoading] = useState(false);

  // Send message via /api/chat (Gemini 3.8 Flash + Gemini TTS)
  const handleSendMessage = useCallback(
    async (text: string) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Append user turn
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMsg]);

      // If Live API WebSocket is active, forward text into live session
      if (liveStatus.isConnected) {
        setExternalTrigger({ text, id: Date.now() });
      }

      setIsChatLoading(true);

      // Pre-unlock audio on mobile user touch/gesture
      try {
        const dummyAudio = new Audio();
        dummyAudio.play().catch(() => {});
      } catch (e) {}

      let data: any = null;
      let lastError: any = null;

      // Automatic retry once on network interruption
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              voice: selectedVoice,
              history: messages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });

          if (res.ok) {
            data = await res.json();
            break;
          } else {
            throw new Error(`Server responded with ${res.status}`);
          }
        } catch (attemptErr) {
          lastError = attemptErr;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (data && data.text) {
        const replyText = data.text;
        const audioBase64 = data.audio;

        const assistantMsg: ChatMessage = {
          id: `cano-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          audioBase64,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Automatically play Cano's deep voiced response
        if (audioBase64) {
          playWavBase64(audioBase64);
        }
      } else {
        console.error('Chat error after retries:', lastError);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content:
              'Pardon me, it appears a technical nuance occurred. Shall we try once more?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      setIsChatLoading(false);
    },
    [liveStatus.isConnected, messages, selectedVoice]
  );

  // Incoming transcript from live audio session
  const handleTranscriptReceived = useCallback(
    (turn: { role: 'user' | 'assistant'; text: string }) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `live-${Date.now()}-${Math.random()}`,
          role: turn.role,
          content: turn.text,
          timestamp: timeStr,
        },
      ]);
    },
    []
  );

  const handleLiveStatusChange = useCallback(
    (status: { isConnected: boolean; isListening: boolean; isSpeaking: boolean; error: string | null }) => {
      setLiveStatus(status);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#070d18] text-[#f1f5f9] flex flex-col selection:bg-[#203660] selection:text-[#f8fafc]">
      <Header isLiveConnected={liveStatus.isConnected} isSpeaking={liveStatus.isSpeaking} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col items-center">
        {/* Editorial Introduction */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d172e] border border-[#1b2f57] text-[11px] text-[#dfb87a] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dfb87a]" />
            <span>Digital Persona & Voice Ambassador</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl text-[#f8fafc] font-normal tracking-wide leading-tight">
            Sophisticated, Multilingual, Alarmingly Charming.
          </h2>

          <p className="text-xs sm:text-sm text-[#94a3b8] mt-4 font-sans leading-relaxed">
            Representing Can Boga — Master's in Luxury Marketing at HWR Berlin & ESCE Paris. Conversing fluently in German, British English, and French with an irresistible baritone.
          </p>
        </div>

        {/* Central Audio Orb & Visualizer */}
        <div className="my-2">
          <AudioOrb
            isSpeaking={liveStatus.isSpeaking}
            isListening={liveStatus.isListening}
            isConnected={liveStatus.isConnected}
            audioLevel={audioLevel}
          />
        </div>

        {/* Live Duplex Voice Controls */}
        <div className="mb-10 w-full">
          <LiveVoiceController
            onStatusChange={handleLiveStatusChange}
            onTranscriptReceived={handleTranscriptReceived}
            onVoiceInputCompleted={handleSendMessage}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            onAudioLevelChange={setAudioLevel}
            externalTrigger={externalTrigger}
          />
        </div>

        {/* Interactive Conversation Console */}
        <ConversationalConsole
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          onQuickPromptClick={handleSendMessage}
          isLiveConnected={liveStatus.isConnected}
        />

        {/* Full Dossier on Can Boga */}
        <CanBogaDossier onAskChapter={handleSendMessage} />
      </main>

      <Footer />
    </div>
  );
}
