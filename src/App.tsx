import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Languages,
  AlertCircle,
  Headphones,
  FileText,
} from 'lucide-react';
import { VoiceName, DeliveryStyle, GeneratedClip } from './types';
import {
  INITIAL_SINHALA_TEXT,
  PRESET_TEXTS,
  PresetText,
} from './data/presets';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneSelector } from './components/ToneSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { ClipHistory } from './components/ClipHistory';

export default function App() {
  const [inputText, setInputText] = useState(INITIAL_SINHALA_TEXT);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<DeliveryStyle>('storytelling');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentClip, setCurrentClip] = useState<GeneratedClip | null>(null);
  const [history, setHistory] = useState<GeneratedClip[]>([]);
  const [copied, setCopied] = useState(false);

  // Load history from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tts_clips_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          // Set first saved clip as current preview if available
          setCurrentAudioUrl(parsed[0].audioUrl);
          setCurrentClip(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: GeneratedClip[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('tts_clips_history', JSON.stringify(newHistory.slice(0, 15)));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  };

  const handleGenerateTTS = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) {
      setErrorMsg('Please enter some text in Sinhala or any language to convert to speech.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmedText,
          voice: selectedVoice,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate speech. Please try again.');
      }

      const audioDataUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const newClip: GeneratedClip = {
        id: Math.random().toString(36).substring(2, 9),
        text: trimmedText,
        voice: data.voice || selectedVoice,
        style: data.style || selectedStyle,
        audioUrl: audioDataUrl,
        duration: data.duration || 5,
        byteSize: data.byteSize || 0,
        createdAt: Date.now(),
      };

      setCurrentAudioUrl(audioDataUrl);
      setCurrentClip(newClip);
      saveHistory([newClip, ...history]);
    } catch (err: any) {
      console.error('Error calling TTS endpoint:', err);
      setErrorMsg(err.message || 'An unexpected error occurred while contacting the TTS service.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: PresetText) => {
    setInputText(preset.text);
    setSelectedVoice(preset.recommendedVoice);
    setSelectedStyle(preset.recommendedStyle);
    setErrorMsg(null);
  };

  const copyInputText = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('tts_clips_history');
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to generate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        handleGenerateTTS();
      }
    }
  };

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/20">
              <Volume2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Text to Speech Studio
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  gemini-3.1-flash-tts-preview
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Natural Sinhala & Multilingual Voice Synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              <span>Sinhala / English</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Preset Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Quick Sample Texts:
            </span>
            <span className="text-[11px] text-neutral-500">Click to load text & voice</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_TEXTS.map((preset) => {
              const isActive = inputText === preset.text;
              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-mono">[{preset.languageBadge}]</span>
                  <span>{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Section */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tts-text-input"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              Text to Speak (සිංහල හෝ වෙනත් භාෂාවක්)
            </label>

            <div className="flex items-center gap-2">
              <button
                id="copy-text-btn"
                type="button"
                onClick={copyInputText}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-1 rounded hover:bg-neutral-800"
                title="Copy text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                id="reset-text-btn"
                type="button"
                onClick={() => setInputText(INITIAL_SINHALA_TEXT)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-1 rounded hover:bg-neutral-800"
                title="Reset to default text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="tts-text-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="කරුණාකර මෙහි ඔබගේ පෙළ ඇතුළත් කරන්න... (Type or paste any text to synthesize)"
              className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-base sm:text-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all leading-relaxed resize-y"
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>
              {charCount} characters • {wordCount} words
            </span>
            <span className="text-[11px] text-neutral-500">
              Tip: Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">Ctrl+Enter</kbd> to generate
            </span>
          </div>
        </div>

        {/* Voice & Style Settings Card */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5">
          {/* Voice Selector */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            disabled={isLoading}
          />

          <hr className="border-neutral-800/80" />

          {/* Delivery Style Selector */}
          <ToneSelector
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            disabled={isLoading}
          />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Speech Generation Failed</p>
              <p className="text-xs text-red-300 mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="generate-tts-btn"
            type="button"
            disabled={isLoading || !inputText.trim()}
            onClick={handleGenerateTTS}
            className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-neutral-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Synthesizing Voice with Gemini 3.1 TTS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current" />
                <span>Convert Text to Speech</span>
              </>
            )}
          </button>
        </div>

        {/* Active Audio Player */}
        {currentAudioUrl && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              <Headphones className="w-4 h-4 text-amber-500" />
              <span>Current Audio Playback</span>
            </div>

            <AudioPlayer
              audioUrl={currentAudioUrl}
              voice={currentClip?.voice || selectedVoice}
              style={currentClip?.style || selectedStyle}
              estimatedDuration={currentClip?.duration || 4}
              textSnippet={currentClip?.text || inputText}
            />
          </div>
        )}

        {/* Clip History */}
        <ClipHistory
          clips={history}
          currentClipId={currentClip?.id}
          onSelectClip={(clip) => {
            setCurrentAudioUrl(clip.audioUrl);
            setCurrentClip(clip);
            setInputText(clip.text);
            setSelectedVoice(clip.voice);
            setSelectedStyle(clip.style);
          }}
          onClearHistory={clearHistory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 bg-neutral-950/60 py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>
            Powered by Google AI Studio & <code className="text-neutral-400 font-mono">gemini-3.1-flash-tts-preview</code>
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>24 kHz Uncompressed Audio</span>
            <span>•</span>
            <span>Sinhala & Multilingual</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
