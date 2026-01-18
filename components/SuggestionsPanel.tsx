
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM13 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707z" /></svg>
        Guru's Corner
      </h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Better Alternatives</h3>
          <div className="space-y-3">
            {suggestions.alternatives.map((item, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm italic text-slate-700">
                "{item}"
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Key Improvements</h3>
          <ul className="space-y-2">
            {suggestions.improvements.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-indigo-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Expert Practice Tips</h3>
          <ul className="space-y-3">
            {suggestions.tips.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg text-sm text-indigo-900">
                <div className="bg-indigo-200 text-indigo-700 w-6 h-6 flex items-center justify-center rounded-full shrink-0 font-bold text-xs">
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
