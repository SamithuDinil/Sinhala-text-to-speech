import React from 'react';
import { User, Volume2, Check, Sparkles } from 'lucide-react';
import { VoiceName, VoiceOption } from '../types';
import { GEMINI_VOICES } from '../data/presets';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
  customVoices?: VoiceOption[];
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
  customVoices = [],
}) => {
  const allVoices = [...GEMINI_VOICES, ...customVoices];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wide text-zinc-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-500" />
          Voice Persona
        </label>
        <span className="text-[11px] text-zinc-500 font-mono">
          {allVoices.length} Voices Available
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {allVoices.map((voice) => {
          const isSelected = selectedVoice === voice.id;

          return (
            <button
              key={voice.id}
              id={`voice-btn-${voice.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`group relative flex items-start justify-between p-3 rounded-xl text-left border transition-all duration-150 ${
                isSelected
                  ? 'bg-zinc-900 border-amber-500/70 text-zinc-100 ring-1 ring-amber-500/30 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                    {voice.name}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    {voice.gender}
                  </span>
                  {voice.isCustom && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Custom
                    </span>
                  )}
                  {voice.id === 'Kore' && !voice.isCustom && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Sinhala Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-zinc-300 mb-0.5">
                  {voice.character}
                </p>

                <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                  {voice.description}
                </p>
              </div>

              <div className="flex-shrink-0 pt-0.5">
                {isSelected ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-zinc-950 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-zinc-800 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <Volume2 className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
