import React, { useState } from 'react';
import { VoiceOption, VoiceProject, DeliveryStyle } from '../types';
import { FolderKanban, Plus, Trash2, Play, Sparkles, Music, CloudRain, Coffee, Disc, Radio } from 'lucide-react';
import { DELIVERY_STYLES, INITIAL_SINHALA_TEXT } from '../data/presets';

interface ProjectsTabProps {
  voices: VoiceOption[];
  projects: VoiceProject[];
  onSaveProject: (project: VoiceProject) => void;
  onDeleteProject: (id: string) => void;
  onLoadProjectToStudio: (project: VoiceProject) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  voices,
  projects,
  onSaveProject,
  onDeleteProject,
  onLoadProjectToStudio,
}) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [bgMusic, setBgMusic] = useState<'none' | 'rain' | 'lofi' | 'cinematic' | 'cafe'>('rain');
  const [paragraphs, setParagraphs] = useState<
    { id: string; text: string; voice: string; style: DeliveryStyle }[]
  >([
    {
      id: 'p-1',
      text: INITIAL_SINHALA_TEXT,
      voice: voices[0]?.id || 'Kore',
      style: 'storytelling',
    },
  ]);

  const handleAddParagraph = () => {
    setParagraphs([
      ...paragraphs,
      {
        id: `p-${Date.now()}`,
        text: '',
        voice: voices[0]?.id || 'Kore',
        style: 'natural',
      },
    ]);
  };

  const handleUpdateParagraph = (id: string, field: string, value: string) => {
    setParagraphs(
      paragraphs.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveParagraph = (id: string) => {
    if (paragraphs.length <= 1) return;
    setParagraphs(paragraphs.filter((p) => p.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const newProject: VoiceProject = {
      id: `proj-${Date.now()}`,
      title: projectTitle.trim(),
      paragraphs,
      bgMusic,
      createdAt: Date.now(),
    };

    onSaveProject(newProject);
    setProjectTitle('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20 p-8 sm:p-10 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <FolderKanban className="w-3.5 h-3.5" /> Scripts & Audio Projects
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Multi-Voice Audiobook & Podcast Builder
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Compose complex scripts with multiple character paragraphs, assign different voices and styles to each section, and mix atmospheric background audio for immersive storytelling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project Builder Form */}
        <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> New Script Project
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Project Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., Sinhala Heritage Audiobook Chapter 1"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Background Ambiance & Music</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'none', label: 'None', icon: Radio },
                  { id: 'rain', label: 'Gentle Rain', icon: CloudRain },
                  { id: 'lofi', label: 'Lo-Fi Chill', icon: Music },
                  { id: 'cinematic', label: 'Cinematic', icon: Disc },
                  { id: 'cafe', label: 'Coffee Shop', icon: Coffee },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBgMusic(m.id as any)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all border ${
                        bgMusic === m.id
                          ? 'bg-purple-500 text-zinc-950 border-purple-400 shadow-md shadow-purple-500/20'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Paragraph Blocks</label>
                <button
                  type="button"
                  onClick={handleAddParagraph}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold border border-purple-500/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Paragraph
                </button>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {paragraphs.map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">Paragraph #{idx + 1}</span>
                      {paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(p.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <textarea
                      value={p.text}
                      onChange={(e) => handleUpdateParagraph(p.id, 'text', e.target.value)}
                      placeholder="Enter paragraph text..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-purple-500 resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={p.voice}
                        onChange={(e) => handleUpdateParagraph(p.id, 'voice', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
                      >
                        {voices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={p.style}
                        onChange={(e) => handleUpdateParagraph(p.id, 'style', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
                      >
                        {DELIVERY_STYLES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:from-purple-400 hover:to-indigo-400 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <FolderKanban className="w-5 h-5" /> Save Script Project
            </button>
          </form>
        </div>

        {/* Saved Projects List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">Your Saved Projects</h3>
              <span className="text-xs text-zinc-400">{projects.length} projects</span>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <p className="text-sm text-zinc-400">No projects saved yet.</p>
                <p className="text-xs text-zinc-600">Compose your script on the left and save it.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/40 transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{proj.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          {proj.paragraphs.length} paragraphs • Music: {proj.bgMusic}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-2 rounded-xl bg-zinc-900 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onLoadProjectToStudio(proj)}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-purple-500 hover:text-white text-purple-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-800"
                    >
                      <Play className="w-3.5 h-3.5" /> Load into TTS Studio
                    </button>
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
