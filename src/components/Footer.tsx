import React from 'react';
import { Heart, Code, Zap, Shield, Globe, BarChart3 } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Code className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-gray-600 text-sm">
            Built with React, TypeScript & Azure AI Language
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs text-gray-500 mb-6">
          <div className="flex items-center justify-center">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Analysis
          </div>
          <div className="flex items-center justify-center">
            <BarChart3 className="w-3 h-3 mr-1" />
            Multi-Feature AI
          </div>
          <div className="flex items-center justify-center">
            <Globe className="w-3 h-3 mr-1" />
            Language Detection
          </div>
          <div className="flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Privacy Focused
          </div>
          <div className="flex items-center justify-center">
            <Heart className="w-3 h-3 mr-1" />
            Production Ready
          </div>
          <div className="flex items-center justify-center">
            <Code className="w-3 h-3 mr-1" />
            Open Source
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Azure AI Language Features:</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Sentiment Analysis</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Key Phrase Extraction</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Named Entity Recognition</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Text Summarization</span>
            <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded">Language Detection</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400">
          Your text is processed securely through Azure AI and not stored on our servers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;