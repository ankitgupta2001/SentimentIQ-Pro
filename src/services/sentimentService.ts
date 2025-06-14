import { supabase } from './authService';
import { adminService } from './adminService';
import type { 
  SentimentResult, 
  KeyPhrasesResult, 
  EntitiesResult, 
  SummaryResult, 
  LanguageResult,
  ComprehensiveAnalysisResult,
  AnalysisFeature 
} from '../types/sentiment';

const API_BASE_URL = '/api';

export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for analysis');
  }

  try {
    adminService.logEvent('info', 'Sentiment analysis started', 'analysis', { textLength: text.length });
    
    const response = await fetch(`${API_BASE_URL}/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        adminService.logEvent('warn', 'Sentiment analysis validation error', 'analysis', { error: errorData.message });
        throw new Error(errorData.message || 'Invalid input provided');
      }
      
      if (response.status === 403) {
        adminService.logEvent('error', 'Sentiment analysis access denied', 'analysis', { status: response.status });
        throw new Error('API access denied. Please check your credentials.');
      }
      
      if (response.status === 500) {
        adminService.logEvent('error', 'Sentiment analysis server error', 'analysis', { status: response.status });
        throw new Error('Server error. Please try again later.');
      }
      
      adminService.logEvent('error', 'Sentiment analysis failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Validate the response structure
    if (!result || typeof result.sentiment !== 'string' || typeof result.score !== 'number') {
      adminService.logEvent('error', 'Invalid sentiment analysis response', 'analysis', { result });
      throw new Error('Invalid response from sentiment analysis service');
    }

    adminService.logEvent('info', 'Sentiment analysis completed', 'analysis', { 
      sentiment: result.sentiment, 
      score: result.score,
      textLength: text.length 
    });

    adminService.trackAction('analysis', { 
      type: 'sentiment', 
      sentiment: result.sentiment, 
      score: result.score,
      textLength: text.length 
    });

    return result;
    
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in sentiment analysis', 'analysis', {}, error);
      throw new Error('Unable to connect to the analysis service. Please check if the server is running.');
    }
    
    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unknown errors
    adminService.logEvent('error', 'Unknown error in sentiment analysis', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during analysis');
  }
};

export const extractKeyPhrases = async (text: string): Promise<KeyPhrasesResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for key phrase extraction');
  }

  try {
    adminService.logEvent('info', 'Key phrase extraction started', 'analysis', { textLength: text.length });
    
    const response = await fetch(`${API_BASE_URL}/extract-key-phrases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      adminService.logEvent('error', 'Key phrase extraction failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    adminService.logEvent('info', 'Key phrase extraction completed', 'analysis', { 
      phrasesFound: result.count,
      textLength: text.length 
    });

    adminService.trackAction('analysis', { 
      type: 'keyPhrases', 
      phrasesFound: result.count,
      textLength: text.length 
    });

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in key phrase extraction', 'analysis', {}, error);
      throw new Error('Unable to connect to the key phrase extraction service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    adminService.logEvent('error', 'Unknown error in key phrase extraction', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during key phrase extraction');
  }
};

export const recognizeEntities = async (text: string): Promise<EntitiesResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for entity recognition');
  }

  try {
    adminService.logEvent('info', 'Entity recognition started', 'analysis', { textLength: text.length });
    
    const response = await fetch(`${API_BASE_URL}/recognize-entities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      adminService.logEvent('error', 'Entity recognition failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    adminService.logEvent('info', 'Entity recognition completed', 'analysis', { 
      entitiesFound: result.totalEntities,
      categories: result.categories?.length || 0,
      textLength: text.length 
    });

    adminService.trackAction('analysis', { 
      type: 'entities', 
      entitiesFound: result.totalEntities,
      categories: result.categories,
      textLength: text.length 
    });

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in entity recognition', 'analysis', {}, error);
      throw new Error('Unable to connect to the entity recognition service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    adminService.logEvent('error', 'Unknown error in entity recognition', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during entity recognition');
  }
};

export const summarizeText = async (text: string): Promise<SummaryResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for summarization');
  }

  if (text.length < 200) {
    throw new Error('Text must be at least 200 characters for summarization');
  }

  try {
    adminService.logEvent('info', 'Text summarization started', 'analysis', { textLength: text.length });
    
    const response = await fetch(`${API_BASE_URL}/summarize-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      adminService.logEvent('error', 'Text summarization failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    adminService.logEvent('info', 'Text summarization completed', 'analysis', { 
      originalLength: result.originalLength,
      summaryLength: result.summaryLength,
      compressionRatio: result.compressionRatio,
      sentenceCount: result.sentenceCount
    });

    adminService.trackAction('analysis', { 
      type: 'summary', 
      originalLength: result.originalLength,
      summaryLength: result.summaryLength,
      compressionRatio: result.compressionRatio
    });

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in text summarization', 'analysis', {}, error);
      throw new Error('Unable to connect to the text summarization service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    adminService.logEvent('error', 'Unknown error in text summarization', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during text summarization');
  }
};

