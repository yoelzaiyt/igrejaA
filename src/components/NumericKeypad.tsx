import React from 'react';
import { playTapSound } from '../utils/audio';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export default function NumericKeypad({ onKeyPress, onConfirm, confirmLabel = 'OK' }: NumericKeypadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handlePress = (key: string) => {
    playTapSound();
    onKeyPress(key);
  };

  const handleConfirm = () => {
    playTapSound();
    if (onConfirm) onConfirm();
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-2 select-none animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {digits.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handlePress(num)}
            className="key-tap h-16 bg-white active:bg-brand-red active:text-white active:border-brand-red text-[#121212] hover:text-brand-red hover:border-brand-red text-xl font-bold border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
          >
            {num}
          </button>
        ))}

        {/* Action Row */}
        <button
          type="button"
          onClick={() => handlePress('CLEAR')}
          className="key-tap h-16 bg-red-50 active:bg-red-100 text-red-600 text-sm font-bold border-2 border-red-200 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          LIMPAR
        </button>

        <button
          type="button"
          onClick={() => handlePress('0')}
          className="key-tap h-16 bg-white active:bg-brand-red active:text-white active:border-brand-red text-[#121212] hover:text-brand-red hover:border-brand-red text-xl font-bold border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => handlePress('BACKSPACE')}
          className="key-tap h-16 bg-slate-100 active:bg-slate-200 text-slate-800 border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          <span className="material-symbols-outlined !text-2xl">backspace</span>
        </button>
      </div>

      {onConfirm && (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-14 mt-2 bg-brand-red hover:bg-brand-red-hover text-white text-base font-extrabold uppercase tracking-widest rounded-2xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
          style={{
            boxShadow: '0 8px 20px -6px var(--color-brand-red)'
          }}
        >
          <span>{confirmLabel}</span>
          <span className="material-symbols-outlined !text-xl">check_circle</span>
        </button>
      )}
    </div>
  );
}
