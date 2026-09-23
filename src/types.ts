export type VoiceName = string;

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  character: string;
  description: string;
  toneTag: string;
  isCustom?: boolean;
  baseVoice?: string;
  accent?: string;
  creator?: string;
  likes?: number;
  promptInstructions?: string;
}

export type DeliveryStyle = 'natural' | 'storytelling' | 'cheerful' | 'calm' | 'documentary';

export interface DeliveryStyleOption {
  id: DeliveryStyle;
  label: string;
  description: string;
  iconName: string;
}

export interface GeneratedClip {
  id: string;
  text: string;
  voice: string;
  style: DeliveryStyle;
  audioUrl: string;
  duration: number;
  byteSize: number;
  createdAt: number;
  isFavorite?: boolean;
}

export interface VoiceProject {
  id: string;
  title: string;
  paragraphs: {
    id: string;
    text: string;
    voice: string;
    style: DeliveryStyle;
  }[];
  bgMusic: 'none' | 'rain' | 'lofi' | 'cinematic' | 'cafe';
  createdAt: number;
}

export interface TTSApiResponse {
  success: boolean;
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  voice: string;
  style: DeliveryStyle;
  duration: number;
  byteSize: number;
  error?: string;
  isRateLimit?: boolean;
  retryAfter?: number;
  modelUsed?: string;
}
