import React, { useState } from 'react';
import { ViewState, CheckinState } from '../types';
import { churchMembers } from '../data';
import { playTapSound, playSuccessSound } from '../utils/audio';
import NumericKeypad from './NumericKeypad';
import VirtualKeyboard from './VirtualKeyboard';
import { HeaderClock } from './LiveClock';
import { BrandConfig } from '../utils/brand';
import { Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface CheckinViewProps {
  onBack: () => void;
  onSuccess: () => void;
  brand: BrandConfig;
  lang: Lang;
}

export default function CheckinView({ onBack, onSuccess, brand, lang }: CheckinViewProps) {
  const [method, setMethod] = useState<'qr' | 'phone' | 'name'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMethodSelect = (m: 'qr' | 'phone' | 'name') => {
    playTapSound();
    setMethod(m);
  };

  const handlePhoneKeyPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setPhoneNumber((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setPhoneNumber('');
      return;
    }

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

  const handleNameKeyPress = (char: string) => {
    setSelectedMember(null);
    if (char === 'BACKSPACE') {
      setNameSearch((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setNameSearch('');
      return;
    }
    if (char === 'SPACE') {
      setNameSearch((prev) => prev + ' ');
      return;
    }
    
    if (nameSearch.length < 30) {
      setNameSearch((prev) => prev + char);
    }
  };

  const filteredMembers = churchMembers.filter((m) =>
    m.toLowerCase().includes(nameSearch.toLowerCase())
  );

  const handleConfirmCheckin = () => {
    if (method === 'phone' && phoneNumber.length < 10) {
      alert('Por favor, informe um telefone válido com código de área.');
      return;
    }
    if (method === 'name' && !selectedMember) {
      alert('Por favor, busque e selecione um membro da lista para realizar o check-in.');
      return;
    }

    // Save registration to localStorage
    const newReg = {
      id: `checkin_${Date.now()}`,
      name: method === 'name' ? selectedMember : (method === 'phone' ? `Telefone: ${phoneNumber}` : 'Checkin QR Code'),
      phone: method === 'phone' ? phoneNumber : '-',
      email: '-',
      type: `${brand.termCult}: Entrada Confirmada`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    playSuccessSound();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1500);
  };

  const handleGoBack = () => {
    playTapSound();
    onBack();
  };

  return (
    <div className="relative min-h-screen bg-brand-light text-[#191c1e] flex flex-col justify-between overflow-x-hidden font-sans submodule-view">
      
      {/* Dynamic client-specific identity background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none transition-all duration-500"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&fit=crop&q=80)`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">
            {brand.id === 'imocarwash'
              ? 'Check-in de Lavagem'
              : brand.id === 'ymcactx'
              ? 'Check-in de Treino'
              : brand.type === 'synagogue'
              ? 'Check-in do Shabat'
              : `Check-in do ${brand.termCult}`}
          </h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-grow pt-28 pb-32 px-6 md:px-20 max-w-[1550px] mx-auto w-full flex flex-col justify-center relative z-10">
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 border-t-4 border-brand-red border-solid rounded-full animate-spin" />
            <h3 className="font-bold text-xl text-brand-dark tracking-tight">Processando Check-in...</h3>
            <p className="text-[#5c6066]">Aguarde um momento enquanto confirmamos sua presença.</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDEBAR PANEL: Event presentation box */}
            <div className="relative overflow-hidden col-span-12 lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[380px] p-2">
              {/* Background image related to client virtual identity inside panel */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col h-full justify-between flex-grow">
                {/* Event Cover Image */}
                <div className="relative h-56 w-full shrink-0">
                  <img
                    className="h-full w-full object-cover"
                    src={brand.bgUrl}
                    alt={brand.termCult}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                      {brand.id === 'imocarwash' ? 'Programas de Lavagem IMO' : brand.type === 'synagogue' ? 'Serviços do Shabat' : `Celebração Especial ${brand.name}`}
                    </h2>
                  </div>
                </div>

                {/* Event Meta specifics */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-3 text-slate-700">
                      <span className="material-symbols-outlined text-brand-red !text-2xl">schedule</span>
                      <div>
                        <p className="font-bold text-sm text-brand-dark">Horário de entrada</p>
                        <p className="text-xs text-slate-500">Acesso liberado 30 min antes do início</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-slate-700">
                      <span className="material-symbols-outlined text-brand-red !text-2xl">pin_drop</span>
                      <div>
                        <p className="font-bold text-sm text-brand-dark">Localização</p>
                        <p className="text-xs text-slate-500">{brand.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50/50 rounded-2xl p-4 border border-dashed border-brand-red/20 text-xs text-slate-500 font-medium bg-white/60">
                    <p className="font-bold text-slate-700 mb-1">Problemas no check-in?</p>
                    {brand.id === 'imocarwash'
                      ? 'Por favor, solicite suporte a um de nossos operadores de pista para auxílio imediato.'
                      : brand.id === 'ymcactx'
                      ? 'Por favor, solicite suporte na recepção da academia para auxílio imediato.'
                      : 'Por favor, solicite suporte a um de nossos voluntários e recepcionistas no saguão para auxílio imediato.'}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT MAIN PANEL: Active checking selector and methods tabs */}
            <div className="relative overflow-hidden col-span-12 lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between p-8 md:p-10">
              {/* Background image related to client virtual identity inside panel */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 flex flex-col h-full justify-between flex-grow w-full">
                
                {/* Selector Custom Navigation Tabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1.5 justify-between w-full border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('qr')}
                    className={`flex-1 py-5 text-center rounded-xl font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.96] ${
                      method === 'qr' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-xl">qr_code_scanner</span>
                    <span>QR Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMethodSelect('phone')}
                    className={`flex-1 py-5 text-center rounded-xl font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.96] ${
                      method === 'phone' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-xl">phone_iphone</span>
                    <span>Celular</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMethodSelect('name')}
                    className={`flex-1 py-5 text-center rounded-xl font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.96] ${
                      method === 'name' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-xl">badge</span>
                    <span>Pelo Nome</span>
                  </button>
                </div>

                {/* Dynamic TAB contents */}
                <div className="flex-grow py-6 flex flex-col justify-center">
                  
                  {/* METHOD 1: QR Code Ticket Scanner simulator */}
                  {method === 'qr' && (
                    <div className="space-y-6 text-center animate-fade-in flex flex-col items-center">
                      <p className="text-sm font-black text-slate-600 uppercase tracking-widest">
                        Aproxime seu celular com o QR Code
                      </p>

                      {/* Viewfinder simulated layout */}
                      <div 
                        onClick={handleConfirmCheckin}
                        className="relative w-64 h-64 border-4 border-brand-red rounded-3xl overflow-hidden bg-black/5 cursor-pointer group shadow-inner transition-all hover:scale-[1.05] active:scale-[0.95]"
                        title="Clique para simular um escaneamento bem-sucedido!"
                      >
                        {/* Animated scan bar */}
                        <div className="absolute left-0 w-full h-1 bg-brand-red scan-line rounded-full opacity-80" />
                        
                        {/* Target lines around */}
                        <div className="absolute inset-8 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center flex-col opacity-60">
                          <span className="material-symbols-outlined !text-6xl text-slate-400 group-hover:scale-110 transition-transform">
                            qr_code_scanner
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2 group-hover:text-brand-red duration-205">
                            Toque para scannear
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                        Simule o escaneamento tocando no leitor acima
                      </p>
                    </div>
                  )}

                  {/* METHOD 2: Phone Input Numeric Keypad approach */}
                  {method === 'phone' && (
                    <div className="space-y-4 text-center animate-fade-in w-full max-w-sm mx-auto">
                      <div className="bg-slate-100 rounded-2xl py-3 px-6 text-2xl font-black text-brand-dark border-2 border-slate-200 tracking-widest min-h-[56px] flex items-center justify-center shadow-inner">
                        {formatPhone(phoneNumber) || 'Digite seu telefone'}
                      </div>

                      <NumericKeypad 
                        onKeyPress={handlePhoneKeyPress} 
                        onConfirm={handleConfirmCheckin} 
                        confirmLabel="Realizar Check-in"
                      />
                    </div>
                  )}

                  {/* METHOD 3: Search name database check-in */}
                  {method === 'name' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left items-stretch">
                      
                      {/* Left Column: Search Input & Results List */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-xs font-black uppercase tracking-wider text-brand-red ml-1">
                            Consulte seu Nome
                          </span>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={nameSearch}
                              placeholder="Busque por letras..."
                              className="w-full h-12 px-4 bg-slate-100 rounded-xl border border-slate-300 font-bold text-slate-800 pointer-events-none"
                            />
                            {nameSearch && (
                              <button
                                type="button"
                                onClick={() => { playTapSound(); setNameSearch(''); setSelectedMember(null); }}
                                className="absolute right-3 top-2.5 hover:bg-slate-200 rounded-full w-7 h-7 flex items-center justify-center font-bold text-slate-500 cursor-pointer text-xs"
                                title="Limpar busca"
                              >
                                X
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Filter result members */}
                        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex-grow min-h-[160px] max-h-[220px] overflow-y-auto space-y-1">
                          {filteredMembers.length > 0 ? (
                            filteredMembers.map((m) => {
                              const isSelected = selectedMember === m;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => { playTapSound(); setSelectedMember(m); }}
                                  className={`w-full text-left font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97] ${
                                    isSelected 
                                      ? 'bg-brand-red text-white font-black shadow-sm' 
                                      : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? brand.primaryColor : undefined,
                                  }}
                                >
                                  {m}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-center text-xs text-slate-400 py-10">
                              {brand.id === 'imocarwash'
                                ? 'Nenhum cliente encontrado com as iniciais atuais.'
                                : brand.id === 'ymcactx'
                                ? 'Nenhum atleta encontrado com as iniciais atuais.'
                                : 'Nenhum membro encontrado com as iniciais atuais.'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Virtual Keyboard */}
                      <div className="flex items-center justify-center pt-4 md:pt-0">
                        <div className="w-full border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-6">
                          <VirtualKeyboard onKeyPress={handleNameKeyPress} />
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Central Bottom Action triggered inside right panel */}
                {method === 'name' && (
                  <button
                    type="button"
                    onClick={handleConfirmCheckin}
                    className="w-full h-16 text-white font-black text-lg flex items-center justify-center rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.96] shrink-0 hover:opacity-90 animate-fade-in"
                    style={{
                      backgroundColor: brand.primaryColor,
                      boxShadow: `0 8px 20px -6px ${brand.primaryColor}80`
                    }}
                  >
                    Confirmar Presença
                  </button>
                )}

              </div>
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

      {/* Footer empty layout for alignment spacing */}
      <footer className="h-28 w-full" />

    </div>
  );
}
