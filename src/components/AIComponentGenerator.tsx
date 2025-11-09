import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Code, Sparkles } from 'lucide-react';
import { MagicAIService } from '../lib/integrations';

interface AIComponentGeneratorProps {
  onComponentGenerated: (component: any) => void;
}

const AIComponentGenerator: React.FC<AIComponentGeneratorProps> = ({ onComponentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const magicAI = new MagicAIService(import.meta.env.VITE_MAGIC_AI_API_KEY);
      const result = await magicAI.generateComponent(prompt);
      
      setGeneratedComponent(result);
    } catch (error) {
      console.error('Error generating component:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseComponent = () => {
    if (generatedComponent) {
      onComponentGenerated(generatedComponent);
      setGeneratedComponent(null);
      setPrompt('');
    }
  };

  const examplePrompts = [
    "Add a feedback form with star rating",
    "Create a testimonials slider",
    "Build a contact form with validation",
    "Add a pricing table with three tiers",
    "Create a FAQ accordion section",
    "Build a newsletter signup form"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Component Generator</h3>
        <p className="text-gray-600 text-sm">
          Describe what you want and let AI generate the perfect component for you
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your component
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a feedback form with star rating and comment field"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 mb-1">Quick examples:</span>
          {examplePrompts.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating Component...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Component
            </div>
          )}
        </button>
      </div>

      {generatedComponent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border-t pt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Generated Component</h4>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Sparkles className="w-4 h-4" />
              Ready to use
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Component Preview</span>
            </div>
            <div className="bg-white rounded border p-4">
              <div dangerouslySetInnerHTML={{ __html: generatedComponent.preview }} />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUseComponent}
              className="btn-primary flex-1"
            >
              Add to App
            </button>
            <button
              onClick={() => setGeneratedComponent(null)}
              className="btn-secondary"
            >
              Discard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIComponentGenerator;