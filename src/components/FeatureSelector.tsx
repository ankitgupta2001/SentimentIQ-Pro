import React, { useState } from 'react';
import { BarChart3, MessageSquare, Users, FileText, Globe, CheckCircle, Circle, Lock, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTierLimits, canAccessFeature } from '../utils/tierUtils';
import TierUpgrade from './TierUpgrade';
import type { AnalysisFeature } from '../types/sentiment';

interface FeatureSelectorProps {
  selectedFeatures: AnalysisFeature[];
  onFeaturesChange: (features: AnalysisFeature[]) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ selectedFeatures, onFeaturesChange }) => {
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const tierLimits = getTierLimits(user?.tier || 'guest');

  const features = [
    {
      id: 'sentiment' as AnalysisFeature,
      icon: BarChart3,
      label: 'Sentiment Analysis',
      description: 'Analyze emotional tone and polarity',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'keyPhrases' as AnalysisFeature,
      icon: MessageSquare,
      label: 'Key Phrases',
      description: 'Extract important topics and concepts',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'entities' as AnalysisFeature,
      icon: Users,
      label: 'Named Entities',
      description: 'Identify people, places, organizations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'summary' as AnalysisFeature,
      icon: FileText,
      label: 'Text Summary',
      description: 'Generate concise text summaries',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'language' as AnalysisFeature,
      icon: Globe,
      label: 'Language Detection',
      description: 'Detect the language of the text',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    }
  ];

  const toggleFeature = (featureId: AnalysisFeature) => {
    const canAccess = canAccessFeature(user?.tier || 'guest', featureId);
    
    if (!canAccess) {
      setShowUpgrade(true);
      return;
    }

    if (selectedFeatures.includes(featureId)) {
      // Don't allow removing the last feature for guest users
      if (user?.tier === 'guest' && selectedFeatures.length === 1) {
        return;
      }
      onFeaturesChange(selectedFeatures.filter(f => f !== featureId));
    } else {
      // Check if adding this feature would exceed the limit
      if (selectedFeatures.length >= tierLimits.maxFeatures) {
        setShowUpgrade(true);
        return;
      }
      onFeaturesChange([...selectedFeatures, featureId]);
    }
  };

  const selectAll = () => {
    const allowedFeatures = features
      .filter(f => canAccessFeature(user?.tier || 'guest', f.id))
      .map(f => f.id)
      .slice(0, tierLimits.maxFeatures);
    onFeaturesChange(allowedFeatures);
  };

  const clearAll = () => {
    // For guest users, always keep sentiment selected
    if (user?.tier === 'guest') {
      onFeaturesChange(['sentiment']);
    } else {
      onFeaturesChange([]);
    }
  };

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Analysis Features
            {user?.tier && (
              <span className="ml-3 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {user.tier === 'guest' ? 'Guest Mode' : 
                 user.tier === 'standard' ? 'Standard Plan' : 'Pro Plan'}
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Select All Available
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const isSelected = selectedFeatures.includes(feature.id);
            const canAccess = canAccessFeature(user?.tier || 'guest', feature.id);
            const Icon = feature.icon;
            const CheckIcon = isSelected ? CheckCircle : Circle;

            return (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                disabled={!canAccess && user?.tier === 'guest' && feature.id !== 'sentiment'}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left relative
                  ${isSelected && canAccess
                    ? `${feature.bgColor} ${feature.borderColor} shadow-md` 
                    : canAccess
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    : 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                {!canAccess && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-6 h-6 ${isSelected && canAccess ? feature.color : 'text-gray-400'}`} />
                  <CheckIcon className={`w-5 h-5 ${isSelected && canAccess ? feature.color : 'text-gray-300'}`} />
                </div>
                
                <h3 className={`font-semibold mb-1 ${isSelected && canAccess ? 'text-gray-800' : 'text-gray-600'}`}>
                  {feature.label}
                  {!canAccess && (
                    <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />
                  )}
                </h3>
                
                <p className={`text-sm ${isSelected && canAccess ? 'text-gray-700' : 'text-gray-500'}`}>
                  {feature.description}
                </p>

                {!canAccess && (
                  <div className="mt-2 text-xs text-yellow-600 font-medium">
                    {user?.tier === 'guest' ? 'Sign up required' : 'Upgrade required'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            <span className="font-medium">{selectedFeatures.length}</span> of {tierLimits.maxFeatures} features selected
          </span>
          {user?.tier !== 'pro' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Upgrade for more features →
            </button>
          )}
        </div>

        {user?.tier === 'guest' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Guest Mode:</strong> You can only use Sentiment Analysis. 
              <button 
                onClick={() => setShowUpgrade(true)}
                className="text-yellow-700 underline ml-1 hover:text-yellow-900"
              >
                Sign up to unlock more features
              </button>
            </p>
          </div>
        )}
      </div>

      {showUpgrade && (
        <TierUpgrade 
          currentTier={user?.tier || 'guest'}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
};

export default FeatureSelector;