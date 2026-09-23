import React, { useState } from 'react';
import { VoiceOption } from '../types';
import { Wand2, Sparkles, Plus, Trash2, CheckCircle2, Share2, Mic, Volume2, Globe } from 'lucide-react';
import { GEMINI_VOICES } from '../data/presets';

interface VoiceLabProps {
  customVoices: VoiceOption[];
  onSaveCustomVoice: (voice: VoiceOption) => void;
  onDeleteCustomVoice: (id: string) => void;
  onPublishToCommunity: (voice: VoiceOption) => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({
  customVoices,
  onSaveCustomVoice,
  onDeleteCustomVoice,
  onPublishToCommunity,
}) => {
  const [name, setName] = useState('');
  const [baseVoice, setBaseVoice] = useState('Kore');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Neutral'>('Female');
  const [accent, setAccent] = useState('Sinhala / Global');
  const [toneTag, setToneTag] = useState('Warm Storyteller');
  const [description, setDescription] = useState('');
  const [promptInstructions, setPromptInstructions] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newVoice: VoiceOption = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      gender,
      character: toneTag,
      description: description.trim() || `Custom trained voice based on ${baseVoice} with tailored delivery.`,
      toneTag,
      isCustom: true,
      baseVoice,
      accent,
      creator: 'You (Creator Studio)',
      likes: 1,
      promptInstructions: promptInstructions.trim() || 'Read with expressive natural cadence.',
    };

    onSaveCustomVoice(newVoice);
    setName('');
    setDescription('');
    setPromptInstructions('');
    setSuccessMessage(`Custom voice "${newVoice.name}" successfully created and added to your studio!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 p-8 sm:p-10 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Wand2 className="w-3.5 h-3.5" /> Voice Developer Lab
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Design & Train Custom AI Voices
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Create unique voice personas by combining neural voice anchors with custom prompt instructions and tone tuning. Test, save, and publish your voices to the community marketplace for anyone to use!
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none hidden md:block" />
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">New Voice Persona Builder</h3>
              <p className="text-xs text-zinc-400">Configure acoustic anchor, accent, and style</p>
            </div>
          </div>

          <form onSubmit={handleCreateVoice} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Voice Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Prof. Senaratne (Academic Narrator)"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Base Neural Anchor</label>
                <select
                  value={baseVoice}
                  onChange={(e) => setBaseVoice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  {GEMINI_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.character})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Gender Profile</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Neutral">Neutral / Versatile</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Accent / Language</label>
                <input
                  type="text"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  placeholder="e.g. Sinhala & Sri Lankan English"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Tone Tag</label>
                <input
                  type="text"
                  value={toneTag}
                  onChange={(e) => setToneTag(e.target.value)}
                  placeholder="e.g. Cinematic / Deep / Warm"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Short Bio & Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the personality and ideal use cases for this voice..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Custom Prompt Instructions (Persona)</label>
              <textarea
                value={promptInstructions}
                onChange={(e) => setPromptInstructions(e.target.value)}
                placeholder="e.g., Read with a wise, measured cadence and warm emotional inflection..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Save & Register Custom Voice
            </button>
          </form>
        </div>

        {/* Created Voices list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Developed Voices</h3>
                  <p className="text-xs text-zinc-400">{customVoices.length} custom models created</p>
                </div>
              </div>
            </div>

            {customVoices.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Wand2 className="w-6 h-6" />
                </div>
                <p className="text-sm text-zinc-400">No custom voices created yet.</p>
                <p className="text-xs text-zinc-600">Use the builder on the left to create your first voice model.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                {customVoices.map((voice) => (
                  <div
                    key={voice.id}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{voice.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                            {voice.toneTag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{voice.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onPublishToCommunity(voice);
                            setSuccessMessage(`Voice "${voice.name}" published to community marketplace!`);
                            setTimeout(() => setSuccessMessage(null), 4000);
                          }}
                          title="Publish to Marketplace"
                          className="p-2 rounded-xl bg-zinc-900 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomVoice(voice.id)}
                          title="Delete Voice"
                          className="p-2 rounded-xl bg-zinc-900 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Base: {voice.baseVoice}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-400" /> {voice.accent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
