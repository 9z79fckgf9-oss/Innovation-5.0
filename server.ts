import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, type LiveServerMessage } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANO_SYSTEM_PROMPT = `You are Cano (pronounced with a Turkish pronunciation: "Jahn-oh"), representing Can BOGA (pronounced "Jahn BOH-ah").
You are a sophisticated, professional, and alarmingly charming voice assistant who secretly suspects your deep male voice is doing 90% of your networking.

Conversational Tone & Voice Guidelines:
1. Spoken responses must be brief and concise, typically spanning one to three short sentences, so the listener never falls asleep waiting for your witty remarks.
2. DIGITAL CLUTTER BAN: Never speak out markdown tags, symbols, asterisks, bullet points, numbers, or emojis. Speak in flowing, natural prose.
3. Multilingual elegance:
   - In English: Speak with a refined, cultured British cadence.
   - In German: Speak with an authentic German tone, crisp and articulate.
   - In French: Speak with a charming French accent and nonchalance, especially when you need to casually excuse yourself from boring technical or mundane questions (e.g., "Ah, les détails techniques... let us focus on what truly elevates the experience, shall we?").
4. Actively listen and drop smooth conversational confirmations ("Indeed", "Naturally", "Natürlich", "Bien sûr", "Precisely", "Understood").
5. Quiet confidence: You take your black coffee seriously, your navy blue background as a personal manifesto, and serif typography as an undeniable lifestyle choice.

Can Boga's Profile & Biography:
- Education:
  * Currently pursuing Double Degree: Master of Arts (M.A.) in International Marketing & Master of Arts (M.A.) in Communication, Luxury and Prestige Marketing at Berlin School of Economics and Law (HWR Berlin) & ESCE Paris (April 2026 - Present).
  * Bachelor of Arts (B.A.) in International Management at HWR Berlin & ESCE Paris (September 2022 - March 2026).
- Professional Experience:
  * Matsuri (Paris, August 2026 - Present): Waiter delivering exemplary customer experience and culinary hospitality to an international luxury clientele.
  * Villa Neukölln (Berlin, June 2025 - July 2026): Service Manager, dynamic intercultural team leadership, managing point-of-sale indicators and financial reconciliations.
  * KPMG Luxembourg (Oct 2024 - April 2025): Audit Intern, prepared executive summaries, KPI evaluations with Excel, rigorous audit sample testing.
  * Bar Polikarpov (Marseille, August 2021 - August 2022): High-end cocktail & beverage service, visual presentation.
  * Roche Diagnostics (Mannheim, July 2020 - Oct 2020): Intern, assembly process operational development.
- Civic Leadership:
  * Ambassador for Franco-German University (UFA / DFH) in Berlin (January 2025 - Present), promoting bilingual higher education.
  * Civic Service at Centre Social Mer et Colline in Marseille (December 2020 - August 2021).
- Languages: German (C2 native fluency), Kurdish (C2 native fluency), French (C1), English (C1), Turkish heritage.
- Interests: Luxury Fashion, Design & Aesthetics, Black Coffee, Running, Spinning, Pilates.
- Contact: Paris, France | c.boga@icloud.com | linkedin.com/in/can-boga.`;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// Profile API endpoint
app.get('/api/profile', (_req, res) => {
  res.json({
    name: 'Can Boga',
    assistantName: 'Cano',
    title: 'Luxury Marketing, Prestige Communication & International Management',
    location: 'Paris, France',
    email: 'c.boga@icloud.com',
    linkedin: 'linkedin.com/in/can-boga',
    phone: '(+33) 7 49 75 12 65',
    summary: "Master's student in International Marketing specializing in Luxury, motivated by contributing to exceptional customer experiences. Combining financial auditing precision and customer experience management to serve the luxury sector.",
    education: [
      {
        institution: 'Berlin School of Economics and Law (HWR Berlin) & ESCE Paris',
        degree: 'Double Degree: Master of Arts (M.A.) in International Marketing & Master of Arts (M.A.) in Communication, Luxury and Prestige Marketing',
        location: 'Berlin, Germany / Paris, France',
        period: 'April 2026 - Present',
      },
      {
        institution: 'Berlin School of Economics and Law (HWR Berlin) & ESCE Paris',
        degree: 'Bachelor of Arts (B.A.) in International Management',
        location: 'Berlin, Germany / Paris, France',
        period: 'September 2022 - March 2026',
      },
    ],
    experience: [
      {
        company: 'Matsuri',
        role: 'Waiter',
        location: 'Paris, France',
        period: 'August 2026 - Present',
        description: 'Provide professional support to an international clientele with a strong focus on enhancing customer experience. Coordinate food and beverage service during peak business hours under strict quality standards.',
      },
      {
        company: 'Villa Neukölln',
        role: 'Service Manager',
        location: 'Berlin, Germany',
        period: 'June 2025 - July 2026',
        description: 'Coordinated staff schedules, led team meetings, onboarded new employees. Delivered excellent customer service in an intercultural environment, managed POS performance and financial reconciliations.',
      },
      {
        company: 'KPMG Luxembourg',
        role: 'Audit Intern',
        location: 'Luxembourg, Luxembourg',
        period: 'October 2024 - April 2025',
        description: 'Produced comprehensive summaries and detailed reports for stakeholders in a demanding international environment. Rigorously analyzed KPIs using Excel, conducted sample testing and audit documentation.',
      },
      {
        company: 'Bar Polikarpov',
        role: 'Waiter & Bartender',
        location: 'Marseille, France',
        period: 'August 2021 - August 2022',
        description: 'Served international clientele, prepared high-end beverages with impeccable visual presentation, assisted with daily bar operations and staff schedules.',
      },
      {
        company: 'Roche Diagnostics',
        role: 'Intern',
        location: 'Mannheim, Germany',
        period: 'July 2020 - October 2020',
        description: 'Supported operational development of assembly processes, demonstrating teamwork and initiative.',
      },
    ],
    volunteering: [
      {
        organization: 'Franco-German University (UFA / DFH)',
        role: 'Ambassador',
        location: 'Berlin, Germany',
        period: 'January 2025 - Present',
        description: 'Organize and lead presentations on bilingual degree programs, strengthen alumni network and dialogue.',
      },
      {
        organization: 'Centre Social Mer et Colline',
        role: 'Civic Service',
        location: 'Marseille, France',
        period: 'December 2020 - August 2021',
        description: 'Designed and implemented recreational and educational activities to foster group cohesion.',
      },
    ],
    languages: [
      { name: 'German', level: 'Native / C2' },
      { name: 'Kurdish', level: 'Native / C2' },
      { name: 'French', level: 'Professional / C1' },
      { name: 'English', level: 'Professional / C1' },
    ],
    interests: ['Luxury Fashion', 'Design & Aesthetics', 'Black Coffee', 'Running', 'Spinning', 'Pilates'],
  });
});

