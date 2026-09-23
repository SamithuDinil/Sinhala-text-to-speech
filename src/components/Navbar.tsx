import React from 'react';
import { Mic2, Users, Wand2, FolderKanban, History, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'lab' | 'community' | 'projects' | 'history';
  setActiveTab: (tab: 'studio' | 'lab' | 'community' | 'projects' | 'history') => void;
  customVoicesCount: number;
  communityVoicesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  customVoicesCount,
  communityVoicesCount,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
              VoiceCraft <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Studio v2</span>
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block">AI Voice Lab & Community Marketplace</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span className="hidden md:inline">TTS Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'lab'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden md:inline">Voice Lab</span>
            {customVoicesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {customVoicesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'community'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'projects'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span className="hidden md:inline">Scripts & Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
