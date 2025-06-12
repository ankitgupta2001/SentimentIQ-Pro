import React from 'react';
import { BarChart3, MessageSquare, Users, FileText, Globe, CheckCircle, Circle } from 'lucide-react';
import type { AnalysisFeature } from '../types/sentiment';

interface FeatureSelectorProps {
  selectedFeatures: AnalysisFeature[];
  onFeaturesChange: (features: AnalysisFeature[]) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ selectedFeatures, onFeaturesChange }) => {
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
    if (selectedFeatures.includes(featureId)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== featureId));
    } else {
      onFeaturesChange([...selectedFeatures, featureId]);
    }
  };

  const selectAll = () => {
    onFeaturesChange(features.map(f => f.id));
  };

  const clearAll = () => {
    onFeaturesChange([]);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Analysis Features
        </h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Select All
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
          const Icon = feature.icon;
          const CheckIcon = isSelected ? CheckCircle : Circle;

          return (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? `${feature.bgColor} ${feature.borderColor} shadow-md` 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-6 h-6 ${isSelected ? feature.color : 'text-gray-400'}`} />
                <CheckIcon className={`w-5 h-5 ${isSelected ? feature.color : 'text-gray-300'}`} />
              </div>
              
              <h3 className={`font-semibold mb-1 ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                {feature.label}
              </h3>
              
              <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium">{selectedFeatures.length}</span> of {features.length} features selected
      </div>
    </div>
  );
};

export default FeatureSelector;