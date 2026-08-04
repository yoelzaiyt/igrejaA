import React, { useState } from 'react';
import { Pastor, ViewState } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import NumericKeypad from './NumericKeypad';
import { HeaderClock } from './LiveClock';
import { BrandConfig, hexToRgb } from '../utils/brand';
import { Lang, t } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface PastoralViewProps {
  onBack: () => void;
  onGoHome: () => void;
  onSelectView?: (view: ViewState) => void;
  brand: BrandConfig;
  lang: Lang;
}

export default function PastoralView({ onBack, onGoHome, onSelectView, brand, lang }: PastoralViewProps) {
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null);
  const [userPhone, setUserPhone] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const handlePastorSelect = (p: Pastor) => {
    if (!p.available) {
      playTapSound();
      if (brand.id === 'imocarwash') {
        alert('Este operador está em atendimento no momento. Por favor, chame outro disponível ou aguarde alguns minutos.');
      } else if (brand.id === 'ymcactx') {
        alert('Este treinador está em atendimento no momento. Por favor, chame outro disponível ou aguarde alguns minutos.');
      } else {
        alert(brand.type === 'synagogue'
          ? 'Este rabino está em atendimento no momento. Por favor, escolha outro disponível ou aguarde alguns minutos.'
          : 'Este pastor está em atendimento individual no momento. Por favor escolha um de nossos conselheiros disponíveis ou aguarde alguns minutos.'
        );
      }
      return;
    }
    playTapSound();
    setSelectedPastor(p);
  };

  const handleKeypadPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setUserPhone((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setUserPhone('');
      return;
    }
    
    // Clean to keep digits only and limit size
    const clean = (userPhone + char).replace(/\D/g, '');
    if (clean.length <= 11) {
      setUserPhone(clean);
    }
  };

  const formatPhone = (raw: string) => {
    if (!raw) return '';
    const clean = raw.replace(/\D/g, '');
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };  const handleScheduleSubmit = () => {
    if (!userPhone.trim() || userPhone.length < 10) {
      alert('Por favor, indique um número de WhatsApp válido (DDD + Número).');
      return;
    }

    // Save registration to localStorage
    const newReg = {
      id: `pastoral_${Date.now()}`,
      name: `Atendimento com ${selectedPastor?.name || brand.termPastor}`,
      phone: userPhone,
      email: '-',
      type: brand.id === 'imocarwash'
        ? 'Chamar Operador'
        : brand.id === 'ymcactx'
        ? 'Falar com Treinador'
        : brand.type === 'synagogue'
        ? 'Aconselhamento Rabínico'
        : 'Aconselhamento Pastoral',
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    setIsScheduled(true);
    playSuccessSound();
  };

  const handleClose = () => {
    playTapSound();
    setSelectedPastor(null);
    setUserPhone('');
    setIsScheduled(false);
  };

  const handleGoBack = () => {
    playTapSound();
    onBack();
  };

  const handleNavClick = (targetView: ViewState) => {
    playTapSound();
    if (targetView === 'pastoral') {
      setSelectedPastor(null);
      setUserPhone('');
      setIsScheduled(false);
      return;
    }
    if (onSelectView) {
      onSelectView(targetView);
    }
  };

  const navItems = [
    { view: 'dashboard' as ViewState, label: 'Painel Principal', icon: 'dashboard' },
    { view: 'new_member' as ViewState, label: brand.termMember, icon: 'person_add' },
    { view: 'donations' as ViewState, label: brand.termDonations, icon: 'payments' },
    { 
      view: 'ministries' as ViewState, 
      label: brand.id === 'imocarwash' 
        ? t('volunteerTitleCarWash', lang) 
        : brand.type === 'synagogue' 
        ? 'Mitzvot' 
        : 'Participar', 
      icon: 'groups' 
    },
    { view: 'checkin' as ViewState, label: brand.termCults, icon: 'calendar_month' },
    { view: 'my_cell' as ViewState, label: brand.termConnects, icon: 'diversity_3' },
    { 
      view: 'prayer' as ViewState, 
      label: brand.id === 'imocarwash' 
        ? t('prayerTitleCarWash', lang) 
        : brand.id === 'ymcactx' 
        ? t('prayerTitleSports', lang) 
        : brand.type === 'synagogue' 
        ? 'Pedido de Rezas' 
        : 'Pedido de Oração', 
      icon: (brand.id === 'ymcactx' || brand.id === 'imocarwash') ? 'chat' : 'volunteer_activism' 
    },
    { view: 'pastoral' as ViewState, label: brand.termPastoral, icon: 'chat' },
  ];

  return (
    <div 
      className="relative min-h-screen bg-brand-light text-[#191c1e] flex flex-col overflow-x-hidden font-sans submodule-view"
      style={{
        '--color-brand-red': brand.primaryColor,
        '--color-brand-red-hover': brand.primaryColorHover,
        '--color-brand-red-rgb': hexToRgb(brand.primaryColor)
      } as React.CSSProperties}
    >
      
      {/* Dynamic client-specific identity background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none transition-all duration-500"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&fit=crop&q=80)`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      <header className="sticky top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">{brand.termPastoral}</h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="max-w-[1600px] mx-auto w-full flex-grow flex flex-col lg:flex-row relative z-10">
        
        {/* Left Sidebar (Desktop) */}
        <aside className="relative overflow-hidden hidden lg:flex w-96 shrink-0 border-r border-[#eceef1]/60 bg-white/45 backdrop-blur-xl p-8 flex-col gap-5 sticky top-[73px] h-[calc(100vh-73px)]">
          {/* Background image related to client virtual identity inside sidebar */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
          />
          <div className="relative z-10 flex flex-col gap-4 w-full h-full overflow-y-auto">
            <div className="mb-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">Módulos do Totem</span>
              <div className="h-0.5 w-8 bg-brand-red rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.view === 'pastoral';
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNavClick(item.view)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-base text-left active:scale-[0.98] cursor-pointer group ${
                      isActive 
                        ? 'shadow-lg text-white hover:opacity-90' 
                        : 'text-slate-700 hover:bg-white/70 hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: isActive ? brand.primaryColor : undefined,
                      color: isActive ? '#fff' : undefined,
                      boxShadow: isActive ? `0 10px 15px -3px ${brand.primaryColor}33, 0 4px 6px -4px ${brand.primaryColor}33` : undefined,
                      ['--hover-color' as any]: brand.primaryColor,
                    }}
                  >
                    <span 
                      className={`material-symbols-outlined !text-2xl transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-[var(--hover-color)]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate group-hover:text-[var(--hover-color)] transition-colors">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Top Scrolling Bar (Mobile/Tablet) */}
        <nav className="flex lg:hidden w-full overflow-x-auto whitespace-nowrap gap-3 p-5 border-b border-[#eceef1]/60 bg-white/40 backdrop-blur-xl sticky top-[73px] z-20 scrollbar-none">
          {navItems.map((item) => {
            const isActive = item.view === 'pastoral';
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`inline-flex items-center gap-3 px-5 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm shrink-0 border group cursor-pointer ${
                  isActive 
                    ? 'text-white border-transparent' 
                    : 'text-slate-750 bg-white/60 border-slate-200/60 hover:shadow-md'
                }`}
                style={{
                  backgroundColor: isActive ? brand.primaryColor : undefined,
                  ['--hover-color' as any]: brand.primaryColor,
                }}
              >
                <span 
                  className={`material-symbols-outlined !text-lg transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[var(--hover-color)]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className={isActive ? 'text-white' : 'group-hover:text-[var(--hover-color)] transition-colors'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Content Container */}
        <main className="flex-grow py-8 px-6 md:px-12 w-full flex flex-col justify-start relative z-10 animate-fade-in max-w-7xl">
          
          <header className="mb-8 text-center lg:text-left max-w-2xl pt-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              {brand.id === 'imocarwash'
                ? 'Precisa de ajuda ou atendimento na pista?'
                : brand.id === 'ymcactx'
                ? 'Precisa falar com um treinador ou instrutor?'
                : brand.type === 'synagogue'
                ? 'Precisa de orientação espiritual ou auxílio do Rabinato?'
                : 'Precisa conversar ou receber uma oração presencial?'}
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold leading-relaxed">
              {brand.id === 'imocarwash'
                ? `Nossos ${brand.termPastors.toLowerCase()} de plantão estão prontos para auxiliar você com as pistas e programas. Escolha um ${brand.termPastor.toLowerCase()} abaixo para solicitar ajuda agora.`
                : brand.id === 'ymcactx'
                ? `Nossos ${brand.termPastors.toLowerCase()} estão disponíveis para tirar dúvidas e dar orientações esportivas. Escolha um ${brand.termPastor.toLowerCase()} abaixo para agendar um atendimento.`
                : brand.type === 'synagogue'
                ? `Nossa equipe de ${brand.termPastors.toLowerCase()} está pronta para ouvir você, oferecer conselhos baseados na Torá e prestar apoio espiritual. Escolha um ${brand.termPastor.toLowerCase()} abaixo para agendar um encontro hoje.`
                : `Nossa equipe de ${brand.termPastors.toLowerCase()} de plantão está pronta para ouvir você, oferecer conselhos bíblicos e orar pelas suas necessidades. Escolha um ${brand.termPastor.toLowerCase()} abaixo para agendar um encontro reservado hoje mesmo.`}
            </p>
          </header>

          {/* Pastors Grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">

            {brand.pastors.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg flex flex-col justify-between items-stretch hover:border-brand-red hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[360px]"
              >
                {/* Background image related to client virtual identity inside card */}
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.10] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                
                {/* Pastor Portrait cover */}
                <div className="relative h-64 w-full bg-slate-100 shrink-0">
                  <img
                    className="w-full h-full object-cover select-none"
                    src={p.photoUrl}
                    alt={p.name}
                  />
                  <div className="absolute top-3 right-3">
                    {p.available ? (
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Disponível
                      </span>
                    ) : (
                      <span className="bg-slate-100/90 text-slate-600 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-slate-200 inline-block shadow-md">
                        Ocupado
                      </span>
                    )}
                  </div>
                </div>

                {/* Pastor bio text definitions */}
                <div className="relative z-10 p-6 flex-grow flex flex-col justify-between gap-5">
                  <div>
                    <h3 className="text-2xl font-black text-brand-dark tracking-tight leading-tight uppercase">
                      {p.name}
                    </h3>
                    <p className="text-sm text-brand-red font-black tracking-wider uppercase mt-1">
                      {p.role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePastorSelect(p)}
                    className={`w-full h-16 font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 shadow-sm ${
                      p.available 
                        ? 'bg-slate-50 border-slate-200 hover:bg-brand-red hover:border-brand-red text-brand-dark hover:text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    style={{
                      '--hover-bg': brand.primaryColor
                    } as React.CSSProperties}
                  >
                    <span>Chamar {brand.termPastor}</span>
                    <span className="material-symbols-outlined !text-lg">chat_bubble</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* Counseling solicitation popup layout */}
      {selectedPastor && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in select-none">
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            {/* Background image related to client virtual identity inside modal */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
              style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
            />
            
            {/* Header */}
            <div className="relative z-10 p-6 bg-brand-dark text-white border-b flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{selectedPastor.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative z-10 p-6 md:p-8 overflow-y-auto flex-grow">
              {isScheduled ? (
                <div className="text-center space-y-4 py-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined !text-3xl font-black">done</span>
                  </div>
                  <h4 className="text-xl font-black text-brand-dark">Solicitação Confirmada!</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {brand.id === 'imocarwash'
                      ? `O ${selectedPastor.name} foi acionado imediatamente. Por favor, dirija-se à área de espera de clientes ou aguarde ao lado da pista. Obrigado!`
                      : brand.id === 'ymcactx'
                      ? `O ${selectedPastor.name} foi acionado imediatamente. Por favor, aguarde confortavelmente na recepção ou área de convivência da academia. Obrigado!`
                      : brand.type === 'synagogue'
                      ? `O ${selectedPastor.name} foi acionado imediatamente. Por favor, aguarde confortavelmente nas poltronas localizadas no saguão principal de recepção.`
                      : `O ${selectedPastor.name} foi acionado imediatamente. Por favor, contorne o balcão esquerdo e aguarde confortavelmente nas poltronas de acolhimento localizadas no saguão principal do Lobby. Deus abençoe!`}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-16 w-full text-white font-black rounded-xl mt-4 transition-colors cursor-pointer text-base uppercase tracking-wider shadow-md"
                    style={{
                      backgroundColor: brand.primaryColor,
                      boxShadow: `0 4px 12px ${brand.primaryColor}40`
                    }}
                  >
                    Fechar e Concluir
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left Column: Description & WhatsApp Input */}
                  <div className="space-y-6 flex flex-col justify-center">
                    <p className="text-sm text-slate-650 font-semibold bg-slate-50/60 rounded-2xl p-4 border border-slate-200 leading-relaxed">
                      {brand.id === 'imocarwash'
                        ? `Ao confirmar a solicitação, o ${brand.termPastor.toLowerCase()} de plantão virá ao seu encontro para ajudá-lo na pista.`
                        : brand.id === 'ymcactx'
                        ? `Ao confirmar a solicitação, o ${brand.termPastor.toLowerCase()} entrará em contato para agendar o seu atendimento.`
                        : brand.type === 'synagogue'
                        ? 'Ao confirmar a solicitação, o rabino de plantão se organizará para recebê-lo de forma individual em nossa sala reservada de estudos e orientação.'
                        : 'Ao confirmar o atendimento, o pastor de plantão se organizará para recebê-lo de forma individual em nossa sala reservada de aconselhamento.'}
                    </p>

                    <div className="space-y-2 text-left">
                      <label className="block text-sm uppercase tracking-widest font-black text-brand-red ml-1">
                        Seu WhatsApp para Contato
                      </label>
                      <div className="w-full h-16 px-5 rounded-2xl border-2 border-slate-300 bg-slate-50 font-bold text-slate-800 flex items-center text-xl shadow-inner">
                        {formatPhone(userPhone) || <span className="text-slate-400 font-normal">Digite seu celular</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Keypad */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-6">
                    <NumericKeypad 
                      onKeyPress={handleKeypadPress} 
                      onConfirm={handleScheduleSubmit} 
                      confirmLabel={brand.id === 'imocarwash' ? 'Chamar Operador' : brand.id === 'ymcactx' ? 'Chamar Treinador' : brand.type === 'synagogue' ? 'Chamar Rabino' : 'Solicitar Atendimento'}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

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

      {/* Empty space block footer padding */}
      <footer className="h-28 w-full" />

    </div>
  );
}

