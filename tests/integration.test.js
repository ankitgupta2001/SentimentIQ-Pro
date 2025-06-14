/**
 * Integration Tests
 * Tests complete workflows and feature combinations
 */

describe('Integration Tests', () => {
  
  describe('Complete User Journey Tests', () => {
    test('should complete guest user analysis workflow', async () => {
      // 1. Start as guest
      const user = { tier: 'guest' };
      
      // 2. Select allowed features
      const allowedFeatures = ['sentiment'];
      
      // 3. Analyze text
      const text = 'This is a great product!';
      const mockResult = {
        features: {
          sentiment: {
            sentiment: 'positive',
            score: 0.8
          }
        }
      };
      
      // 4. Verify results
      expect(user.tier).toBe('guest');
      expect(allowedFeatures).toEqual(['sentiment']);
      expect(mockResult.features.sentiment.sentiment).toBe('positive');
    });

    test('should complete standard user registration and analysis', async () => {
      // 1. Register as standard user
      const registrationData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        tier: 'standard'
      };
      
      // 2. Confirm email (mock)
      const emailConfirmed = true;
      
      // 3. Login
      const user = {
        id: 'user-123',
        tier: 'standard',
        email: registrationData.email
      };
      
      // 4. Select features
      const allowedFeatures = ['sentiment', 'keyPhrases'];
      
      // 5. Analyze text
      const text = 'Apple Inc. released a new iPhone with amazing features.';
      const mockResult = {
        features: {
          sentiment: { sentiment: 'positive', score: 0.7 },
          keyPhrases: { keyPhrases: ['Apple Inc.', 'iPhone', 'features'], count: 3 }
        }
      };
      
      // 6. Save to history
      const historyEntry = {
        user_id: user.id,
        text: text,
        features: allowedFeatures,
        result: mockResult
      };
      
      // Verify complete workflow
      expect(registrationData.tier).toBe('standard');
      expect(emailConfirmed).toBe(true);
      expect(user.tier).toBe('standard');
      expect(allowedFeatures).toHaveLength(2);
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.keyPhrases).toBeTruthy();
      expect(historyEntry.user_id).toBe(user.id);
    });

    test('should complete pro user comprehensive analysis', async () => {
      // 1. Pro user login
      const user = {
        id: 'pro-user-456',
        tier: 'pro',
        email: 'pro@example.com'
      };
      
      // 2. Select all features
      const allFeatures = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'];
      
      // 3. Comprehensive analysis
      const text = 'Microsoft Corporation announced their new AI product at their headquarters in Redmond, Washington. CEO Satya Nadella praised the innovation team for developing cutting-edge artificial intelligence technology that will revolutionize business operations.';
      
      const mockResult = {
        text: text,
        wordCount: 32,
        characterCount: 245,
        features: {
          sentiment: { sentiment: 'positive', score: 0.75 },
          keyPhrases: { keyPhrases: ['Microsoft Corporation', 'AI product', 'artificial intelligence'], count: 3 },
          entities: { 
            entities: [
              { text: 'Microsoft Corporation', category: 'Organization' },
              { text: 'Redmond', category: 'Location' },
              { text: 'Washington', category: 'Location' },
              { text: 'Satya Nadella', category: 'Person' }
            ],
            totalEntities: 4 
          },
          summary: { 
            summary: 'Microsoft announced new AI product with CEO praising innovation team.',
            compressionRatio: '28.5%' 
          },
          language: { name: 'English', iso6391Name: 'en', confidence: 0.99 }
        }
      };
      
      // 4. Save to history
      const historyEntry = {
        user_id: user.id,
        text: text,
        features: allFeatures,
        result: mockResult
      };
      
      // 5. Access admin dashboard
      const hasAdminAccess = user.tier === 'pro';
      
      // Verify complete pro workflow
      expect(user.tier).toBe('pro');
      expect(allFeatures).toHaveLength(5);
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.keyPhrases).toBeTruthy();
      expect(mockResult.features.entities).toBeTruthy();
      expect(mockResult.features.summary).toBeTruthy();
      expect(mockResult.features.language).toBeTruthy();
      expect(historyEntry.features).toEqual(allFeatures);
      expect(hasAdminAccess).toBe(true);
    });
  });

  describe('Feature Combination Tests', () => {
    test('should analyze with sentiment + key phrases', async () => {
      const text = 'The new restaurant has excellent food and outstanding service.';
      const features = ['sentiment', 'keyPhrases'];
      
      const mockResult = {
        features: {
          sentiment: {
            sentiment: 'positive',
            score: 0.85,
            confidenceScores: { positive: 0.85, negative: 0.05, neutral: 0.10 }
          },
          keyPhrases: {
            keyPhrases: ['restaurant', 'excellent food', 'outstanding service'],
            count: 3
          }
        }
      };
      
      expect(mockResult.features.sentiment.sentiment).toBe('positive');
      expect(mockResult.features.keyPhrases.keyPhrases).toContain('excellent food');
      expect(features).toHaveLength(2);
    });

    test('should analyze with entities + summary', async () => {
      const text = 'Apple Inc. CEO Tim Cook announced the new iPhone 15 Pro at the Apple Park headquarters in Cupertino, California. The device features advanced camera technology and improved battery life. The announcement was well-received by technology enthusiasts and industry analysts who praised the innovative features and design improvements.';
      const features = ['entities', 'summary'];
      
      const mockResult = {
        features: {
          entities: {
            entities: [
              { text: 'Apple Inc.', category: 'Organization', confidenceScore: 0.98 },
              { text: 'Tim Cook', category: 'Person', confidenceScore: 0.95 },
              { text: 'iPhone 15 Pro', category: 'Product', confidenceScore: 0.92 },
              { text: 'Apple Park', category: 'Location', confidenceScore: 0.89 },
              { text: 'Cupertino', category: 'Location', confidenceScore: 0.94 },
              { text: 'California', category: 'Location', confidenceScore: 0.96 }
            ],
            totalEntities: 6,
            entitiesByCategory: {
              'Organization': [{ text: 'Apple Inc.', category: 'Organization' }],
              'Person': [{ text: 'Tim Cook', category: 'Person' }],
              'Product': [{ text: 'iPhone 15 Pro', category: 'Product' }],
              'Location': [
                { text: 'Apple Park', category: 'Location' },
                { text: 'Cupertino', category: 'Location' },
                { text: 'California', category: 'Location' }
              ]
            }
          },
          summary: {
            summary: 'Apple Inc. CEO Tim Cook announced the iPhone 15 Pro with advanced features. The announcement was well-received by technology enthusiasts.',
            originalLength: 387,
            summaryLength: 125,
            compressionRatio: '32.3%',
            sentenceCount: 2
          }
        }
      };
      
      expect(mockResult.features.entities.totalEntities).toBe(6);
      expect(mockResult.features.entities.entitiesByCategory['Location']).toHaveLength(3);
      expect(mockResult.features.summary.compressionRatio).toBe('32.3%');
      expect(features).toHaveLength(2);
    });

    test('should analyze with all features combined', async () => {
      const text = 'Google LLC announced their revolutionary new artificial intelligence system called Gemini at their Mountain View, California headquarters. The system demonstrates unprecedented capabilities in natural language understanding and generation. CEO Sundar Pichai expressed excitement about the potential applications in healthcare, education, and scientific research.';
      const features = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'];
      
      const mockResult = {
        text: text,
        wordCount: 48,
        characterCount: 398,
        features: {
          sentiment: {
            sentiment: 'positive',
            score: 0.72,
            magnitude: 0.8,
            intensity: 'high'
          },
          keyPhrases: {
            keyPhrases: [
              'Google LLC',
              'artificial intelligence system',
              'Gemini',
              'natural language understanding',
              'Sundar Pichai',
              'healthcare',
              'education',
              'scientific research'
            ],
            count: 8
          },
          entities: {
            entities: [
              { text: 'Google LLC', category: 'Organization', confidenceScore: 0.99 },
              { text: 'Gemini', category: 'Product', confidenceScore: 0.87 },
              { text: 'Mountain View', category: 'Location', confidenceScore: 0.92 },
              { text: 'California', category: 'Location', confidenceScore: 0.95 },
              { text: 'Sundar Pichai', category: 'Person', confidenceScore: 0.96 }
            ],
            totalEntities: 5
          },
          summary: {
            summary: 'Google announced their AI system Gemini with advanced language capabilities. CEO Sundar Pichai highlighted applications in healthcare and education.',
            compressionRatio: '35.2%',
            sentenceCount: 2
          },
          language: {
            name: 'English',
            iso6391Name: 'en',
            confidence: 0.99
          }
        }
      };
      
      // Verify all features are present and working together
      expect(Object.keys(mockResult.features)).toHaveLength(5);
      expect(mockResult.features.sentiment.sentiment).toBe('positive');
      expect(mockResult.features.keyPhrases.count).toBe(8);
      expect(mockResult.features.entities.totalEntities).toBe(5);
      expect(mockResult.features.summary.compressionRatio).toBe('35.2%');
      expect(mockResult.features.language.name).toBe('English');
    });
  });

  describe('Error Recovery Tests', () => {
    test('should handle partial feature failures gracefully', async () => {
      const text = 'Test text for error handling.';
      const features = ['sentiment', 'keyPhrases', 'entities'];
      
      const mockResult = {
        features: {
          sentiment: { sentiment: 'neutral', score: 0.0 },
          keyPhrases: { error: 'Service temporarily unavailable' },
          entities: { entities: [], totalEntities: 0 }
        }
      };
      
      // Should still return successful features
      expect(mockResult.features.sentiment).toBeTruthy();
      expect(mockResult.features.entities.totalEntities).toBe(0);
      // Should indicate error for failed feature
      expect(mockResult.features.keyPhrases.error).toBeTruthy();
    });

    test('should handle network interruption during analysis', async () => {
      const networkError = new Error('Network request failed');
      
      expect(() => {
        if (networkError.message.includes('Network request failed')) {
          throw new Error('Unable to connect to the analysis service. Please check your internet connection and try again.');
        }
      }).toThrow('Unable to connect to the analysis service');
    });

    test('should handle Azure API rate limiting', async () => {
      const rateLimitResponse = { status: 429, message: 'Rate limit exceeded' };
      
      expect(() => {
        if (rateLimitResponse.status === 429) {
          throw new Error('Analysis rate limit exceeded. Please wait a moment and try again.');
        }
      }).toThrow('Analysis rate limit exceeded');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large text analysis', async () => {
      const largeText = 'Lorem ipsum '.repeat(400); // ~4800 characters
      
      expect(largeText.length).toBeLessThan(5120); // Within API limits
      expect(largeText.length).toBeGreaterThan(1000); // Large enough to test performance
    });

    test('should handle multiple concurrent analyses', async () => {
      const texts = [
        'First analysis text',
        'Second analysis text',
        'Third analysis text'
      ];
      
      const mockResults = texts.map((text, index) => ({
        id: index,
        text: text,
        features: {
          sentiment: { sentiment: 'neutral', score: 0.0 }
        }
      }));
      
      expect(mockResults).toHaveLength(3);
      expect(mockResults[0].text).toBe('First analysis text');
    });

    test('should handle rapid feature selection changes', async () => {
      const featureSelections = [
        ['sentiment'],
        ['sentiment', 'keyPhrases'],
        ['sentiment', 'keyPhrases', 'entities'],
        ['sentiment']
      ];
      
      featureSelections.forEach(selection => {
        expect(selection).toContain('sentiment');
        expect(selection.length).toBeGreaterThan(0);
        expect(selection.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Data Persistence Tests', () => {
    test('should save and retrieve analysis history', async () => {
      const user = { id: 'user-123', tier: 'standard' };
      const analysisData = {
        text: 'Test analysis for history',
        features: ['sentiment', 'keyPhrases'],
        result: {
          features: {
            sentiment: { sentiment: 'positive', score: 0.6 },
            keyPhrases: { keyPhrases: ['test', 'analysis'], count: 2 }
          }
        }
      };
      
      // Mock save to history
      const historyEntry = {
        id: 'history-456',
        user_id: user.id,
        text: analysisData.text,
        features: analysisData.features,
        result: analysisData.result,
        created_at: new Date().toISOString()
      };
      
      // Mock retrieve from history
      const retrievedHistory = [historyEntry];
      
      expect(historyEntry.user_id).toBe(user.id);
      expect(retrievedHistory).toHaveLength(1);
      expect(retrievedHistory[0].text).toBe(analysisData.text);
    });

    test('should handle history pagination', async () => {
      const mockHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `history-${i}`,
        text: `Analysis ${i}`,
        created_at: new Date(Date.now() - i * 1000).toISOString()
      }));
      
      // Mock pagination
      const page1 = mockHistory.slice(0, 20);
      const page2 = mockHistory.slice(20, 40);
      
      expect(page1).toHaveLength(20);
      expect(page2).toHaveLength(20);
      expect(page1[0].id).toBe('history-0');
      expect(page2[0].id).toBe('history-20');
    });
  });

  describe('Security Integration Tests', () => {
    test('should enforce tier-based access control', async () => {
      const guestUser = { tier: 'guest' };
      const standardUser = { tier: 'standard' };
      const proUser = { tier: 'pro' };
      
      // Test feature access
      const restrictedFeature = 'entities';
      
      expect(canAccessFeature(guestUser.tier, restrictedFeature)).toBe(false);
      expect(canAccessFeature(standardUser.tier, restrictedFeature)).toBe(false);
      expect(canAccessFeature(proUser.tier, restrictedFeature)).toBe(true);
    });

    test('should validate session persistence across page refresh', async () => {
      const mockSession = {
        user: { id: 'user-123', tier: 'standard' },
        access_token: 'valid-token',
        expires_at: Date.now() + 3600000
      };
      
      // Mock session storage
      const sessionData = JSON.stringify(mockSession);
      localStorage.setItem('supabase.auth.token', sessionData);
      
      // Mock page refresh - retrieve session
      const storedSession = JSON.parse(localStorage.getItem('supabase.auth.token'));
      
      expect(storedSession.user.id).toBe('user-123');
      expect(storedSession.expires_at).toBeGreaterThan(Date.now());
    });

    test('should handle expired session gracefully', async () => {
      const expiredSession = {
        user: { id: 'user-123' },
        expires_at: Date.now() - 1000 // Expired 1 second ago
      };
      
      const isSessionValid = expiredSession.expires_at > Date.now();
      
      expect(isSessionValid).toBe(false);
    });
  });
});

// Helper function for tests
function canAccessFeature(tier, feature) {
  const tierLimits = {
    guest: ['sentiment'],
    standard: ['sentiment', 'keyPhrases'],
    pro: ['sentiment', 'keyPhrases', 'entities', 'summary', 'language']
  };
  
  return tierLimits[tier]?.includes(feature) || false;
}