import React, { useState } from 'react';
import { ViewState, PrayerRequest } from '../types';
import { playSuccessSound, playTapSound } from '../utils/audio';
import VirtualKeyboard from './VirtualKeyboard';
import { HeaderClock } from './LiveClock';
import { BrandConfig, hexToRgb } from '../utils/brand';
import { t, Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface PrayerRequestViewProps {
  onBack: () => void;
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
}

export default function PrayerRequestView({ onBack, onGoHome, brand, lang }: PrayerRequestViewProps) {
  const [request, setRequest] = useState<PrayerRequest>({
    isAnonymous: true,
    name: '',
    message: ''
  });

  const [activeField, setActiveField] = useState<'name' | 'message' | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleKeyboardPress = (char: string) => {
    const currentField = activeField;
    if (!currentField) return;
    const val = request[currentField] || '';
    
    if (char === 'BACKSPACE') {
      setRequest((prev) => ({ ...prev, [currentField]: val.slice(0, -1) }));
      return;
    }
    if (char === 'SPACE') {
      setRequest((prev) => ({ ...prev, [currentField]: val + ' ' }));
      return;
    }
    if (char === 'CLEAR') {
      setRequest((prev) => ({ ...prev, [currentField]: '' }));
      return;
    }
    
    // Limits
    if (currentField === 'name' && val.length >= 30) return;
    if (currentField === 'message' && val.length >= 300) return;

    setRequest((prev) => ({ ...prev, [currentField]: val + char }));
  };

  const handleSubmit = () => {
    if (!request.isAnonymous && !request.name.trim()) {
      alert(lang === 'en' ? 'Please enter your name or submit anonymously.' : lang === 'es' ? 'Por favor, ingrese su nombre o envíe de forma anónima.' : 'Por favor, informe seu nome ou mude o pedido para Anônimo.');
      return;
    }
    if (!request.message.trim()) {
      alert((brand.id === 'ymcactx' || brand.id === 'imocarwash') ? t('supportAlertSports', lang) : brand.type === 'synagogue' ? t('supportAlertSynagogue', lang) : t('supportAlertDefault', lang));
      return;
    }

    // Save registration to localStorage
    const newReg = {
      id: `prayer_${Date.now()}`,
      name: request.isAnonymous ? (lang === 'en' ? 'Anonymous Message' : lang === 'es' ? 'Mensaje Anónimo' : 'Pedido Anônimo') : request.name,
      phone: '-',
      email: '-',
      type: (brand.id === 'ymcactx' || brand.id === 'imocarwash') ? `Fale Conosco: ${request.message.slice(0, 40)}...` : brand.type === 'synagogue' ? `Pedido de Rezas: ${request.message.slice(0, 40)}...` : `Pedido de Oração: ${request.message.slice(0, 40)}...`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    setIsSent(true);
    playSuccessSound();
  };

  const handleToggleAnonymous = (anon: boolean) => {
    playTapSound();
    setRequest(prev => ({ ...prev, isAnonymous: anon }));
    if (activeField !== null) {
      if (anon) {
        setActiveField('message');
      } else {
        setActiveField('name');
      }
    }
  };

  const handleFieldFocus = (field: 'name' | 'message') => {
    playTapSound();
    setActiveField(field);
  };

  const handleGoBack = () => {
    playTapSound();
    onBack();
  };

  if (isSent) {
    return (
      <div 
        className="relative min-h-screen bg-brand-light text-[#191c1e] flex flex-col items-center justify-center p-6 animate-fade-in font-sans"
        style={{
          '--color-brand-red': brand.primaryColor,
          '--color-brand-red-hover': brand.primaryColorHover,
          '--color-brand-red-rgb': hexToRgb(brand.primaryColor)
        } as React.CSSProperties}
      >
        
        {/* Dynamic client-specific identity background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.20] pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(3px)' }}
        />
        <div 
          className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
          style={{
            background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
          }}
        />
        <div className="relative overflow-hidden w-full max-w-4xl text-center p-12 md:p-16 rounded-3xl shadow-xl border border-white/60 animate-fade-in bg-white/90 backdrop-blur-md">
          {/* Background image related to client virtual identity inside card */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.15] pointer-events-none"
            style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
          />
          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-fill !text-6xl text-white">favorite</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight mb-2">
                {(brand.id === 'ymcactx' || brand.id === 'imocarwash') ? t('supportSuccessTitleSports', lang) : (lang === 'en' ? 'Request Sent!' : lang === 'es' ? '¡Pedido Enviado!' : 'Pedido Enviado!')}
              </h2>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                {brand.id === 'imocarwash'
                  ? t('supportSuccessDescCarWash', lang)
                  : brand.id === 'ymcactx'
                  ? t('supportSuccessDescSports', lang)
                  : brand.type === 'synagogue'
                  ? t('supportSuccessDescSynagogue', lang)
                  : t('supportSuccessDescDefault', lang)}
              </p>
            </div>

            <div className="bg-white/40 border border-slate-200 p-6 rounded-2xl italic text-slate-500 max-w-md mx-auto">
              {brand.id === 'imocarwash'
                ? 'IMO Car Wash — O seu veículo limpo e protegido.'
                : brand.id === 'ymcactx'
                ? t('supportQuoteSports', lang)
                : brand.type === 'synagogue'
                ? t('supportQuoteSynagogue', lang)
                : t('supportQuoteDefault', lang)}
            </div>

            <button
              type="button"
              onClick={onGoHome}
              className="h-16 px-12 bg-[#e30613] hover:bg-[#c61118] text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2 cursor-pointer text-base uppercase tracking-wider"
            >
              <span>{t('home', lang)}</span>
              <span className="material-symbols-outlined !text-xl">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1600&fit=crop&q=80)`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">
            {brand.id === 'imocarwash' ? t('prayerTitleCarWash', lang) : brand.id === 'ymcactx' ? t('prayerTitleSports', lang) : brand.type === 'synagogue' ? 'Pedido de Rezas' : 'Pedido de Oração'}
          </h1>
          <span className="material-symbols-outlined text-brand-red !text-3xl sm:!text-4xl shrink-0 hidden sm:block">volunteer_activism</span>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main Container Input Elements */}
      <main className="flex-grow flex flex-col pt-32 pb-[310px] px-6 md:px-20 max-w-[1550px] mx-auto w-full justify-center relative z-10">
        <div className="grid grid-cols-12 gap-6 w-full items-stretch">
          
          {/* Left panel - Name Identification Toggle */}
          <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col justify-between">
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
              />
              <div className="relative z-10 space-y-4">
                <span className="text-xs uppercase tracking-widest font-black text-slate-500 ml-1 block">
                  Identificação
                </span>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleToggleAnonymous(true)}
                    className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-all active:scale-[0.96] ${
                      request.isAnonymous
                        ? 'bg-brand-dark text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    {t('anonymous', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAnonymous(false)}
                    className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-all active:scale-[0.96] ${
                      !request.isAnonymous
                        ? 'bg-brand-dark text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    {t('withName', lang)}
                  </button>
                </div>

                {/* Slide down Name Field if not anonymous */}
                {!request.isAnonymous && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-xs uppercase tracking-widest font-black text-brand-red ml-1">
                      {lang === 'en' ? 'Your name or initials' : lang === 'es' ? 'Su nombre o iniciales' : 'Seu nome ou iniciais'}
                    </label>
                    <div
                      onClick={() => handleFieldFocus('name')}
                      className={`w-full h-14 px-4 bg-slate-50 rounded-xl border-2 font-bold text-slate-800 flex items-center shadow-inner cursor-pointer transition-all ${
                        activeField === 'name' ? 'border-brand-red bg-white' : 'border-slate-200'
                      }`}
                    >
                      {request.name || <span className="text-slate-400 font-normal">{t('tapToType', lang)}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden text-xs text-[#5c6066]/90 bg-red-50/50 rounded-3xl p-5 border border-brand-red/10 leading-relaxed shadow-sm">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
              />
              <div className="relative z-10">
                <div className="flex gap-2 text-brand-red font-black mb-1.5 uppercase tracking-wider text-[10px]">
                  <span className="material-symbols-outlined !text-base">lock</span>
                  <span>Sigilo Absoluto</span>
                </div>
                {brand.id === 'imocarwash'
                  ? t('supportInfoCarWash', lang)
                  : brand.id === 'ymcactx'
                  ? t('supportInfoSports', lang)
                  : brand.type === 'synagogue'
                  ? t('supportInfoSynagogue', lang)
                  : t('supportInfoDefault', lang)}
              </div>
            </div>
          </div>

          {/* Right panel - Request Textarea Box */}
          <div className="relative overflow-hidden col-span-12 lg:col-span-8 flex flex-col bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm gap-2">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
              style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
            />
            <div className="relative z-10 flex flex-col flex-grow h-full w-full gap-2">
              <label className="block text-xs uppercase tracking-widest font-black text-brand-red ml-1 shrink-0">
                {(brand.id === 'ymcactx' || brand.id === 'imocarwash') ? t('supportWriteMessageSports', lang) : 'Escreva aqui sua intenção ou necessidade'}
              </label>
              <div
                onClick={() => handleFieldFocus('message')}
                className={`w-full flex-grow p-6 rounded-2xl border-2 bg-slate-50/80 text-lg font-bold text-slate-800 flex flex-wrap content-start shadow-inner cursor-pointer overflow-y-auto min-h-[220px] transition-all ${
                  activeField === 'message' ? 'border-brand-red bg-white' : 'border-slate-200'
                }`}
              >
                {request.message || <span className="text-slate-400 font-normal">
                  {(brand.id === 'ymcactx' || brand.id === 'imocarwash') ? t('supportPlaceholderSports', lang) : (lang === 'en' ? 'Write your request here...' : lang === 'es' ? 'Escriba su petición aquí...' : 'Escreva seu pedido aqui...')}
                </span>}
              </div>

              {/* Submit Button Inside Card */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white font-black px-12 h-16 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.96] transition-all cursor-pointer text-lg"
                  style={{
                    backgroundColor: brand.primaryColor,
                    boxShadow: `0 8px 20px -6px ${brand.primaryColor}80`
                  }}
                >
                  <span>{(brand.id === 'ymcactx' || brand.id === 'imocarwash') ? t('supportSubmitSports', lang) : t('supportSubmitDefault', lang)}</span>
                  <span className="material-symbols-outlined !text-xl">send</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Screen Integrated Tactile Full Portuguese Keyboard layout */}
      {activeField && (
        <div className="fixed bottom-28 left-0 w-full bg-[#eceef1] shadow-[0_-8px_32px_rgba(0,0,0,0.08)] py-4 px-6 z-40 transition-transform duration-300">
          <VirtualKeyboard onKeyPress={handleKeyboardPress} />
        </div>
      )}

      {/* Footer Navigation (Transparent, floating only the Back button on bottom right) */}
      <footer className="fixed bottom-8 right-6 md:right-20 z-45">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center gap-3 text-white font-black px-12 h-20 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 text-xl md:text-2xl shadow-xl border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
            boxShadow: `0 10px 25px ${brand.primaryColor}55`
          }}
        >
          <span className="material-symbols-outlined !text-3xl font-black">arrow_back</span>
          <span>{t('back', lang)}</span>
        </button>
      </footer>

    </div>
  );
}
