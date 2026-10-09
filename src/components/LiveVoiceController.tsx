import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { AudioStreamPlayer, floatTo16BitPCM } from '../utils/audio';

interface LiveVoiceControllerProps {
  onStatusChange: (status: {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    error: string | null;
  }) => void;
  onTranscriptReceived?: (turn: { role: 'user' | 'assistant'; text: string }) => void;
  onVoiceInputCompleted?: (text: string) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onAudioLevelChange?: (level: number) => void;
  externalTrigger?: { text: string; id: number } | null;
}

export const LiveVoiceController: React.FC<LiveVoiceControllerProps> = ({
  onStatusChange,
  onTranscriptReceived,
  onVoiceInputCompleted,
  selectedVoice,
  onVoiceChange,
  onAudioLevelChange,
  externalTrigger,
}) => {
  const [connectionMode, setConnectionMode] = useState<'live-websocket' | 'voice-mic'>('live-websocket');
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<AudioStreamPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Fallback Web Speech Recognition for environments where iframe blocks WebSockets
  const recognitionRef = useRef<any>(null);
  const isSpeechRecActiveRef = useRef(false);

  // Initialize or get audio player
  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new AudioStreamPlayer();
    }
    return playerRef.current;
  }, []);

  // Update parent status
  useEffect(() => {
    onStatusChange({
      isConnected,
      isListening: isConnected && !isMicMuted,
      isSpeaking,
      error: null,
    });
  }, [isConnected, isMicMuted, isSpeaking, onStatusChange]);

  // Audio level monitoring
  useEffect(() => {
    if (!isConnected) {
      if (onAudioLevelChange) onAudioLevelChange(0);
      return;
    }

    const checkLevel = () => {
      let maxLevel = 0;

      if (playerRef.current) {
        const analyser = playerRef.current.getAnalyser();
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          if (avg > 0.02) {
            maxLevel = Math.max(maxLevel, avg);
            setIsSpeaking(true);
          } else {
            setIsSpeaking(false);
          }
        }
      }

      if (onAudioLevelChange) {
        onAudioLevelChange(maxLevel);
      }

      animFrameRef.current = requestAnimationFrame(checkLevel);
    };

    animFrameRef.current = requestAnimationFrame(checkLevel);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isConnected, onAudioLevelChange]);

  // Disconnect everything
  const disconnectSession = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        isSpeechRecActiveRef.current = false;
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (playerRef.current) {
      playerRef.current.stopAll();
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  }, []);

  // Start Resilient Continuous Voice Mode (using Web Speech + Gemini 3.8 Flash + TTS)
  const startVoiceSpeechMode = useCallback(() => {
    disconnectSession();
    setIsConnecting(true);
    setConnectionMode('voice-mic');
    setNoticeMessage('Voice Mode Active · Continuous speech recognition enabled.');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNoticeMessage('Microphone access ready. Type or speak to conversate.');
      setIsConnecting(false);
      setIsConnected(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isSpeechRecActiveRef.current = true;
        setIsConnected(true);
        setIsConnecting(false);
      };

      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.trim();
        if (transcript && onVoiceInputCompleted) {
          onVoiceInputCompleted(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
        if (err.error === 'not-allowed') {
          setNoticeMessage('Microphone permission needed for continuous speech.');
        }
      };

      recognition.onend = () => {
        if (isSpeechRecActiveRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition initiation fallback:', e);
      setIsConnected(true);
      setIsConnecting(false);
    }
  }, [disconnectSession, onVoiceInputCompleted]);

  // Attempt Live WebSocket session with graceful automatic fallback
  const connectSession = useCallback(async () => {
    disconnectSession();
    setIsConnecting(true);
    setNoticeMessage(null);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;
    } catch (micErr: any) {
      console.warn('Microphone permission check:', micErr);
      setNoticeMessage('Please enable microphone access in your browser to speak directly.');
      setIsConnecting(false);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${encodeURIComponent(
        selectedVoice
      )}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const player = getPlayer();
      player.resetInterruption();

      // Handshake timeout: if WebSocket doesn't connect within 3.5s, fall back seamlessly
      const connectionTimer = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket handshake timed out, switching seamlessly to Voice Mode');
          ws.close();
          startVoiceSpeechMode();
        }
      }, 3500);

      ws.onopen = () => {
        clearTimeout(connectionTimer);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionMode('live-websocket');
        setNoticeMessage('Gemini 3.8 Live API Active · Bidirectional audio stream established.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'audio' && data.audio) {
            player.playChunk(data.audio);
          } else if (data.type === 'interrupted') {
            player.stopAll();
            player.resetInterruption();
            setIsSpeaking(false);
          } else if (data.type === 'text' && data.text) {
            if (onTranscriptReceived) {
              onTranscriptReceived({ role: 'assistant', text: data.text });
            }
          }
        } catch (e) {
          console.error('Socket message parse error:', e);
        }
      };

      ws.onerror = (err) => {
        clearTimeout(connectionTimer);
        console.warn('Live WebSocket unavailable through proxy, activating Voice Stream mode.', err);
        // Seamless fallback to Voice Mode without crashing or showing error!
        startVoiceSpeechMode();
      };

      ws.onclose = () => {
        clearTimeout(connectionTimer);
        if (connectionMode === 'live-websocket' && isConnected) {
          disconnectSession();
        }
      };

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMicMuted) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const base64Audio = floatTo16BitPCM(inputChannelData);

        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          })
        );
      };
    } catch (err: any) {
      console.warn('Live session init fallback:', err);
      startVoiceSpeechMode();
    }
  }, [
    connectionMode,
    disconnectSession,
    getPlayer,
    isConnected,
    isMicMuted,
    onTranscriptReceived,
    selectedVoice,
    startVoiceSpeechMode,
  ]);

  // Forward external triggers to Live session if open
  useEffect(() => {
    if (!externalTrigger) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: externalTrigger.text,
        })
      );
    }
  }, [externalTrigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
      if (playerRef.current) {
        playerRef.current.close();
      }
    };
  }, [disconnectSession]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto px-4">
      {/* Live Voice Controls Row */}
      <div className="flex items-center flex-wrap justify-center gap-3">
        {!isConnected ? (
          <button
            onClick={connectSession}
            disabled={isConnecting}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#dfb87a] to-[#c59e5e] text-[#070d18] font-medium text-sm shadow-lg shadow-[#dfb87a]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PhoneCall className="w-4 h-4" />
            )}
            <span>{isConnecting ? 'Connecting to Cano...' : 'Start Live Voice Conversation'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMicMuted((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-[#121e3d] border-[#223554] text-[#dfb87a] hover:border-[#dfb87a]/60'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicMuted ? 'Mic Muted' : 'Mic Active'}</span>
            </button>

            <button
              onClick={disconnectSession}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium bg-red-900/40 border border-red-700/50 text-red-200 hover:bg-red-800/60 active:scale-95 transition-all cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          </div>
        )}

        {/* Voice Timbre Picker */}
        <div className="flex items-center gap-2 bg-[#0d162d]/80 border border-[#1e2f52] rounded-full px-3 py-1.5 text-xs text-[#94a3b8]">
          <Volume2 className="w-3.5 h-3.5 text-[#dfb87a]" />
          <span className="text-[#cbd5e1] font-sans">Voice:</span>
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={isConnected}
            className="bg-transparent text-[#f1f5f9] font-medium text-xs focus:outline-none cursor-pointer"
          >
            <option value="Fenrir" className="bg-[#0b1329] text-[#f1f5f9]">
              Fenrir (Deep Velvet Baritone)
            </option>
            <option value="Charon" className="bg-[#0b1329] text-[#f1f5f9]">
              Charon (Deep Resonant Tone)
            </option>
            <option value="Zephyr" className="bg-[#0b1329] text-[#f1f5f9]">
              Zephyr (Cultured British Nuance)
            </option>
          </select>
        </div>
      </div>

      {/* Notice Message if any */}
      {noticeMessage && (
        <div className="flex items-center gap-2 text-xs text-[#dfb87a] bg-[#121f3d]/60 border border-[#1e345e] rounded-full px-4 py-1.5 text-center">
          <Radio className="w-3.5 h-3.5 shrink-0 text-[#dfb87a]" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Informational Subtext */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Sparkles className="w-3 h-3 text-[#dfb87a]/70" />
        <span>
          {connectionMode === 'live-websocket' && isConnected
            ? 'Live API Duplex Mode Active'
            : 'Gemini 3.8 Live API & Voice Engine'}
        </span>
      </div>
    </div>
  );
};
