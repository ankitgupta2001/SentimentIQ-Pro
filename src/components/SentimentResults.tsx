import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Target, 
  FileText,
  Zap,
  CheckCircle
} from 'lucide-react';
import type { SentimentResult } from '../types/sentiment';

interface SentimentResultsProps {
  result: SentimentResult;
}

const SentimentResults: React.FC<SentimentResultsProps> = ({ result }) => {
  const getSentimentIcon = () => {
    switch (result.sentiment) {
      case 'positive':
        return <TrendingUp className="w-6 h-6" />;
      case 'negative':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getSentimentColor = () => {
    switch (result.sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getScoreBarColor = () => {
    if (result.score > 0) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (result.score < 0) return 'bg-gradient-to-r from-red-400 to-red-600';
    return 'bg-gradient-to-r from-blue-400 to-blue-600';
  };

  const getIntensityColor = () => {
    switch (result.intensity) {
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatScore = (score: number) => {
    return score > 0 ? `+${score}` : score.toString();
  };

  const getScoreBarStyles = () => {
    const normalizedScore = Math.max(-1, Math.min(1, result.score));
    const absScore = Math.abs(normalizedScore);
    const barWidth = Math.min(45, absScore * 45);
    
    if (normalizedScore >= 0) {
      return {
        width: `${barWidth}%`,
        marginLeft: '50%'
      };
    } else {
      return {
        width: `${barWidth}%`,
        marginLeft: `${50 - barWidth}%`
      };
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center mb-8">
        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Sentiment Analysis Results</h2>
      </div>

      {/* Main Sentiment Card */}
      <div className={`
        rounded-xl p-8 border-2 mb-8 transition-all duration-300
        ${getSentimentColor()}
      `}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {getSentimentIcon()}
            <div className="ml-4">
              <h3 className="text-2xl font-bold capitalize">{result.sentiment}</h3>
              <p className="text-sm opacity-80 mt-1">Overall Sentiment</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatScore(result.score)}</div>
            <div className="text-sm opacity-80 mt-1">Sentiment Score</div>
          </div>
        </div>

        {/* Score Visualization */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${getScoreBarColor()}`}
              style={getScoreBarStyles()}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>-1.0</span>
            <span>0</span>
            <span>+1.0</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
            <h4 className="font-semibold text-gray-800">Magnitude</h4>
          </div>
          <div className="text-3xl font-bold text-purple-600">{result.magnitude}</div>
          <div className="text-sm text-gray-600 mt-1">Emotional Intensity</div>
        </div>

        <div className={`rounded-xl p-6 ${getIntensityColor()}`}>
          <div className="flex items-center mb-3">
            <Zap className="w-6 h-6 mr-3" />
            <h4 className="font-semibold">Intensity</h4>
          </div>
          <div className="text-3xl font-bold capitalize">{result.intensity}</div>
          <div className="text-sm opacity-80 mt-1">Strength Level</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <FileText className="w-6 h-6 text-indigo-600 mr-3" />
            <h4 className="font-semibold text-gray-800">Word Count</h4>
          </div>
          <div className="text-3xl font-bold text-indigo-600">{result.wordCount}</div>
          <div className="text-sm text-gray-600 mt-1">Total Words</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Target className="w-6 h-6 text-cyan-600 mr-3" />
            <h4 className="font-semibold text-gray-800">Confidence</h4>
          </div>
          <div className="text-3xl font-bold text-cyan-600 capitalize">{result.analysis.confidence}</div>
          <div className="text-sm text-gray-600 mt-1">Analysis Quality</div>
        </div>
      </div>

      {/* Confidence Scores Breakdown */}
      {result.confidenceScores && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Confidence Breakdown
          </h4>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {(result.confidenceScores.positive * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Positive</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${result.confidenceScores.positive * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(result.confidenceScores.neutral * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Neutral</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${result.confidenceScores.neutral * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {(result.confidenceScores.negative * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Negative</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${result.confidenceScores.negative * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Analysis Summary
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Sentiment Classification:</span>
            <span className="font-semibold capitalize">{result.sentiment}</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Emotional Polarity:</span>
            <span className="font-semibold">
              {result.analysis.isPositive ? 'Positive' : 
               result.analysis.isNegative ? 'Negative' : 'Neutral'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Intensity Level:</span>
            <span className="font-semibold capitalize">{result.intensity}</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Analysis Confidence:</span>
            <span className="font-semibold capitalize">{result.analysis.confidence}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/70 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Interpretation:</strong> {' '}
            {result.analysis.isPositive && 'The text expresses positive emotions and favorable opinions.'}
            {result.analysis.isNegative && 'The text contains negative emotions and unfavorable sentiments.'}
            {result.analysis.isNeutral && 'The text maintains a neutral tone without strong emotional bias.'}
            {' '}The magnitude of {result.magnitude} indicates {' '}
            {result.intensity === 'high' ? 'strong emotional content' : 
             result.intensity === 'medium' ? 'moderate emotional expression' : 'subtle emotional nuances'}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SentimentResults;