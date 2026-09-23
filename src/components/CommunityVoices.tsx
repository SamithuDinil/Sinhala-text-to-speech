import React, { useState } from 'react';
import { VoiceOption } from '../types';
import { Users, Search, Heart, Download, Sparkles, CheckCircle2, Globe, Volume2 } from 'lucide-react';

interface CommunityVoicesProps {
  communityVoices: VoiceOption[];
  onCloneToStudio: (voice: VoiceOption) => void;
  onLikeVoice: (id: string) => void;
  onSelectForTTS: (voiceId: string) => void;
}

export const CommunityVoices: React.FC<CommunityVoicesProps> = ({
  communityVoices,
  onCloneToStudio,
  onLikeVoice,
  onSelectForTTS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [notification, setNotification] = useState<string | null>(null);

  const tags = ['All', 'Epic / Historical', 'Podcast / Social', 'Meditation / Calm', 'Professional', 'Enthusiastic'];

  const filteredVoices = communityVoices.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.creator?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || v.toneTag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 p-8 sm:p-10 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Users className="w-3.5 h-3.5" /> Community Voice Marketplace
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Discover & Use Community AI Voices
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Explore custom voices created by fellow developers and creators worldwide. Clone any voice model into your studio or use it instantly for text-to-speech synthesis!
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search voices, creators, tags..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm shadow-lg"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoices.map((voice) => (
          <div
            key={voice.id}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {voice.name}
                  </h3>
                  <p className="text-xs text-zinc-400">By {voice.creator || 'Community Creator'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                  {voice.toneTag}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{voice.description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Base: {voice.baseVoice}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> {voice.accent}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onLikeVoice(voice.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 text-rose-400 border border-zinc-800 hover:bg-rose-500/10 transition-all text-xs font-semibold"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20" /> {voice.likes || 0}
                </button>

                <button
                  onClick={() => {
                    onCloneToStudio(voice);
                    setNotification(`Successfully cloned "${voice.name}" into your Voice Lab!`);
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Clone
                </button>

                <button
                  onClick={() => {
                    onSelectForTTS(voice.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Use Voice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
