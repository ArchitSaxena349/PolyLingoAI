import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import { MagicAIService } from '../lib/integrations';
import { useToast } from '../contexts/ToastContext';

interface AIComponentGeneratorProps {
  onComponentGenerated: (component: any) => void;
}

const AIComponentGenerator: React.FC<AIComponentGeneratorProps> = ({ onComponentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const magicAI = new MagicAIService();
      const result = await magicAI.generateComponent(prompt);
      
      setGeneratedComponent(result);
      toast.success('Component generated successfully!', 'AI Generator');
    } catch (error) {
      console.error('Error generating component:', error);
      const errorMessage = error instanceof Error ? error.message : 'Component generation failed';
      setError(errorMessage);
      toast.error(errorMessage, 'Generation Error');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 max-w-xl mx-auto shadow-2xl text-slate-100"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Wand2 className="w-8 h-8 text-slate-950" />
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
          AI Component Generator <Sparkles className="w-5 h-5 text-emerald-400" />
        </h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Describe what you want and let AI generate the component directly for your builder canvas
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Describe your component
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a feedback form with star rating and comment field"
            rows={3}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400">Quick examples:</span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 3).map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-xs bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
              Generating Component...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Component
            </div>
          )}
        </button>

        {error && (
          <div className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {generatedComponent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border-t border-slate-800 pt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Generated Component
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Ready to use
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Component Preview</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
              <p className="font-bold text-white mb-1">{generatedComponent.component?.props?.prompt || prompt}</p>
              <p className="text-slate-400">The generated component is prepared and can be injected directly into your App Builder canvas.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUseComponent}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
            >
              Add to Canvas
            </button>
            <button
              onClick={() => setGeneratedComponent(null)}
              className="px-4 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800 transition-colors"
            >
              Discard
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIComponentGenerator;
