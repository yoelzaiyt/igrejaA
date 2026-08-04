import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import NewMemberView from './components/NewMemberView';
import PrayerRequestView from './components/PrayerRequestView';
import CheckinView from './components/CheckinView';
import CheckinSuccessView from './components/CheckinSuccessView';
import MinistryView from './components/MinistryView';
import DonationView from './components/DonationView';
import MyCellView from './components/MyCellView';
import PastoralView from './components/PastoralView';
import AdminView from './components/AdminView';
import InactivityTimer from './components/InactivityTimer';
import { playTapSound, playSuccessSound } from './utils/audio';
import { speakText, setVoiceAssistEnabled } from './utils/tts';
import { getCurrentBrand } from './utils/brand';
import { translateBrandTerms, Lang, t } from './utils/i18n';

const hexToRgb = (hex: string): string => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '227, 6, 19';
};

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [highContrast, setHighContrast] = useState(false);
  const [textZoom, setTextZoom] = useState(false);
  const [voiceAssist, setVoiceAssist] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('totem_lang') as Lang) || 'pt';
    }
    return 'pt';
  });

  // Kiosk Security & Admin Protection States
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const [donationInitialStep, setDonationInitialStep] = useState<'category' | 'value'>('category');
  const [donationInitialCategory, setDonationInitialCategory] = useState<string>('');

  const rawBrand = getCurrentBrand();
  const brand = translateBrandTerms(rawBrand, lang);

  // Kiosk Mode Defenses (context menu and keyboard shortcuts block)
  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const disableKeyCombos = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I/J, Ctrl+U/S (common DevTools / page escape keys)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('contextmenu', disableContextMenu);
      window.addEventListener('keydown', disableKeyCombos);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('contextmenu', disableContextMenu);
        window.removeEventListener('keydown', disableKeyCombos);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-brand-red', brand.primaryColor);
    document.documentElement.style.setProperty('--color-brand-red-hover', brand.primaryColorHover);
    document.documentElement.style.setProperty('--color-brand-red-rgb', hexToRgb(brand.primaryColor));
    document.documentElement.style.setProperty('--color-brand-glow', brand.glowColor);
    document.documentElement.style.setProperty('--color-brand-badge-bg', brand.badgeBgColor);
    document.documentElement.style.setProperty('--color-brand-badge-text', brand.badgeTextColor);
    document.documentElement.style.setProperty('--color-brand-accent-splash', brand.accentSplashColor);
    
    if (brand.id === 'ibmalphaville') {
      document.documentElement.style.setProperty('--font-sans', '"Montserrat", sans-serif');
      document.documentElement.style.setProperty('--font-body', '"Montserrat", sans-serif');
    } else {
      document.documentElement.style.setProperty('--font-sans', '"Inter", system-ui, -apple-system, sans-serif');
      document.documentElement.style.setProperty('--font-body', '"Inter", system-ui, -apple-system, sans-serif');
    }
    
    document.title = `Santuário Digital - ${brand.name}`;
  }, [brand]);

  // Block state verification
  const isBlocked = blockUntil ? Date.now() < blockUntil : false;

  const handlePasscodeNumber = (num: string) => {
    if (isBlocked) return;
    playTapSound();
    setPasscodeError('');
    if (enteredPasscode.length < 4) {
      const next = enteredPasscode + num;
      setEnteredPasscode(next);
      
      if (next.length === 4) {
        if (next === '1903') {
          playSuccessSound();
          setView('admin');
          setShowAdminPasscodeModal(false);
          setEnteredPasscode('');
          setAttemptsLeft(5);
          speakText('Acesso administrativo autorizado.', true);
        } else {
          const nextAttempts = attemptsLeft - 1;
          setEnteredPasscode('');
          if (nextAttempts <= 0) {
            setBlockUntil(Date.now() + 30000); // Lock for 30s
            setAttemptsLeft(5);
            setPasscodeError(t('adminPasscodeBlocked', lang));
            speakText(t('adminPasscodeBlocked', lang), true);
          } else {
            setAttemptsLeft(nextAttempts);
            setPasscodeError(t('adminPasscodeInvalid', lang));
            speakText(t('adminPasscodeInvalid', lang), true);
          }
        }
      }
    }
  };

  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('totem_lang', newLang);
    if (newLang === 'pt') speakText('Idioma: Português.', true);
    else if (newLang === 'en') speakText('Language: English.', true);
    else if (newLang === 'es') speakText('Idioma: Español.', true);
    else if (newLang === 'de') speakText('Sprache: Deutsch.', true);
  };

  const handleStart = () => {
    setView('dashboard');
    if (lang === 'en') speakText('Entering main panel. How can we help you today?');
    else if (lang === 'es') speakText('Entrando al panel principal. ¿Cómo podemos ayudarle hoy?');
    else if (lang === 'de') speakText('Hauptmenü aufgerufen. Wie können wir Ihnen heute helfen?');
    else speakText('Entrando no painel principal. Como podemos ajudar você hoje?');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    if (lang === 'en') speakText('Returning to main panel.');
    else if (lang === 'es') speakText('Retornando al panel principal.');
    else if (lang === 'de') speakText('Zurück zum Hauptmenü.');
    else speakText('Retornando ao painel principal.');
  };

  const handleGoHome = () => {
    setView('home');
    if (lang === 'en') speakText('Returning to start screen.');
    else if (lang === 'es') speakText('Retornando a la pantalla de inicio.');
    else if (lang === 'de') speakText('Zurück zum Startbildschirm.');
    else speakText('Retornando à tela inicial.');
  };

  const handleCheckinSuccess = () => {
    setView('checkin_success');
  };

  const handleSelectView = (v: ViewState, options?: { step?: 'category' | 'value'; category?: string }) => {
    setView(v);
    if (v === 'new_member') {
      const term = brand.termMember.toLowerCase();
      if (lang === 'en') speakText('Starting athlete registration form.');
      else if (lang === 'es') speakText('Iniciando formulario de registro de atleta.');
      else if (lang === 'de') speakText('Athleten-Registrierung gestartet.');
      else speakText(`Iniciando formulário de ${term}.`);
    } else if (v === 'prayer') {
      if (brand.id === 'ymcactx' || brand.id === 'imocarwash') {
        if (lang === 'en') speakText('Opening customer support screen.');
        else if (lang === 'es') speakText('Abriendo pantalla de suporte al cliente.');
        else if (lang === 'de') speakText('Kundenservice geöffnet.');
        else speakText('Abri a tela de suporte ao cliente.');
      } else {
        const text = brand.type === 'synagogue' ? 'orações' : 'oração';
        if (lang === 'en') speakText('Opening prayer request screen.');
        else if (lang === 'es') speakText('Abriendo pantalla de peticiones de oración.');
        else if (lang === 'de') speakText('Gebetsanliegen geöffnet.');
        else speakText(`Abri a tela para enviar pedidos de ${text}.`);
      }
    } else if (v === 'checkin') {
      if (lang === 'en') speakText(`Opening check-in for ${brand.termCults.toLowerCase()}.`);
      else if (lang === 'es') speakText(`Abriendo check-in para ${brand.termCults.toLowerCase()}.`);
      else if (lang === 'de') speakText(`Check-in für ${brand.termCults.toLowerCase()} geöffnet.`);
      else speakText(`Acessando check-in de ${brand.termCults.toLowerCase()} e encontros.`);
    } else if (v === 'donations') {
      setDonationInitialStep(options?.step || 'category');
      setDonationInitialCategory(options?.category || '');
      if (brand.id === 'imocarwash') {
        if (lang === 'en') speakText('Opening wash programs and payments.');
        else if (lang === 'es') speakText('Abriendo programas de lavado y pagos.');
        else if (lang === 'de') speakText('Waschprogramme und Zahlungen geöffnet.');
        else speakText('Acessando programas de lavagem e recargas.');
      } else if (brand.id === 'ymcactx') {
        if (lang === 'en') speakText('Opening fees and payments.');
        else if (lang === 'es') speakText('Abriendo mensalidades y pagos.');
        else if (lang === 'de') speakText('Mitgliedsbeiträge und Zahlungen geöffnet.');
        else speakText('Acessando pagamentos de mensalidades.');
      } else {
        if (lang === 'en') speakText('Opening fees and contributions screen.');
        else if (lang === 'es') speakText('Abriendo pantalla de mensalidades y contribuciones.');
        else if (lang === 'de') speakText('Beiträge und Zahlungen geöffnet.');
        else speakText(`Acessando altar de generosidade para ${brand.termDonations.toLowerCase()}.`);
      }
    } else if (v === 'ministries') {
      if (lang === 'en') speakText('Opening volunteering panel.');
      else if (lang === 'es') speakText('Abriendo panel de voluntariado.');
      else if (lang === 'de') speakText('Mitwirkung und Ehrenamt geöffnet.');
      else speakText('Abrindo painel de voluntariado e atividades.');
    } else if (v === 'my_cell') {
      if (lang === 'en') speakText(`Opening ${brand.termConnects.toLowerCase()} search.`);
      else if (lang === 'es') speakText(`Abriendo búsqueda de ${brand.termConnects.toLowerCase()}.`);
      else if (lang === 'de') speakText(`Suche für ${brand.termConnects.toLowerCase()} geöffnet.`);
      else speakText(`Abri a busca de ${brand.termConnects.toLowerCase()}.`);
    } else if (v === 'pastoral') {
      if (lang === 'en') speakText('Displaying coaches on duty.');
      else if (lang === 'es') speakText('Mostrando entrenadores de guardia.');
      else if (lang === 'de') speakText('Trainer im Dienst angezeigt.');
      else speakText(`Exibindo ${brand.termPastors.toLowerCase()} de plantão.`);
    }
  };

  return (
    <InactivityTimer currentView={view} onReset={handleGoHome} brand={brand}>
      <div 
        className={`min-h-screen select-none transition-all duration-300 ${
          highContrast ? 'high-contrast-active bg-black text-yellow-400 font-bold' : 'bg-brand-light text-[#191c1e]'
        } ${textZoom ? 'text-zoom-active' : ''}`}
      >
        {view === 'home' && (
          <HomeView 
            onStart={handleStart} 
            onOpenAccessibility={() => setShowAccessModal(true)}
            onOpenAdmin={() => {
              setShowAdminPasscodeModal(true);
              speakText(t('adminPasscodePrompt', lang));
            }}
            brand={brand}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            onDirectDonation={() => handleSelectView('donations')}
            onDirectCheckin={() => handleSelectView('checkin')}
          />
        )}

        {view === 'dashboard' && (
          <DashboardView 
            onSelectView={handleSelectView} 
            onGoHome={handleGoHome} 
            onOpenAccessibility={() => setShowAccessModal(true)}
            onOpenAdmin={() => {
              setShowAdminPasscodeModal(true);
              speakText(t('adminPasscodePrompt', lang));
            }}
            brand={brand}
            lang={lang}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {view === 'new_member' && (
          <NewMemberView 
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'prayer' && (
          <PrayerRequestView 
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'checkin' && (
          <CheckinView 
            onBack={handleBackToDashboard} 
            onSuccess={handleCheckinSuccess} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'checkin_success' && (
          <CheckinSuccessView 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'ministries' && (
          <MinistryView 
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'donations' && (
          <DonationView 
            key={`donations-${donationInitialStep}-${donationInitialCategory}`}
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
            initialStep={donationInitialStep}
            initialCategory={donationInitialCategory}
          />
        )}

        {view === 'my_cell' && (
          <MyCellView 
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'pastoral' && (
          <PastoralView 
            onBack={handleBackToDashboard} 
            onGoHome={handleGoHome} 
            onSelectView={handleSelectView}
            brand={brand}
            lang={lang}
          />
        )}

        {view === 'admin' && (
          <AdminView 
            onBack={handleBackToDashboard} 
            brand={brand}
            lang={lang}
          />
        )}
        {/* Admin Passcode Modal Overlay */}
        {showAdminPasscodeModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-fade-in">
            <div className="bg-slate-900 text-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-white/10 text-center space-y-6">
              <div className="space-y-1">
                <span className="material-symbols-outlined text-4xl text-amber-500">lock</span>
                <h2 className="text-xl font-black tracking-tight">Painel Administrativo</h2>
                <p className="text-sm text-slate-400 font-medium">
                  {isBlocked 
                    ? t('adminPasscodeBlocked', lang) 
                    : t('adminPasscodePrompt', lang)}
                </p>
              </div>

              {/* Dots representing entered passcode */}
              <div className="flex justify-center gap-4 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 border-white/20 transition-all duration-150 ${
                      idx < enteredPasscode.length
                        ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/30'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Error messages */}
              {passcodeError && (
                <div className="text-red-400 text-sm font-semibold animate-pulse">
                  {passcodeError}
                  {!isBlocked && (
                    <div className="text-xs text-slate-400 mt-1 font-normal">
                      {t('adminPasscodeAttempts', lang)}: {attemptsLeft}
                    </div>
                  )}
                </div>
              )}

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => handlePasscodeNumber(num)}
                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setEnteredPasscode('');
                    setPasscodeError('');
                  }}
                  className="w-16 h-16 rounded-full bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 uppercase tracking-widest active:scale-95 cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  key="0"
                  type="button"
                  disabled={isBlocked}
                  onClick={() => handlePasscodeNumber('0')}
                  className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setShowAdminPasscodeModal(false);
                    setEnteredPasscode('');
                    setPasscodeError('');
                  }}
                  className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 uppercase tracking-widest active:scale-95 cursor-pointer"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Accessibility Modal Overlay */}
        {showAccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none animate-fade-in">
            <div className="bg-white text-brand-dark rounded-3xl w-full max-w-md shadow-2xl p-8 border border-slate-200 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-red" />
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Painel de Acessibilidade</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Ajuste as configurações para uma melhor experiência de leitura e interação no totem.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Toggle High Contrast */}
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    const next = !highContrast;
                    setHighContrast(next);
                    speakText(next ? "Alto contraste ativado" : "Alto contraste desativado", true);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-left flex justify-between items-center transition-colors ${
                    highContrast ? 'border-brand-red bg-red-50/50 text-brand-red' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined">contrast</span>
                    Alto Contraste
                  </span>
                  <span className="material-symbols-outlined !text-3xl">
                    {highContrast ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>

                {/* Toggle Text Zoom */}
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    const next = !textZoom;
                    setTextZoom(next);
                    speakText(next ? "Fonte ampliada ativada" : "Fonte ampliada desativada", true);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-left flex justify-between items-center transition-colors ${
                    textZoom ? 'border-brand-red bg-red-50/50 text-brand-red' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined">zoom_in</span>
                    Fonte Ampliada
                  </span>
                  <span className="material-symbols-outlined !text-3xl">
                    {textZoom ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>

                {/* Toggle Screen Reader / Voice Assist */}
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    const next = !voiceAssist;
                    setVoiceAssist(next);
                    setVoiceAssistEnabled(next);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-left flex justify-between items-center transition-colors ${
                    voiceAssist ? 'border-brand-red bg-red-50/50 text-brand-red' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined">volume_up</span>
                    Guia de Voz (Leitor)
                  </span>
                  <span className="material-symbols-outlined !text-3xl">
                    {voiceAssist ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => { playTapSound(); setShowAccessModal(false); }}
                className="w-full h-12 bg-brand-dark hover:bg-brand-red text-white font-extrabold uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-sm"
              >
                Voltar ao Totem
              </button>
            </div>
          </div>
        )}
      </div>
    </InactivityTimer>
  );
}

