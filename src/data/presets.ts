import { VoiceName, VoiceOption, DeliveryStyleOption } from '../types';

export const INITIAL_SINHALA_TEXT =
  'ශ්රී ලංකාව ඉන්දියන් සාගරයේ පිහිටි සුන්දර දූපතකි. එය උරුමය, ස්වාභාවික සෞන්දර්යය සහ හිතකාමී ජනතාව නිසා ලොව පුරා ප්රකට වී ඇත.';

export interface PresetText {
  id: string;
  title: string;
  languageBadge: string;
  text: string;
  recommendedVoice: VoiceName;
  recommendedStyle: 'natural' | 'storytelling' | 'cheerful' | 'calm' | 'documentary';
}

export const PRESET_TEXTS: PresetText[] = [
  {
    id: 'sri-lanka-intro',
    title: 'Sri Lanka Heritage (User Text)',
    languageBadge: 'සිංහල Sinhala',
    text: 'ශ්රී ලංකාව ඉන්දියන් සාගරයේ පිහිටි සුන්දර දූපතකි. එය උරුමය, ස්වාභාවික සෞන්දර්යය සහ හිතකාමී ජනතාව නිසා ලොව පුරා ප්රකට වී ඇත.',
    recommendedVoice: 'Kore',
    recommendedStyle: 'storytelling',
  },
  {
    id: 'sri-lanka-welcome',
    title: 'Traditional Greeting & Welcome',
    languageBadge: 'සිංහල Sinhala',
    text: 'ආයුබෝවන්! ශ්රී ලංකාවට ඔබව සාදරයෙන් පිළිගනිමු. සුවබර මෙන්ම සොඳුරු මතකයන් පිරි සංචාරයක් ඔබට වේවායි ප්රාර්ථනා කරමු.',
    recommendedVoice: 'Zephyr',
    recommendedStyle: 'cheerful',
  },
  {
    id: 'sigiriya-wonder',
    title: 'Sigiriya Rock Fortress Story',
    languageBadge: 'සිංහල Sinhala',
    text: 'සීගිරිය යනු ලෝක උරුමයක් බඳු පෞරාණික මහා නිර්මාණයකි. කාශ්‍යප රජුගේ මාලිගා නටබුන්, මනරම් බිතුසිතුවම් සහ අලංකාර ජල උද්යාන ඉතිහාසයේ විස්මයක් කියාපායි.',
    recommendedVoice: 'Charon',
    recommendedStyle: 'documentary',
  },
  {
    id: 'pearl-of-indian-ocean',
    title: 'Pearl of the Indian Ocean',
    languageBadge: 'English',
    text: 'Sri Lanka, celebrated as the Pearl of the Indian Ocean, is famous for its lush highland tea gardens, golden sandy coastlines, and deeply hospitable people.',
    recommendedVoice: 'Kore',
    recommendedStyle: 'natural',
  },
  {
    id: 'blessings',
    title: 'Peace & Well-being Blessing',
    languageBadge: 'සිංහල Sinhala',
    text: 'සියලු සත්වයෝ නිදුක් වෙත්වා, නීරෝගී වෙත්වා, සුවපත් වෙත්වා! සාමය හා සතුට සැමවිටම ඔබ සමඟ වේවා.',
    recommendedVoice: 'Fenrir',
    recommendedStyle: 'calm',
  },
];

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    character: 'Warm & Natural',
    description: 'Balanced, articulate, and soothingly expressive for narratives and cultural descriptions.',
    toneTag: 'Recommended for Sinhala',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    character: 'Clear & Melodic',
    description: 'Crisp articulation with high clarity, great for greetings and announcements.',
    toneTag: 'High Clarity',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    character: 'Lively & Playful',
    description: 'Dynamic pacing with upbeat energy, ideal for casual and lively dialogues.',
    toneTag: 'Energetic',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    character: 'Deep & Authoritative',
    description: 'Rich low-register timbre, perfect for historical chronicles and documentaries.',
    toneTag: 'Deep & Resonant',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    character: 'Calm & Steady',
    description: 'Measured, grounding vocal delivery that provides clarity and composure.',
    toneTag: 'Calm & Steady',
  },
];

export const DELIVERY_STYLES: DeliveryStyleOption[] = [
  {
    id: 'natural',
    label: 'Natural',
    description: 'Authentic neutral conversational pacing',
    iconName: 'Sparkles',
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    description: 'Warm, vivid, and emotionally captivating',
    iconName: 'BookOpen',
  },
  {
    id: 'cheerful',
    label: 'Cheerful',
    description: 'Upbeat, welcoming, and bright enthusiasm',
    iconName: 'Smile',
  },
  {
    id: 'calm',
    label: 'Calm & Soothing',
    description: 'Gentle, relaxed, and tranquil meditation tone',
    iconName: 'Feather',
  },
  {
    id: 'documentary',
    label: 'Documentary',
    description: 'Dignified, articulate, and historical broadcast style',
    iconName: 'Radio',
  },
];
