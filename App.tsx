
import React, { useState, useEffect, useRef } from 'react';
import { PedagogicalResponse, ResponseMode, LLMProvider } from './types';
import { GeminiService } from './services/geminiService';
import ResponseView from './components/ResponseView';
import SuggestionsPanel from './components/SuggestionsPanel';
import SettingsPanel from './components/SettingsPanel';
import { DEFAULT_API_KEY } from './constants';

const STORAGE_KEY_PROVIDER = 'eg_llm_provider';
const STORAGE_KEY_API_KEY = 'eg_api_key';
const STORAGE_KEY_USER_NAME = 'eg_user_name';
const STORAGE_KEY_GOAL = 'eg_user_goal';

const DEFAULT_CHIPS = [
  { label: '📚 Explain "Tenses"', query: 'Explain "Tenses" in Hindi with examples', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: '🤝 Business Etiquette', query: 'What are the key phrases for Business meeting etiquette?', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: '👋 Greeting Mistakes', query: 'What are common greeting mistakes people make in English?', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: '🎤 Self Introduction', query: 'Help me draft a professional self-introduction for an interview.', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' }
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PedagogicalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.GEMINI);
  // Initialize with Default Key
  const [userApiKey, setUserApiKey] = useState<string>(DEFAULT_API_KEY);
  const [userName, setUserName] = useState<string>('');
  const [userGoal, setUserGoal] = useState<string>('');

  // Suggestions State
  const [suggestionChips, setSuggestionChips] = useState(DEFAULT_CHIPS);
  const [isRefreshingChips, setIsRefreshingChips] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load settings from storage on mount
  useEffect(() => {
    // Persistent settings (localStorage)
    const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER);
    const savedName = localStorage.getItem(STORAGE_KEY_USER_NAME);
    const savedGoal = localStorage.getItem(STORAGE_KEY_GOAL);
    
    // Session-only settings (sessionStorage)
    const savedKey = sessionStorage.getItem(STORAGE_KEY_API_KEY);
    
    if (savedProvider) setProvider(savedProvider as LLMProvider);
    if (savedKey) {
        setUserApiKey(savedKey);
    } 
    // If no saved key, it remains DEFAULT_API_KEY from initial state
    
    if (savedName) setUserName(savedName);
    if (savedGoal) setUserGoal(savedGoal);
  }, []);

  // Effect to refresh chips when goal/key is available and it's the initial load or goal changed
  useEffect(() => {
      if (userApiKey && userGoal) {
          refreshChips(userGoal, userApiKey);
      }
  }, [userApiKey, userGoal]);

  const handleSaveSettings = (newProvider: LLMProvider, newKey: string, newName: string, newGoal: string) => {
    setProvider(newProvider);
    setUserApiKey(newKey);
    setUserName(newName);
    setUserGoal(newGoal);
    
    // Save persistent settings to localStorage
    localStorage.setItem(STORAGE_KEY_PROVIDER, newProvider);
    localStorage.setItem(STORAGE_KEY_USER_NAME, newName);
    localStorage.setItem(STORAGE_KEY_GOAL, newGoal);
    
    // Save API key to sessionStorage (cleared when tab closes)
    sessionStorage.setItem(STORAGE_KEY_API_KEY, newKey);
    
    // Trigger chip refresh if goal is updated
    if (newKey && newGoal && newGoal !== userGoal) {
        refreshChips(newGoal, newKey);
    }
  };

  const refreshChips = async (goal: string, apiKey: string) => {
    if (!goal || !apiKey) return;
    
    setIsRefreshingChips(true);
    try {
      const gemini = new GeminiService();
      const newPrompts = await gemini.fetchStarterPrompts(goal, apiKey);
      
      if (newPrompts && newPrompts.length > 0) {
        const colors = [
          'bg-emerald-100 text-emerald-800 border-emerald-200',
          'bg-blue-100 text-blue-800 border-blue-200',
          'bg-amber-100 text-amber-800 border-amber-200',
          'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200'
        ];
        
        const coloredPrompts = newPrompts.map((p, i) => ({
          ...p,
          color: colors[i % colors.length]
        }));
        
        setSuggestionChips(coloredPrompts);
      }
    } catch (e) {
      console.error("Failed to refresh chips", e);
    } finally {
      setIsRefreshingChips(false);
    }
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
      const result = await gemini.processQuery(trimmedQuery, userApiKey, userName, userGoal);
      setResponse(result);
    } catch (err: any) {
      console.error("Query Error:", err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPrompt = (professionalPrompt: string) => {
    setQuery(professionalPrompt);
    // Smooth scroll is optional here if it's already visible, but ensures focus
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-[Outfit]">
      <header className="bg-violet-600 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setResponse(null); setQuery(''); }}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-600 font-extrabold text-2xl shadow-inner transform group-hover:rotate-6 transition-transform duration-300">
              EG
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight group-hover:text-violet-100 transition-colors">English Guru</h1>
              <p className="text-xs text-violet-200 font-medium tracking-wider uppercase opacity-80">AI Communication Coach</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        initialProvider={provider}
        initialKey={userApiKey}
        initialName={userName}
        initialGoal={userGoal}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Input Card */}
            <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-violet-100 border border-slate-100">
              <form onSubmit={handleProcessQuery} className="relative">
                <textarea
                  ref={textAreaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={userName ? `Hi ${userName}! What do you want to learn today?` : "Type something like: 'How to use Present Perfect Tense?'"}
                  className="w-full h-36 bg-slate-50 rounded-[1.5rem] p-6 pr-24 focus:bg-white border-2 border-transparent focus:border-violet-400 outline-none transition-all text-lg resize-none placeholder-slate-400 text-slate-700"
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
                  className={`absolute bottom-3 right-3 w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg transition-all transform duration-200 ${
                    isLoading || !query.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white hover:scale-105 hover:shadow-violet-200 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-7 h-7 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </form>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-3 items-center">
              {suggestionChips.map((chip, index) => (
                <button
                  key={`${chip.label}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionPrompt(chip.query)}
                  className={`text-sm font-bold px-4 py-2 rounded-xl border-b-4 hover:border-b-0 hover:translate-y-1 transition-all ${chip.color} shadow-sm`}
                >
                  {chip.label}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => refreshChips(userGoal, userApiKey)}
                disabled={isRefreshingChips || !userGoal || !userApiKey}
                className={`ml-auto p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${isRefreshingChips ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-600'}`}
                title={userGoal ? "Refresh Topics aligned to Goal" : "Set a Goal in settings to enable"}
              >
                 <span className={`block text-xl ${isRefreshingChips ? 'animate-spin' : ''}`}>🔄</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="bg-red-100 p-2 rounded-full shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="font-bold">{error}</p>
              </div>
            )}

            {response ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResponseView response={response} />
              </div>
            ) : !isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-violet-100 rounded-[2rem] py-16 px-8 flex flex-col items-center text-center md:col-span-2">
                    <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <span className="text-5xl">🎓</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Ready to Master English?</h2>
                    <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
                      {userName 
                        ? <span dangerouslySetInnerHTML={{__html: `Hi <strong class="text-violet-600">${userName}</strong>! ${userGoal ? 'Let\'s work on your goal: <em>' + userGoal + '</em>' : 'Ask me anything!'}`}} />
                        : "I'm your friendly PhD-level Guru. Ask a question, and I'll explain it simply with Hindi support!"}
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-4">
                   <div className="text-3xl bg-emerald-100 p-2 rounded-xl">🔒</div>
                   <div>
                     <h3 className="font-bold text-slate-800">Secure & Private</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Your data stays local</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-4">
                   <div className="text-3xl bg-amber-100 p-2 rounded-xl">⚡</div>
                   <div>
                     <h3 className="font-bold text-slate-800">Fast & Accurate</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Powered by Gemini 3</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 h-fit lg:sticky lg:top-28 space-y-6">
            {response ? (
              <SuggestionsPanel 
                suggestions={response.suggestions} 
                // Pass props to allow panel to be smarter if needed, or simple display
              />
            ) : (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400"></div>
                  <div className={`w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-sm rotate-3 transition-transform group-hover:rotate-6 ${userGoal ? 'ring-2 ring-violet-200' : ''}`}>
                    💡
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Guru's Corner</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {userGoal 
                      ? <span>Ready to provide tips for: <strong className="text-violet-600 block mt-1">{userGoal}</strong></span> 
                      : "Ask a question to unlock personalized improvements and expert tips here!"}
                  </p>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-100 transform hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center gap-2 mb-3 opacity-90">
                  <span className="text-xl">🔥</span>
                  <h3 className="font-black uppercase tracking-wide text-sm">Pro Motivation</h3>
                </div>
                <p className="text-lg font-bold leading-relaxed">
                  "Don't worry about being perfect. Focus on being understood. Fluency is a journey!"
                </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm font-medium">
        <p>© {new Date().getFullYear()} English Guru • PhD-Pedagogy • Made with 💜</p>
      </footer>
    </div>
  );
};

export default App;
