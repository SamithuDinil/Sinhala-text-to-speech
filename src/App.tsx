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
  Share2,
  Info,
  ExternalLink,
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
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const handleShareSite = async () => {
    const url = window.location.href;
    const title = 'Voice Studio - Text to Speech';
    const shareText = 'Convert Sinhala and multilingual text into natural, expressive speech.';

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch {
        // Fall back to clipboard if dismissed or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareToast('Site URL copied to clipboard!');
      setTimeout(() => setShareToast(null), 2500);
    } catch {
      setShareToast('URL: ' + url);
      setTimeout(() => setShareToast(null), 4000);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Notification Toast */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-semibold text-xs shadow-2xl animate-fade-in border border-amber-400">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Top Studio Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 flex-shrink-0">
              <Volume2 className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Voice Studio
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Neural Engine Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Natural Sinhala & Multilingual Neural Voice Synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900 text-zinc-400 border border-zinc-800/80">
              <span className="text-amber-500">●</span> 24 kHz WAV
            </span>

            <button
              id="info-modal-btn"
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="System & Audio Specifications"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              id="share-site-btn"
              type="button"
              onClick={handleShareSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all text-xs font-semibold"
              title="Share site link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Info / Specifications Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">System Architecture & Specifications</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Synthesizes natural speech using high-fidelity neural voice synthesis models with native phonetic articulation.
              </p>

              <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Audio Pipeline:</span>
                  <span className="text-zinc-200">24 kHz Linear PCM (RIFF WAV)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sinhala (සිංහල):</span>
                  <span className="text-emerald-400">Native Neural Phonetics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Voice Roster:</span>
                  <span className="text-zinc-200">Kore, Zephyr, Puck, Charon, Fenrir</span>
                </div>
              </div>

              <p className="text-zinc-400">
                Audio is rendered server-side and streamed in standard uncompressed WAV container for immediate playback across all modern browsers and mobile devices.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Text Input & Active Player Deck (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Presets Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Preset Phrases
                </span>
                <span className="text-[11px] text-zinc-500">Click to autofill sample</span>
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
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 font-mono">[{preset.languageBadge}]</span>
                      <span>{preset.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor Console */}
            <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Input Text (සිංහල / English / Multilingual)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="copy-text-btn"
                    type="button"
                    onClick={copyInputText}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-zinc-800"
                    title="Copy text to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    id="reset-text-btn"
                    type="button"
                    onClick={() => setInputText(INITIAL_SINHALA_TEXT)}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-zinc-800"
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
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="කරුණාකර මෙහි ඔබගේ පෙළ ඇතුළත් කරන්න... (Type or paste text to synthesize)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-base sm:text-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all leading-relaxed resize-y font-normal"
                  style={{ minHeight: '140px' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pt-0.5">
                <span>
                  {charCount} chars • {wordCount} words
                </span>
                <span className="hidden sm:inline text-[11px] text-zinc-500">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Ctrl+Enter</kbd> to generate
                </span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs text-red-300">Synthesis Failed</p>
                  <p className="text-xs text-red-400/90 mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div>
              <button
                id="generate-tts-btn"
                type="button"
                disabled={isLoading || !inputText.trim()}
                onClick={handleGenerateTTS}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-zinc-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Synthesizing Voice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </div>

            {/* Active Audio Player Deck */}
            {currentAudioUrl ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Headphones className="w-4 h-4 text-amber-500" />
                  <span>Audio Output Player</span>
                </div>

                <AudioPlayer
                  audioUrl={currentAudioUrl}
                  voice={currentClip?.voice || selectedVoice}
                  style={currentClip?.style || selectedStyle}
                  estimatedDuration={currentClip?.duration || 4}
                  textSnippet={currentClip?.text || inputText}
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Headphones className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-zinc-400">Ready for Voice Synthesis</p>
                <p className="text-[11px] text-zinc-500">Select a voice persona and click "Generate Speech" to listen</p>
              </div>
            )}
          </div>

          {/* Right Column: Voice Persona, Delivery Style & Session History (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Voice & Delivery Controls */}
            <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                disabled={isLoading}
              />

              <hr className="border-zinc-800/80" />

              <ToneSelector
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
                disabled={isLoading}
              />
            </div>

            {/* Session Clip History */}
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
          </div>
        </div>
      </main>

      {/* Modern Studio Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="flex flex-wrap items-center gap-1.5">
            <span>Developed by <span className="font-semibold text-zinc-200">Samithu Dinil</span></span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span>Neural Speech Synthesis Studio</span>
          </p>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span>24 kHz Uncompressed WAV</span>
            <span>•</span>
            <span>Sinhala & Multilingual Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
