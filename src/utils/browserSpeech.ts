/**
 * Browser Speech Synthesis Utility
 * Provides offline, zero-quota text-to-speech using the browser's Web Speech API,
 * with language detection (Sinhala, English, etc.) and WAV carrier generator.
 */

export interface BrowserVoiceInfo {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isSinhala: boolean;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices() || [];
}

export function findBestVoiceForText(text: string, preferredVoiceName?: string): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();
  if (voices.length === 0) return null;

  const isSinhala = /[\u0D80-\u0DFF]/.test(text);

  if (isSinhala) {
    const sinhalaVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('si') || v.lang.toLowerCase().includes('lk') || v.name.toLowerCase().includes('sinhala')
    );
    if (sinhalaVoice) return sinhalaVoice;
  }

  if (preferredVoiceName) {
    const matched = voices.find((v) => v.name.toLowerCase().includes(preferredVoiceName.toLowerCase()));
    if (matched) return matched;
  }

  // Fallback to default or English
  return (
    voices.find((v) => v.lang.startsWith('en') && v.default) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0] ||
    null
  );
}

export function speakWithBrowser(
  text: string,
  options: {
    voice?: SpeechSynthesisVoice | null;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (options.voice) {
    utterance.voice = options.voice;
  } else {
    const best = findBestVoiceForText(text);
    if (best) utterance.voice = best;
  }

  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopBrowserSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Generates a clean 16-bit PCM mono WAV data URL
 * so history clips always have playable/downloadable audio records.
 */
export function createWavDataUrl(durationSeconds = 3, sampleRate = 22050): string {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV Header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Subtle ambient chime or gentle voice carrier waveform
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Harmonious soft tone fading out
    const envelope = Math.max(0, 1 - t / durationSeconds);
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.15 * envelope;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}
