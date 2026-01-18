
export enum LLMProvider {
  GEMINI = 'GEMINI',
  CHATGPT = 'CHATGPT'
}

export enum ResponseMode {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface PedagogicalResponse {
  simpleExplanation: string;
  hindiExplanation: string;
  correctExamples: string[];
  commonMistakes: string[];
  practiceSuggestion: string;
  suggestions: {
    improvements: string[];
    alternatives: string[];
    tips: string[];
  };
  recommendedMode: ResponseMode;
  audioScript?: string;
  videoMetadata?: {
    scene: string;
    subtitles: string[];
  };
  isInvalidTopic: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: PedagogicalResponse;
  timestamp: number;
}
