export interface DigitalTwin {
  name: string;
  avatarUrl: string;
  voice: 'Zephyr' | 'Kore' | 'Fenrir' | 'Charon' | 'Puck';
  tone: 'professional' | 'charismatic' | 'intellectual' | 'casual' | 'energetic';
  specialty: string;
  agencyName: string;
  targetAudience: string;
  customPrompt: string;
}

export interface VideoScene {
  id: number;
  duration: number;
  subtitle: string;
  visualPrompt: string;
  audioPrompt: string;
  mediaUrl?: string; // Generated image representation (base64)
  voiceUrl?: string; // Generated audio representation (base64 wav / mp3)
}

export interface VideoScript {
  title: string;
  seoKeywords: string[];
  hook: string;
  callToAction: string;
  scenes: VideoScene[];
}

export interface Trend {
  title: string;
  description: string;
  keyInsight: string;
  seoTags: string[];
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AnalyticsMetric {
  day: string;
  youtubeViews: number;
  instagramViews: number;
  telegramViews: number;
  leadsGenerated: number;
  retentionRate: number;
}
