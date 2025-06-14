import type { TierLimits, AnalysisFeature } from '../types/auth';

export const getTierLimits = (tier: 'guest' | 'standard' | 'pro'): TierLimits => {
  switch (tier) {
    case 'guest':
      return {
        maxFeatures: 1,
        allowedFeatures: ['sentiment'],
        hasHistory: false,
        requiresAuth: false
      };
    case 'standard':
      return {
        maxFeatures: 2,
        allowedFeatures: ['sentiment', 'keyPhrases'],
        hasHistory: true,
        requiresAuth: true
      };
    case 'pro':
      return {
        maxFeatures: 5,
        allowedFeatures: ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'],
        hasHistory: true,
        requiresAuth: true
      };
    default:
      return getTierLimits('guest');
  }
};

export const canAccessFeature = (tier: 'guest' | 'standard' | 'pro', feature: string): boolean => {
  const limits = getTierLimits(tier);
  return limits.allowedFeatures.includes(feature);
};

export const getTierDisplayName = (tier: 'guest' | 'standard' | 'pro'): string => {
  switch (tier) {
    case 'guest': return 'Guest';
    case 'standard': return 'Standard';
    case 'pro': return 'Pro';
    default: return 'Guest';
  }
};

export const getTierColor = (tier: 'guest' | 'standard' | 'pro'): string => {
  switch (tier) {
    case 'guest': return 'text-gray-600 bg-gray-100';
    case 'standard': return 'text-blue-600 bg-blue-100';
    case 'pro': return 'text-purple-600 bg-purple-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};