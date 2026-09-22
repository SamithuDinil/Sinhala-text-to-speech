import React from 'react';
import { User, Volume2, Check } from 'lucide-react';
import { VoiceName } from '../types';
import { GEMINI_VOICES } from '../data/presets';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-500" />
          Select Gemini Voice
        </label>
        <span className="text-xs text-neutral-400">
          Model: <code className="text-amber-400/90 font-mono">gemini-3.1-flash-tts-preview</code>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {GEMINI_VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;

          return (
            <button
              key={voice.id}
              id={`voice-btn-${voice.id.toLowerCase()}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative flex flex-col p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-sm shadow-amber-500/10'
                  : 'bg-neutral-900/70 hover:bg-neutral-800/80 border-neutral-800 hover:border-neutral-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                    {voice.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                    {voice.gender}
                  </span>
                </div>

                {isSelected ? (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-neutral-950">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-neutral-500 opacity-60" />
                )}
              </div>

              <span className="text-xs font-medium text-neutral-300 mb-0.5">
                {voice.character}
              </span>

              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                {voice.description}
              </p>

              {voice.toneTag && (
                <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex items-center">
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    {voice.toneTag}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
