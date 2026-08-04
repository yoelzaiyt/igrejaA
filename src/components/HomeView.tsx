import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playTapSound } from '../utils/audio';
import { speakText } from '../utils/tts';
import { BrandConfig } from '../utils/brand';
import { Slide } from '../types';
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

/* ─── Component Props ───────────────────────────────── */
interface HomeViewProps {
  onStart: () => void;
  onOpenAccessibility: () => void;
  onOpenAdmin?: () => void;
  brand: BrandConfig;
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
  onDirectDonation?: () => void;
  onDirectCheckin?: () => void;
}

/* ─── HomeView ──────────────────────────────────────── */
export default function HomeView({
  onStart,
  onOpenAccessibility,
  onOpenAdmin,
  brand,
  lang,
  onLanguageChange,
  onDirectDonation,
  onDirectCheckin,
}: HomeViewProps) {
  const slides = useMemo(() => {
    if (brand.slides && brand.slides.length > 0) {
      return brand.slides;
    }
    return [{
      bgUrl: brand.bgUrl,
      verse: 'Seja forte e corajoso! Não se apavore, nem se desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.',
      verseRef: 'Josué 1:9'
    }];
  }, [brand]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide,    setPrevSlide]    = useState<number | null>(null);
  const [isExiting,   setIsExiting]    = useState(false);
  const touchStartX = useRef<number | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Voice greeting */
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(
        t('welcomeVoice', lang)
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [brand, lang]);

  /* ── Slide transition ─────────────────────────────── */
  const goToSlide = useCallback((next: number) => {
    if (slides.length === 0 || next === currentSlide) return;
    setPrevSlide(currentSlide);
    setIsExiting(true);
    setTimeout(() => {
      setCurrentSlide(next);
      setPrevSlide(null);
      setIsExiting(false);
    }, 700); // crossfade duration
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setPrevSlide(currentSlide);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 6000);
  }, [nextSlide]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  /* ── Touch / swipe ───────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      const next = delta < 0
        ? (currentSlide + 1) % slides.length
        : (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(next);
      startTimer();
    }
    touchStartX.current = null;
  };

  /* ── Actions ─────────────────────────────────────── */
  const handleStart = () => { playTapSound(); onStart(); };
  const handleLang  = () => {
    playTapSound();
    const nextLang = lang === 'pt' ? 'en' : lang === 'en' ? 'es' : lang === 'es' ? 'de' : 'pt';
    onLanguageChange(nextLang);
  };
  const handleAccessibility = () => { playTapSound(); onOpenAccessibility(); };

  /* ── Brand switcher ──────────────────────────────── */
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playTapSound();
    const url = new URL(window.location.href);
    url.searchParams.set('client', e.target.value);
    window.location.href = url.toString();
  };

  const slide = slides[currentSlide];

  /* ── Accent / glow colour ────────────────────────── */
  const accent = '#F5C31E'; // Institutional generic yellow
  const glow   = 'rgba(245,195,30,0.25)';

  /* ── Logo icon (generic per type) ───────────────── */
  const logoIcon = brand.type === 'synagogue' ? 'synagogue' : 'church';

  return (
    <div
      className="relative h-screen w-full select-none overflow-hidden text-white"
      style={{ background: '#020617' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Totem de atendimento — Toque para iniciar"
      role="main"
    >

      {/* ════════════════════════════════════════════════
          LAYER 1 — Radial deep gradient (always visible)
          ════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-[1]"
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

      {/* ════════════════════════════════════════════════
          LAYER 2 — Particle system
          ════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none" aria-hidden="true">
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

      {/* ════════════════════════════════════════════════
          LAYER 3 — Fullscreen carousel (Ken Burns)
          ════════════════════════════════════════════════ */}
      {slides.map((s, i) => {
        const isActive = i === currentSlide;
        const isLeaving = i === prevSlide && isExiting;
        const visible = isActive || isLeaving;
        return (
          <div
            key={i}
            className="absolute inset-0 z-[3]"
            style={{
              opacity:    visible ? (isLeaving ? 0 : 1) : 0,
              transition: 'opacity 0.7s ease-in-out',
              willChange: 'opacity',
            }}
            aria-hidden="true"
          >
            {/* Image with Ken Burns */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={s.bgUrl}
                alt=""
                role="presentation"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`h-full w-full object-cover ${isActive ? 'ken-burns' : ''}`}
                style={{ opacity: 0.70, willChange: 'transform' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Cinematic overlay with dynamic brand color tint */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  180deg,
                  rgba(var(--color-brand-red-rgb), 0.75) 0%,
                  rgba(15, 23, 42, 0.40) 50%,
                  rgba(2, 6, 23, 0.90) 100%
                )`,
              }}
            />
          </div>
        );
      })}

      {/* ════════════════════════════════════════════════
          LAYER 4 — Brand accent glow (central radial)
          ════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 52%, ${glow} 0%, transparent 62%)`,
        }}
        aria-hidden="true"
      />

      {/* ════════════════════════════════════════════════
          TOP NAV
          ════════════════════════════════════════════════ */}
      <nav
        className="absolute top-0 left-0 z-50 w-full flex items-center justify-between px-8 md:px-16 py-5"
        aria-label="Navegação principal"
      >
        {/* Brand Switcher */}
        <div className="flex items-center gap-2" role="group" aria-label="Selecionar instituição">
          <span className="material-symbols-outlined !text-base text-white/35" aria-hidden="true">swap_horizontal_circle</span>
          <select
            value={brand.id}
            onChange={handleBrandChange}
            aria-label="Selecionar cliente"
            className="bg-white/8 text-white border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 cursor-pointer backdrop-blur-xl transition-all hover:bg-white/15"
            style={{ focusRingColor: accent } as React.CSSProperties}
          >
            <option value="atitude"      className="bg-slate-900">Atitude</option>
            <option value="lagoinha"     className="bg-slate-900">Lagoinha</option>
            <option value="universal"    className="bg-slate-900">Universal</option>
            <option value="beityaacov"   className="bg-slate-900">Beit Yaacov</option>
            <option value="ibmalphaville" className="bg-slate-900">IBM Alphaville</option>
            <option value="icconselheira" className="bg-slate-900">ICC</option>
          </select>
        </div>



        {/* Action buttons */}
        <div className="flex items-center gap-2" role="group" aria-label="Ações">
          {onOpenAdmin && (
            <button
              type="button"
              onClick={() => { playTapSound(); onOpenAdmin(); }}
              className="w-11 h-11 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xl"
              aria-label="Abrir painel administrativo"
              title="Admin"
            >
              <span className="material-symbols-outlined font-light !text-xl" aria-hidden="true">settings</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleLang}
            className="w-16 h-11 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xl gap-1 text-xs font-black uppercase tracking-wider text-white"
            aria-label="Mudar idioma"
            title="Idioma"
          >
            <span className="material-symbols-outlined font-light !text-base" aria-hidden="true">language</span>
            <span>{lang}</span>
          </button>
          <button
            type="button"
            onClick={handleAccessibility}
            className="w-11 h-11 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xl"
            aria-label="Abrir opções de acessibilidade"
            title="Acessibilidade"
          >
            <span className="material-symbols-outlined font-light !text-xl" aria-hidden="true">accessibility_new</span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════ */}
      <main
        className="relative z-40 h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ paddingTop: '5rem', paddingBottom: '6rem' }}
      >
        {/* Title block — animates on slide change */}
        <div
          className="mb-10 flex flex-col items-center"
          style={{
            opacity:    slide ? 1 : 0,
            transform:  slide ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity .5s ease, transform .5s ease',
          }}
        >
          {/* Eyebrow */}
          <span
            className="uppercase tracking-[0.4em] font-black mb-4 slide-reveal"
            style={{ color: accent, fontSize: '24px', fontWeight: 600 }}
          >
            {t('welcome', lang)}
          </span>

          {/* H1 — 64px / 800 / letter-spacing 4px */}
          <h1
            className="drop-shadow-2xl slide-reveal my-6"
            style={{
              animationDelay: '0.08s',
            }}
          >
            <img
              src={brand.logoUrl}
              className={`h-24 md:h-36 object-contain ${['atitude', 'ibmalphaville', 'lagoinha', 'universal', 'beityaacov', 'icconselheira'].includes(brand.id) ? 'logo-white' : ''}`}
              alt={brand.name}
              referrerPolicy="no-referrer"
            />
          </h1>

          {/* Campus subtitle */}
          <p
            className="uppercase tracking-[0.5em] text-white mt-3 mb-6 slide-reveal"
            style={{ fontSize: '24px', fontWeight: 600, color: '#F5C31E', animationDelay: '0.16s' }}
          >
            {brand.campusName}
          </p>

          {/* Verse */}
          <div
            className="max-w-lg mx-auto slide-reveal"
            style={{ animationDelay: '0.24s' }}
          >
            <p
              className="font-sans text-sm md:text-base leading-relaxed italic"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              "{slide?.verse}"
            </p>
            <span
              className="block text-xs mt-2 font-bold uppercase tracking-widest not-italic"
              style={{ color: accent }}
            >
              — {slide?.verseRef}
            </span>
          </div>
        </div>

        {/* ── CTA Button ─────────────────────────────── */}
        {brand.id === 'ymcactx' ? (
          <div className="relative flex flex-col items-center slide-reveal" style={{ animationDelay: '0.36s' }}>
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              {/* Button 1: Iniciar */}
              <div
                className="relative flex flex-col items-center group cursor-pointer"
                onClick={handleStart}
                role="button"
                tabIndex={0}
                aria-label={lang === 'en' ? 'Start Services' : lang === 'es' ? 'Iniciar Atendimiento' : lang === 'de' ? 'Dienste Starten' : 'Iniciar Atendimento'}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              >
                {/* Ambient glow */}
                <div
                  className="absolute -inset-6 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: brand.primaryColor }}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="relative w-[280px] md:w-[320px] h-20 md:h-24 text-white font-bold text-lg md:text-xl flex items-center justify-center rounded-full border-2 hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150 cursor-pointer shadow-2xl btn-shine"
                  style={{
                    background:   `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                    borderColor:  'rgba(255, 255, 255, 0.15)',
                    fontFamily:   'Inter, Segoe UI, Roboto, Arial, sans-serif',
                    fontWeight:   700,
                  }}
                >
                  <span className="material-symbols-outlined !text-3xl mr-3" aria-hidden="true">
                    play_arrow
                  </span>
                  {lang === 'en' ? 'Start' : lang === 'es' ? 'Iniciar' : lang === 'de' ? 'Starten' : 'Iniciar'}
                </button>
              </div>

              {/* Button 2: Eventos / Acesso */}
              <div
                className="relative flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  playTapSound();
                  if (onDirectCheckin) onDirectCheckin();
                }}
                role="button"
                tabIndex={0}
                aria-label="Acessar Eventos"
                onKeyDown={(e) => e.key === 'Enter' && onDirectCheckin && onDirectCheckin()}
              >
                {/* Ambient glow */}
                <div
                  className="absolute -inset-6 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: brand.accentColor }}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="relative w-[280px] md:w-[320px] h-20 md:h-24 text-white font-bold text-lg md:text-xl flex items-center justify-center rounded-full border-2 hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150 cursor-pointer shadow-2xl btn-shine"
                  style={{
                    background:   `linear-gradient(135deg, ${brand.accentColor} 0%, #d58f05 100%)`,
                    borderColor:  'rgba(255, 255, 255, 0.15)',
                    fontFamily:   'Inter, Segoe UI, Roboto, Arial, sans-serif',
                    fontWeight:   700,
                  }}
                >
                  <span className="material-symbols-outlined !text-3xl mr-3" aria-hidden="true">
                    event
                  </span>
                  {t('ymcaHomeEventsBtn', lang)}
                </button>
              </div>
            </div>

            {/* Tap prompt */}
            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <span className="w-8 h-px bg-white/20" />
              <span className="text-white/45 text-xs uppercase tracking-[0.3em] font-semibold animate-pulse">
                {t('tapToStart', lang)}
              </span>
              <span className="w-8 h-px bg-white/20" />
            </div>
          </div>
        ) : (
          <div
            className="relative flex flex-col items-center group cursor-pointer slide-reveal"
            style={{ animationDelay: '0.36s' }}
            onClick={handleStart}
            role="button"
            tabIndex={0}
            aria-label="Tocar para iniciar o atendimento"
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          >
            {/* Ambient glow behind button */}
            <div
              className="absolute -inset-8 rounded-full blur-3xl opacity-25 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: brand.primaryColor }}
              aria-hidden="true"
            />

            <button
              type="button"
              className="relative w-[280px] md:w-[520px] h-20 md:h-24 text-white font-bold text-xl md:text-2xl flex items-center justify-center rounded-full border-2 hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150 cursor-pointer shadow-2xl animate-cta-pulse btn-shine"
              style={{
                background:   `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                borderColor:  'rgba(255, 255, 255, 0.15)',
                fontFamily:   'Inter, Segoe UI, Roboto, Arial, sans-serif',
                fontWeight:   700,
              }}
              aria-label="Iniciar atendimento"
            >
              <span
                className="material-symbols-outlined !text-4xl mr-3 animate-hand-bounce"
                aria-hidden="true"
              >
                touch_app
              </span>
              {t('ctaQuestion', lang)}
            </button>

            {/* Tap prompt */}
            <div className="mt-5 flex items-center gap-3" aria-hidden="true">
              <span className="w-8 h-px bg-white/20" />
              <span className="text-white/45 text-xs uppercase tracking-[0.3em] font-semibold animate-pulse">
                {t('tapToStart', lang)}
              </span>
              <span className="w-8 h-px bg-white/20" />
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════
          BOTTOM RAIL — Dots + WiFi/Location
          ════════════════════════════════════════════════ */}
      <footer
        className="absolute bottom-0 left-0 z-50 w-full pb-6 px-8 md:px-16"
        aria-label="Informações de conexão e navegação do carrossel"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* ── Carousel dots ─────────────────────────── */}
          <div
            className="flex items-center gap-3"
            role="tablist"
            aria-label="Slides do carrossel"
          >
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === currentSlide}
                aria-label={`Slide ${i + 1}: ${s.verseRef}`}
                onClick={() => { goToSlide(i); startTimer(); }}
                className="cursor-pointer"
                style={{
                  width:           i === currentSlide ? '16px' : '6px',
                  height:          '6px',
                  borderRadius:    '999px',
                  backgroundColor: i === currentSlide
                    ? accent
                    : 'rgba(255,255,255,0.25)',
                  boxShadow: i === currentSlide
                    ? `0 0 8px rgba(245,195,30,.40), 0 0 16px rgba(245,195,30,.20)`
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* ── WiFi + Location pill ──────────────────── */}
          <div
            className="flex items-center bg-white/5 backdrop-blur-xl px-5 py-2 rounded-full text-white/80 text-xs font-medium border border-white/10 gap-4"
            aria-label="Informações do local"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="material-symbols-outlined !text-sm" style={{ color: accent }} aria-hidden="true">wifi</span>
              <span>{brand.wifi}</span>
            </div>
            <div className="w-px h-4 bg-white/15" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-sm" style={{ color: accent }} aria-hidden="true">location_on</span>
              <span>
                {brand.id === 'ymcactx' ? t('locationGym', lang) : brand.type === 'synagogue' ? t('locationSynagogue', lang) : t('locationHall', lang)}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
