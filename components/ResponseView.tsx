
import React, { useState, useEffect } from 'react';
import { PedagogicalResponse, ResponseMode } from '../types.ts';
import { speakText, stopSpeech } from '../utils/audioUtils.ts';
import { GeminiService } from '../services/geminiService.ts';
import Avatar from './Avatar.tsx';

interface ResponseViewProps {
  response: PedagogicalResponse;
  apiKey?: string;
}

const ResponseView: React.FC<ResponseViewProps> = ({ response, apiKey }) => {
  // STRICT REQUIREMENT: Always default to TEXT (Explanation) mode when response loads
  const [activeTab, setActiveTab] = useState<ResponseMode>(ResponseMode.TEXT);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoSubtitleIndex, setVideoSubtitleIndex] = useState(0);

  // Practice Arena State
  const [practiceInput, setPracticeInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ type: 'success' | 'warning' | 'info'; message: string; correction?: string } | null>(null);

  useEffect(() => {
    // Reset state on new response
    setActiveTab(ResponseMode.TEXT); // Always go to Explanation page by default
    stopSpeech();
    setIsSpeaking(false);
    setPracticeInput('');
    setPracticeFeedback(null);
    setIsChecking(false);
  }, [response]);

  const handlePlayAudio = () => {
    const textToSpeak = response.audioScript || response.simpleExplanation;
    setIsSpeaking(true);
    speakText(textToSpeak, () => setIsSpeaking(false));
  };

  const handleStopAudio = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  const handleCheckPractice = async () => {
    if (!practiceInput.trim()) return;
    setIsChecking(true);
    setPracticeFeedback(null);

    try {
      // 1. First attempt: Quick local check (instant gratification if perfect match)
      const input = practiceInput.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const foundCorrect = response.correctExamples.find(correct => 
        input === correct.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      );

      if (foundCorrect) {
        setPracticeFeedback({
          type: 'success',
          message: "🌟 Perfect! You used the concept exactly right!"
        });
        setIsChecking(false);
        return;
      }

      // 2. Second attempt: AI Validation for smarter feedback
      const service = new GeminiService();
      const validation = await service.validatePracticeInput(
        practiceInput, 
        response.grammarFocus?.topic || 'English Grammar', 
        response.practiceSuggestion,
        apiKey
      );

      if (validation.isCorrect) {
        setPracticeFeedback({
          type: 'success',
          message: validation.feedback || "🌟 Excellent! Your sentence is grammatically correct."
        });
      } else {
        setPracticeFeedback({
          type: 'warning',
          message: validation.feedback || "⚠️ There's a small mistake.",
          correction: validation.correctedSentence
        });
      }

    } catch (error) {
      console.error(error);
      setPracticeFeedback({
        type: 'info',
        message: "Couldn't verify online, but good attempt! Compare with the 'Say This' examples above."
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeTab === ResponseMode.VIDEO && isSpeaking && response.videoMetadata?.subtitles) {
      interval = setInterval(() => {
        setVideoSubtitleIndex((prev) => (prev + 1) % (response.videoMetadata?.subtitles.length || 1));
      }, 3000);
    } else {
      setVideoSubtitleIndex(0);
    }
    return () => clearInterval(interval);
  }, [activeTab, isSpeaking, response.videoMetadata]);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Tabs */}
      <div className="p-2 bg-slate-100/50 m-2 rounded-[1.5rem] flex gap-1">
        {[
          { id: ResponseMode.TEXT, label: '📖 Explanation', color: 'text-violet-700 bg-white shadow-md' },
          { id: ResponseMode.AUDIO, label: '🗣️ Pronunciation', color: 'text-fuchsia-700 bg-white shadow-md' },
          { id: ResponseMode.VIDEO, label: '🎬 Simulation', color: 'text-blue-700 bg-white shadow-md' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ResponseMode)}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeTab === tab.id 
                ? `${tab.color} scale-100` 
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700 scale-95'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === ResponseMode.TEXT && (
          <div className="space-y-8">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-3">The Breakdown</h3>
              <p className="text-xl font-medium text-slate-800 leading-relaxed">{response.simpleExplanation}</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 relative">
              <div className="absolute -top-3 left-6 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                हिन्दी Context
              </div>
              <p className="text-lg text-slate-800 hindi-text font-medium mt-2">{response.hindiExplanation}</p>
            </div>

            {/* Grammar Focus Section */}
            {response.grammarFocus && (
              <div className="bg-sky-50 rounded-3xl p-6 border-2 border-sky-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-sky-200 rounded-full blur-2xl opacity-20"></div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm text-sky-600">
                    🧩
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-1">
                      Grammar Focus: {response.grammarFocus.topic}
                    </h3>
                    <p className="text-lg font-bold text-slate-800 leading-snug">
                      {response.grammarFocus.rule}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-4">
                  <span className="w-8 h-8 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-sm">✓</span>
                  Say This
                </h3>
                <ul className="space-y-3">
                  {response.correctExamples.map((ex, i) => (
                    <li key={i} className="text-emerald-900 font-medium flex items-start gap-2">
                       <span>•</span>
                       <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50 rounded-3xl p-6 border-2 border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold mb-4">
                  <span className="w-8 h-8 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center text-sm">✗</span>
                  Not This
                </h3>
                <ul className="space-y-3">
                  {response.commonMistakes.map((err, i) => (
                    <li key={i} className="text-rose-900 font-medium flex items-start gap-2">
                       <span>•</span>
                       <span className="line-through opacity-70 decoration-rose-400">{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Practice Arena */}
            <div className="bg-violet-600 text-white p-1 rounded-[2rem] shadow-xl shadow-violet-200">
              <div className="bg-white/10 p-6 rounded-[1.8rem] backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl bg-white/20 w-12 h-12 flex items-center justify-center rounded-2xl">🏋️</div>
                  <div>
                    <h3 className="text-violet-100 font-bold uppercase text-xs tracking-wider mb-1">Practice Arena</h3>
                    <p className="text-lg font-bold text-white leading-snug">{response.practiceSuggestion}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={practiceInput}
                    onChange={(e) => {
                      setPracticeInput(e.target.value);
                      setPracticeFeedback(null);
                    }}
                    placeholder="Type your sentence here to practice..."
                    className="w-full bg-white text-slate-800 rounded-xl p-4 font-medium outline-none border-4 border-transparent focus:border-violet-300 transition-all placeholder-slate-400 resize-none h-24"
                  />
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={handleCheckPractice}
                      disabled={!practiceInput.trim() || isChecking}
                      className="bg-amber-400 hover:bg-amber-300 text-amber-900 px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wide transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20 flex items-center gap-2"
                    >
                      {isChecking ? (
                        <>
                           <div className="w-4 h-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin"></div>
                           Checking...
                        </>
                      ) : (
                        "Check My Sentence"
                      )}
                    </button>
                  </div>

                  {practiceFeedback && (
                    <div className={`rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                      practiceFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-900' :
                      practiceFeedback.type === 'warning' ? 'bg-rose-100 text-rose-900' :
                      'bg-sky-100 text-sky-900'
                    }`}>
                      <span className="text-xl shrink-0 mt-0.5">
                        {practiceFeedback.type === 'success' ? '🎉' : practiceFeedback.type === 'warning' ? '🧐' : 'ℹ️'}
                      </span>
                      <div>
                        <p className="font-bold text-sm leading-relaxed">{practiceFeedback.message}</p>
                        {practiceFeedback.correction && (
                          <div className="mt-2 bg-white/50 p-2 rounded-lg">
                            <span className="text-xs font-bold uppercase tracking-wide opacity-70 block mb-1">Correction</span>
                            <p className="font-bold text-lg">{practiceFeedback.correction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === ResponseMode.AUDIO && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className={`mb-8 p-1 rounded-full transition-all duration-500 ${isSpeaking ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 p-[6px]' : 'bg-slate-100'}`}>
               <div className="bg-white p-8 rounded-full">
                  <svg className={`w-20 h-20 ${isSpeaking ? 'text-fuchsia-600 animate-pulse' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Listen & Repeat</h3>
            <p className="text-slate-500 max-w-md mb-8 font-medium">
              Focus on the rhythm and intonation. Mimic the speaker exactly.
            </p>
            <div className="flex gap-4">
              {!isSpeaking ? (
                <button
                  onClick={handlePlayAudio}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-200 hover:scale-105 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  Play Audio
                </button>
              ) : (
                <button
                  onClick={handleStopAudio}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all shadow-inner"
                >
                  Stop Playing
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === ResponseMode.VIDEO && (
          <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
             <div className="absolute bottom-0 left-0 p-32 bg-fuchsia-500 rounded-full blur-[100px] opacity-20"></div>
             
             <div className="mb-8 relative z-10">
                <Avatar isSpeaking={isSpeaking} />
             </div>
             
             <div className="min-h-[8rem] flex items-center justify-center max-w-xl mb-8 px-4 relative z-10">
                {isSpeaking ? (
                   <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                     <p className="text-2xl text-white font-medium italic leading-relaxed">
                       "{response.videoMetadata?.subtitles[videoSubtitleIndex] || response.audioScript}"
                     </p>
                   </div>
                ) : (
                  <div className="text-indigo-200">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">Scenario</span>
                    <p className="text-xl font-bold leading-snug text-white">{response.videoMetadata?.scene || 'Practice Scenario'}</p>
                  </div>
                )}
             </div>

             <div className="flex gap-4 relative z-10">
                {!isSpeaking ? (
                  <button
                    onClick={handlePlayAudio}
                    className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                  >
                    Start Roleplay
                  </button>
                ) : (
                  <button
                    onClick={handleStopAudio}
                    className="bg-red-500/20 border-2 border-red-500 text-red-200 px-8 py-4 rounded-2xl font-bold hover:bg-red-500/30 transition-all"
                  >
                    End Session
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseView;
