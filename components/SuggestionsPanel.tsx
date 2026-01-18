
import React from 'react';

interface SuggestionsPanelProps {
  suggestions: {
    improvements: string[];
    alternatives: string[];
    tips: string[];
  };
  userGoal?: string;
  onSelectPrompt?: (prompt: string) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions, userGoal, onSelectPrompt }) => {
  
  const handleAlternativeClick = (text: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(`Analyze the phrase: "${text}". Explain its tone, formality level, and provide 3 situations where I should use it.`);
    }
  };

  const handleImprovementClick = (text: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(`Please explain the grammar rule behind the correction: "${text}". Why is this better than my original mistake?`);
    }
  };

  const handleTipClick = (text: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(`Can you elaborate on this tip: "${text}"? Give me a practice exercise for it.`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-amber-50 rounded-[2rem] shadow-xl shadow-amber-100/50 border border-amber-100 p-8 h-full relative overflow-hidden">
      
      {/* Dynamic Header based on Goal */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-amber-900 flex items-center gap-3">
          <span className="bg-amber-200 p-2 rounded-xl text-xl shadow-sm">💡</span>
          Guru's Wisdom
        </h2>
        {userGoal && (
           <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-100/50 border border-amber-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide truncate max-w-[200px]">
                Targeting: {userGoal}
              </span>
           </div>
        )}
      </div>

      <div className="space-y-8 relative z-10">
        <section>
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">
            {userGoal ? "Smart Alternatives for Your Goal" : "Better Ways to Say It"}
          </h3>
          <div className="space-y-3">
            {suggestions.alternatives.map((item, i) => (
              <button 
                key={i} 
                onClick={() => handleAlternativeClick(item)}
                className="w-full text-left group bg-white p-4 rounded-2xl border-2 border-amber-100 text-slate-700 font-medium italic shadow-sm hover:border-amber-300 hover:shadow-md transition-all active:scale-95"
              >
                <div className="flex justify-between items-start gap-2">
                  <span>"{item}"</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 text-xs font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-lg">
                    Ask Why ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">Fix These Mistakes</h3>
          <ul className="space-y-3">
            {suggestions.improvements.map((item, i) => (
              <li key={i}>
                <button 
                  onClick={() => handleImprovementClick(item)}
                  className="w-full text-left flex gap-3 text-slate-700 font-medium bg-amber-50/50 hover:bg-amber-100 p-2 rounded-xl transition-colors group"
                >
                  <span className="text-amber-500 font-bold mt-1">•</span>
                  <span>{item}</span>
                  <span className="opacity-0 group-hover:opacity-100 ml-auto text-amber-600 text-[10px] font-bold uppercase border border-amber-200 px-1 rounded bg-white">
                    Explain
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">
            {userGoal ? "Expert Tips for Success" : "Pro Tips"}
          </h3>
          <ul className="space-y-4">
            {suggestions.tips.map((item, i) => (
              <li key={i}>
                <button 
                  onClick={() => handleTipClick(item)}
                  className="w-full text-left flex gap-4 group"
                >
                  <div className="w-8 h-8 bg-amber-900 text-amber-50 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <p className="text-amber-900 font-medium py-1 group-hover:text-amber-700 transition-colors">{item}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400 rounded-full opacity-5 blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default SuggestionsPanel;
