import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or API_KEY environment variable is required.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'voicecraft-vercel',
        },
      },
    });
  }
  return aiClient;
}

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-pro-preview-tts',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { text, voice = 'Kore', style = 'natural' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide valid text to convert.' });
    }

    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const selectedVoice = allowedVoices.includes(voice) ? voice : 'Kore';

    const ai = getGenAI();

    let promptContent = text.trim();
    if (style === 'storytelling') {
      promptContent = `Read with rich warmth, immersive pacing, and clear emotional storytelling: ${promptContent}`;
    } else if (style === 'cheerful') {
      promptContent = `Say cheerfully, brightly, and enthusiastically: ${promptContent}`;
    } else if (style === 'calm') {
      promptContent = `Read gently, soothingly, and at a relaxed pace: ${promptContent}`;
    } else if (style === 'documentary') {
      promptContent = `Read in an articulate, dignified, and captivating documentary tone: ${promptContent}`;
    }

    let lastError: any = null;
    let audioData: string | null = null;
    let successfulModel: string | null = null;

    for (const modelName of TTS_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: promptContent }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (inlineData?.data) {
          audioData = inlineData.data;
          successfulModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`TTS attempt with ${modelName} failed on Vercel function:`, err?.message || err);
      }
    }

    if (!audioData) {
      throw lastError || new Error('The speech synthesis engine did not return audio data.');
    }

    const rawBuffer = Buffer.from(audioData, 'base64');
    const isAlreadyWav = rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF';

    const wavBuffer = isAlreadyWav ? rawBuffer : pcmToWav(rawBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');
    const estimatedDuration = Math.round((rawBuffer.length / (24000 * 2)) * 10) / 10;

    return res.status(200).json({
      success: true,
      audioBase64: wavBase64,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      voice: selectedVoice,
      style,
      duration: estimatedDuration,
      byteSize: wavBuffer.length,
      modelUsed: successfulModel,
    });
  } catch (error: any) {
    console.error('Vercel TTS generation error:', error);
    const rawMsg = String(error?.message || '');
    const isRateLimit = rawMsg.includes('429') || rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource_exhausted');
    
    let retryAfter = 45;
    const match = rawMsg.match(/retry in\s+([0-9.]+)\s*s/i);
    if (match) retryAfter = Math.ceil(parseFloat(match[1]));

    return res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit
        ? `Speech synthesis quota temporarily exceeded. Please wait ${retryAfter} seconds or upgrade your API quota.`
        : (error?.message || 'Failed to generate speech.'),
      isRateLimit,
      retryAfter,
    });
  }
}
