
import React, { useState, useEffect } from 'react';
import { PedagogicalResponse, ResponseMode } from '../types.ts';
import { speakText, stopSpeech } from '../utils/audioUtils.ts';
import Avatar from './Avatar.tsx';

interface ResponseViewProps {
  response: PedagogicalResponse;
}

const ResponseView: React.FC<ResponseViewProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState<ResponseMode>(response.recommendedMode);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoSubtitleIndex, setVideoSubtitleIndex] = useState(0);

  useEffect(() => {
    setActiveTab(response.recommendedMode);
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab(ResponseMode.TEXT)}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === ResponseMode.TEXT ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Text Explanation
        </button>
        <button
          onClick={() => setActiveTab(ResponseMode.AUDIO)}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === ResponseMode.AUDIO ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pronunciation (Audio)
        </button>
        <button
          onClick={() => setActiveTab(ResponseMode.VIDEO)}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === ResponseMode.VIDEO ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Simulation (Video)
        </button>
      </div>

      <div className="p-6">
        {activeTab === ResponseMode.TEXT && (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">English Explanation</h3>
              <p className="text-lg text-slate-800 leading-relaxed">{response.simpleExplanation}</p>
            </section>
            
            <section className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
              <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-2 hindi-text">हिन्दी में समझें (Hindi Context)</h3>
              <p className="text-lg text-slate-800 hindi-text">{response.hindiExplanation}</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">Correct Examples</h3>
                <ul className="space-y-2">
                  {response.correctExamples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-slate-700">{ex}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">Common Mistakes</h3>
                <ul className="space-y-2">
                  {response.commonMistakes.map((err, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-slate-700">{err}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="bg-indigo-600 text-white p-4 rounded-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 opacity-90">Practice Drill</h3>
              <p className="text-lg font-medium">{response.practiceSuggestion}</p>
            </section>
          </div>
        )}

        {activeTab === ResponseMode.AUDIO && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className={`mb-8 p-6 rounded-full ${isSpeaking ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <svg className={`w-16 h-16 ${isSpeaking ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Listen to the Pronunciation</h3>
            <p className="text-slate-600 max-w-md mb-8">
              Click play to hear how a PhD-level expert would say these sentences. Focus on the stress and intonation.
            </p>
            <div className="flex gap-4">
              {!isSpeaking ? (
                <button
                  onClick={handlePlayAudio}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  Start Audio
                </button>
              ) : (
                <button
                  onClick={handleStopAudio}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-all"
                >
                  Stop Audio
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === ResponseMode.VIDEO && (
          <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-center text-center">
             <div className="mb-6">
                <Avatar isSpeaking={isSpeaking} />
             </div>
             
             <div className="h-24 flex items-center justify-center max-w-lg mb-8">
                {isSpeaking ? (
                   <p className="text-xl text-white font-medium italic">
                     "{response.videoMetadata?.subtitles[videoSubtitleIndex] || response.audioScript}"
                   </p>
                ) : (
                  <div className="text-indigo-400">
                    <p className="text-lg font-bold mb-1">{response.videoMetadata?.scene || 'Practice Scenario'}</p>
                    <p className="text-sm opacity-75">Click Start to begin simulation</p>
                  </div>
                )}
             </div>

             <div className="flex gap-4">
                {!isSpeaking ? (
                  <button
                    onClick={handlePlayAudio}
                    className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all"
                  >
                    Start Role-play
                  </button>
                ) : (
                  <button
                    onClick={handleStopAudio}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-all"
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
