/**
 * User Tier and Feature Access Tests
 * Tests tier-based feature access control
 */

const { getTierLimits, canAccessFeature, getTierDisplayName, getTierColor } = require('../src/utils/tierUtils');

describe('User Tier System Tests', () => {
  
  describe('Tier Limits Tests', () => {
    test('should return correct limits for guest tier', () => {
      const limits = getTierLimits('guest');
      
      expect(limits.maxFeatures).toBe(1);
      expect(limits.allowedFeatures).toEqual(['sentiment']);
      expect(limits.hasHistory).toBe(false);
      expect(limits.requiresAuth).toBe(false);
    });

    test('should return correct limits for standard tier', () => {
      const limits = getTierLimits('standard');
      
      expect(limits.maxFeatures).toBe(2);
      expect(limits.allowedFeatures).toEqual(['sentiment', 'keyPhrases']);
      expect(limits.hasHistory).toBe(true);
      expect(limits.requiresAuth).toBe(true);
    });

    test('should return correct limits for pro tier', () => {
      const limits = getTierLimits('pro');
      
      expect(limits.maxFeatures).toBe(5);
      expect(limits.allowedFeatures).toEqual(['sentiment', 'keyPhrases', 'entities', 'summary', 'language']);
      expect(limits.hasHistory).toBe(true);
      expect(limits.requiresAuth).toBe(true);
    });

    test('should default to guest limits for invalid tier', () => {
      const limits = getTierLimits('invalid');
      
      expect(limits.maxFeatures).toBe(1);
      expect(limits.allowedFeatures).toEqual(['sentiment']);
      expect(limits.hasHistory).toBe(false);
    });
  });

  describe('Feature Access Tests', () => {
    test('guest can only access sentiment analysis', () => {
      expect(canAccessFeature('guest', 'sentiment')).toBe(true);
      expect(canAccessFeature('guest', 'keyPhrases')).toBe(false);
      expect(canAccessFeature('guest', 'entities')).toBe(false);
      expect(canAccessFeature('guest', 'summary')).toBe(false);
      expect(canAccessFeature('guest', 'language')).toBe(false);
    });

    test('standard can access sentiment and key phrases', () => {
      expect(canAccessFeature('standard', 'sentiment')).toBe(true);
      expect(canAccessFeature('standard', 'keyPhrases')).toBe(true);
      expect(canAccessFeature('standard', 'entities')).toBe(false);
      expect(canAccessFeature('standard', 'summary')).toBe(false);
      expect(canAccessFeature('standard', 'language')).toBe(false);
    });

    test('pro can access all features', () => {
      expect(canAccessFeature('pro', 'sentiment')).toBe(true);
      expect(canAccessFeature('pro', 'keyPhrases')).toBe(true);
      expect(canAccessFeature('pro', 'entities')).toBe(true);
      expect(canAccessFeature('pro', 'summary')).toBe(true);
      expect(canAccessFeature('pro', 'language')).toBe(true);
    });
  });

  describe('Feature Selection Validation Tests', () => {
    test('should validate guest feature selection', () => {
      const guestLimits = getTierLimits('guest');
      const selectedFeatures = ['sentiment'];
      
      expect(selectedFeatures.length).toBeLessThanOrEqual(guestLimits.maxFeatures);
      expect(selectedFeatures.every(feature => guestLimits.allowedFeatures.includes(feature))).toBe(true);
    });

    test('should reject invalid guest feature selection', () => {
      const guestLimits = getTierLimits('guest');
      const selectedFeatures = ['sentiment', 'keyPhrases'];
      
      expect(selectedFeatures.length).toBeGreaterThan(guestLimits.maxFeatures);
    });

    test('should validate standard feature selection', () => {
      const standardLimits = getTierLimits('standard');
      const selectedFeatures = ['sentiment', 'keyPhrases'];
      
      expect(selectedFeatures.length).toBeLessThanOrEqual(standardLimits.maxFeatures);
      expect(selectedFeatures.every(feature => standardLimits.allowedFeatures.includes(feature))).toBe(true);
    });

    test('should reject invalid standard feature selection', () => {
      const standardLimits = getTierLimits('standard');
      const selectedFeatures = ['sentiment', 'keyPhrases', 'entities'];
      
      expect(selectedFeatures.length).toBeGreaterThan(standardLimits.maxFeatures);
    });

    test('should validate pro feature selection', () => {
      const proLimits = getTierLimits('pro');
      const selectedFeatures = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'];
      
      expect(selectedFeatures.length).toBeLessThanOrEqual(proLimits.maxFeatures);
      expect(selectedFeatures.every(feature => proLimits.allowedFeatures.includes(feature))).toBe(true);
    });
  });

  describe('Tier Display Tests', () => {
    test('should return correct display names', () => {
      expect(getTierDisplayName('guest')).toBe('Guest');
      expect(getTierDisplayName('standard')).toBe('Standard');
      expect(getTierDisplayName('pro')).toBe('Pro');
      expect(getTierDisplayName('invalid')).toBe('Guest');
    });

    test('should return correct tier colors', () => {
      expect(getTierColor('guest')).toBe('text-gray-600 bg-gray-100');
      expect(getTierColor('standard')).toBe('text-blue-600 bg-blue-100');
      expect(getTierColor('pro')).toBe('text-purple-600 bg-purple-100');
      expect(getTierColor('invalid')).toBe('text-gray-600 bg-gray-100');
    });
  });

  describe('Tier Upgrade Scenarios Tests', () => {
    test('should handle guest to standard upgrade', () => {
      const oldTier = 'guest';
      const newTier = 'standard';
      
      const oldLimits = getTierLimits(oldTier);
      const newLimits = getTierLimits(newTier);
      
      expect(newLimits.maxFeatures).toBeGreaterThan(oldLimits.maxFeatures);
      expect(newLimits.hasHistory).toBe(true);
      expect(oldLimits.hasHistory).toBe(false);
    });

    test('should handle standard to pro upgrade', () => {
      const oldTier = 'standard';
      const newTier = 'pro';
      
      const oldLimits = getTierLimits(oldTier);
      const newLimits = getTierLimits(newTier);
      
      expect(newLimits.maxFeatures).toBeGreaterThan(oldLimits.maxFeatures);
      expect(newLimits.allowedFeatures.length).toBeGreaterThan(oldLimits.allowedFeatures.length);
    });

    test('should handle pro to standard downgrade', () => {
      const oldTier = 'pro';
      const newTier = 'standard';
      
      const oldLimits = getTierLimits(oldTier);
      const newLimits = getTierLimits(newTier);
      
      expect(newLimits.maxFeatures).toBeLessThan(oldLimits.maxFeatures);
      expect(newLimits.allowedFeatures.length).toBeLessThan(oldLimits.allowedFeatures.length);
    });
  });

  describe('History Access Tests', () => {
    test('guest should not have history access', () => {
      const limits = getTierLimits('guest');
      expect(limits.hasHistory).toBe(false);
    });

    test('standard should have history access', () => {
      const limits = getTierLimits('standard');
      expect(limits.hasHistory).toBe(true);
    });

    test('pro should have history access', () => {
      const limits = getTierLimits('pro');
      expect(limits.hasHistory).toBe(true);
    });
  });

  describe('Authentication Requirements Tests', () => {
    test('guest should not require authentication', () => {
      const limits = getTierLimits('guest');
      expect(limits.requiresAuth).toBe(false);
    });

    test('standard should require authentication', () => {
      const limits = getTierLimits('standard');
      expect(limits.requiresAuth).toBe(true);
    });

    test('pro should require authentication', () => {
      const limits = getTierLimits('pro');
      expect(limits.requiresAuth).toBe(true);
    });
  });
});