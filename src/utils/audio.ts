/**
 * Audio processing utilities for Gemini Live API and Gemini TTS.
 * Live API uses 16kHz 16-bit mono PCM input and 24kHz 16-bit mono PCM output.
 */

export class AudioStreamPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isInterrupted: boolean = false;
  private analyser: AnalyserNode | null = null;

  constructor() {
    // Lazy initialize to comply with browser autoplay policies
  }

  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stopAll() {
    this.isInterrupted = true;
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might have already stopped
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }

  public resetInterruption() {
    this.isInterrupted = false;
    if (this.audioCtx) {
      this.nextPlayTime = Math.max(this.audioCtx.currentTime, this.nextPlayTime);
    }
  }

  /**
   * Schedules a 24kHz 16-bit PCM chunk for gapless playback.
   */
  public playChunk(base64Pcm: string) {
    if (this.isInterrupted) return;

    try {
      const ctx = this.getAudioContext();
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM little endian to Float32 [-1.0, 1.0]
      const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(ctx.destination);
      }

      const now = ctx.currentTime;
      if (this.nextPlayTime < now) {
        this.nextPlayTime = now + 0.05; // tiny buffer to avoid initial underrun
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index !== -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Audio chunk playback error:', err);
    }
  }

  public close() {
    this.stopAll();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

/**
 * Converts Float32Array from Web Audio microphone stream to 16-bit PCM Base64.
 */
export function floatTo16BitPCM(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(output.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Plays a WAV base64 data string (e.g., from Gemini TTS unary).
 */
export function playWavBase64(base64Wav: string, onEnded?: () => void): HTMLAudioElement {
  const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
  if (onEnded) {
    audio.onended = onEnded;
  }
  audio.play().catch((err) => {
    console.warn('Audio play request failed:', err);
  });
  return audio;
}
