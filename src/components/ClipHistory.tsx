import React from 'react';
import { History, Play, Download, Trash2, Clock } from 'lucide-react';
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
    <div id="clip-history-section" className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-neutral-200">Generated Clips History</h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-neutral-800 text-neutral-400">
            {clips.length}
          </span>
        </div>

        <button
          id="clear-history-btn"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-400 transition-colors"
          title="Clear all clips"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {clips.map((clip) => {
          const isActive = currentClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                  : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-200 truncate">
                  "{clip.text}"
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                  <span className="text-amber-400 font-medium">Voice: {clip.voice}</span>
                  <span>•</span>
                  <span className="capitalize">{clip.style}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {clip.duration}s
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(clip.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onSelectClip(clip)}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                  }`}
                  title="Load and play this clip"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>

                <a
                  href={clip.audioUrl}
                  download={`tts-${clip.voice.toLowerCase()}-${clip.id}.wav`}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Download WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
