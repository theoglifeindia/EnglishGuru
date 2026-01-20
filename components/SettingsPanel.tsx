import React, { useState, useEffect } from 'react';
import { LLMProvider } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: LLMProvider, name: string, goal: string) => void;
  initialProvider: LLMProvider;
  initialName: string;
  initialGoal: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProvider,
  initialName,
  initialGoal
}) => {
  const [provider, setProvider] = useState(initialProvider);
  const [name, setName] = useState(initialName);
  const [goal, setGoal] = useState(initialGoal);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
        setProvider(initialProvider);
        setName(initialName);
        setGoal(initialGoal);
    }
  }, [isOpen, initialProvider, initialName, initialGoal]);

  const handleSave = () => {
    onSave(provider, name, goal);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-2xl font-bold text-slate-800">Settings & Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* User Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h3 className="text-sm font-bold uppercase tracking-wider">My Profile</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">What should I call you?</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul, Priya"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Why are you learning English?</label>
              <textarea 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. I have a job interview at an MNC next week, or I want to travel to Europe confidently."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all h-32 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                *The AI will use this goal to customize examples and role-play scenarios specifically for you.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* AI Config Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="text-sm font-bold uppercase tracking-wider">AI Configuration</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">AI Model Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider(LLMProvider.GEMINI)}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                    provider === LLMProvider.GEMINI 
                    ? 'border-violet-600 bg-violet-50 text-violet-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                   Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setProvider(LLMProvider.CHATGPT)}
                  disabled
                  className={`px-4 py-3 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all opacity-50 cursor-not-allowed ${
                    provider === LLMProvider.CHATGPT
                    ? 'border-violet-600 bg-violet-50 text-violet-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                   ChatGPT (Soon)
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-slate-900 hover:bg-violet-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-200 hover:-translate-y-1 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;