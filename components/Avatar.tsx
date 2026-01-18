
import React from 'react';

interface AvatarProps {
  isSpeaking: boolean;
  mood?: 'happy' | 'thinking' | 'serious';
}

const Avatar: React.FC<AvatarProps> = ({ isSpeaking, mood = 'happy' }) => {
  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-indigo-100 rounded-full border-4 border-indigo-200 overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face */}
        <circle cx="50" cy="50" r="40" fill="#FFE0B2" />
        
        {/* Hair */}
        <path d="M20 40 Q50 10 80 40" stroke="#3E2723" strokeWidth="8" fill="none" />
        
        {/* Eyes */}
        <circle cx="35" cy="45" r="3" fill="#333" />
        <circle cx="65" cy="45" r="3" fill="#333" />
        
        {/* Mouth */}
        {isSpeaking ? (
          <ellipse 
            cx="50" 
            cy="65" 
            rx="8" 
            ry={isSpeaking ? "4" : "1"} 
            fill="#333" 
            className="animate-pulse"
          />
        ) : (
          <path d="M40 65 Q50 70 60 65" stroke="#333" strokeWidth="2" fill="none" />
        )}

        {/* Glasses - for PhD look */}
        <path d="M25 45 L45 45 M55 45 L75 45" stroke="#333" strokeWidth="1" />
        <circle cx="35" cy="45" r="6" stroke="#333" strokeWidth="1" fill="none" />
        <circle cx="65" cy="45" r="6" stroke="#333" strokeWidth="1" fill="none" />
        <path d="M45 45 Q50 43 55 45" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
      {isSpeaking && (
        <div className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-25"></div>
      )}
    </div>
  );
};

export default Avatar;
