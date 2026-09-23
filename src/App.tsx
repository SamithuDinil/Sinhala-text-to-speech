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
  Clock,
  Wand2,
  Users,
  FolderKanban,
} from 'lucide-react';
import { VoiceName, DeliveryStyle, GeneratedClip, VoiceOption, VoiceProject } from './types';
import {
  INITIAL_SINHALA_TEXT,
  PRESET_TEXTS,
  PresetText,
  GEMINI_VOICES,
  INITIAL_COMMUNITY_VOICES,
} from './data/presets';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneSelector } from './components/ToneSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { ClipHistory } from './components/ClipHistory';
import { Navbar } from './components/Navbar';
import { VoiceLab } from './components/VoiceLab';
import { CommunityVoices } from './components/CommunityVoices';
import { ProjectsTab } from './components/ProjectsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'lab' | 'community' | 'projects' | 'history'>('studio');

  const [inputText, setInputText] = useState(INITIAL_SINHALA_TEXT);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<DeliveryStyle>('storytelling');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentClip, setCurrentClip] = useState<GeneratedClip | null>(null);
  const [history, setHistory] = useState<GeneratedClip[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Custom voices and community voices state
  const [customVoices, setCustomVoices] = useState<VoiceOption[]>([]);
  const [communityVoices, setCommunityVoices] = useState<VoiceOption[]>(INITIAL_COMMUNITY_VOICES);
  const [projects, setProjects] = useState<VoiceProject[]>([]);

  // Rate limit cooldown timer countdown
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setIsQuotaExceeded(false);
          setErrorMsg(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCountdown]);

  // Load history, custom voices, and projects from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('tts_clips_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentAudioUrl(parsed[0].audioUrl);
          setCurrentClip(parsed[0]);
        }
      }

      const savedCustomVoices = localStorage.getItem('voicecraft_custom_voices');
      if (savedCustomVoices) {
        const parsed = JSON.parse(savedCustomVoices);
        if (Array.isArray(parsed)) setCustomVoices(parsed);
      }

      const savedCommunity = localStorage.getItem('voicecraft_community_voices');
      if (savedCommunity) {
        const parsed = JSON.parse(savedCommunity);
        if (Array.isArray(parsed)) setCommunityVoices(parsed);
      }

      const savedProjects = localStorage.getItem('voicecraft_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) setProjects(parsed);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
  }, []);

  const saveHistory = (newHistory: GeneratedClip[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('tts_clips_history', JSON.stringify(newHistory.slice(0, 15)));
    } catch (e) {
      console.warn('Failed to persist history', e);
    }
  };

  const handleSaveCustomVoice = (voice: VoiceOption) => {
    const updated = [voice, ...customVoices];
    setCustomVoices(updated);
    try {
      localStorage.setItem('voicecraft_custom_voices', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist custom voices', e);
    }
  };

  const handleDeleteCustomVoice = (id: string) => {
    const updated = customVoices.filter((v) => v.id !== id);
    setCustomVoices(updated);
    try {
      localStorage.setItem('voicecraft_custom_voices', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete custom voice', e);
    }
  };

  const handlePublishToCommunity = (voice: VoiceOption) => {
    const updated = [voice, ...communityVoices];
    setCommunityVoices(updated);
    try {
      localStorage.setItem('voicecraft_community_voices', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to publish voice', e);
    }
  };

  const handleCloneToCommunityVoice = (voice: VoiceOption) => {
    const cloned: VoiceOption = {
      ...voice,
      id: `custom-clone-${Date.now()}`,
      name: `${voice.name} (Cloned)`,
      creator: 'You (Cloned)',
    };
    handleSaveCustomVoice(cloned);
  };

  const handleLikeCommunityVoice = (id: string) => {
    const updated = communityVoices.map((v) => (v.id === id ? { ...v, likes: (v.likes || 0) + 1 } : v));
    setCommunityVoices(updated);
    try {
      localStorage.setItem('voicecraft_community_voices', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update likes', e);
    }
  };

  const handleSaveProject = (project: VoiceProject) => {
    const updated = [project, ...projects];
    setProjects(updated);
    try {
      localStorage.setItem('voicecraft_projects', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save project', e);
    }
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    try {
      localStorage.setItem('voicecraft_projects', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete project', e);
    }
  };

  const handleGenerateTTS = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) {
      setErrorMsg('Please enter some text in Sinhala or any language to convert to speech.');
      return;
    }

    if (retryCountdown && retryCountdown > 0) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsQuotaExceeded(false);

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
        if (response.status === 429 || data.isRateLimit) {
          setIsQuotaExceeded(true);
          const cooldown = Number(data.retryAfter) || 60;
          setRetryCountdown(cooldown);
          throw new Error(data.error || `Speech synthesis quota temporarily reached. Please wait ${cooldown} seconds before retrying.`);
        }
        throw new Error(data.error || 'Failed to generate speech. Please try again.');
      }

      setRetryCountdown(null);
      setIsQuotaExceeded(false);

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
      let friendlyError = err.message || 'An unexpected error occurred while contacting the TTS service.';
      try {
        const jsonMatch = friendlyError.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error?.message) {
            friendlyError = parsed.error.message;
          }
        }
      } catch {
        // fallback
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: PresetText) => {
    setInputText(preset.text);
    setSelectedVoice(preset.recommendedVoice);
    setSelectedStyle(preset.recommendedStyle);
  };

  const handleCopyText = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('tts_clips_history');
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  };

  // Combine default, custom, and community voices for selectors
  const allAvailableVoices = [
    ...GEMINI_VOICES,
    ...customVoices,
    ...communityVoices.filter((cv) => !customVoices.some((v) => v.id === cv.id)),
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customVoicesCount={customVoices.length}
        communityVoicesCount={communityVoices.length}
      />

      {/* Main Content Router */}
      {activeTab === 'lab' && (
        <VoiceLab
          customVoices={customVoices}
          onSaveCustomVoice={handleSaveCustomVoice}
          onDeleteCustomVoice={handleDeleteCustomVoice}
          onPublishToCommunity={handlePublishToCommunity}
        />
      )}

      {activeTab === 'community' && (
        <CommunityVoices
          communityVoices={communityVoices}
          onCloneToStudio={handleCloneToCommunityVoice}
          onLikeVoice={handleLikeCommunityVoice}
          onSelectForTTS={(voiceId) => {
            setSelectedVoice(voiceId);
            setActiveTab('studio');
          }}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          voices={allAvailableVoices}
          projects={projects}
          onSaveProject={handleSaveProject}
          onDeleteProject={handleDeleteProject}
          onLoadProjectToStudio={(project) => {
            if (project.paragraphs.length > 0) {
              setInputText(project.paragraphs[0].text);
              setSelectedVoice(project.paragraphs[0].voice);
              setSelectedStyle(project.paragraphs[0].style);
            }
            setActiveTab('studio');
          }}
        />
      )}

      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
          <ClipHistory
            clips={history}
            currentClipId={currentClip?.id}
            onSelectClip={(clip) => {
              setCurrentAudioUrl(clip.audioUrl);
              setCurrentClip(clip);
              setInputText(clip.text);
              setSelectedVoice(clip.voice);
              setSelectedStyle(clip.style);
              setActiveTab('studio');
            }}
            onClearHistory={clearHistory}
          />
        </div>
      )}

      {activeTab === 'studio' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-8 animate-fadeIn">
          {/* Hero Welcome banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                  <Languages className="w-3.5 h-3.5" /> Sinhala & Multilingual Neural Voice Studio
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Transform Any Text into Expressive Neural Audio
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  Experience studio-grade text-to-speech with natural intonation, customizable voice personas, and high-fidelity 24kHz audio synthesis.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('lab')}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Wand2 className="w-4 h-4" /> Voice Lab ({customVoices.length})
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Users className="w-4 h-4" /> Marketplace
                </button>
              </div>
            </div>
          </div>

          {/* Rate limit / Error Banner */}
          {errorMsg && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-sm animate-shake ${
              isQuotaExceeded
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div className="flex-1">
                <p className="font-semibold">{isQuotaExceeded ? 'Speech Synthesis Quota Cooling Down' : 'Synthesis Error'}</p>
                <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
                {retryCountdown !== null && retryCountdown > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${Math.max(0, Math.min(100, (retryCountdown / 60) * 100))}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Auto-retry in {retryCountdown}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Preset Scripts
              </span>
              <span className="text-[11px] text-zinc-500">Click any preset to load instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {PRESET_TEXTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 transition-all text-left space-y-2 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {preset.languageBadge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{preset.text}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Voice: {preset.recommendedVoice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Studio Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Text Editor & Audio Player (7 cols) */}
            <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Input Script / Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInputText('')}
                    title="Clear Text"
                    className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-xs border border-zinc-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyText}
                    title="Copy Text"
                    className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-xs border border-zinc-800 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter Sinhala or multilingual text here..."
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm leading-relaxed resize-none shadow-inner font-sans"
                />
                <div className="absolute bottom-3 right-3 text-[11px] text-zinc-500 font-mono bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
                  {inputText.length} chars • {inputText.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              {/* Generate Speech Button */}
              <button
                onClick={handleGenerateTTS}
                disabled={isLoading || (retryCountdown !== null && retryCountdown > 0)}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-base ${
                  isLoading || (retryCountdown !== null && retryCountdown > 0)
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-zinc-950 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25 ring-1 ring-white/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                    <span>Synthesizing Voice Audio...</span>
                  </>
                ) : retryCountdown !== null && retryCountdown > 0 ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>Rate limit cooling down ({retryCountdown}s)...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Generate Speech Audio</span>
                  </>
                )}
              </button>

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
              <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  disabled={isLoading}
                  customVoices={[...customVoices, ...communityVoices]}
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
      )}

      {/* Modern Studio Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="flex flex-wrap items-center gap-1.5">
            <span>Developed by <span className="font-semibold text-zinc-200">Samithu Dinil</span></span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span>VoiceCraft Studio & Community Voice Lab</span>
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
