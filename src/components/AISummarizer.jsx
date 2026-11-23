import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, X, Loader2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';

export default function AISummarizer({ material, onClose }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  
  // NEW: Keep track of how many times they've generated
  const [generationCount, setGenerationCount] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const texts = [
      'Reading document...',
      'Changing perspective...',
      'Extracting key concepts...',
      'Structuring study points...',
      'Finalizing summary...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i % texts.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary('');
    setCopied(false);

    try {
      // Send the generationCount to the backend
      const { data, error: funcError } = await supabase.functions.invoke('ai-summarize', {
        body: {
          title: material.title,
          courseCode: material.course_code,
          description: material.description,
          generationCount: generationCount // <-- Here is the magic
        }
      });

      if (funcError) throw new Error(funcError.message);
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      
      // Increment the counter so the next click uses a different prompt!
      setGenerationCount((prev) => prev + 1);

    } catch (err) {
      setError(err.message || 'Failed to connect to the AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 modal-enter border-teal/20 shadow-[0_0_50px_rgba(94,234,212,0.1)]">
        <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
            <Sparkles size={20} />
          </div>
          <h3 className="font-display text-2xl font-bold text-white">AI Study Buddy</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Analyzing <strong className="text-white">{material.title}</strong>
        </p>

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        {!summary && !loading && !error && (
          <button onClick={generateSummary} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            <Sparkles size={18} /> Generate Summary
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-teal">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium animate-pulse">{loadingText}</p>
          </div>
        )}

        {summary && !loading && (
          <div className="fade-up">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap text-gray-200 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {summary}
            </div>
            
            <div className="flex gap-3">
              <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all">
                {copied ? <><Check size={16} className="text-green-400" /> Copied!</> : <><Copy size={16} /> Copy</>}
              </button>
              
              <button onClick={generateSummary} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal/10 hover:bg-teal/20 border border-teal/20 text-teal text-sm font-semibold transition-all">
                <RefreshCw size={16} /> New Perspective
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}