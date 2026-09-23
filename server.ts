import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables or local .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Creates a standard 44-byte WAV header for 16-bit PCM mono audio
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // SubChunk1Size for PCM
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// In-memory cache for synthesized audio to prevent duplicate API calls and conserve quota
interface CacheEntry {
  audioBase64: string;
  duration: number;
  byteSize: number;
}
const audioCache = new Map<string, CacheEntry>();

function getCacheKey(text: string, voice: string, style: string): string {
  return `${voice}::${style}::${text.trim()}`;
}

function parseGeminiError(error: any): { isRateLimit: boolean; message: string; retryAfter?: number } {
  let statusCode = 500;
  let parsedErrorObj: any = null;
  const rawMsg = String(error?.message || "");

  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedErrorObj = JSON.parse(jsonMatch[0]);
    } else if (typeof error === "object" && error !== null) {
      parsedErrorObj = error;
    }
  } catch {
    // fallback
  }

  const errData = parsedErrorObj?.error || parsedErrorObj;
  if (errData?.code) {
    statusCode = Number(errData.code);
  }
  if (errData?.status === "RESOURCE_EXHAUSTED" || error?.status === 429) {
    statusCode = 429;
  }

  const isRateLimit =
    statusCode === 429 ||
    errData?.status === "RESOURCE_EXHAUSTED" ||
    rawMsg.includes("429") ||
    rawMsg.toLowerCase().includes("quota exceeded") ||
    rawMsg.toLowerCase().includes("resource_exhausted");

  let retryAfter = 60;
  if (Array.isArray(errData?.details)) {
    const retryInfo = errData.details.find((d: any) => d?.["@type"]?.includes("RetryInfo"));
    if (retryInfo?.retryDelay) {
      const match = String(retryInfo.retryDelay).match(/([0-9]+)/);
      if (match) retryAfter = parseInt(match[1], 10);
    }
  } else {
    const textMatch = rawMsg.match(/retry in\s+([0-9.]+)\s*s/i);
    if (textMatch) {
      retryAfter = Math.ceil(parseFloat(textMatch[1]));
    }
  }

  if (isRateLimit) {
    return {
      isRateLimit: true,
      message: `Speech synthesis quota temporarily exceeded. Please wait ${retryAfter} seconds before trying again, or upgrade your API quota in Google AI Studio.`,
      retryAfter,
    };
  }

  const friendlyMsg = errData?.message || rawMsg || "Failed to generate speech. Please try again.";
  return {
    isRateLimit: false,
    message: friendlyMsg.split("\n")[0].substring(0, 200),
  };
}

const TTS_MODELS = [
  "gemini-2.5-flash-preview-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-pro-preview-tts",
];

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
  res.json({ status: "ok", hasApiKey, models: TTS_MODELS });
});

// Text-to-Speech generation endpoint
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text, voice = "Kore", style = "natural" } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Please provide valid text to convert." });
      return;
    }

    // Available prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "Kore";

    // Check memory cache first
    const cacheKey = getCacheKey(text, selectedVoice, style);
    const cached = audioCache.get(cacheKey);
    if (cached) {
      res.json({
        success: true,
        audioBase64: cached.audioBase64,
        mimeType: "audio/wav",
        sampleRate: 24000,
        voice: selectedVoice,
        style,
        duration: cached.duration,
        byteSize: cached.byteSize,
        cached: true,
      });
      return;
    }

    const ai = getGenAI();

    // Format prompt text with optional tone guidance for expressiveness
    let promptContent = text.trim();
    if (style === "storytelling") {
      promptContent = `Read with rich warmth, immersive pacing, and clear emotional storytelling: ${promptContent}`;
    } else if (style === "cheerful") {
      promptContent = `Say cheerfully, brightly, and enthusiastically: ${promptContent}`;
    } else if (style === "calm") {
      promptContent = `Read gently, soothingly, and at a relaxed pace: ${promptContent}`;
    } else if (style === "documentary") {
      promptContent = `Read in an articulate, dignified, and captivating documentary tone: ${promptContent}`;
    }

    let lastError: any = null;
    let audioData: string | null = null;
    let successfulModel: string | null = null;

    // Attempt generation across available TTS models with automatic fallback
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
        console.warn(`TTS attempt with ${modelName} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!audioData) {
      if (lastError) {
        throw lastError;
      }
      res.status(500).json({
        error: "The speech synthesis engine did not return audio data. Please try with shorter text or a different voice.",
      });
      return;
    }

    const rawBuffer = Buffer.from(audioData, "base64");
    const isAlreadyWav = rawBuffer.subarray(0, 4).toString("ascii") === "RIFF";

    const wavBuffer = isAlreadyWav ? rawBuffer : pcmToWav(rawBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");
    const estimatedDuration = Math.round((rawBuffer.length / (24000 * 2)) * 10) / 10;

    // Cache generated audio (max 100 entries)
    if (audioCache.size >= 100) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, {
      audioBase64: wavBase64,
      duration: estimatedDuration,
      byteSize: wavBuffer.length,
    });

    res.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      sampleRate: 24000,
      voice: selectedVoice,
      style,
      duration: estimatedDuration,
      byteSize: wavBuffer.length,
      modelUsed: successfulModel,
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    const parsed = parseGeminiError(error);
    res.status(parsed.isRateLimit ? 429 : 500).json({
      error: parsed.message,
      isRateLimit: parsed.isRateLimit,
      retryAfter: parsed.retryAfter,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Server listening at http://localhost:${PORT}`);
  });
}

startServer();
