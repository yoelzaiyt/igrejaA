import React, { useState, useEffect, useRef } from 'react';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { BrandConfig, hexToRgb } from '../utils/brand';

interface InactivityTimerProps {
  currentView: string;
  onReset: () => void;
  brand: BrandConfig;
  children: React.ReactNode;
}

export default function InactivityTimer({ currentView, onReset, brand, children }: InactivityTimerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(15);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const INACTIVITY_LIMIT = 45000; // 45 seconds
  const WARNING_LIMIT = 15; // 15 seconds countdown

  // Reset the main inactivity timer
  const resetTimer = () => {
    // Hide warning and reset countdown if user interacts
    if (showWarning) {
      setShowWarning(false);
      setCountdown(WARNING_LIMIT);
      playSuccessSound(); // chime sound to confirm they clicked "continuar"
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Only set timer if we are not on the home page
    if (currentView !== 'home') {
      timerRef.current = setTimeout(() => {
        startWarning();
      }, INACTIVITY_LIMIT);
    }
  };

  const startWarning = () => {
    setShowWarning(true);
    setCountdown(WARNING_LIMIT);
    
    // Play a warning click sound
    playTapSound();

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          handleTimeout();
          return 0;
        }
        // Play a soft click sound for every second of countdown to attract attention
        playTapSound();
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setShowWarning(false);
    onReset();
  };

  const handleContinue = () => {
    resetTimer();
  };

  // Set up event listeners for user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      // Don't reset the timer if the warning is showing, so the user has to click the explicit button
      if (!showWarning) {
        resetTimer();
      }
    };

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentView, showWarning]);

  return (
    <>
      {children}

      {showWarning && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md p-6 select-none animate-fade-in"
          style={{
            '--color-brand-red': brand.primaryColor,
            '--color-brand-red-hover': brand.primaryColorHover,
            '--color-brand-red-rgb': hexToRgb(brand.primaryColor)
          } as React.CSSProperties}
        >
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-slate-200 text-center space-y-6 relative overflow-hidden">
            {/* Warning visual border glow */}
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-red animate-pulse" />

            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner"
              style={{
                backgroundColor: `rgba(${hexToRgb(brand.primaryColor)}, 0.1)`,
                color: brand.primaryColor
              }}
            >
              <span className="material-symbols-outlined !text-4xl font-bold animate-bounce">hourglass_empty</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#121212] tracking-tight">Ainda está aí?</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Para sua privacidade e segurança dos seus dados, esta tela retornará ao início automaticamente.
              </p>
            </div>

            <div className="py-2">
              <div className="text-6xl font-black text-brand-red tracking-tighter">
                {countdown}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Segundos restantes</span>
            </div>

            {/* Simulated progress timer circle or line */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-red transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / WARNING_LIMIT) * 100}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full h-14 bg-[#121212] hover:bg-brand-red-hover text-white font-extrabold uppercase tracking-widest rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95 duration-100 border border-white/5"
            >
              <span>Continuar Usando</span>
              <span className="material-symbols-outlined !text-lg">play_arrow</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
