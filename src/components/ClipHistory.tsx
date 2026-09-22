import React from 'react';
import { History, Play, Download, Trash2, Clock, Volume2 } from 'lucide-react';
import { GeneratedClip } from '../types';

interface ClipHistoryProps {
  clips: GeneratedClip[];
  onSelectClip: (clip: GeneratedClip) => void;
  onClearHistory: () => void;
  currentClipId?: string;
}

export const ClipHistory: React.FC<ClipHistoryProps> = ({
  clips,
  onSelectClip,
  onClearHistory,
  currentClipId,
}) => {
  if (clips.length === 0) {
    return null;
  }

  const formatTimeAgo = (timestamp: number) => {
    const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsedSeconds < 60) return 'Just now';
    const mins = Math.floor(elapsedSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div id="clip-history-section" className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-semibold tracking-wide text-zinc-300">Session History</h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {clips.length}
          </span>
        </div>

        <button
          id="clear-history-btn"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
          title="Clear all clips"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {clips.map((clip) => {
          const isActive = currentClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-zinc-850 border-amber-500/60 text-zinc-100 ring-1 ring-amber-500/20 shadow-sm'
                  : 'bg-zinc-950/50 border-zinc-850 hover:border-zinc-700/80 text-zinc-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  "{clip.text}"
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 font-mono">
                  <span className="text-amber-400 font-sans font-medium">{clip.voice}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="capitalize">{clip.style}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5 text-zinc-500" />
                    {clip.duration}s
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span>{formatTimeAgo(clip.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onSelectClip(clip)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title="Load and play this clip"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>

                <a
                  href={clip.audioUrl}
                  download={`tts-${clip.voice.toLowerCase()}-${clip.id}.wav`}
                  className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800"
                  title="Download WAV"
                >
                  <Download className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

