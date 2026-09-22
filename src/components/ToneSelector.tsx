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
      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        Delivery Tone & Style
      </label>

      <div className="flex flex-wrap gap-2">
        {DELIVERY_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              id={`style-btn-${style.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectStyle(style.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-neutral-900/80 hover:bg-neutral-850 border-neutral-800 text-neutral-300 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={style.description}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-neutral-400'}>
                {getIcon(style.iconName)}
              </span>
              <span>{style.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
