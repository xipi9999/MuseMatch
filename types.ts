export enum AnalysisSource {
  YOUTUBE = 'YOUTUBE',
  FILE = 'FILE'
}

export interface SunoPrompt {
  title: string;
  prompt: string;
  tags: string;
  explanation: string;
}

export interface ScoredItem {
  name: string;
  score: number; // 0-100
}

export interface MusicAnalysis {
  songTitle?: string;
  artist?: string;
  videoId?: string; // For YouTube Embed
  
  // Lyrics Analysis
  lyricsSummary: string;
  lyricsThemes: ScoredItem[];
  lyricsMoods: ScoredItem[];
  language: string;
  explicit: string; // "Yes" | "No" | "Clean"
  
  // Music Analysis
  genres: ScoredItem[];
  subgenres: ScoredItem[];
  musicMoods: ScoredItem[];
  instruments: string[];
  bpm: string;
  key: string;
  vocals: string;

  sunoPrompts: SunoPrompt[];
  sources?: { title: string; url: string }[];
}

export interface LoadingStep {
  id: number;
  message: string;
  active: boolean;
  completed: boolean;
}