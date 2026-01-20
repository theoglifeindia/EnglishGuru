
import React, { useState, useEffect } from 'react';
import { PedagogicalResponse, ResponseMode } from '../types';
import { speakText, stopSpeech } from '../utils/audioUtils';
import Avatar from './Avatar';

interface ResponseViewProps {
  response: PedagogicalResponse;
}

const ResponseView: React.FC<ResponseViewProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState<ResponseMode>(response.recommendedMode);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoSubtitleIndex, setVideoSubtitleIndex] = useState(0);

  useEffect(() => {
    // Always default to TEXT view when response changes, per user requirement
    setActiveTab(ResponseMode.TEXT);
    stopSpeech();
    setIsSpeaking(false);
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
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
        <button
          onClick={() => setActiveTab(ResponseMode.TEXT)}
          className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${activeTab === ResponseMode.TEXT ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          Text & Theory
        </button>
        <button
          onClick={() => setActiveTab(ResponseMode.AUDIO)}
          className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${activeTab === ResponseMode.AUDIO ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          Pronunciation
        </button>
        <button
          onClick={() => setActiveTab(ResponseMode.VIDEO)}
          className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${activeTab === ResponseMode.VIDEO ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          Simulation
        </button>
      </div>

      <div className="p-8">
        {/* Text View */}
        {activeTab === ResponseMode.TEXT && (
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-violet-500 uppercase tracking-widest mb-3">Guru's Explanation</h3>
              <p className="text-xl text-slate-800 leading-relaxed font-medium">{response.simpleExplanation}</p>
            </section>
            
            <section className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 hindi-text">हिन्दी में (Context)</h3>
              <p className="text-xl text-slate-800 hindi-text font-medium">{response.hindiExplanation}</p>
            </section>

            {/* Grammar Breakdown Section */}
            {response.grammarAnalysis && (
              <section className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Grammar Breakdown</h3>
                <div className="bg-white/60 p-4 rounded-xl border border-blue-100 font-mono text-sm md:text-base text-slate-700 font-medium shadow-sm">
                  {response.grammarAnalysis}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Correct Usage</h3>
                <ul className="space-y-3">
                  {response.correctExamples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">✓</div>
                      {ex}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-3">Common Errors</h3>
                <ul className="space-y-3">
                  {response.commonMistakes.map((err, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                       <div className="mt-1 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs shrink-0">✗</div>
                      {err}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </div>
              <h3 className="text-xs font-black text-violet-300 uppercase tracking-widest mb-2">Drill of the Day</h3>
              <p className="text-lg font-bold leading-relaxed">{response.practiceSuggestion}</p>
            </section>
          </div>
        )}

        {/* Audio View */}
        {activeTab === ResponseMode.AUDIO && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className={`mb-8 p-8 rounded-full transition-all duration-500 ${isSpeaking ? 'bg-violet-100 scale-110 shadow-xl shadow-violet-200' : 'bg-slate-50'}`}>
              <svg className={`w-20 h-20 ${isSpeaking ? 'text-violet-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Master the Accent</h3>
            <p className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed">
              Listen closely to the intonation. Repeat after the AI to build muscle memory.
            </p>
            <div className="flex gap-4">
              {!isSpeaking ? (
                <button
                  onClick={handlePlayAudio}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-violet-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  Play Audio
                </button>
              ) : (
                <button
                  onClick={handleStopAudio}
                  className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-red-200"
                >
                  Stop Audio
                </button>
              )}
            </div>
          </div>
        )}

        {/* Video View */}
        {activeTab === ResponseMode.VIDEO && (
          <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900 via-slate-900 to-slate-900"></div>

             <div className="mb-8 relative z-10">
                <Avatar isSpeaking={isSpeaking} />
             </div>
             
             <div className="min-h-[120px] flex items-center justify-center max-w-lg mb-8 relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                {isSpeaking ? (
                   <p className="text-xl text-white font-medium italic">
                     "{response.videoMetadata?.subtitles[videoSubtitleIndex] || response.audioScript}"
                   </p>
                ) : (
                  <div className="text-violet-200">
                    <p className="text-lg font-bold mb-2 text-white">{response.videoMetadata?.scene || 'Practice Scenario'}</p>
                    <p className="text-sm opacity-75 font-mono uppercase tracking-wide">Press Start to Begin</p>
                  </div>
                )}
             </div>

             <div className="flex gap-4 relative z-10">
                {!isSpeaking ? (
                  <button
                    onClick={handlePlayAudio}
                    className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-violet-50 transition-all active:scale-95"
                  >
                    Start Role-play
                  </button>
                ) : (
                  <button
                    onClick={handleStopAudio}
                    className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95"
                  >
                    Stop Simulation
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
