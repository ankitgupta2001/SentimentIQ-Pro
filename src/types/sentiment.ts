export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1.0 to 1.0
  magnitude: number; // 0.0 to 1.0
  intensity: 'low' | 'medium' | 'high';
  wordCount: number;
  analysis: {
    isPositive: boolean;
    isNegative: boolean;
    isNeutral: boolean;
    confidence: 'low' | 'medium' | 'high';
  };
  confidenceScores?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface KeyPhrase {
  text: string;
  offset: number;
  length: number;
}

export interface KeyPhrasesResult {
  keyPhrases: string[];
  count: number;
  wordCount: number;
}

export interface Entity {
  text: string;
  category: string;
  subcategory?: string;
  offset: number;
  length: number;
  confidenceScore: number;
}

export interface EntitiesResult {
  entities: Entity[];
  entitiesByCategory: Record<string, Entity[]>;
  totalEntities: number;
  categories: string[];
}

export interface SummaryResult {
  summary: string;
  sentences: Array<{
    text: string;
    rankScore: number;
    offset: number;
    length: number;
  }>;
  originalLength: number;
  summaryLength: number;
  compressionRatio: string;
  sentenceCount: number;
}

export interface LanguageResult {
  detectedLanguage: {
    name: string;
    iso6391Name: string;
    confidenceScore: number;
  };
  confidence: number;
  iso6391Name: string;
  name: string;
}

export interface ComprehensiveAnalysisResult {
  text: string;
  wordCount: number;
  characterCount: number;
  timestamp: string;
  features: {
    sentiment?: SentimentResult;
    keyPhrases?: KeyPhrasesResult;
    entities?: EntitiesResult;
    summary?: SummaryResult;
    language?: LanguageResult;
  };
}

export interface AnalysisError {
  type: 'network' | 'validation' | 'server' | 'unknown';
  message: string;
}

export interface AnalysisRequest {
  text: string;
  features?: string[];
}

export type AnalysisFeature = 'sentiment' | 'keyPhrases' | 'entities' | 'summary' | 'language';