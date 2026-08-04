import React from 'react';
import { playTapSound } from '../utils/audio';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  layout?: 'text' | 'email';
}

export default function VirtualKeyboard({ onKeyPress, layout = 'text' }: VirtualKeyboardProps) {
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', layout === 'email' ? '@' : '?']
  ];

  // Additional helper keys based on layout
  const emailHelpers = ['@gmail.com', '@hotmail.com', '@yahoo.com', '.com'];

  const handlePress = (key: string) => {
    playTapSound();
    onKeyPress(key);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 select-none animate-fade-in bg-[#eceef1] p-4 rounded-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.08)] border border-slate-200">
      <div className="space-y-1.5">
        {keyboardRows.map((row, idx) => (
          <div key={idx} className="flex justify-center gap-1.5 md:gap-2">
            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => handlePress(char)}
                className="key-tap w-9 sm:w-12 md:w-14 h-12 md:h-14 bg-white active:bg-brand-red active:text-white active:border-brand-red text-[#121212] hover:text-brand-red hover:border-brand-red text-sm sm:text-base md:text-lg font-bold rounded-xl shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer transition-all duration-100"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
      </div>

      {layout === 'email' && (
        <div className="flex justify-center gap-2 mt-1.5">
          {emailHelpers.map((helper) => (
            <button
              key={helper}
              type="button"
              onClick={() => handlePress(helper)}
              className="key-tap px-3 h-10 bg-slate-50 active:bg-brand-red active:text-white active:border-brand-red text-xs font-bold rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all"
            >
              {helper}
            </button>
          ))}
        </div>
      )}

      {/* Special Control row keys */}
      <div className="flex justify-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => handlePress('CLEAR')}
          className="key-tap w-24 h-12 md:h-14 bg-red-50 active:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          LIMPAR
        </button>

        <button
          type="button"
          onClick={() => handlePress('SPACE')}
          className="key-tap w-56 sm:w-80 md:w-[450px] h-12 md:h-14 bg-white active:bg-brand-red active:text-white active:border-brand-red border border-slate-200 rounded-xl shadow-sm flex items-center justify-center cursor-pointer font-bold text-xs tracking-widest text-[#121212] transition-all duration-100"
        >
          ESPAÇO
        </button>

        <button
          type="button"
          onClick={() => handlePress('BACKSPACE')}
          className="key-tap w-24 h-12 md:h-14 bg-slate-200 active:bg-slate-300 border border-slate-200 text-slate-800 rounded-xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          <span className="material-symbols-outlined !text-xl">backspace</span>
        </button>
      </div>
    </div>
  );
}
