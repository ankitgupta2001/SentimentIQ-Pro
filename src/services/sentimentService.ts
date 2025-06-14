import { supabase } from './authService';
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
        throw new Error(errorData.message || 'Invalid input provided');
      }
      
      if (response.status === 403) {
        throw new Error('API access denied. Please check your credentials.');
      }
      
      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Validate the response structure
    if (!result || typeof result.sentiment !== 'string' || typeof result.score !== 'number') {
      throw new Error('Invalid response from sentiment analysis service');
    }

    return result;
    
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the analysis service. Please check if the server is running.');
    }
    
    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unknown errors
    throw new Error('An unexpected error occurred during analysis');
  }
};

export const extractKeyPhrases = async (text: string): Promise<KeyPhrasesResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for key phrase extraction');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/extract-key-phrases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the key phrase extraction service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred during key phrase extraction');
  }
};

export const recognizeEntities = async (text: string): Promise<EntitiesResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for entity recognition');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/recognize-entities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the entity recognition service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
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
    const response = await fetch(`${API_BASE_URL}/summarize-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the text summarization service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred during text summarization');
  }
};

export const detectLanguage = async (text: string): Promise<LanguageResult> => {
  if (!text?.trim()) {
    throw new Error('Text is required for language detection');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the language detection service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
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
        throw new Error(errorData.message || 'Invalid input provided');
      }
      
      if (response.status === 503) {
        throw new Error('Analysis service is not available. Please check your Azure configuration.');
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
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
      } catch (error) {
        // Don't fail the main request if saving to history fails
        console.warn('Failed to save analysis to history:', error);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the comprehensive analysis service.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
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
    
    return response.ok;
  } catch {
    return false;
  }
};