import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';

function getEffectiveApiKey(customKey?: string): string | null {
  const trimmed = customKey?.trim();
  if (trimmed) return trimmed;
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    null
  );
}

function getGenAI(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-preview-tts',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-gemini-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { text, voice = 'Kore', style = 'natural' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide valid text to convert.' });
    }

    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    let selectedVoice = 'Kore';
    let customPromptInstruction = '';

    if (allowedVoices.includes(voice)) {
      selectedVoice = voice;
    } else if (voice === 'young-girl-sinhala') {
      selectedVoice = 'Zephyr';
      customPromptInstruction = 'Read with a very light, high-pitched, cheerful young girl voice and natural Sinhala cadence.';
    } else if (voice === 'community-mahinda-narrator') {
      selectedVoice = 'Charon';
      customPromptInstruction = 'Read with deep reverence, deliberate pauses, and rich historical gravitas.';
    } else if (voice === 'community-anula-host') {
      selectedVoice = 'Zephyr';
      customPromptInstruction = 'Speak with a bright, warm, and approachable conversational rhythm.';
    } else if (voice === 'community-zen-master') {
      selectedVoice = 'Fenrir';
      customPromptInstruction = 'Read exceptionally gently, softly, and with long relaxing pauses between phrases.';
    } else {
      selectedVoice = 'Zephyr';
    }

    const customKey = (req.headers['x-gemini-api-key'] as string) || req.body?.customApiKey;
    const apiKey = getEffectiveApiKey(customKey);

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        isMissingApiKey: true,
        fallbackToBrowser: true,
        error: 'GEMINI_API_KEY is not configured in your Vercel Project Settings -> Environment Variables. The app has switched to Unlimited Browser Voice Engine so you can speak immediately!',
      });
    }

    const ai = getGenAI(apiKey);

    let promptContent = text.trim();
    if (customPromptInstruction) {
      promptContent = `${customPromptInstruction} ${promptContent}`;
    }
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
    const rawMsg = String(error?.message || '');
    const isRateLimit = rawMsg.includes('429') || rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource_exhausted');
    const isMissingApiKey = rawMsg.includes('GEMINI_API_KEY') || rawMsg.includes('API_KEY is missing') || rawMsg.includes('API key');
    if (!isRateLimit && !isMissingApiKey) {
      console.error('Vercel TTS generation error:', error);
    }
    
    let retryAfter = 45;
    const match = rawMsg.match(/retry in\s+([0-9.]+)\s*s/i);
    if (match) retryAfter = Math.ceil(parseFloat(match[1]));

    return res.status(isRateLimit ? 429 : 200).json({
      success: false,
      isMissingApiKey,
      error: isRateLimit
        ? `Speech synthesis quota temporarily exceeded. Please wait ${retryAfter} seconds or upgrade your API quota.`
        : (error?.message || 'Failed to generate speech.'),
      isRateLimit,
      retryAfter,
      fallbackToBrowser: true,
    });
  }
}
