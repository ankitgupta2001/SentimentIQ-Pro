import React from 'react';
import { Brain, Sparkles, Zap, BarChart3, MessageSquare, Users, FileText, Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <Brain className="w-12 h-12 text-blue-600 mr-3" />
          <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SentimentIQ Pro
          </h1>
          <div className="text-sm text-gray-500 mt-1">Advanced Text Analytics Platform</div>
        </div>
      </div>
      
      <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6">
        Unlock comprehensive insights from your text with our advanced AI-powered analytics suite. 
        Analyze sentiment, extract key phrases, identify entities, generate summaries, and detect languages—all in one powerful platform.
      </p>
      
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
          Sentiment Analysis
        </div>
        <div className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
          Key Phrases
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-purple-500" />
          Named Entities
        </div>
        <div className="flex items-center">
          <FileText className="w-4 h-4 mr-2 text-orange-500" />
          Text Summary
        </div>
        <div className="flex items-center">
          <Globe className="w-4 h-4 mr-2 text-cyan-500" />
          Language Detection
        </div>
      </div>

      <div className="flex items-center justify-center text-xs text-gray-400">
        <Zap className="w-3 h-3 mr-1" />
        Powered by Azure AI Language
      </div>
    </header>
  );
};

export default Header;