import React from 'react';
import { Sparkles, BookOpen, Smile, Feather, Radio } from 'lucide-react';
import { DeliveryStyle } from '../types';
import { DELIVERY_STYLES } from '../data/presets';

interface ToneSelectorProps {
  selectedStyle: DeliveryStyle;
  onSelectStyle: (style: DeliveryStyle) => void;
  disabled?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  disabled = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'BookOpen':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Smile':
        return <Smile className="w-3.5 h-3.5" />;
      case 'Feather':
        return <Feather className="w-3.5 h-3.5" />;
      case 'Radio':
        return <Radio className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wide text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Pacing & Tone
        </label>
        <span className="text-[11px] text-zinc-500 font-mono capitalize">
          {selectedStyle}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {DELIVERY_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              id={`style-btn-${style.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectStyle(style.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 text-zinc-300 hover:text-zinc-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={style.description}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-zinc-500'}>
                {getIcon(style.iconName)}
              </span>
              <span className="truncate">{style.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

