import { VoiceName, VoiceOption, DeliveryStyleOption } from '../types';

export const INITIAL_SINHALA_TEXT =
  'ශ්රී ලංකාව ඉන්දියන් සාගරයේ පිහිටි සුන්දර දූපතකි. එය උරුමය, ස්වාභාවික සෞන්දර්යය සහ හිතකාමී ජනතාව නිසා ලොව පුරා ප්රකට වී ඇත.';

export interface PresetText {
  id: string;
  title: string;
  languageBadge: string;
  text: string;
  recommendedVoice: string;
  recommendedStyle: 'natural' | 'storytelling' | 'cheerful' | 'calm' | 'documentary';
}

export const PRESET_TEXTS: PresetText[] = [
  {
    id: 'sri-lanka-intro',
    title: 'Sri Lanka Heritage Intro',
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
    character: 'Warm & Professional',
    description: 'Clear, balanced, and articulate tone suited for narration and professional content.',
    toneTag: 'Professional',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    character: 'Bright & Energetic',
    description: 'Upbeat, friendly, and engaging voice ideal for greetings and storytelling.',
    toneTag: 'Enthusiastic',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    character: 'Lively & Playful',
    description: 'Dynamic and youthful tone with an approachable and energetic delivery.',
    toneTag: 'Playful',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    character: 'Deep & Authoritative',
    description: 'Deep, resonant, and serious tone ideal for documentaries and historical tales.',
    toneTag: 'Cinematic',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    character: 'Calm & Grounded',
    description: 'Steady, soothing, and reassuring voice perfect for meditations and wisdom.',
    toneTag: 'Calm',
  },
];

export const INITIAL_COMMUNITY_VOICES: VoiceOption[] = [
  {
    id: 'community-mahinda-narrator',
    name: 'Lankan Epic Narrator',
    gender: 'Male',
    character: 'Rich & Cinematic',
    description: 'Trained for traditional Sinhala epics and historical documentaries with deep bass resonance.',
    toneTag: 'Epic / Historical',
    isCustom: true,
    baseVoice: 'Charon',
    accent: 'Sinhala / English',
    creator: 'VoiceCraft Lab',
    likes: 342,
    promptInstructions: 'Read with deep reverence, deliberate pauses, and rich historical gravitas.',
  },
  {
    id: 'community-anula-host',
    name: 'Anula - Podcast Host',
    gender: 'Female',
    character: 'Friendly & Conversational',
    description: 'Modern bilingual host tone optimized for tech podcasts, interviews, and vlogs.',
    toneTag: 'Podcast / Social',
    isCustom: true,
    baseVoice: 'Zephyr',
    accent: 'Global English / Sinhala',
    creator: 'Studio Creator X',
    likes: 512,
    promptInstructions: 'Speak with a bright, warm, and approachable conversational rhythm.',
  },
  {
    id: 'community-zen-master',
    name: 'Zen Meditation Guide',
    gender: 'Neutral',
    character: 'Whispering & Peaceful',
    description: 'Calm, slow-paced meditative voice designed for relaxation, sleep stories, and mindfulness.',
    toneTag: 'Meditation / Calm',
    isCustom: true,
    baseVoice: 'Fenrir',
    accent: 'Neutral Accent',
    creator: 'MindfulVoices',
    likes: 289,
    promptInstructions: 'Read exceptionally gently, softly, and with long relaxing pauses between phrases.',
  },
];

export const DELIVERY_STYLES: DeliveryStyleOption[] = [
  {
    id: 'natural',
    label: 'Natural Balanced',
    description: 'Natural speech rhythm and standard cadence',
    iconName: 'Sparkles',
  },
  {
    id: 'storytelling',
    label: 'Warm Storytelling',
    description: 'Rich warmth, immersive pacing, and emotional expression',
    iconName: 'BookOpen',
  },
  {
    id: 'cheerful',
    label: 'Bright & Cheerful',
    description: 'Enthusiastic, lively, and optimistic tone',
    iconName: 'Smile',
  },
  {
    id: 'calm',
    label: 'Calm & Soothing',
    description: 'Relaxed, gentle, and peaceful delivery',
    iconName: 'Coffee',
  },
  {
    id: 'documentary',
    label: 'Cinematic Documentary',
    description: 'Articulate, dignified, and captivating gravitas',
    iconName: 'Film',
  },
];
