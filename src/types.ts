export type VoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  character: string;
  description: string;
  toneTag: string;
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
  voice: VoiceName;
  style: DeliveryStyle;
  audioUrl: string;
  duration: number;
  byteSize: number;
  createdAt: number;
}

export interface TTSApiResponse {
  success: boolean;
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  voice: VoiceName;
  style: DeliveryStyle;
  duration: number;
  byteSize: number;
  error?: string;
}
