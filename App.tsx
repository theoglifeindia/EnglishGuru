
import React, { useState, useEffect } from 'react';
import { PedagogicalResponse, ResponseMode, LLMProvider } from './types.ts';
import { GeminiService } from './services/geminiService.ts';
import ResponseView from './components/ResponseView.tsx';
import SuggestionsPanel from './components/SuggestionsPanel.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';

const STORAGE_KEY_PROVIDER = 'eg_llm_provider';
const STORAGE_KEY_API_KEY = 'eg_api_key';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PedagogicalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.GEMINI);
  const [userApiKey, setUserApiKey] = useState<string>('');

  // Load settings from session storage on mount
  useEffect(() => {
    const savedProvider = sessionStorage.getItem(STORAGE_KEY_PROVIDER);
    const savedKey = sessionStorage.getItem(STORAGE_KEY_API_KEY);
    
    if (savedProvider) setProvider(savedProvider as LLMProvider);
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const handleSaveSettings = (newProvider: LLMProvider, newKey: string) => {
    setProvider(newProvider);
    setUserApiKey(newKey);
    sessionStorage.setItem(STORAGE_KEY_PROVIDER, newProvider);
    sessionStorage.setItem(STORAGE_KEY_API_KEY, newKey);
  };

  const handleProcessQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    setError(null);

    try {
      if (provider === LLMProvider.CHATGPT) {
        throw new Error("ChatGPT integration is currently in preview. Please switch to Gemini for now.");
      }
      
      const gemini = new GeminiService();
      // Service will use userApiKey if present, otherwise fallback to process.env.API_KEY
      const result = await gemini.processQuery(trimmedQuery, userApiKey);
      setResponse(result);
    } catch (err: any) {
      console.error("Query Error:", err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Bilingual suggestion chips
  const suggestionChips = [
    { label: 'Explain "Tenses" (काल समझाएं)', query: 'Explain "Tenses" in Hindi' },
    { label: 'Business Etiquette (बिज़नेस शिष्टाचार)', query: 'Business meeting etiquette' },
    { label: 'Greeting Mistakes (अभिवादन की गलतियाँ)', query: 'Common greeting mistakes' },
    { label: 'Self Introduction (अपना परिचय दें)', query: 'Interview self-introduction' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              EG
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">English Guru</h1>
              <p className="text-xs text-slate-500 font-medium">Learn English Clearly, Confidently, Correctly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter hidden sm:inline-block">
              {provider === LLMProvider.GEMINI ? 'Gemini PhD' : 'GPT Expert'} Mode
            </span>
          </div>
        </div>
      </header>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        initialProvider={provider}
        initialKey={userApiKey}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleProcessQuery} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me: 'Explain Present Continuous tense', 'How to sound professional in meetings?', etc."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl p-6 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleProcessQuery(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${isLoading || !query.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setQuery(chip.query)}
                    className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {response ? (
              <ResponseView response={response} />
            ) : !isLoading && !error && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl py-20 px-8 flex flex-col items-center text-center">
                 <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Learn?</h2>
                 <p className="text-slate-500 max-w-md">
                    I'm your PhD-level English guru. Ask a question or paste a sentence, and I'll break it down with simple explanations and Hindi support!
                 </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 h-fit lg:sticky lg:top-24">
            {response ? (
              <SuggestionsPanel suggestions={response.suggestions} />
            ) : (
              <div className="bg-slate-100 rounded-xl p-8 border border-slate-200 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <p className="text-sm font-medium text-slate-500">
                    Submit your first query to unlock guru tips and improvement suggestions here.
                 </p>
              </div>
            )}
            
            <div className="mt-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg">
               <h3 className="font-bold mb-2">Pro Tip</h3>
               <p className="text-sm opacity-90 leading-relaxed italic">
                  "Don't worry about being perfect. Focus on being understood. Fluency comes from practice and making small improvements daily."
               </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium italic">
            Developed with PhD-level pedagogical principles for Indian English learners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
