
export const speakText = (text: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB'; // British English for clear pronunciation
  utterance.rate = 0.9; // Slightly slower for clarity
  
  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  window.speechSynthesis.cancel();
};
