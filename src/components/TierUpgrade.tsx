import React, { useState, useEffect } from 'react';
import { Crown, Star, Zap, Check, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import AuthModal from './AuthModal';

interface TierUpgradeProps {
  currentTier: 'guest' | 'standard' | 'pro';
  onClose: () => void;
}

interface PlanStats {
  standard: number;
  pro: number;
}

const TierUpgrade: React.FC<TierUpgradeProps> = ({ currentTier, onClose }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [planStats, setPlanStats] = useState<PlanStats>({ standard: 0, pro: 0 });
  const { user, login } = useAuth();

  // Fetch plan statistics to determine most popular
  useEffect(() => {
    const fetchPlanStats = async () => {
      try {
        const stats = await authService.getPlanStats();
        setPlanStats(stats);
      } catch (error) {
        console.error('Failed to fetch plan stats:', error);
        // Default stats if fetch fails
        setPlanStats({ standard: 65, pro: 35 });
      }
    };

    fetchPlanStats();
  }, []);

  const getMostPopularPlan = (): 'standard' | 'pro' => {
    return planStats.standard >= planStats.pro ? 'standard' : 'pro';
  };

  const handlePlanChange = async (newTier: 'standard' | 'pro') => {
    if (!user || user.tier === 'guest') {
      setShowAuthModal(true);
      return;
    }

    if (user.tier === newTier) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.updateProfile({ tier: newTier });
      
      const action = getTierPriority(newTier) > getTierPriority(user.tier) ? 'upgraded' : 'downgraded';
      setSuccess(`Successfully ${action} to ${getTierDisplayName(newTier)} plan!`);
      
      // Refresh the page after a short delay to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const getTierPriority = (tier: string): number => {
    switch (tier) {
      case 'guest': return 0;
      case 'standard': return 1;
      case 'pro': return 2;
      default: return 0;
    }
  };

  const getTierDisplayName = (tier: string): string => {
    switch (tier) {
      case 'standard': return 'Standard';
      case 'pro': return 'Pro';
      default: return 'Guest';
    }
  };

  const mostPopularPlan = getMostPopularPlan();

  const plans = [
    {
      id: 'guest',
      name: 'Guest',
      icon: Zap,
      price: 'Free',
      description: 'Basic sentiment analysis',
      features: [
        'Sentiment Analysis only',
        'No account required',
        'No history saved',
        'Temporary access'
      ],
      limitations: [
        'Limited to 1 feature',
        'No data persistence',
        'No advanced features'
      ],
      color: 'border-gray-200 bg-gray-50',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      current: currentTier === 'guest',
      userCount: 0
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Star,
      price: '$9.99/month',
      description: 'Enhanced analysis with history',
      features: [
        'Sentiment Analysis',
        'Key Phrase Extraction',
        'Analysis History',
        'Account Dashboard',
        'Email Support'
      ],
      limitations: [
        'Limited to 2 features',
        'Basic support only'
      ],
      color: 'border-blue-200 bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      current: currentTier === 'standard',
      popular: mostPopularPlan === 'standard',
      userCount: planStats.standard
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      price: '$19.99/month',
      description: 'Complete AI-powered text analytics',
      features: [
        'All Analysis Features',
        'Sentiment Analysis',
        'Key Phrase Extraction',
        'Named Entity Recognition',
        'Text Summarization',
        'Language Detection',
        'Unlimited History',
        'Priority Support',
        'API Access',
        'Export Reports'
      ],
      limitations: [],
      color: 'border-purple-200 bg-purple-50',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      current: currentTier === 'pro',
      popular: mostPopularPlan === 'pro',
      userCount: planStats.pro
    }
  ];

  const getButtonText = (plan: any) => {
    if (plan.current) return 'Current Plan';
    if (plan.id === 'guest') return 'Continue as Guest';
    if (currentTier === 'guest') return 'Sign Up';
    
    const currentPriority = getTierPriority(currentTier);
    const planPriority = getTierPriority(plan.id);
    
    if (planPriority > currentPriority) return 'Upgrade';
    if (planPriority < currentPriority) return 'Downgrade';
    return 'Select';
  };

  const canChangePlan = (plan: any) => {
    if (plan.current) return false;
    if (plan.id === 'guest') return true;
    if (currentTier === 'guest') return true;
    return true; // Allow both upgrade and downgrade
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
                <p className="text-gray-600 mt-2">Unlock powerful AI features with our tiered plans</p>
                {user && user.tier !== 'guest' && (
                  <p className="text-sm text-blue-600 mt-1">
                    Current plan: <span className="font-semibold">{getTierDisplayName(user.tier)}</span>
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <strong>Success:</strong> {success}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isChangeable = canChangePlan(plan);
                
                return (
                  <div
                    key={plan.id}
                    className={`
                      relative rounded-2xl border-2 p-6 transition-all duration-200
                      ${plan.color}
                      ${plan.current ? 'ring-2 ring-blue-500' : ''}
                    `}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Most Popular ({plan.userCount}% of users)
                        </span>
                      </div>
                    )}

                    {plan.current && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <Icon className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                      <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                      <p className="text-gray-600 mt-1">{plan.description}</p>
                      <div className="text-3xl font-bold text-gray-800 mt-4">{plan.price}</div>
                      {plan.userCount > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          {plan.userCount}% of users choose this plan
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Features Included:</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.limitations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Limitations:</h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (plan.id === 'guest') {
                          onClose();
                        } else if (currentTier === 'guest') {
                          setShowAuthModal(true);
                        } else {
                          handlePlanChange(plan.id as 'standard' | 'pro');
                        }
                      }}
                      disabled={!isChangeable || loading}
                      className={`
                        w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
                        ${!isChangeable || loading
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : `${plan.buttonColor} hover:scale-105 active:scale-95`
                        }
                      `}
                    >
                      {loading && plan.id !== 'guest' && !plan.current ? 'Processing...' : getButtonText(plan)}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>All plans include secure data processing and privacy protection.</p>
              <p className="mt-1">
                {user && user.tier !== 'guest' 
                  ? 'You can upgrade or downgrade your plan at any time.' 
                  : 'Cancel anytime. No hidden fees.'
                }
              </p>
            </div>

            {user && user.tier !== 'guest' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Plan Change Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Upgrades take effect immediately</li>
                  <li>• Downgrades will be processed at the end of your current billing cycle</li>
                  <li>• Your analysis history will be preserved during plan changes</li>
                  <li>• Feature access will be updated according to your new plan</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
      />
    </>
  );
};

export default TierUpgrade;