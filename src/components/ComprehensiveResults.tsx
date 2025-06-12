import React from 'react';
import { 
  CheckCircle, 
  BarChart3, 
  MessageSquare, 
  Users, 
  FileText, 
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  MapPin,
  Building,
  User,
  Calendar,
  Hash,
  Zap
} from 'lucide-react';
import type { ComprehensiveAnalysisResult } from '../types/sentiment';

interface ComprehensiveResultsProps {
  result: ComprehensiveAnalysisResult;
}

const ComprehensiveResults: React.FC<ComprehensiveResultsProps> = ({ result }) => {
  // Safely handle features that might be null or undefined
  const features = result.features || {};

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5" />;
      case 'negative': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getEntityIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'person': return <User className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      case 'datetime': return <Calendar className="w-4 h-4" />;
      case 'quantity': return <Hash className="w-4 h-4" />;
      case 'skill': return <Zap className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getEntityColor = (category: string) => {
    const colors = {
      person: 'bg-blue-100 text-blue-800',
      location: 'bg-green-100 text-green-800',
      organization: 'bg-purple-100 text-purple-800',
      datetime: 'bg-orange-100 text-orange-800',
      quantity: 'bg-cyan-100 text-cyan-800',
      skill: 'bg-pink-100 text-pink-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || colors.default;
  };

  // Helper function to safely format numbers
  const formatNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to safely format percentages
  const formatPercentage = (value: any, defaultValue: number = 0): string => {
    const num = formatNumber(value, defaultValue);
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
      <div className="flex items-center mb-6">
        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Comprehensive Analysis Results</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(result.wordCount)}</div>
          <div className="text-sm text-blue-700">Words</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{formatNumber(result.characterCount)}</div>
          <div className="text-sm text-green-700">Characters</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(features).length}</div>
          <div className="text-sm text-purple-700">Features Analyzed</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-600">
            {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A'}
          </div>
          <div className="text-sm text-orange-700">Analysis Time</div>
        </div>
      </div>

      {/* Feature Results */}
      <div className="space-y-6">
        {/* Sentiment Analysis */}
        {features.sentiment && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Sentiment Analysis</h3>
            </div>
            
            <div className={`rounded-lg p-4 border-2 ${getSentimentColor(features.sentiment.sentiment)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getSentimentIcon(features.sentiment.sentiment)}
                  <span className="ml-2 text-lg font-bold capitalize">
                    {features.sentiment.sentiment}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {features.sentiment.score > 0 ? '+' : ''}{formatNumber(features.sentiment.score).toFixed(3)}
                  </div>
                  <div className="text-sm opacity-80">Score</div>
                </div>
              </div>
              
              {features.sentiment.confidenceScores && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {formatPercentage(features.sentiment.confidenceScores.positive)}
                    </div>
                    <div className="text-gray-600">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {formatPercentage(features.sentiment.confidenceScores.neutral)}
                    </div>
                    <div className="text-gray-600">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">
                      {formatPercentage(features.sentiment.confidenceScores.negative)}
                    </div>
                    <div className="text-gray-600">Negative</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Phrases */}
        {features.keyPhrases && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Key Phrases</h3>
              <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {formatNumber(features.keyPhrases.count)} found
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {features.keyPhrases.keyPhrases && features.keyPhrases.keyPhrases.length > 0 ? (
                features.keyPhrases.keyPhrases.map((phrase, index) => (
                  <span
                    key={index}
                    className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200"
                  >
                    {phrase}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4 w-full">
                  No key phrases found in the text.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Named Entities */}
        {features.entities && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Named Entities</h3>
              <span className="ml-auto bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                {formatNumber(features.entities.totalEntities)} found
              </span>
            </div>
            
            {features.entities.entitiesByCategory && Object.keys(features.entities.entitiesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(features.entities.entitiesByCategory).map(([category, entities]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      {getEntityIcon(category)}
                      <span className="ml-2 capitalize">{category}</span>
                      <span className="ml-2 text-sm text-gray-500">({entities.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {entities.map((entity, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getEntityColor(category)}`}
                          title={`Confidence: ${formatPercentage(entity.confidenceScore)}`}
                        >
                          {entity.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No named entities found in the text.
              </div>
            )}
          </div>
        )}

        {/* Text Summary */}
        {features.summary && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Text Summary</h3>
              <span className="ml-auto bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                {features.summary.compressionRatio || 'N/A'} compression
              </span>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              {features.summary.summary ? (
                <>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {features.summary.summary}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {formatNumber(features.summary.sentenceCount)}
                      </div>
                      <div className="text-gray-600">Sentences</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {formatNumber(features.summary.summaryLength)}
                      </div>
                      <div className="text-gray-600">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {formatNumber(features.summary.originalLength)}
                      </div>
                      <div className="text-gray-600">Original</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {features.summary.compressionRatio || 'N/A'}
                      </div>
                      <div className="text-gray-600">Ratio</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Summary could not be generated for this text.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Language Detection */}
        {features.language && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 text-cyan-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Language Detection</h3>
            </div>
            
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-cyan-800">
                    {features.language.name || features.language.detectedLanguage?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-cyan-600">
                    ISO Code: {features.language.iso6391Name || features.language.detectedLanguage?.iso6391Name || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-600">
                    {formatPercentage(
                      features.language.confidence || 
                      features.language.detectedLanguage?.confidenceScore
                    )}
                  </div>
                  <div className="text-sm text-cyan-700">Confidence</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Analysis Summary
        </h4>
        
        <div className="text-sm text-gray-700 leading-relaxed">
          <p>
            This comprehensive analysis processed <strong>{formatNumber(result.wordCount)} words</strong> and{' '}
            <strong>{formatNumber(result.characterCount)} characters</strong> using{' '}
            <strong>{Object.keys(features).length} AI features</strong>.
            
            {features.sentiment && (
              <span>
                {' '}The text shows a <strong>{features.sentiment.sentiment}</strong> sentiment
                {features.sentiment.analysis && (
                  <span> with a confidence of <strong>{features.sentiment.analysis.confidence}</strong></span>
                )}.
              </span>
            )}
            
            {features.keyPhrases && (
              <span>
                {' '}We identified <strong>{formatNumber(features.keyPhrases.count)} key phrases</strong>
                that represent the main topics.
              </span>
            )}
            
            {features.entities && formatNumber(features.entities.totalEntities) > 0 && (
              <span>
                {' '}The text contains <strong>{formatNumber(features.entities.totalEntities)} named entities</strong>
                {features.entities.categories && (
                  <span> across <strong>{features.entities.categories.length} categories</strong></span>
                )}.
              </span>
            )}
            
            {features.summary && features.summary.compressionRatio && (
              <span>
                {' '}The summary achieved a <strong>{features.summary.compressionRatio}</strong> compression ratio.
              </span>
            )}
            
            {features.language && (
              <span>
                {' '}The text is written in <strong>
                  {features.language.name || features.language.detectedLanguage?.name || 'Unknown'}
                </strong>
                with <strong>
                  {formatPercentage(
                    features.language.confidence || 
                    features.language.detectedLanguage?.confidenceScore
                  )}
                </strong> confidence.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveResults;