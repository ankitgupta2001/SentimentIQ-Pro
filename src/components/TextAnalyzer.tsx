import React, { useState } from 'react';
import { Send, Loader2, AlertTriangle, Zap } from 'lucide-react';
import TextInput from './TextInput';
import ComprehensiveResults from './ComprehensiveResults';
import ErrorMessage from './ErrorMessage';
import { analyzeTextComprehensive } from '../services/sentimentService';
import type { ComprehensiveAnalysisResult, AnalysisError, AnalysisFeature } from '../types/sentiment';

interface TextAnalyzerProps {
  selectedFeatures: AnalysisFeature[];
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ selectedFeatures }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ComprehensiveAnalysisResult | null>(null);
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

    if (text.length > 10000) {
      setError({
        type: 'validation',
        message: 'Text is too long. Please limit to 10,000 characters.'
      });
      return;
    }

    if (selectedFeatures.length === 0) {
      setError({
        type: 'validation',
        message: 'Please select at least one analysis feature.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeTextComprehensive(text, selectedFeatures);
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError({
        type: 'network',
        message: err instanceof Error ? err.message : 'Failed to analyze text. Please try again.'
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

  const isAnalyzeDisabled = !text.trim() || loading || text.length > 10000 || selectedFeatures.length === 0;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Enter your text here for comprehensive analysis... You can paste articles, reviews, social media posts, emails, or any text you'd like to analyze with multiple AI features."
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
                Analyzing with {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Analyze Text ({selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''})
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
        
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>{selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected</span>
          <span>{text.length}/10,000 characters</span>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Results Section */}
      {result && <ComprehensiveResults result={result} />}

      {/* Example Texts */}
      {!result && !error && !loading && (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Try These Examples
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                label: 'Product Review',
                text: 'I recently purchased the new iPhone 15 Pro from Apple Store in New York. The camera quality is absolutely amazing, especially the night mode feature. However, the battery life could be better. The customer service at the store was outstanding - Sarah helped me transfer all my data seamlessly. Overall, I would definitely recommend this phone to anyone looking for a premium smartphone experience.',
                color: 'border-blue-200 hover:border-blue-300'
              },
              {
                label: 'News Article',
                text: 'Microsoft announced today that their new AI-powered productivity suite will be available starting next month. The company, headquartered in Redmond, Washington, expects this technology to revolutionize workplace efficiency. CEO Satya Nadella stated that the integration of artificial intelligence into everyday business tools represents a significant milestone in digital transformation. The announcement was made during the annual Microsoft Build conference.',
                color: 'border-green-200 hover:border-green-300'
              },
              {
                label: 'Travel Blog',
                text: 'My recent trip to Paris, France was absolutely incredible! I stayed at the Hotel des Invalides near the Eiffel Tower for five days in September. The weather was perfect, and I managed to visit the Louvre Museum, Notre-Dame Cathedral, and take a romantic cruise along the Seine River. The French cuisine was exceptional - I particularly loved the croissants from the local bakery on Rue de Rivoli. I cannot wait to return to this beautiful city next summer.',
                color: 'border-purple-200 hover:border-purple-300'
              },
              {
                label: 'Business Report',
                text: 'The quarterly financial report shows significant growth across all major sectors. Revenue increased by 15% compared to the previous quarter, with particularly strong performance in the technology and healthcare divisions. Our expansion into the European market has exceeded expectations, with offices in London, Berlin, and Amsterdam contributing substantially to overall profits. The board of directors has approved additional investment in research and development for the upcoming fiscal year.',
                color: 'border-orange-200 hover:border-orange-300'
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
                <div className="text-sm text-gray-600 line-clamp-4">{example.text}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {example.text.length} characters • Click to use
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnalyzer;