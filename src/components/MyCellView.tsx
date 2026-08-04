import React, { useState } from 'react';
import { CellGroup } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import NumericKeypad from './NumericKeypad';
import { HeaderClock } from './LiveClock';
import { BrandConfig, hexToRgb } from '../utils/brand';
import { Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface MyCellViewProps {
  onBack: () => void;
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
}

export default function MyCellView({ onBack, onGoHome, brand, lang }: MyCellViewProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [activeCellModal, setActiveCellModal] = useState<CellGroup | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  // Neighbors select list computed dynamically from brand's groups
  const neighborhoods = ['Todos', ...Array.from(new Set(brand.cellGroups.map((c) => c.neighborhood)))];

  const filteredCells = selectedNeighborhood === 'Todos'
    ? brand.cellGroups
    : brand.cellGroups.filter((c) => c.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase()));

  const handleNeighborhoodSelect = (n: string) => {
    playTapSound();
    setSelectedNeighborhood(n);
  };

  const handleCellModalOpen = (cell: CellGroup) => {
    playTapSound();
    setActiveCellModal(cell);
  };

  const handleCloseModal = () => {
    playTapSound();
    setActiveCellModal(null);
    setPhoneNumber('');
    setIsJoined(false);
  };

  const handleKeypadPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setPhoneNumber((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setPhoneNumber('');
      return;
    }
    
    // Clean to keep digits only and limit size
    const clean = (phoneNumber + char).replace(/\D/g, '');
    if (clean.length <= 11) {
      setPhoneNumber(clean);
    }
  };

  const formatPhone = (raw: string) => {
    if (!raw) return '';
    const clean = raw.replace(/\D/g, '');
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleSubmitAddress = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      alert('Por favor, informe um número de celular com WhatsApp válido (DDD + Número).');
      return;
    }

    // Save registration to localStorage
    const newReg = {
      id: `cell_${Date.now()}`,
      name: `Visita ao grupo ${activeCellModal?.name || ''}`,
      phone: phoneNumber,
      email: '-',
      type: `${brand.termConnect}: Solicitação de Localização`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    setIsJoined(true);
    playSuccessSound();
  };

  const handleGoBack = () => {
    playTapSound();
    onBack();
  };

  return (
    <div 
      className="relative min-h-screen bg-brand-light text-[#191c1e] flex flex-col justify-between overflow-x-hidden font-sans submodule-view"
      style={{
        '--color-brand-red': brand.primaryColor,
        '--color-brand-red-hover': brand.primaryColorHover,
        '--color-brand-red-rgb': hexToRgb(brand.primaryColor)
      } as React.CSSProperties}
    >
      
      {/* Dynamic client-specific identity background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none transition-all duration-500"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&fit=crop&q=80)`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">Encontre seu {brand.termConnect}</h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main Content frame */}
      <main className="flex-grow pt-28 pb-32 px-6 md:px-20 max-w-[1550px] mx-auto w-full flex flex-col justify-center relative z-10">
        
        {/* Neighborhood selectors line */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 mb-6 overflow-x-auto border border-slate-200 scrollbar-none">
          {neighborhoods.map((n) => {
            const isSelected = selectedNeighborhood === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => handleNeighborhoodSelect(n)}
                className={`py-3 px-6 rounded-xl font-black text-xs md:text-sm tracking-wider uppercase transition-all duration-150 whitespace-nowrap cursor-pointer flex-grow text-center active:scale-[0.96] ${
                  isSelected 
                    ? 'bg-brand-dark text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center mt-[-1rem] mb-6 flex items-center justify-center gap-1 select-none">
          <span className="material-symbols-outlined !text-sm">swipe_left</span>
          <span>Deslize para ver todas as regiões</span>
        </div>

        {/* Banner Card de Pequenos Grupos */}
        <div 
          className="w-full h-48 rounded-3xl overflow-hidden mb-8 shadow-sm border border-slate-200 bg-cover bg-center flex flex-col justify-end p-6 md:p-8 relative"
          style={{ backgroundImage: `url(${brand.id === 'imocarwash' ? 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&fit=crop&q=80' : brand.type === 'synagogue' ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop&q=80' : 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&fit=crop&q=80'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-0" />
          <div className="relative z-10 text-left">
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase">
              {brand.termConnects} {brand.name}
            </h2>
            <p className="text-xs text-white/80 font-semibold mt-1">
              {brand.id === 'imocarwash'
                ? `Conheça os nossos programas de lavagem em andamento e as localizações das pistas de serviço.`
                : brand.type === 'synagogue'
                ? `Participe de um grupo de estudos perto de você e viva uma verdadeira comunhão em ${brand.campusName}.`
                : `Encontre um(a) ${brand.termConnect.toLowerCase()} perto de você e viva uma verdadeira comunhão em ${brand.campusName}.`}
            </p>
          </div>
        </div>

        {/* Cells Layout list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCells.length > 0 ? (
            filteredCells.map((cell) => (
              <div
                key={cell.id}
                className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-8 border-2 border-slate-200 shadow-sm flex flex-col justify-between items-stretch hover:border-brand-red hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 min-h-[300px]"
                id={`cell-${cell.id}`}
              >
                {/* Background image related to client virtual identity inside button */}
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.10] pointer-events-none"
                  style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
                />
                <div className="relative z-10 flex flex-col justify-between h-full flex-grow">
                  <div>
                    <div className="flex justify-end items-start mb-3">
                      <span className="material-symbols-fill text-brand-red !text-2xl">hub</span>
                    </div>

                    <h3 className="text-2xl font-black text-brand-dark tracking-tight leading-tight uppercase">
                      {cell.name}
                    </h3>
                    
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
                        <span className="material-symbols-outlined !text-lg text-slate-400">person</span>
                        <span>Responsável: <strong className="text-brand-dark">{cell.leader}</strong></span>
                      </div>

                      <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
                        <span className="material-symbols-outlined !text-lg text-slate-400">schedule</span>
                        <span>{cell.day} às {cell.hour}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCellModalOpen(cell)}
                    className="w-full h-16 text-white font-black text-xs uppercase tracking-wider rounded-xl mt-6 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-transparent hover:opacity-90"
                    style={{
                      backgroundColor: brand.primaryColor,
                      boxShadow: `0 4px 12px ${brand.primaryColor}30`
                    }}
                  >
                    <span>{brand.id === 'imocarwash' ? 'Saber Mais' : brand.type === 'synagogue' ? 'Quero Participar' : 'Quero Visitar'}</span>
                    <span className="material-symbols-outlined !text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium space-y-2 bg-slate-50 border border-slate-200 rounded-3xl">
              <span className="material-symbols-outlined !text-5xl text-slate-300">block</span>
              <p>Nenhum grupo cadastrado nesta região no momento.</p>
            </div>
          )}
        </div>

      </main>

      {/* Address pop-up request modal */}
      {activeCellModal && (
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
                <h3 className="text-xl font-bold uppercase tracking-tight">{activeCellModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative z-10 p-6 md:p-8 overflow-y-auto flex-grow">
              {isJoined ? (
                <div className="text-center space-y-4 py-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined !text-3xl font-black">done</span>
                  </div>
                  <h4 className="text-xl font-black text-brand-dark">
                    {brand.id === 'imocarwash' ? 'Detalhes Enviados!' : 'Local Enviado!'}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {brand.id === 'imocarwash'
                      ? `As instruções da pista e detalhes sobre a/o ${activeCellModal.name} foram enviados por WhatsApp para o número `
                      : `O local completo e as orientações de ${activeCellModal.leader} foram enviados por WhatsApp para o número `}
                    <span className="font-bold text-brand-dark">{formatPhone(phoneNumber)}</span>.
                    {brand.id === 'imocarwash' ? ' Obrigado pela preferência!' : ' Seja muito bem-vindo!'}
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="h-16 w-full text-white font-black rounded-xl mt-4 cursor-pointer text-base hover:scale-[1.02] active:scale-[0.96] transition-all shadow-md uppercase tracking-wider"
                    style={{
                      backgroundColor: brand.primaryColor,
                      boxShadow: `0 4px 12px ${brand.primaryColor}40`
                    }}
                  >
                    Fechar Janela
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left Column: Description & WhatsApp Input */}
                  <div className="space-y-6 flex flex-col justify-center">
                    <p className="text-sm text-slate-650 font-semibold bg-red-50/60 rounded-2xl p-4 border border-red-100 leading-relaxed">
                      {brand.id === 'imocarwash'
                        ? 'Enviaremos os detalhes do clube de lavagem e cupons de desconto diretamente por WhatsApp.'
                        : brand.type === 'synagogue'
                        ? 'Por segurança de nossos membros, enviamos o local das preces e shiurim exclusivamente por WhatsApp.'
                        : 'Por segurança de nossos pequenos grupos, enviamos o endereço completo exclusivamente por WhatsApp.'}
                    </p>

                    <div className="space-y-2 text-left">
                      <label className="block text-sm uppercase tracking-widest font-black text-brand-red ml-1">
                        Seu WhatsApp / Celular
                      </label>
                      <div className="w-full h-16 px-5 rounded-2xl border-2 border-slate-300 bg-slate-50 font-bold text-slate-800 flex items-center text-xl shadow-inner">
                        {formatPhone(phoneNumber) || <span className="text-slate-400 font-normal">Digite seu celular</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Keypad */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-6">
                    <NumericKeypad 
                      onKeyPress={handleKeypadPress} 
                      onConfirm={handleSubmitAddress} 
                      confirmLabel={brand.id === 'imocarwash' ? 'Solicitar Detalhes' : brand.type === 'synagogue' ? 'Solicitar Local' : 'Solicitar Endereço'}
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

      {/* Spacing empty footer padding footer */}
      <footer className="h-28 w-full" />

    </div>
  );
}