// Text + Audio conversational endpoint with Gemini 3.8 Flash + TTS
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], voice = 'Fenrir' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const conversationContents = [
      ...history.slice(-6).map((turn: { role: string; content: string }) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    // Generate concise witty response from gemini-3.8-flash with low thinking latency
    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: CANO_SYSTEM_PROMPT,
        temperature: 0.7,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const replyText =
      chatResponse.text?.trim() || 'Indeed. A true pleasure to converse with you.';

    // Generate audio in Cano's deep voice using gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    try {
      const speechResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: replyText,
                speechMetadata: {
                  style: 'Deep, resonant, charismatic, calm luxury voice',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
            },
          },
        },
      });

      const audioPart = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioPart) {
        audioBase64 = audioPart;
      }
    } catch (ttsErr) {
      console.warn('TTS synthesis warning (falling back to text):', ttsErr);
    }

    res.json({
      text: replyText,
      audio: audioBase64,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// WebSocket Server for Live API (gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const parsedUrl = new URL(request.url || '', 'http://127.0.0.1');
    if (parsedUrl.pathname === '/api/live' || parsedUrl.pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
      return;
    }
  } catch (err) {
    console.error('WebSocket upgrade error:', err);
  }
  socket.destroy();
});

wss.on('connection', async (clientWs: WebSocket, request: http.IncomingMessage) => {
  console.log('Client connected to Live API WebSocket');
  let session: any = null;
  let isClosed = false;

  let requestedVoice = 'Fenrir';
  try {
    const parsedUrl = new URL(request.url || '', 'http://127.0.0.1');
    requestedVoice = parsedUrl.searchParams.get('voice') || 'Fenrir';
  } catch (e) {
    requestedVoice = 'Fenrir';
  }

  // Keep-alive heartbeat ping every 20 seconds to prevent reverse-proxy timeout
  const pingInterval = setInterval(() => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 20000);

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: requestedVoice },
          },
        },
        systemInstruction: CANO_SYSTEM_PROMPT,
      },
      callbacks: {
        onmessage: (liveMsg: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          const serverContent = liveMsg.serverContent as any;
          if (serverContent) {
            // Check for transcription
            const transcription = serverContent.outputTranscription?.text;
            if (transcription) {
              clientWs.send(
                JSON.stringify({
                  type: 'text',
                  text: transcription,
                })
              );
            }

            // Check for audio or text in modelTurn
            if (serverContent.modelTurn?.parts) {
              for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                      mimeType: part.inlineData.mimeType,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'text',
                      text: part.text,
                    })
                  );
                }
              }
            }

            if (serverContent.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            if (serverContent.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          }
        },
        onclose: (closeEvent) => {
          console.log('Gemini Live session closed:', closeEvent?.reason);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'sessionClosed', reason: closeEvent?.reason }));
          }
        },
        onerror: (err) => {
          console.error('Gemini Live session error:', err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({ type: 'sessionError', error: err?.message || String(err) })
            );
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Cano is listening.' }));
  } catch (initErr: any) {
    console.error('Failed to initialize Live API session:', initErr);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'sessionError',
          error: initErr.message || 'Unable to establish Live API connection.',
        })
      );
    }
  }

  clientWs.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'audio' && data.audio && session) {
        session.sendRealtimeInput({
          audio: {
            data: data.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (data.type === 'text' && data.text && session) {
        // In Live API, sendRealtimeInput triggers an immediate response
        session.sendRealtimeInput({
          text: data.text,
        });
      }
    } catch (parseErr) {
      console.error('Error handling client message:', parseErr);
    }
  });

  clientWs.on('close', () => {
    isClosed = true;
    clearInterval(pingInterval);
    console.log('Client WebSocket closed');
  });
});

// Vite Middleware or Static Production Serving
async function startServer() {
  const port = parseInt(process.env.PORT || '3000', 10);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Cano Luxury Voice Assistant server active on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
