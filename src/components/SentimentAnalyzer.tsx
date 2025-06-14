import React, { useState } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import TextInput from './TextInput';
import SentimentResults from './SentimentResults';
import ErrorMessage from './ErrorMessage';
import { analyzeSentiment } from '../services/sentimentService';
import type { SentimentResult, AnalysisError } from '../types/sentiment';

const SentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError({
        type: 'validation',
        message: 'Please enter some text to analyze'
      });
      return;
    }

    if (text.length > 5120) {
      setError({
        type: 'validation',
        message: 'Text is too long. Please limit to 5,120 characters to comply with Azure Language API limits.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeSentiment(text);
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError({
        type: 'network',
        message: err instanceof Error ? err.message : 'Failed to analyze sentiment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const isAnalyzeDisabled = !text.trim() || loading || text.length > 5120;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Enter your text here for sentiment analysis... You can paste articles, reviews, social media posts, emails, or any text you'd like to analyze."
          disabled={loading}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            className={`
              flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200
              ${isAnalyzeDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Analyze Sentiment
              </>
            )}
          </button>
          
          {(result || error) && (
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              Reset
            </button>
          )}
        </div>
        
        <div className="mt-4 text-right text-sm text-gray-500">
          {text.length}/5,120 characters
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Results Section */}
      {result && <SentimentResults result={result} />}

      {/* Example Texts */}
      {!result && !error && !loading && (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Try These Examples
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: 'Positive Example',
                text: 'I absolutely love this new product! The quality is amazing and the customer service was outstanding. Highly recommended!',
                color: 'border-green-200 hover:border-green-300'
              },
              {
                label: 'Negative Example',
                text: 'This was a terrible experience. The product broke immediately and the support team was unhelpful and rude.',
                color: 'border-red-200 hover:border-red-300'
              },
              {
                label: 'Neutral Example',
                text: 'The meeting was scheduled for 3 PM. We discussed the quarterly reports and upcoming project deadlines.',
                color: 'border-blue-200 hover:border-blue-300'
              }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setText(example.text)}
                className={`
                  text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                  ${example.color}
                `}
              >
                <div className="font-medium text-gray-800 mb-2">{example.label}</div>
                <div className="text-sm text-gray-600 line-clamp-3">{example.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalyzer;