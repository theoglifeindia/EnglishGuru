
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Model Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Rahul, Priya..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Learning Goal</label>
            <textarea
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. I want to become a Business Analyst in a Bank..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
            <p className="mt-2 text-xs text-slate-500">
              The Guru will tailor examples and scenarios to this goal.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as LLMProvider)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            >
              <option value={LLMProvider.GEMINI}>Google Gemini</option>
              <option value={LLMProvider.CHATGPT}>OpenAI ChatGPT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your private API key..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <p className="mt-2 text-xs text-slate-500">
              Keys are stored in <strong>session storage</strong>.
            </p>
          </div>

          {showSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-bounce">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
              Settings Saved!
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
