/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-123'),
  },
});

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Supabase client
jest.mock('../src/services/authService', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      resend: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
  },
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    getAnalysisHistory: jest.fn(),
    saveAnalysis: jest.fn(),
    resendConfirmation: jest.fn(),
    verifyToken: jest.fn(),
    getPlanStats: jest.fn(),
  },
}));

// Mock admin service
jest.mock('../src/services/adminService', () => ({
  adminService: {
    logEvent: jest.fn(),
    trackVisitor: jest.fn(),
    trackAction: jest.fn(),
    getAnalytics: jest.fn(),
    getVisitorLogs: jest.fn(),
    getSystemLogs: jest.fn(),
    getDatabaseStats: jest.fn(),
    getAllUsers: jest.fn(),
    updateUserTier: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

// Mock sentiment service
jest.mock('../src/services/sentimentService', () => ({
  analyzeSentiment: jest.fn(),
  extractKeyPhrases: jest.fn(),
  recognizeEntities: jest.fn(),
  summarizeText: jest.fn(),
  detectLanguage: jest.fn(),
  analyzeTextComprehensive: jest.fn(),
  checkServerHealth: jest.fn(),
}));

// Mock tier utils
jest.mock('../src/utils/tierUtils', () => ({
  getTierLimits: jest.fn((tier) => {
    const limits = {
      guest: {
        maxFeatures: 1,
        allowedFeatures: ['sentiment'],
        hasHistory: false,
        requiresAuth: false,
      },
      standard: {
        maxFeatures: 2,
        allowedFeatures: ['sentiment', 'keyPhrases'],
        hasHistory: true,
        requiresAuth: true,
      },
      pro: {
        maxFeatures: 5,
        allowedFeatures: ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'],
        hasHistory: true,
        requiresAuth: true,
      },
    };
    return limits[tier] || limits.guest;
  }),
  canAccessFeature: jest.fn((tier, feature) => {
    const limits = {
      guest: ['sentiment'],
      standard: ['sentiment', 'keyPhrases'],
      pro: ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'],
    };
    return limits[tier]?.includes(feature) || false;
  }),
  getTierDisplayName: jest.fn((tier) => {
    const names = { guest: 'Guest', standard: 'Standard', pro: 'Pro' };
    return names[tier] || 'Guest';
  }),
  getTierColor: jest.fn((tier) => {
    const colors = {
      guest: 'text-gray-600 bg-gray-100',
      standard: 'text-blue-600 bg-blue-100',
      pro: 'text-purple-600 bg-purple-100',
    };
    return colors[tier] || colors.guest;
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
});

// Global test utilities
global.testUtils = {
  mockUser: (tier = 'standard') => ({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    tier: tier,
    createdAt: new Date().toISOString(),
  }),
  
  mockAnalysisResult: (features = ['sentiment']) => ({
    text: 'Test analysis text',
    wordCount: 3,
    characterCount: 18,
    timestamp: new Date().toISOString(),
    features: features.reduce((acc, feature) => {
      acc[feature] = { mock: true, feature: feature };
      return acc;
    }, {}),
  }),
  
  mockError: (type = 'network', message = 'Test error') => ({
    type: type,
    message: message,
  }),
  
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};