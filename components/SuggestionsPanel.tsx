
import React from 'react';

interface SuggestionsPanelProps {
  suggestions: {
    improvements: string[];
    alternatives: string[];
    tips: string[];
  };
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 p-8 h-full">
      <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-lg">
             <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM13 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707z" /></svg>
        </div>
        Guru's Feedback
      </h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Sound More Natural</h3>
          <div className="space-y-3">
            {suggestions.alternatives.map((item, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 italic">
                "{item}"
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Key Corrections</h3>
          <ul className="space-y-3">
            {suggestions.improvements.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium leading-relaxed">
                <span className="text-violet-500 text-lg leading-none">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Pro Tips</h3>
          <ul className="space-y-3">
            {suggestions.tips.map((item, i) => (
              <li key={i} className="flex items-start gap-4 bg-violet-50/80 p-4 rounded-2xl text-sm text-violet-900 font-medium">
                <div className="bg-white text-violet-700 w-6 h-6 flex items-center justify-center rounded-full shrink-0 font-bold text-xs shadow-sm">
                  {i + 1}
                </div>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SuggestionsPanel;
