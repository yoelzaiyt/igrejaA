import React, { useEffect } from 'react';
import { playSuccessSound, playTapSound } from '../utils/audio';
import { BrandConfig } from '../utils/brand';
import { Lang, t } from '../utils/i18n';

interface CheckinSuccessViewProps {
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
}

export default function CheckinSuccessView({ onGoHome, brand, lang }: CheckinSuccessViewProps) {
  useEffect(() => {
    playSuccessSound();
  }, []);

  const handleFinish = () => {
    playTapSound();
    onGoHome();
  };

  return (
    <div className="relative min-h-screen w-full select-none overflow-y-auto bg-brand-dark text-white flex items-center justify-center font-sans py-12">
      
      {/* Sacred Light Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover opacity-25 mix-blend-overlay transition-transform duration-10000"
          src={brand.bgUrl}
          alt={brand.name}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark/95" />
      </div>

      {/* Main feedback central card */}
      <main className="relative z-10 w-full max-w-2xl px-6 text-center space-y-6 animate-fade-in">
        
        {/* Glowing Success ring checkmark */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="absolute -inset-2 rounded-full border border-emerald-500/30 animate-ping duration-2000" />
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white/40">
            <span className="material-symbols-outlined !text-5xl font-bold">done_all</span>
          </div>
        </div>

        <div className="space-y-4">
          <span className="bg-brand-red text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block shadow-md border border-brand-red-hover">
            {brand.id === 'ymcactx'
              ? t('specialEventLabelSports', lang)
              : brand.id === 'imocarwash'
              ? t('specialEventLabelCarWash', lang)
              : (brand.type === 'synagogue' ? t('specialEventLabelSynagogue', lang) : `${t('specialEventLabelDefault', lang)} ${brand.name}`)}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
            {t('checkinSuccessTitle', lang)}
          </h2>
        </div>

        {/* Glass confirmation card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md mx-auto space-y-2">
          <p className="text-lg font-semibold text-white/95">
            {t('checkinSuccessPresence', lang)}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {brand.id === 'ymcactx'
              ? t('checkinSuccessDescSports', lang)
              : brand.id === 'imocarwash'
              ? t('checkinSuccessDescCarWash', lang)
              : (brand.type === 'synagogue' ? t('checkinSuccessDescSynagogue', lang) : t('checkinSuccessDescDefault', lang))}
          </p>
        </div>

        {/* YMCA App Download Panel */}
        {brand.id === 'ymcactx' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md mx-auto text-left space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-md font-black text-white">
                {t('downloadTitle', lang)}
              </h3>
              <p className="text-[11px] text-white/70 font-semibold max-w-xs mx-auto">
                {t('downloadDesc', lang)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Android Download */}
              <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
                <div className="bg-white p-1.5 rounded-lg">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.netpulse.mobile.ymcaofgreaterwilliamsoncounty%26hl%3Den_US%26gl%3DUS%26pli%3D1"
                    alt="Android App QR Code"
                    className="w-[100px] h-[100px] object-contain"
                    loading="lazy"
                  />
                </div>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.netpulse.mobile.ymcaofgreaterwilliamsoncounty&hl=en_US&gl=US&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg hover:scale-105 active:scale-95 shadow-md text-[10px] cursor-pointer text-center border border-white/5"
                >
                  <span className="material-symbols-outlined !text-sm">android</span>
                  <span>Google Play</span>
                </a>
              </div>

              {/* iOS Download */}
              <div className="flex flex-col items-center p-3 bg-white/5 border border-white/15 rounded-xl space-y-2.5">
                <div className="bg-white p-1.5 rounded-lg">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fymca-ctx%2Fid1485537145"
                    alt="iOS App QR Code"
                    className="w-[100px] h-[100px] object-contain"
                    loading="lazy"
                  />
                </div>
                <a 
                  href="https://apps.apple.com/us/app/ymca-ctx/id1485537145"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg hover:scale-105 active:scale-95 shadow-md text-[10px] cursor-pointer text-center border border-white/5"
                >
                  <span className="material-symbols-outlined !text-sm">phone_iphone</span>
                  <span>App Store</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Bottom anchor action button */}
        <button
          type="button"
          onClick={handleFinish}
          className="h-16 px-12 text-white font-extrabold text-lg rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-3 cursor-pointer relative z-10 border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
            boxShadow: `0 10px 25px ${brand.primaryColor}55`
          }}
        >
          <span>{t('checkinSuccessFinishBtn', lang)}</span>
          <span className="material-symbols-outlined !text-2xl font-bold">arrow_forward</span>
        </button>

      </main>

    </div>
  );
}
