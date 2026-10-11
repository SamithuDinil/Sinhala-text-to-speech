# VoiceCraft Studio - Multilingual & Sinhala AI Voice Studio

VoiceCraft Studio is a high-fidelity Text-to-Speech (TTS) creation and speech synthesis platform supporting Sinhala and multilingual audio generation.

## Dual Voice Engine Architecture

VoiceCraft Studio offers two speech engines:

1. **Gemini 3.8 Flash Neural Voice (24kHz HD Cloud)**:
   - Ultra-realistic, expressive voice personas with natural cadence, breathing, and pitch dynamics.
   - Built with Google's latest `@google/genai` SDK using `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`.
   - Requires `GEMINI_API_KEY` (configured on the server or entered in the in-app settings).

2. **Browser Voice Engine (Web Speech API)**:
   - 100% free, unlimited, and offline-capable voice synthesis.
   - Zero quota limits, zero API keys required.
   - Automatically supports native operating system voices, including Sinhala and multilingual speech.
   - Acts as an automatic seamless fallback whenever cloud quotas or network limits are reached.

---

## Deployment & Configuration

### Vercel Deployment

When deploying to Vercel:

1. Import this repository into your Vercel dashboard.
2. Go to **Project Settings** -> **Environment Variables**.
3. Add the following environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google AI Studio API Key (from [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
4. Redeploy the project.

> **Note**: If `GEMINI_API_KEY` is not set on Vercel, VoiceCraft Studio automatically falls back to the Unlimited Browser Voice Engine so you and your users can still generate and listen to speech immediately without crashes.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Add your `GEMINI_API_KEY` in `.env`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```
