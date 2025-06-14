import React, { useState } from 'react';
import { Crown, Star, Zap, Check, X } from 'lucide-react';
import AuthModal from './AuthModal';

interface TierUpgradeProps {
  currentTier: 'guest' | 'standard' | 'pro';
  onClose: () => void;
}

const TierUpgrade: React.FC<TierUpgradeProps> = ({ currentTier, onClose }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      current: currentTier === 'guest'
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
      popular: true
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
      current: currentTier === 'pro'
    }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
                <p className="text-gray-600 mt-2">Unlock powerful AI features with our tiered plans</p>
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
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
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
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
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
                          // Handle upgrade logic here
                          console.log(`Upgrading to ${plan.id}`);
                        }
                      }}
                      disabled={plan.current}
                      className={`
                        w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
                        ${plan.current 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : `${plan.buttonColor} hover:scale-105 active:scale-95`
                        }
                      `}
                    >
                      {plan.current ? 'Current Plan' : 
                       plan.id === 'guest' ? 'Continue as Guest' :
                       currentTier === 'guest' ? 'Sign Up' : 
                       'Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>All plans include secure data processing and privacy protection.</p>
              <p className="mt-1">Cancel anytime. No hidden fees.</p>
            </div>
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