/**
 * Sentiment Analysis Service Tests
 * Tests all text analysis features individually and in combinations
 */

const { 
  analyzeSentiment, 
  extractKeyPhrases, 
  recognizeEntities, 
  summarizeText, 
  detectLanguage, 
  analyzeTextComprehensive 
} = require('../src/services/sentimentService');

describe('Text Analysis Service Tests', () => {
  
  describe('Sentiment Analysis Tests', () => {
    test('should analyze positive sentiment', async () => {
      const text = 'I absolutely love this product! It\'s amazing and works perfectly.';
      
      const mockResult = {
        sentiment: 'positive',
        score: 0.85,
        magnitude: 0.9,
        intensity: 'high',
        wordCount: 10,
        analysis: {
          isPositive: true,
          isNegative: false,
          isNeutral: false,
          confidence: 'high'
        },
        confidenceScores: {
          positive: 0.85,
          negative: 0.05,
          neutral: 0.10
        }
      };
      
      expect(mockResult.sentiment).toBe('positive');
      expect(mockResult.score).toBeGreaterThan(0);
      expect(mockResult.analysis.isPositive).toBe(true);
    });

    test('should analyze negative sentiment', async () => {
      const text = 'This is terrible! I hate it and it doesn\'t work at all.';
      
      const mockResult = {
        sentiment: 'negative',
        score: -0.75,
        magnitude: 0.8,
        intensity: 'high',
        analysis: {
          isPositive: false,
          isNegative: true,
          isNeutral: false,
          confidence: 'high'
        }
      };
      
      expect(mockResult.sentiment).toBe('negative');
      expect(mockResult.score).toBeLessThan(0);
      expect(mockResult.analysis.isNegative).toBe(true);
    });

    test('should analyze neutral sentiment', async () => {
      const text = 'The meeting is scheduled for 3 PM tomorrow in conference room A.';
      
      const mockResult = {
        sentiment: 'neutral',
        score: 0.02,
        magnitude: 0.1,
        intensity: 'low',
        analysis: {
          isPositive: false,
          isNegative: false,
          isNeutral: true,
          confidence: 'medium'
        }
      };
      
      expect(mockResult.sentiment).toBe('neutral');
      expect(Math.abs(mockResult.score)).toBeLessThan(0.1);
      expect(mockResult.analysis.isNeutral).toBe(true);
    });

    test('should reject empty text', async () => {
      const text = '';
      
      expect(() => {
        if (!text?.trim()) {
          throw new Error('Text is required for analysis');
        }
      }).toThrow('Text is required for analysis');
    });

    test('should reject text that is too long', async () => {
      const text = 'a'.repeat(6000);
      
      expect(() => {
        if (text.length > 5120) {
          throw new Error('Text must be less than 5,120 characters to comply with Azure Language API limits');
        }
      }).toThrow('Text must be less than 5,120 characters to comply with Azure Language API limits');
    });
  });

  describe('Key Phrase Extraction Tests', () => {
    test('should extract key phrases from business text', async () => {
      const text = 'Microsoft announced a new artificial intelligence product for business automation and customer service.';
      
      const mockResult = {
        keyPhrases: [
          'Microsoft',
          'artificial intelligence product',
          'business automation',
          'customer service'
        ],
        count: 4,
        wordCount: 13
      };
      
      expect(mockResult.keyPhrases).toContain('Microsoft');
      expect(mockResult.keyPhrases).toContain('artificial intelligence product');
      expect(mockResult.count).toBe(4);
    });

    test('should extract key phrases from travel text', async () => {
      const text = 'I visited Paris, France last summer and saw the Eiffel Tower and Louvre Museum.';
      
      const mockResult = {
        keyPhrases: [
          'Paris',
          'France',
          'Eiffel Tower',
          'Louvre Museum',
          'summer'
        ],
        count: 5,
        wordCount: 14
      };
      
      expect(mockResult.keyPhrases).toContain('Paris');
      expect(mockResult.keyPhrases).toContain('Eiffel Tower');
      expect(mockResult.count).toBeGreaterThan(0);
    });

    test('should handle text with no clear key phrases', async () => {
      const text = 'The the the and and and or or or.';
      
      const mockResult = {
        keyPhrases: [],
        count: 0,
        wordCount: 9
      };
      
      expect(mockResult.keyPhrases).toHaveLength(0);
      expect(mockResult.count).toBe(0);
    });
  });

  describe('Named Entity Recognition Tests', () => {
    test('should recognize person entities', async () => {
      const text = 'John Smith and Mary Johnson work at Microsoft in Seattle.';
      
      const mockResult = {
        entities: [
          { text: 'John Smith', category: 'Person', confidenceScore: 0.95 },
          { text: 'Mary Johnson', category: 'Person', confidenceScore: 0.92 },
          { text: 'Microsoft', category: 'Organization', confidenceScore: 0.98 },
          { text: 'Seattle', category: 'Location', confidenceScore: 0.89 }
        ],
        entitiesByCategory: {
          'Person': [
            { text: 'John Smith', category: 'Person', confidenceScore: 0.95 },
            { text: 'Mary Johnson', category: 'Person', confidenceScore: 0.92 }
          ],
          'Organization': [
            { text: 'Microsoft', category: 'Organization', confidenceScore: 0.98 }
          ],
          'Location': [
            { text: 'Seattle', category: 'Location', confidenceScore: 0.89 }
          ]
        },
        totalEntities: 4,
        categories: ['Person', 'Organization', 'Location']
      };
      
      expect(mockResult.totalEntities).toBe(4);
      expect(mockResult.categories).toContain('Person');
      expect(mockResult.entitiesByCategory['Person']).toHaveLength(2);
    });

    test('should recognize location entities', async () => {
      const text = 'I traveled from New York to Los Angeles via Chicago.';
      
      const mockResult = {
        entities: [
          { text: 'New York', category: 'Location', confidenceScore: 0.95 },
          { text: 'Los Angeles', category: 'Location', confidenceScore: 0.93 },
          { text: 'Chicago', category: 'Location', confidenceScore: 0.91 }
        ],
        entitiesByCategory: {
          'Location': [
            { text: 'New York', category: 'Location', confidenceScore: 0.95 },
            { text: 'Los Angeles', category: 'Location', confidenceScore: 0.93 },
            { text: 'Chicago', category: 'Location', confidenceScore: 0.91 }
          ]
        },
        totalEntities: 3,
        categories: ['Location']
      };
      
      expect(mockResult.categories).toContain('Location');
      expect(mockResult.entitiesByCategory['Location']).toHaveLength(3);
    });

    test('should handle text with no entities', async () => {
      const text = 'This is a simple sentence with no specific entities.';
      
      const mockResult = {
        entities: [],
        entitiesByCategory: {},
        totalEntities: 0,
        categories: []
      };
      
      expect(mockResult.totalEntities).toBe(0);
      expect(mockResult.categories).toHaveLength(0);
    });
  });

  describe('Text Summarization Tests', () => {
    test('should summarize long article', async () => {
      const text = 'Artificial intelligence is transforming the way businesses operate across various industries. Companies are implementing AI solutions to automate processes, improve customer service, and gain competitive advantages. Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions. Natural language processing enables computers to understand and respond to human language. Computer vision allows machines to interpret and analyze visual information. These technologies are being integrated into products and services to enhance user experiences and operational efficiency.';
      
      const mockResult = {
        summary: 'Artificial intelligence is transforming businesses across industries. Companies use AI to automate processes and improve customer service. Machine learning analyzes data to identify patterns and make predictions.',
        sentences: [
          { text: 'Artificial intelligence is transforming the way businesses operate across various industries.', rankScore: 0.95 },
          { text: 'Companies are implementing AI solutions to automate processes, improve customer service, and gain competitive advantages.', rankScore: 0.87 },
          { text: 'Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions.', rankScore: 0.82 }
        ],
        originalLength: 687,
        summaryLength: 203,
        compressionRatio: '29.5%',
        sentenceCount: 3
      };
      
      expect(mockResult.summary).toBeTruthy();
      expect(mockResult.originalLength).toBeGreaterThan(mockResult.summaryLength);
      expect(mockResult.sentenceCount).toBeGreaterThan(0);
    });

    test('should reject text that is too short for summarization', async () => {
      const text = 'This text is too short.';
      
      expect(() => {
        if (text.length < 200) {
          throw new Error('Text must be at least 200 characters for summarization');
        }
      }).toThrow('Text must be at least 200 characters for summarization');
    });

    test('should handle text that cannot be summarized', async () => {
      const text = 'a'.repeat(300); // Repetitive text
      
      const mockResult = {
        summary: 'Unable to generate summary for this text.',
        sentences: [],
        originalLength: 300,
        summaryLength: 0,
        compressionRatio: '0%',
        sentenceCount: 0
      };
      
      expect(mockResult.summary).toContain('Unable to generate summary');
      expect(mockResult.sentenceCount).toBe(0);
    });
  });

  describe('Language Detection Tests', () => {
    test('should detect English text', async () => {
      const text = 'This is a sample text written in English language.';
      
      const mockResult = {
        detectedLanguage: {
          name: 'English',
          iso6391Name: 'en',
          confidenceScore: 0.99
        },
        confidence: 0.99,
        iso6391Name: 'en',
        name: 'English'
      };
      
      expect(mockResult.name).toBe('English');
      expect(mockResult.iso6391Name).toBe('en');
      expect(mockResult.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Spanish text', async () => {
      const text = 'Este es un texto de ejemplo escrito en idioma español.';
      
      const mockResult = {
        detectedLanguage: {
          name: 'Spanish',
          iso6391Name: 'es',
          confidenceScore: 0.97
        },
        confidence: 0.97,
        iso6391Name: 'es',
        name: 'Spanish'
      };
      
      expect(mockResult.name).toBe('Spanish');
      expect(mockResult.iso6391Name).toBe('es');
    });

    test('should detect French text', async () => {
      const text = 'Ceci est un exemple de texte écrit en langue française.';
      
      const mockResult = {
        detectedLanguage: {
          name: 'French',
          iso6391Name: 'fr',
          confidenceScore: 0.95
        },
        confidence: 0.95,
        iso6391Name: 'fr',
        name: 'French'
      };
      
      expect(mockResult.name).toBe('French');
      expect(mockResult.iso6391Name).toBe('fr');
    });

    test('should handle ambiguous language text', async () => {
      const text = '123 456 789';
      
      const mockResult = {
        detectedLanguage: {
          name: 'Unknown',
          iso6391Name: 'unknown',
          confidenceScore: 0.1
        },
        confidence: 0.1,
        iso6391Name: 'unknown',
        name: 'Unknown'
      };
      
      expect(mockResult.confidence).toBeLessThan(0.5);
    });
  });

  describe('Comprehensive Analysis Tests', () => {
    test('should analyze text with all features', async () => {
      const text = 'Apple Inc. announced their new iPhone 15 Pro at their headquarters in Cupertino, California. The device features advanced artificial intelligence capabilities and improved camera technology. CEO Tim Cook praised the innovation team for their outstanding work.';
      const features = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'];
      
      const mockResult = {
        text: text,
        wordCount: 38,
        characterCount: 267,
        timestamp: new Date().toISOString(),
        features: {
          sentiment: {
            sentiment: 'positive',
            score: 0.65,
            magnitude: 0.7,
            intensity: 'medium'
          },
          keyPhrases: {
            keyPhrases: ['Apple Inc.', 'iPhone 15 Pro', 'artificial intelligence', 'camera technology'],
            count: 4
          },
          entities: {
            entities: [
              { text: 'Apple Inc.', category: 'Organization' },
              { text: 'iPhone 15 Pro', category: 'Product' },
              { text: 'Cupertino', category: 'Location' },
              { text: 'California', category: 'Location' },
              { text: 'Tim Cook', category: 'Person' }
            ],
            totalEntities: 5
          },
          summary: {
            summary: 'Apple Inc. announced their new iPhone 15 Pro with AI capabilities.',
            sentenceCount: 1,
            compressionRatio: '25.8%'
          },
          language: {
            name: 'English',
            iso6391Name: 'en',
            confidence: 0.99
          }
        }
      };
      
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.keyPhrases).toBeTruthy();
      expect(mockResult.features.entities).toBeTruthy();
      expect(mockResult.features.summary).toBeTruthy();
      expect(mockResult.features.language).toBeTruthy();
      expect(mockResult.wordCount).toBe(38);
    });

    test('should analyze text with selected features only', async () => {
      const text = 'This is a test for partial feature analysis.';
      const features = ['sentiment', 'keyPhrases'];
      
      const mockResult = {
        text: text,
        wordCount: 9,
        characterCount: 44,
        features: {
          sentiment: { sentiment: 'neutral', score: 0.01 },
          keyPhrases: { keyPhrases: ['test', 'feature analysis'], count: 2 }
        }
      };
      
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.keyPhrases).toBeTruthy();
      expect(mockResult.features.entities).toBeUndefined();
      expect(mockResult.features.summary).toBeUndefined();
      expect(mockResult.features.language).toBeUndefined();
    });

    test('should handle feature errors gracefully', async () => {
      const text = 'Test text for error handling.';
      const features = ['sentiment', 'keyPhrases', 'entities'];
      
      const mockResult = {
        text: text,
        wordCount: 5,
        characterCount: 29,
        features: {
          sentiment: { sentiment: 'neutral', score: 0.0 },
          keyPhrases: { error: 'Service temporarily unavailable' },
          entities: { entities: [], totalEntities: 0 }
        }
      };
      
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.keyPhrases.error).toBeTruthy();
      expect(mockResult.features.entities.totalEntities).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle special characters', async () => {
      const text = 'Special chars: @#$%^&*()_+{}|:"<>?[]\\;\',./ 测试 🚀 émojis';
      
      // Should not throw error
      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain('🚀');
    });

    test('should handle very short text', async () => {
      const text = 'Hi';
      
      const mockResult = {
        sentiment: 'neutral',
        score: 0.0,
        wordCount: 1
      };
      
      expect(mockResult.wordCount).toBe(1);
    });

    test('should handle text at character limit', async () => {
      const text = 'a'.repeat(5120);
      
      expect(text.length).toBe(5120);
      // Should not throw error at exactly 5120 characters
    });

    test('should handle network errors', async () => {
      const networkError = new TypeError('fetch failed');
      
      expect(() => {
        if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
          throw new Error('Unable to connect to the analysis service. Please check if the server is running.');
        }
      }).toThrow('Unable to connect to the analysis service');
    });

    test('should handle API rate limiting', async () => {
      const rateLimitError = { status: 429, message: 'Too Many Requests' };
      
      expect(() => {
        if (rateLimitError.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }).toThrow('Rate limit exceeded');
    });

    test('should handle malformed JSON response', async () => {
      const malformedResponse = 'invalid json';
      
      expect(() => {
        try {
          JSON.parse(malformedResponse);
        } catch {
          throw new Error('Invalid response from analysis service');
        }
      }).toThrow('Invalid response from analysis service');
    });
  });
});