import React, { useState, useEffect } from 'react';
import { DonationState } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import NumericKeypad from './NumericKeypad';
import { HeaderClock } from './LiveClock';
import { speakText } from '../utils/tts';
import { BrandConfig } from '../utils/brand';

import { Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface DonationViewProps {
  onBack: () => void;
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
  initialStep?: 'category' | 'value' | 'method';
  initialCategory?: string;
  key?: string;
}

const getCategoryDetails = (icon: string) => {
  switch (icon) {
    case 'payments':
      return {
        hoverBorder: 'hover:border-amber-400/60',
        hoverBg: 'hover:bg-amber-950/40',
        iconColor: 'text-amber-300',
        bgGradient: 'from-amber-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=1200&fit=crop&q=80'
      };
    case 'volunteer_activism':
      return {
        hoverBorder: 'hover:border-rose-400/60',
        hoverBg: 'hover:bg-rose-950/40',
        iconColor: 'text-rose-300',
        bgGradient: 'from-rose-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&fit=crop&q=80'
      };
    case 'public':
      return {
        hoverBorder: 'hover:border-cyan-400/60',
        hoverBg: 'hover:bg-cyan-950/40',
        iconColor: 'text-cyan-300',
        bgGradient: 'from-cyan-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&fit=crop&q=80'
      };
    case 'spa':
      return {
        hoverBorder: 'hover:border-emerald-400/60',
        hoverBg: 'hover:bg-emerald-950/40',
        iconColor: 'text-emerald-300',
        bgGradient: 'from-emerald-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&fit=crop&q=80'
      };
    case 'local_car_wash':
      return {
        hoverBorder: 'hover:border-blue-400/60',
        hoverBg: 'hover:bg-blue-950/40',
        iconColor: 'text-blue-300',
        bgGradient: 'from-blue-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&fit=crop&q=80'
      };
    case 'wash':
      return {
        hoverBorder: 'hover:border-indigo-400/60',
        hoverBg: 'hover:bg-indigo-950/40',
        iconColor: 'text-indigo-300',
        bgGradient: 'from-indigo-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=1200&fit=crop&q=80'
      };
    case 'auto_clean_detail':
      return {
        hoverBorder: 'hover:border-teal-400/60',
        hoverBg: 'hover:bg-teal-950/40',
        iconColor: 'text-teal-300',
        bgGradient: 'from-teal-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1601362840469-81e4df86527e?w=1200&fit=crop&q=80'
      };
    case 'credit_card':
      return {
        hoverBorder: 'hover:border-purple-400/60',
        hoverBg: 'hover:bg-purple-950/40',
        iconColor: 'text-purple-300',
        bgGradient: 'from-purple-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=1200&fit=crop&q=80'
      };
    case 'emoji_events':
      return {
        hoverBorder: 'hover:border-yellow-400/60',
        hoverBg: 'hover:bg-yellow-950/40',
        iconColor: 'text-yellow-300',
        bgGradient: 'from-yellow-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&fit=crop&q=80'
      };
    case 'construction':
      return {
        hoverBorder: 'hover:border-orange-400/60',
        hoverBg: 'hover:bg-orange-950/40',
        iconColor: 'text-orange-300',
        bgGradient: 'from-orange-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=1200&fit=crop&q=80'
      };
    default:
      return {
        hoverBorder: 'hover:border-slate-400/60',
        hoverBg: 'hover:bg-slate-800/40',
        iconColor: 'text-slate-350',
        bgGradient: 'from-slate-500/20',
        bgUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&fit=crop&q=80'
      };
  }
};

export default function DonationView({ onBack, onGoHome, brand, lang, initialStep, initialCategory }: DonationViewProps) {
  const [state, setState] = useState<DonationState>({
    category: initialCategory || '',
    value: 0,
    customValue: '',
    step: initialStep || 'category'
  });

  const [pixTimer, setPixTimer] = useState(300);
  const [copied, setCopied] = useState(false);
  const [hoveredCategoryBg, setHoveredCategoryBg] = useState<string | null>(null);

  useEffect(() => {
    if (state.step !== 'pix') return;

    setPixTimer(300);
    speakText(`Código PIX gerado no valor de R$ ${state.value.toFixed(2)}. Aponte o celular ou copie a chave para pagar.`);

    const timer = setInterval(() => {
      setPixTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.step, state.value]);

  useEffect(() => {
    if (state.step !== 'card') return;

    speakText(`Aguardando pagamento no cartão no valor de R$ ${state.value.toFixed(2)}. Por favor, insira ou aproxime o seu cartão na maquininha.`);

    // Auto-simulate card reading success after 6 seconds
    const timer = setTimeout(() => {
      handleCompletePayment();
    }, 6000);

    return () => clearTimeout(timer);
  }, [state.step, state.value]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyKey = () => {
    playSuccessSound();
    navigator.clipboard.writeText(brand.pixKey);
    setCopied(true);
    speakText('Chave Copiada');
    setTimeout(() => setCopied(false), 3000);
  };

  const categories = brand.id === 'imocarwash' ? [
    { title: lang === 'en' ? 'Simple Wash' : lang === 'es' ? 'Lavado Simple' : lang === 'de' ? 'Einfache Wäsche' : 'Lavagem Simples', icon: 'local_car_wash', desc: lang === 'en' ? 'Exterior wash with soap and water drying.' : lang === 'es' ? 'Lavado exterior con jabón y secado de agua.' : lang === 'de' ? 'Außenwäsche mit Seife und Trocknung.' : 'Lavagem externa com água, shampoo e secagem rápida.' },
    { title: lang === 'en' ? 'Triple Wash' : lang === 'es' ? 'Lavado Triple' : lang === 'de' ? 'Triple-Wäsche' : 'Lavagem Tripla', icon: 'wash', desc: lang === 'en' ? 'Exterior wash, underbody protection and hot wax.' : lang === 'es' ? 'Lavado exterior, protección de bajos y cera caliente.' : lang === 'de' ? 'Außenwäsche, Unterbodenschutz und Heißwachs.' : 'Lavagem externa completa com proteção de chassi e cera quente.' },
    { title: lang === 'en' ? 'Ultra HD Premium (Ceramic XTR)' : lang === 'es' ? 'Ultra HD Premium (Ceramic XTR)' : lang === 'de' ? 'Ultra HD Premium (Ceramic XTR)' : 'Ultra HD Premium (Ceramic XTR)', icon: 'auto_clean_detail', desc: lang === 'en' ? 'Our best wash with Ceramic XTR coating protection and tyre shine.' : lang === 'es' ? 'Nuestro mejor lavado con Ceramic XTR y abrillantador de neumáticos.' : lang === 'de' ? 'Unsere beste Wäsche mit Ceramic XTR Lackschutz und Reifenpflege.' : 'Nossa melhor lavagem com película protetora Ceramic XTR e brilho de pneus.' },
    { title: lang === 'en' ? 'IMO Card Reload' : lang === 'es' ? 'Recarga de Tarjeta IMO' : lang === 'de' ? 'IMO-Karte aufladen' : 'Recarga de Cartão IMO', icon: 'credit_card', desc: lang === 'en' ? 'Add balance to your customer loyalty card for future washes.' : lang === 'es' ? 'Añada saldo a su tarjeta de fidelización para futuros lavados.' : lang === 'de' ? 'Guthaben auf Ihre Kundenkarte für zukünftige Wäschen laden.' : 'Adicione saldo ao seu cartão de fidelidade IMO para futuras lavagens.' }
  ] : brand.id === 'ymcactx' ? [
    { title: 'Mensalidade Geral', icon: 'payments', desc: 'Mensalidade padrão de treinamento e uso da quadra.' },
    { title: 'Inscrição em Torneio', icon: 'emoji_events', desc: 'Taxa de inscrição para copas locais, uniformes e taxas de arbitragem.' },
    { title: 'Bolsas Esportivas', icon: 'volunteer_activism', desc: 'Fundo para subsidiar mensalidades e uniformes de atletas carentes.' },
    { title: 'Manutenção de Quadra', icon: 'construction', desc: 'Apoio para melhoria de cestas, bolas e infraestrutura do ginásio.' }
  ] : brand.type === 'synagogue' ? [
    { title: 'Tsedaká Geral', icon: 'payments', desc: 'Contribuição regular para os custos e preces da sinagoga.' },
    { title: 'Estudos e Shabat', icon: 'volunteer_activism', desc: 'Oferta voluntária para festividades de Cabalat Shabat e shiurim.' },
    { title: 'Auxílio de Israel', icon: 'public', desc: 'Apoio direto a projetos humanitários e de assistência em Israel.' },
    { title: 'Ação Social (Chesed)', icon: 'spa', desc: 'Distribuição de cestas kosher e auxílio aos necessitados locais.' }
  ] : [
    { title: 'Dízimo', icon: 'payments', desc: 'Devolução regular de comunhão financeira de dízimo.' },
    { title: 'Oferta', icon: 'volunteer_activism', desc: 'Oferta voluntária para sustentação da casa e dos cultos.' },
    { title: 'Missões', icon: 'public', desc: 'Sustento direto aos nossos missionários no sertão e no exterior.' },
    { title: 'Projetos Sociais', icon: 'spa', desc: 'Sustentação de cestas básicas e assistência comunitária.' }
  ];

  const presetValues = [20, 50, 100, 200];

  const handleSelectCategory = (cat: string) => {
    playTapSound();
    setState((prev) => ({ ...prev, category: cat, step: 'value' }));
  };

  const handleSelectPreset = (val: number) => {
    playSuccessSound();
    setState((prev) => ({ ...prev, value: val, customValue: '', step: 'method' }));
  };

  const handleCustomValueKeyPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setState((prev) => ({ ...prev, customValue: prev.customValue.slice(0, -1) }));
      return;
    }
    if (char === 'CLEAR') {
      setState((prev) => ({ ...prev, customValue: '' }));
      return;
    }
    
    // limit custom value length
    if (state.customValue.length < 7) {
      setState((prev) => ({ ...prev, customValue: prev.customValue + char }));
    }
  };

  const handleCustomValueConfirm = () => {
    const val = parseFloat(state.customValue);
    if (isNaN(val) || val <= 0) {
      alert('Por favor, informe um valor numérico válido.');
      return;
    }
    playSuccessSound();
    setState((prev) => ({ ...prev, value: val, step: 'method' }));
  };

  const handleCompletePayment = () => {
    // Save registration to localStorage
    const newReg = {
      id: `donation_${Date.now()}`,
      name: `Contribuição no Valor de R$ ${state.value.toFixed(2)}`,
      phone: '-',
      email: '-',
      type: `${brand.termDonation}: ${state.category} (${state.paymentMethod === 'pix' ? 'PIX' : 'Cartão'})`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    playSuccessSound();
    setState((prev) => ({ ...prev, step: 'success' }));
  };

  const handleGoBack = () => {
    playTapSound();
    if (state.step === 'value') setState(prev => ({ ...prev, step: 'category' }));
    else if (state.step === 'method') setState(prev => ({ ...prev, step: 'value' }));
    else if (state.step === 'pix' || state.step === 'card') setState(prev => ({ ...prev, step: 'method' }));
    else onBack();
  };

  return (
    <div className={`relative bg-brand-light text-[#191c1e] flex flex-col overflow-x-hidden font-sans submodule-view ${
      state.step === 'category' ? 'h-screen overflow-hidden' : 'min-h-screen justify-between'
    }`}>
      
      {/* Dynamic client-specific identity background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${hoveredCategoryBg || brand.bgUrl})`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0 flex flex-col gap-0.5">
          <p className="text-brand-red text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-widest leading-none">
            {brand.termDonations}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark leading-tight truncate">
            {brand.id === 'imocarwash' || brand.id === 'ymcactx'
              ? `${brand.termDonations} ${brand.name}`
              : `Contribuições ${brand.name}`}
          </h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main interactive area */}
      <main className={`flex-grow relative z-10 w-full flex flex-col ${
        state.step === 'category'
          ? 'pt-[5.5rem] md:pt-[6rem] pb-24 px-1 min-h-0'
          : 'pt-28 pb-32 px-6 md:px-20 max-w-[1550px] mx-auto justify-center'
      }`}>
        
        {/* STEP 1: CATEGORY SELECTION */}
        {state.step === 'category' && (
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 w-full h-full min-h-0 animate-fade-in">
            {categories.map((cat) => {
              const styles = getCategoryDetails(cat.icon);
              return (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => handleSelectCategory(cat.title)}
                  onMouseEnter={() => setHoveredCategoryBg(styles.bgUrl)}
                  onMouseLeave={() => setHoveredCategoryBg(null)}
                  className={`h-full w-full bg-slate-900/90 hover:bg-slate-900/40 backdrop-blur-2xl border border-white/10 ${styles.hoverBorder} ${styles.hoverBg} text-white rounded-lg p-4 md:p-6 flex flex-col justify-center items-center text-center cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group`}
                >
                  <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] group-hover:opacity-[0.22] transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundImage: `url(${styles.bgUrl})`, filter: 'blur(1px)' }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${styles.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  
                  <span className={`material-symbols-outlined !text-[72px] md:!text-[96px] lg:!text-[120px] ${styles.iconColor} group-hover:scale-110 transition-transform duration-500 drop-shadow-md z-10 mb-3 md:mb-4`}>
                    {cat.icon}
                  </span>
                  
                  <div className="text-center z-10 space-y-2 md:space-y-3 px-2">
                    <span className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider block text-white transition-colors duration-300 break-words drop-shadow-md leading-tight">
                      {cat.title}
                    </span>
                    <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-white/85 block max-w-[90%] mx-auto leading-snug">
                      {cat.desc}
                    </span>
                  </div>

                  <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.18] text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 z-0 pointer-events-none">
                    <span className="material-symbols-outlined !text-[180px] md:!text-[240px]">{cat.icon}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}


        {/* STEP 2: CHOOSE VALUE PRESET OR CUSTOM VALUE */}
        {state.step === 'value' && (
          <div className="space-y-6 animate-fade-in justify-center">
            <header className="text-center max-w-xl mx-auto">
              <span className="bg-brand-red/10 text-brand-red text-sm font-black tracking-widest px-3 py-1.5 rounded-full uppercase border border-brand-red/20">
                {state.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-brand-dark mt-3">
                Escolha o valor da contribuição
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
              
              {/* Presets col */}
              <div className="space-y-3 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-widest font-black text-slate-600 block text-center mb-1">
                  Valores Prontos
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {presetValues.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelectPreset(v)}
                      className="key-tap relative overflow-hidden h-24 bg-white/95 hover:bg-white text-brand-dark hover:text-brand-red border-2 border-slate-200 hover:border-brand-red rounded-2xl text-2xl font-black flex items-center justify-center shadow-sm cursor-pointer transition-all hover:scale-[1.05] active:scale-[0.95] duration-200"
                    >
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                        style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                      />
                      <span className="relative z-10">R$ {v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input with virtual keyboard */}
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
                />
                <div className="relative z-10 text-center">
                  <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-1">
                    Valor Personalizado
                  </span>
                  
                  <div className="bg-white rounded-xl py-3 px-4 text-2xl font-black border border-slate-350 text-slate-800 tracking-tight flex items-center justify-center min-h-[58px] shadow-inner">
                    R$ {state.customValue || '0'}
                  </div>
                </div>

                {/* Reusable Keypad integration */}
                <div className="relative z-10 w-full">
                  <NumericKeypad 
                    onKeyPress={handleCustomValueKeyPress} 
                    onConfirm={handleCustomValueConfirm} 
                    confirmLabel="Confirmar Valor"
                  />
                </div>

                <p className="relative z-10 text-[10px] text-center text-slate-550 font-black">
                  Digite somente números sem pontos ou vírgulas
                </p>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2.5: SELECT PAYMENT METHOD */}
        {state.step === 'method' && (
          <div className="space-y-6 animate-fade-in text-center max-w-5xl mx-auto">
            <header className="max-w-xl mx-auto">
              <span className="bg-brand-red/10 text-brand-red text-sm font-black tracking-widest px-3 py-1.5 rounded-full uppercase border border-brand-red/20">
                R$ {state.value.toFixed(2)} - {state.category}
              </span>
              <h2 className="text-3xl font-black text-brand-dark mt-3">
                Selecione a forma de pagamento
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* PIX Method */}
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'pix', paymentMethod: 'pix' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px]"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">qr_code_2</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">PIX</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pagamento instantâneo com QR Code ou Chave Copia e Cola.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Selecionar PIX →
                </div>
              </button>

              {/* Credit Card Method */}
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'card', paymentMethod: 'credit' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px]"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">credit_card</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">Crédito</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pague com seu cartão de crédito aproximando ou inserindo na maquininha.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Pagar no Crédito →
                </div>
              </button>

              {/* Debit Card Method */}
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  setState(prev => ({ ...prev, step: 'card', paymentMethod: 'debit' }));
                }}
                className="relative overflow-hidden bg-white/95 hover:bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-brand-red cursor-pointer transition-all flex flex-col items-center text-center justify-between shadow-sm group hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px] md:col-span-2"
              >
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shrink-0">
                  <span className="material-symbols-outlined !text-4xl font-black">contactless</span>
                </div>
                <div className="relative z-10 flex-grow">
                  <h3 className="font-extrabold text-2xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">Débito</h3>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    Pagamento imediato em débito. Aproxime ou insira o seu cartão.
                  </p>
                </div>
                <div className="relative z-10 mt-6 font-black text-sm uppercase text-slate-450 group-hover:text-brand-red tracking-wider shrink-0">
                  Pagar no Débito →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PIX QR CODE DISPLAY AND SIMULATE */}
        {state.step === 'pix' && (
          <div className="space-y-6 animate-fade-in text-center max-w-3xl mx-auto">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block">PIX Facilitado</span>
              <h2 className="text-2xl font-black text-brand-dark">Aproxime o Celular</h2>
              <div className="text-xl font-extrabold text-brand-red bg-brand-red/10 rounded-full px-6 py-2.5 inline-block border border-brand-red/30 shadow-sm">
                Valor: R$ {state.value.toFixed(2)} ({state.category})
              </div>
            </header>

            {/* Simulated PIX QR display */}
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-slate-200 shadow-lg flex flex-col items-center">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="relative w-56 h-56 group border-2 border-brand-red/20 rounded-2xl overflow-hidden p-1 shadow-inner bg-slate-50">
                  <img
                    className="w-full h-full object-contain rounded-xl pointer-events-none opacity-90"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_ptHuYhlDFyDexHL0MXiDWIWBLQywj4JYFKg9lNzTjM1PVcSDD5P9AkpH48mcS9VAxPD0SCLRkTk86Jc0fItS7fLrskbB0D-CE20Mpp83ZXA6R_Hh5hMcdgSSw5OQV6gkjjzmuI2XP6r3pjC5vurY4SgT1g__rD4uRh6b6NVv4x6_TJtVdDwrgfH6FuHvLgiEJFbqa5zc-GQ4YvskFfGOalToE-66bFI3wVUaNPmvV_C8jyNy9FjlE4QSUlPLEoc58jSKl4bAhegS"
                    alt="PIX QR Code"
                    referrerPolicy="no-referrer"
                  />
                  {/* Scan line overlay */}
                  <div className="absolute left-0 w-full h-1 bg-brand-red scan-line rounded-full opacity-80" />
                </div>

                {/* Countdown timer display */}
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-brand-red !text-lg animate-spin">autorenew</span>
                  <span className="text-xs font-black uppercase tracking-wider">O código expira em:</span>
                  <span className="text-sm font-extrabold text-brand-red font-mono">{formatTimer(pixTimer)}</span>
                </div>

                {/* Copy paste button */}
                <div className="mt-4 w-full">
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 text-xs uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined !text-base">content_copy</span>
                    <span>{copied ? 'Chave Copiada!' : 'Copiar Chave PIX Copia e Cola'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-semibold mt-4 leading-relaxed">
                  Abra o aplicativo do seu banco, selecione a opção "Pagar com PIX/QR Code" e aponte para o código acima para concluir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompletePayment}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-lg"
            >
              <span className="material-symbols-outlined !text-2xl">check_circle</span>
              <span>Simular Pagamento Confirmado</span>
            </button>
          </div>
        )}

        {/* STEP 3.5: CARD PAYMENT INTERACTION */}
        {state.step === 'card' && (
          <div className="space-y-6 animate-fade-in text-center max-w-3xl mx-auto">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block">
                Pagamento em Cartão de {state.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}
              </span>
              <h2 className="text-2xl font-black text-brand-dark">Aproxime ou Insira o Cartão</h2>
              <div className="text-xl font-extrabold text-brand-red bg-brand-red/10 rounded-full px-6 py-2.5 inline-block border border-brand-red/30 shadow-sm">
                Valor: R$ {state.value.toFixed(2)} ({state.category})
              </div>
            </header>

            {/* Card Machine visual */}
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-8 border-2 border-slate-200 shadow-lg flex flex-col items-center space-y-6">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col items-center w-full space-y-6">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Simulated payment machine or terminal icon */}
                  <div className="absolute inset-0 bg-brand-red/5 rounded-full animate-ping opacity-30 animate-duration-3000" />
                  <div className="relative w-36 h-36 bg-slate-800 text-white rounded-2xl p-4 shadow-xl border border-slate-700 flex flex-col justify-between">
                    {/* Terminal Screen */}
                    <div className="bg-emerald-950 text-emerald-400 font-mono text-[10px] p-2 rounded border border-emerald-900 text-left space-y-1 shadow-inner min-h-[50px]">
                      <div className="flex justify-between">
                        <span>VALOR:</span>
                        <span>R$ {state.value.toFixed(2)}</span>
                      </div>
                      <div className="animate-pulse flex items-center gap-1 mt-1 text-[9px] text-emerald-300">
                        <span className="material-symbols-outlined !text-[10px]">contactless</span>
                        <span>APROXIME OU INSIRA</span>
                      </div>
                    </div>
                    {/* Keyboard Area */}
                    <div className="grid grid-cols-3 gap-1 pt-2">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className="w-full h-1.5 bg-slate-700 rounded-[2px]" />
                      ))}
                      <div className="h-1.5 bg-red-600 rounded-[2px]" />
                      <div className="h-1.5 bg-amber-500 rounded-[2px]" />
                      <div className="h-1.5 bg-emerald-600 rounded-[2px]" />
                    </div>
                  </div>

                  {/* Hand contactless animation */}
                  <div className="absolute -bottom-2 -right-2 bg-brand-red text-white p-3 rounded-full shadow-lg border-2 border-white animate-bounce">
                    <span className="material-symbols-outlined !text-2xl">contactless</span>
                  </div>
                </div>

                {/* Waiting status */}
                <div className="flex items-center justify-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-5 py-3 rounded-2xl w-full">
                  <span className="material-symbols-outlined text-brand-red !text-xl animate-pulse">sync_saved_locally</span>
                  <span className="text-xs font-black uppercase tracking-wider">Aguardando maquininha...</span>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Utilize o leitor de cartões integrado na lateral do totem. Caso o pagamento não seja processado automaticamente, você pode simular a aprovação abaixo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompletePayment}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.98] transition-transform text-lg"
            >
              <span className="material-symbols-outlined !text-2xl">check_circle</span>
              <span>Simular Cartão Aprovado</span>
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS CONGRATS BIBLICAL QUOTE */}
        {state.step === 'success' && (
          <div className="relative overflow-hidden space-y-6 text-center animate-fade-in max-w-3xl mx-auto p-10 md:p-12 rounded-3xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60">
            {/* Background image related to client virtual identity inside card */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.15] pointer-events-none"
              style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
            />
            <div className="relative z-10 space-y-6 flex flex-col items-center w-full">
              <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mx-auto text-white shadow-md">
                <span className="material-symbols-outlined !text-5xl font-black animate-pulse">favorite</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-brand-dark tracking-tight">Muito Obrigado!</h2>
                <p className="text-base text-slate-600 font-semibold">
                  {brand.id === 'imocarwash'
                    ? 'Obrigado por lavar conosco! Seu pagamento foi confirmado e a cancela foi liberada. Siga as instruções da pista.'
                    : brand.id === 'ymcactx'
                    ? 'Agradecemos o seu pagamento! O seu acesso às instalações esportivas e atividades foi registrado com sucesso.'
                    : brand.type === 'synagogue'
                    ? 'Sua tsedaká apoia os estudos da Torá, os serviços diários e as ações de auxílio social da nossa comunidade.'
                    : `Sua generosidade faz a igreja de Cristo crescer e transbordar amor e bênçãos em nossa região de ${brand.campusName}.`}
                </p>
              </div>

              {/* Snippet graphic style card */}
              {brand.id === 'imocarwash' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "A lavagem de carros mais popular do mundo. Proteja o seu veículo dos sinais de envelhecimento."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">Garantia de Qualidade</p>
                </div>
              ) : brand.id === 'ymcactx' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Desenvolvendo caráter, liderança e espírito de equipe através do esporte."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">YMCA Central Texas</p>
                </div>
              ) : brand.type === 'synagogue' ? (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Abra a sua mão para o seu irmão, para o seu pobre e para o seu necessitado na sua terra."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">Deuteronômio 15:11</p>
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 italic text-slate-500 shadow-sm w-full text-center">
                  "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama a quem dá com alegria."
                  <p className="font-extrabold text-brand-dark text-xs uppercase tracking-wider mt-3">2 Coríntios 9:7</p>
                </div>
              )}

              <button
                type="button"
                onClick={onGoHome}
                className="h-16 px-12 text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-base uppercase tracking-wider shrink-0 border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                  boxShadow: `0 4px 12px ${brand.primaryColor}40`
                }}
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating Back Button (Bottom Right) */}
      <button
        type="button"
        onClick={handleGoBack}
        className="fixed bottom-8 right-6 md:right-20 z-50 flex items-center gap-3 text-white font-black px-12 h-20 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 text-xl md:text-2xl shadow-xl border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
          boxShadow: `0 10px 25px ${brand.primaryColor}55`
        }}
      >
        <span className="material-symbols-outlined !text-3xl font-black">arrow_back</span>
        <span>Voltar</span>
      </button>

      {/* Spacing empty footer padding footer */}
      {state.step !== 'category' && <footer className="h-28 w-full" />}

    </div>
  );
}
