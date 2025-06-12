import React, { useState } from 'react';
import { Brain, Sparkles, BarChart3, MessageSquare, Users, FileText, Globe } from 'lucide-react';
import TextAnalyzer from './components/TextAnalyzer';
import Header from './components/Header';
import Footer from './components/Footer';
import FeatureSelector from './components/FeatureSelector';
import type { AnalysisFeature } from './types/sentiment';

function App() {
  const [selectedFeatures, setSelectedFeatures] = useState<AnalysisFeature[]>([
    'sentiment', 'keyPhrases', 'entities'
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />
        
        {/* Feature Overview */}
        <div className="mt-8 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: BarChart3, label: 'Sentiment', color: 'text-blue-600', desc: 'Emotion analysis' },
              { icon: MessageSquare, label: 'Key Phrases', color: 'text-green-600', desc: 'Important topics' },
              { icon: Users, label: 'Entities', color: 'text-purple-600', desc: 'People & places' },
              { icon: FileText, label: 'Summary', color: 'text-orange-600', desc: 'Text condensation' },
              { icon: Globe, label: 'Language', color: 'text-cyan-600', desc: 'Language detection' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                <h3 className="font-semibold text-gray-800 text-sm">{feature.label}</h3>
                <p className="text-xs text-gray-600 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <main className="space-y-8">
          <FeatureSelector 
            selectedFeatures={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
          />
          <TextAnalyzer selectedFeatures={selectedFeatures} />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;