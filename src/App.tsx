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
import CentralAdminGate from './components/CentralAdminGate';
import InactivityTimer from './components/InactivityTimer';
import { playTapSound } from './utils/audio';
import { speakText, setVoiceAssistEnabled } from './utils/tts';
import { BrandConfig, getCurrentBrand, fetchBrandConfigOverride, isCentralHost } from './utils/brand';
import { translateBrandTerms, Lang } from './utils/i18n';
import { getOrResolveTotemId } from './utils/totem';

const hexToRgb = (hex: string): string => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '227, 6, 19';
};

export default function App() {
  if (isCentralHost()) {
    return <CentralAdminGate />;
  }
  return <TotemApp />;
}

function TotemApp() {
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

  const [donationInitialStep, setDonationInitialStep] = useState<'category' | 'value'>('category');
  const [donationInitialCategory, setDonationInitialCategory] = useState<string>('');
  const [totemId, setTotemId] = useState<string | null>(null);
  const [paymentInFlight, setPaymentInFlight] = useState(false);

  const [rawBrand, setRawBrand] = useState<BrandConfig>(() => getCurrentBrand());
  const brand = translateBrandTerms(rawBrand, lang);

  // A config hardcoded (pastores, células, slides, identidade, vocabulário)
  // pinta a tela instantaneamente; a config real da igreja no Supabase
  // (editada pela Central) chega logo em seguida e substitui os campos
  // customizados, sem bloquear o boot do totem se a rede estiver lenta/fora.
  useEffect(() => {
    let cancelled = false;
    fetchBrandConfigOverride(rawBrand.id).then((override) => {
      if (cancelled || !override) return;
      setRawBrand((prev) => ({ ...prev, ...override, id: prev.id, domain: prev.domain }));
    });
    return () => {
      cancelled = true;
    };
  }, [rawBrand.id]);

  // Resolve this kiosk's device identity. Runs once at boot, and retries
  // whenever the shopper enters the donation flow if it's still unresolved —
  // create-payment now REQUIRES a bound totemId, so a boot-time hiccup must
  // not permanently disable payments on this kiosk until someone reloads it.
  useEffect(() => {
    if (totemId) return;
    let cancelled = false;
    getOrResolveTotemId(brand.id).then((id) => {
      if (!cancelled) setTotemId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [brand.id, view, totemId]);

  // Kiosk Mode Defenses (context menu and keyboard shortcuts block)
  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const disableKeyCombos = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I/J, Ctrl+U/S/P (DevTools / page escape / native print dialog keys)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's' || e.key === 'P' || e.key === 'p'))
      ) {
        e.preventDefault();
      }
    };

    // Belt-and-suspenders: window.print() opens the OS-native print dialog,
    // which blocks the kiosk screen waiting for human input on a totem no
    // one is meant to interact with directly. Neutralize it no matter what
    // triggers it (stray Ctrl+P past the guard above, a future button, a
    // third-party library).
    const originalPrint = typeof window !== 'undefined' ? window.print : undefined;
    if (typeof window !== 'undefined') {
      window.print = () => {};
      window.addEventListener('contextmenu', disableContextMenu);
      window.addEventListener('keydown', disableKeyCombos);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('contextmenu', disableContextMenu);
        window.removeEventListener('keydown', disableKeyCombos);
        if (originalPrint) window.print = originalPrint;
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
    <InactivityTimer currentView={view} onReset={handleGoHome} brand={brand} suspended={paymentInFlight}>
      <div
        className={`min-h-screen select-none transition-all duration-300 ${
          highContrast ? 'high-contrast-active bg-black text-yellow-400 font-bold' : 'bg-brand-light text-[#191c1e]'
        } ${textZoom ? 'text-zoom-active' : ''}`}
      >
        {view === 'home' && (
          <HomeView
            onStart={handleStart}
            onOpenAccessibility={() => setShowAccessModal(true)}
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
            totemId={totemId}
            onPaymentInFlightChange={setPaymentInFlight}
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
