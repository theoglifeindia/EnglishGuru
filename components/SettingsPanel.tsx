
import React, { useState, useEffect } from 'react';
import { LLMProvider } from '../types.ts';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: LLMProvider, key: string, name: string, goal: string) => void;
  initialProvider: LLMProvider;
  initialKey: string;
  initialName?: string;
  initialGoal?: string;
}

const GOAL_SUGGESTIONS = [
  "Ace my Job Interview",
  "Prepare for IELTS Speaking",
  "Improve Business Emails",
  "Travel Confidence"
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialProvider, 
  initialKey, 
  initialName = '',
  initialGoal = ''
}) => {
  const [provider, setProvider] = useState<LLMProvider>(initialProvider);
  const [apiKey, setApiKey] = useState<string>(initialKey);
  const [userName, setUserName] = useState<string>(initialName);
  const [userGoal, setUserGoal] = useState<string>(initialGoal);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProvider(initialProvider);
      setApiKey(initialKey);
      setUserName(initialName);
      setUserGoal(initialGoal);
      setShowSuccess(false);
    }
  }, [isOpen, initialProvider, initialKey, initialName, initialGoal]);

  const handleSave = () => {
    onSave(provider, apiKey, userName, userGoal);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] ring-8 ring-white/20">
        <div className="bg-violet-600 px-8 py-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            Setup Guru
          </h2>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Call Me</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Rahul"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-violet-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2 ml-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">My Goal</label>
              <span className={`text-[10px] font-bold ${userGoal.length > 90 ? 'text-amber-500' : 'text-slate-300'}`}>
                {userGoal.length}/100 chars
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setUserGoal(suggestion)}
                  className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg hover:bg-violet-100 hover:text-violet-600 transition-colors border border-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <textarea
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              maxLength={100}
              placeholder="e.g. I want to improve my presentation skills for work..."
              rows={3}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-violet-500 focus:bg-white outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Brain Power</label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LLMProvider)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-violet-500 focus:bg-white outline-none transition-all appearance-none"
              >
                <option value={LLMProvider.GEMINI}>Google Gemini (Recommended)</option>
                <option value={LLMProvider.CHATGPT}>OpenAI ChatGPT</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secret Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-violet-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {showSuccess && (
            <div className="bg-emerald-100 text-emerald-800 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
              Saved Successfully!
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-violet-200 transition-all active:scale-95 hover:-translate-y-1"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
