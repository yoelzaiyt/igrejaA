import React, { useState } from 'react';
import { ViewState } from '../types';
import { playTapSound } from '../utils/audio';
import { HeaderClock } from './LiveClock';
import { speakText } from '../utils/tts';
import { BrandConfig } from '../utils/brand';
import { t, Lang } from '../utils/i18n';

/* ─── Particle data ─────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left:     `${5  + (i * 5.3) % 90}%`,
  top:      `${10 + (i * 7.1) % 80}%`,
  size:     `${1.5 + (i % 4) * 0.7}px`,
  delay:    `${(i * 1.3) % 8}s`,
  duration: `${8 + (i % 5) * 2.5}s`,
  opacity:  `${0.15 + (i % 5) * 0.08}`,
}));

interface DashboardViewProps {
  onSelectView: (view: ViewState, options?: { step?: 'category' | 'value'; category?: string }) => void;
  onGoHome: () => void;
  onOpenAccessibility: () => void;
  onOpenAdmin?: () => void;
  brand: BrandConfig;
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
}

export default function DashboardView({ onSelectView, onGoHome, onOpenAccessibility, onOpenAdmin, brand, lang, onLanguageChange }: DashboardViewProps) {
  const [showPromo, setShowPromo] = useState(false);
  const [showYmcaQrModal, setShowYmcaQrModal] = useState(false);

  const handleSelect = (view: ViewState, options?: { step?: 'category' | 'value'; category?: string }) => {
    playTapSound();
    onSelectView(view, options);
  };

  const handleHomeClick = () => {
    playTapSound();
    onGoHome();
  };

  const handleHelpClick = () => {
    playTapSound();
    speakText(`Ajuda solicitada. Se precisar de auxílio com o totem da ${brand.name}, chame um de nossos voluntários no saguão.`);
    alert(`Este é um totem de atendimento inteligente. Se precisar de ajuda física, chame um de nossos voluntários no saguão principal.`);
  };

  const handleAccessibilityClick = () => {
    playTapSound();
    onOpenAccessibility();
  };

  const accent = '#F5C31E'; // Institutional generic yellow
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isAdminMode = params ? params.get('admin') === 'true' : false;

  const getFooterFontSizeClass = (text: string) => {
    if (text.length > 20) {
      return 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl';
    }
    if (text.length > 15) {
      return 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl';
    }
    return 'text-base sm:text-lg md:text-xl lg:text-2xl';
  };

  const menuCardClass =
    'dashboard-card w-full bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-2xl md:rounded-[1.75rem] px-4 py-5 sm:px-5 sm:py-6 md:px-6 md:py-7 flex flex-col justify-center items-center text-center gap-2 sm:gap-3 cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-2xl relative overflow-hidden group';

  const menuCardTitleClass =
    'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-wider block drop-shadow-sm break-words line-clamp-3';

  const menuCardIconClass =
    'material-symbols-outlined text-[clamp(2rem,5vmin,3.5rem)] group-hover:scale-110 transition-transform duration-500 drop-shadow-md z-10';

  return (
    <div className="relative dashboard-fullscreen bg-[#020617] text-white flex flex-col overflow-hidden animate-fade-in font-sans">
      
      {/* ════════════════════════════════════════════════
          BACKGROUND LAYER 1 — Radial deep gradient
          ════════════════════════════════════════════════ */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            circle at center,
            rgba(245,195,30,.08) 0%,
            rgba(15,23,42,.95)  40%,
            rgba(2,6,23,1)      100%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Background Image with Dark Glassmorphism Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 opacity-60"
        style={{ backgroundImage: `url(${brand.dashboardBgUrl || brand.bgUrl})`, filter: 'blur(8px)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/50 to-[#020617]/80 backdrop-blur-xl" />

      {/* Particle background system (subtle) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left:            p.left,
              top:             p.top,
              width:           p.size,
              height:          p.size,
              backgroundColor: accent,
              opacity:         p.opacity,
              animationDelay:    p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Top App Bar */}
      <nav className="dashboard-header fixed top-0 left-0 w-full z-40 flex items-center justify-between gap-4 px-3 sm:px-6 md:px-8 py-2 md:py-3 bg-white/5 backdrop-blur-xl shadow-sm border-b border-white/10 shrink-0 text-white">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img 
            src={brand.logoUrl} 
            className={`h-9 sm:h-10 md:h-12 object-contain shrink-0 ${['atitude', 'ibmalphaville', 'lagoinha', 'universal', 'beityaacov', 'icconselheira'].includes(brand.id) ? 'logo-white' : ''}`} 
            alt={brand.name} 
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black truncate hidden sm:block" style={{ color: accent }}>
            {brand.campusName}
          </span>
        </div>
        
        <div className="flex gap-2 sm:gap-4 items-center shrink-0">
          <HeaderClock tone="on-dark" prominent={false} />
          <button
            type="button"
            onClick={() => {
              playTapSound();
              const nextLang = lang === 'pt' ? 'en' : lang === 'en' ? 'es' : lang === 'es' ? 'de' : 'pt';
              onLanguageChange(nextLang);
            }}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center cursor-pointer backdrop-blur-xl gap-1.5 text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95"
            title="Mudar idioma / Change language / Cambiar idioma"
          >
            <span className="material-symbols-outlined !text-base">language</span>
            <span>{lang}</span>
          </button>
        </div>
      </nav>


      {/* Main Grid Area — 2×3 preenchendo a viewport */}
      <main className="dashboard-main w-full relative z-10" aria-label={
        lang === 'en'
          ? `Welcome to ${brand.name}`
          : lang === 'es'
          ? `Bienvenido a ${brand.name}`
          : (brand.id === 'ymcactx' || brand.id === 'imocarwash')
          ? `Bem-vindo ao ${brand.name}`
          : `Bem-vindo à ${brand.name}`
      }>
        <div className="dashboard-grid">
          
          {/* SOU NOVO AQUI */}
          <button
            type="button"
            onClick={() => handleSelect('new_member')}
            className={`${menuCardClass} hover:border-indigo-400/60 hover:bg-indigo-900/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className={`${menuCardIconClass} text-indigo-300 group-hover:text-indigo-200`}>
              person_add
            </span>
            <div className="text-center z-10">
              <span className={menuCardTitleClass}>{brand.termMember}</span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 z-0 pointer-events-none">
              <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">id_card</span>
            </div>
          </button>

          {/* DOACAO / CONTRIBUICAO */}
          <button
            type="button"
            onClick={() => handleSelect('donations')}
            className={`${menuCardClass} hover:border-amber-400/60 hover:bg-amber-900/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className={`${menuCardIconClass} text-amber-300 group-hover:text-amber-200`}>
              payments
            </span>
            <div className="text-center z-10">
              <span className={menuCardTitleClass}>{brand.termDonation}</span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:-rotate-12 group-hover:scale-125 z-0 pointer-events-none">
              <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">qr_code</span>
            </div>
          </button>

          {/* QUERO PARTICIPAR */}
          <button
            type="button"
            onClick={() => handleSelect('ministries')}
            className={`${menuCardClass} hover:border-cyan-400/60 hover:bg-cyan-900/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className={`${menuCardIconClass} text-cyan-300 group-hover:text-cyan-200`}>
              groups
            </span>
            <div className="text-center z-10">
              <span className={menuCardTitleClass}>
                {brand.id === 'imocarwash' ? t('volunteerTitleCarWash', lang) : t('volunteerTitle', lang)}
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-125 z-0 pointer-events-none">
              <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">handshake</span>
            </div>
          </button>

          {/* EVENTOS / CULTOS */}
          {brand.id === 'ymcactx' ? (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setShowYmcaQrModal(true);
              }}
              className={`${menuCardClass} hover:border-emerald-400/60 hover:bg-emerald-900/40`}
            >
              <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className={`${menuCardIconClass} text-emerald-300 group-hover:text-emerald-200`}>
                qr_code_2
              </span>
              <div className="text-center z-10">
                <span className={menuCardTitleClass}>
                  {t('ymcaClassesCardTitle', lang)}
                </span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:-rotate-6 group-hover:scale-125 z-0 pointer-events-none">
                <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">app_registration</span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelect('checkin')}
              className={`${menuCardClass} hover:border-emerald-400/60 hover:bg-emerald-900/40`}
            >
              <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className={`${menuCardIconClass} text-emerald-300 group-hover:text-emerald-200`}>
                calendar_month
              </span>
              <div className="text-center z-10">
                <span className={menuCardTitleClass}>{brand.termCults}</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:-rotate-6 group-hover:scale-125 z-0 pointer-events-none">
                <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">event</span>
              </div>
            </button>
          )}

          {/* MY CELL / CONEXÃO GRUPOS */}
          <button
            type="button"
            onClick={() => handleSelect('my_cell')}
            className={`${menuCardClass} hover:border-slate-400/60 hover:bg-slate-800/60`}
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className={`${menuCardIconClass} text-slate-300 group-hover:text-white`}>
              diversity_3
            </span>
            <div className="text-center z-10">
              <span className={menuCardTitleClass}>
                {brand.termConnects}
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:scale-125 z-0 pointer-events-none">
              <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">hub</span>
            </div>
          </button>

          {/* PEDIDO DE ORAÇÃO */}
          <button
            type="button"
            onClick={() => handleSelect('prayer')}
            className={`${menuCardClass} hover:border-rose-400/60 hover:bg-rose-900/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className={`${menuCardIconClass} text-rose-300 group-hover:text-rose-200`}>
              {(brand.id === 'ymcactx' || brand.id === 'imocarwash') ? 'chat' : 'volunteer_activism'}
            </span>
            <div className="text-center z-10">
              <span className={menuCardTitleClass}>
                {brand.id === 'imocarwash' ? t('prayerTitleCarWash', lang) : brand.id === 'ymcactx' ? t('prayerTitleSports', lang) : brand.type === 'synagogue' ? t('prayerTitleSynagogue', lang) : t('prayerTitle', lang)}
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] text-white transition-all duration-500 group-hover:-rotate-12 group-hover:scale-125 z-0 pointer-events-none">
              <span className="material-symbols-outlined text-[clamp(4rem,12vmin,10rem)]">chat</span>
            </div>
          </button>

        </div>
      </main>

      {showPromo && (
        <div 
          className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] w-80 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-5 text-left shadow-2xl flex flex-col gap-4 animate-slide-up-popup select-none animate-fade-in"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTapSound();
              setShowPromo(false);
            }}
            className="absolute top-3 right-3 text-white/50 hover:text-white hover:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined !text-sm">close</span>
          </button>
          
          <div className="absolute inset-0 bg-gradient-to-br from-brand-red/15 to-transparent opacity-60 pointer-events-none rounded-[2rem]" />
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.04] pointer-events-none rounded-[2rem]"
            style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
          />

          <div className="relative z-10 flex gap-3 items-center">
            <div className="p-2 bg-brand-red text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined !text-xl font-black">emoji_events</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-tight">
                {brand.id === 'imocarwash' ? 'Meta de Lavagens 🎯' : brand.id === 'ymcactx' ? 'Meta de Contribuição 🎯' : 'Meta de Gratidão 🎯'}
              </h3>
            </div>
          </div>

          <p className="relative z-10 text-[11px] text-white/75 font-medium leading-relaxed">
            {brand.id === 'imocarwash'
              ? 'Ajude-nos a superar a meta de programas hoje!'
              : brand.type === 'synagogue'
              ? 'Contribua para alcançarmos a meta de tsedaká de hoje.'
              : brand.id === 'ymcactx'
              ? 'Apoie nosso financiamento de bolsas esportivas.'
              : 'Faça parte de nossas ações sociais e missionárias de hoje.'}
          </p>
          
          {/* Compact Progress Bar */}
          <div className="relative z-10 w-full bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-2 shadow-inner">
            <div className="flex justify-between text-[9px] font-black text-white/60 uppercase tracking-wider">
              <span>Progresso</span>
              <span className="text-emerald-400 font-extrabold">82%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-red to-rose-500 rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between items-center text-[8px] font-bold text-white/40">
              <span>Hoje: R$ 4.500</span>
              <span>Meta: R$ 5.480</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelect('donations')}
            className="relative z-10 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all duration-200 active:scale-95 cursor-pointer text-center shadow-md border border-emerald-500/20"
          >
            Contribuir
          </button>
        </div>
      )}

      {/* Floating Glass Dock Footer */}
      <footer className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] border border-white/20 max-w-[95vw] md:max-w-max overflow-x-auto scrollbar-none">
        
        {/* Início */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex items-center justify-center gap-3 text-white rounded-full px-10 h-20 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 font-black uppercase tracking-wider border border-white/20 animate-home-pulse home-btn-hover ${getFooterFontSizeClass(t('home', lang))}`}
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
            boxShadow: `0 10px 25px ${brand.primaryColor}55`
          }}
        >
          <span>{t('home', lang)}</span>
        </button>

        {/* Generosidade Button */}
        {brand.id !== 'ymcactx' && (() => {
          const promoText = brand.id === 'imocarwash' ? 'Meta IMO' : brand.type === 'synagogue' ? 'Tsedaká' : 'Generosidade';
          return (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                handleSelect('donations', {
                  step: 'value',
                  category: brand.type === 'synagogue' ? 'Tsedaká Geral' : 'Oferta'
                });
              }}
              className={`flex items-center justify-center gap-3 text-white rounded-full px-10 h-20 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 font-black uppercase tracking-wider border border-white/20 hover:scale-[1.05] ${getFooterFontSizeClass(promoText)}`}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span className="material-symbols-outlined !text-3xl font-black">emoji_events</span>
              <span>{promoText}</span>
            </button>
          );
        })()}

        {/* Atendimento Pastoral Accessibility Button */}
        <button
          type="button"
          onClick={() => handleSelect('pastoral')}
          className={`flex items-center justify-center gap-3 text-white rounded-full px-10 h-20 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 font-black uppercase tracking-wider border border-white/20 hover:scale-[1.05] ${getFooterFontSizeClass(brand.termPastoral)}`}
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColorHover} 0%, ${brand.primaryColor} 100%)`,
            boxShadow: `0 10px 25px ${brand.primaryColor}40`
          }}
        >
          <span>{brand.termPastoral}</span>
        </button>

        {isAdminMode && (
          <>
            {/* Voltar */}
            <button
              type="button"
              onClick={handleHomeClick}
              className="w-16 h-16 flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95 cursor-pointer font-bold font-sans border border-transparent hover:border-white/10"
              title="Voltar"
            >
              <span className="material-symbols-outlined !text-2xl">arrow_back</span>
            </button>

            <div className="w-px h-12 bg-white/10 mx-1" aria-hidden="true" />

            {/* Ajuda */}
            <button
              type="button"
              onClick={handleHelpClick}
              className="w-16 h-16 flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95 cursor-pointer font-bold font-sans border border-transparent hover:border-white/10"
              title="Ajuda"
            >
              <span className="material-symbols-outlined !text-2xl">help_outline</span>
            </button>

            {/* Acessibilidade */}
            <button
              type="button"
              onClick={handleAccessibilityClick}
              className="w-16 h-16 flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95 cursor-pointer font-bold font-sans border border-transparent hover:border-white/10"
              title="Acessibilidade"
            >
              <span className="material-symbols-outlined !text-2xl">settings_accessibility</span>
            </button>

            {/* Administração */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  onOpenAdmin();
                }}
                className="w-16 h-16 flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95 cursor-pointer font-bold font-sans border border-transparent hover:border-white/10"
                title="Admin"
              >
                <span className="material-symbols-outlined !text-xl">admin_panel_settings</span>
              </button>
            )}
          </>
        )}
      </footer>

      {/* YMCA App / Locator QR Code Modal Overlay */}
      {showYmcaQrModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-fade-in">
          <div className="bg-slate-900/95 text-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl p-8 border border-white/10 text-center space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-center mb-2">
                <img 
                  src={brand.logoUrl} 
                  alt="YMCA Logo" 
                  className="h-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {t('ymcaModalTitle', lang)}
              </h2>
              <p className="text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                {t('ymcaModalDesc', lang)}
              </p>
            </div>

            {/* QR Code Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* 1. Locator Web */}
              <div className="flex flex-col items-center p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="bg-white p-2.5 rounded-xl shadow-inner">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https%3A%2F%2Fwww.ymca.org%2Ffind-your-y"
                    alt="YMCA Find Your Y QR Code"
                    className="w-[140px] h-[140px] object-contain"
                    loading="lazy"
                  />
                </div>
                <a 
                  href="https://www.ymca.org/find-your-y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl hover:scale-105 active:scale-95 shadow-md text-xs cursor-pointer text-center border border-white/5"
                >
                  <span className="material-symbols-outlined !text-base">explore</span>
                  <span>find-your-y</span>
                </a>
              </div>

              {/* 2. Google Play Android */}
              <div className="flex flex-col items-center p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="bg-white p-2.5 rounded-xl shadow-inner">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.netpulse.mobile.ymcaofgreaterwilliamsoncounty%26hl%3Den_US%26gl%3DUS%26pli%3D1"
                    alt="YMCA Play Store QR Code"
                    className="w-[140px] h-[140px] object-contain"
                    loading="lazy"
                  />
                </div>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.netpulse.mobile.ymcaofgreaterwilliamsoncounty&hl=en_US&gl=US&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl hover:scale-105 active:scale-95 shadow-md text-xs cursor-pointer text-center border border-white/5"
                >
                  <span className="material-symbols-outlined !text-base">android</span>
                  <span>Google Play</span>
                </a>
              </div>

              {/* 3. App Store iOS */}
              <div className="flex flex-col items-center p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="bg-white p-2.5 rounded-xl shadow-inner">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fymca-ctx%2Fid1485537145"
                    alt="YMCA App Store QR Code"
                    className="w-[140px] h-[140px] object-contain"
                    loading="lazy"
                  />
                </div>
                <a 
                  href="https://apps.apple.com/us/app/ymca-ctx/id1485537145"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl hover:scale-105 active:scale-95 shadow-md text-xs cursor-pointer text-center border border-white/5"
                >
                  <span className="material-symbols-outlined !text-base">phone_iphone</span>
                  <span>App Store</span>
                </a>
              </div>

            </div>

            {/* Back Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setShowYmcaQrModal(false);
                }}
                className="h-16 px-12 text-white font-extrabold text-lg rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-3 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                }}
              >
                <span className="material-symbols-outlined !text-2xl font-bold">arrow_back</span>
                <span>{t('back', lang)}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