export const detectLanguage = async (text: string): Promise<LanguageResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for language detection');
  }

  try {
    adminService.logEvent('info', 'Language detection started', 'analysis', { textLength: text.length });
    
    const response = await fetch(`${API_BASE_URL}/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      adminService.logEvent('error', 'Language detection failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    adminService.logEvent('info', 'Language detection completed', 'analysis', { 
      language: result.name,
      confidence: result.confidence,
      textLength: text.length 
    });

    adminService.trackAction('analysis', { 
      type: 'language', 
      language: result.name,
      confidence: result.confidence,
      textLength: text.length 
    });

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in language detection', 'analysis', {}, error);
      throw new Error('Unable to connect to the language detection service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    adminService.logEvent('error', 'Unknown error in language detection', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during language detection');
  }
};

export const analyzeTextComprehensive = async (
  text: string, 
  features: AnalysisFeature[] = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language']
): Promise<ComprehensiveAnalysisResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for comprehensive analysis');
  }

  try {
    adminService.logEvent('info', 'Comprehensive analysis started', 'analysis', { 
      textLength: text.length, 
      features: features.length,
      featureList: features 
    });
    
    const response = await fetch(`${API_BASE_URL}/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim(), features }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        adminService.logEvent('warn', 'Comprehensive analysis validation error', 'analysis', { error: errorData.message });
        throw new Error(errorData.message || 'Invalid input provided');
      }
      
      if (response.status === 503) {
        adminService.logEvent('error', 'Analysis service unavailable', 'analysis', { status: response.status });
        throw new Error('Analysis service is not available. Please check your Azure configuration.');
      }
      
      adminService.logEvent('error', 'Comprehensive analysis failed', 'analysis', { status: response.status, error: errorData.message });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    adminService.logEvent('info', 'Comprehensive analysis completed', 'analysis', { 
      textLength: text.length,
      features: features.length,
      featureList: features,
      wordCount: result.wordCount,
      characterCount: result.characterCount
    });

    adminService.trackAction('analysis', { 
      type: 'comprehensive', 
      features: features,
      textLength: text.length,
      wordCount: result.wordCount,
      characterCount: result.characterCount
    });

    // Save analysis to history if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await supabase
          .from('analysis_history')
          .insert({
            user_id: user.id,
            text: text.trim(),
            features,
            result
          });
        
        adminService.logEvent('info', 'Analysis saved to history', 'analysis', { userId: user.id });
      } catch (error) {
        // Don't fail the main request if saving to history fails
        console.warn('Failed to save analysis to history:', error);
        adminService.logEvent('warn', 'Failed to save analysis to history', 'analysis', { userId: user.id }, error as Error);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      adminService.logEvent('error', 'Network error in comprehensive analysis', 'analysis', {}, error);
      throw new Error('Unable to connect to the comprehensive analysis service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    adminService.logEvent('error', 'Unknown error in comprehensive analysis', 'analysis', {}, error as Error);
    throw new Error('An unexpected error occurred during comprehensive analysis');
  }
};

// Health check function to verify server connectivity
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const isHealthy = response.ok;
    adminService.logEvent('info', 'Server health check', 'system', { healthy: isHealthy });
    
    return isHealthy;
  } catch (error) {
    adminService.logEvent('error', 'Server health check failed', 'system', {}, error as Error);
    return false;
  }
};