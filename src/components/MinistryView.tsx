import React, { useState } from 'react';
import { playTapSound, playSuccessSound } from '../utils/audio';
import VirtualKeyboard from './VirtualKeyboard';
import NumericKeypad from './NumericKeypad';
import { HeaderClock } from './LiveClock';
import { BrandConfig } from '../utils/brand';
import { Lang } from '../utils/i18n';
import { saveRegistration } from '../lib/registrations';

interface MinistryViewProps {
  onBack: () => void;
  onGoHome: () => void;
  brand: BrandConfig;
  lang: Lang;
}

interface Ministry {
  id: string;
  name: string;
  tag: string;
  icon: string;
  color: string;
  wide?: boolean;
  desc: string;
}

export default function MinistryView({ onBack, onGoHome, brand, lang }: MinistryViewProps) {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeField, setActiveField] = useState<'name' | 'phone' | null>('name');
  const [isSuccess, setIsSuccess] = useState(false);

  const getMinistriesData = (): Ministry[] => {
    if (brand.id === 'beityaacov') {
      return [
        {
          id: 'chazanut',
          name: 'Chazanut (Canto Litúrgico)',
          tag: 'Serviço da Sinagoga',
          icon: 'music_note',
          color: 'bg-indigo-900 border-indigo-950',
          wide: true,
          desc: 'Sirva auxiliando nas preces cantadas e nos serviços litúrgicos da nossa sinagoga.',
        },
        {
          id: 'recepcao',
          name: 'Recepção (Hachnassat Orchim)',
          tag: 'Acolhimento',
          icon: 'front_hand',
          color: 'bg-[#d4af37] border-yellow-600',
          desc: 'Acolha calorosamente e diga Shalom Aleichem a todos os membros e visitantes que entram.',
        },
        {
          id: 'estudos',
          name: 'Estudos da Torá',
          tag: 'Shiurim & Classes',
          icon: 'import_contacts',
          color: 'bg-brand-charcoal border-slate-800',
          desc: 'Apoie na organização de shiurim, palestras e aulas de Torá e Cabalá.',
        },
        {
          id: 'seguranca',
          name: 'Zelo & Segurança',
          tag: 'Organização',
          icon: 'verified_user',
          color: 'bg-rose-950 border-rose-900',
          desc: 'Zele pelo ambiente das preces, garantindo que todas as famílias estejam seguras.',
        },
        {
          id: 'kids',
          name: 'Beit Midrash Kids',
          tag: 'Educação Infantil',
          icon: 'child_care',
          color: 'bg-emerald-900 border-emerald-950',
          desc: 'Auxilie no ensino infantil e atividades recreativas sobre as tradições judaicas.',
        },
        {
          id: 'chesed',
          name: 'Chesed & Ação Social',
          tag: 'Ajuda Comunitária',
          icon: 'diversity_1',
          color: 'bg-[#0f172a] border-[#1e293b]',
          wide: true,
          desc: 'Leve cestas kosher, apoio material e dignidade às famílias necessitadas da nossa comunidade.',
        }
      ];
    }

    if (brand.id === 'universal') {
      return [
        {
          id: 'evg',
          name: 'Evangelização (EVG)',
          tag: 'Apoio Social & Fé',
          icon: 'volunteer_activism',
          color: 'bg-indigo-900 border-indigo-950',
          wide: true,
          desc: 'Leve a palavra de fé e apoio humanitário nos hospitais, presídios e comunidades.',
        },
        {
          id: 'fju',
          name: 'Força Jovem Universal (FJU)',
          tag: 'Jovens',
          icon: 'groups',
          color: 'bg-brand-red border-brand-red-hover',
          desc: 'Auxilie a juventude com atividades de música, esporte, teatro, dança e integração.',
        },
        {
          id: 'caleb',
          name: 'Grupo Caleb',
          tag: 'Melhor Idade',
          icon: 'elderly',
          color: 'bg-[#cf2e2e] border-red-800',
          desc: 'Preste acolhimento, carinho e assistência à melhor idade em nossas reuniões de fé.',
        },
        {
          id: 'unisocial',
          name: 'Grupo Unisocial',
          tag: 'Ação Social',
          icon: 'diversity_1',
          color: 'bg-[#0f172a] border-[#1e293b]',
          wide: true,
          desc: 'Leve alimentos, roupas, amor e dignidade para as comunidades necessitadas da região.',
        },
        {
          id: 'recepcao',
          name: 'Zelo & Organização',
          tag: 'Boas-Vindas',
          icon: 'front_hand',
          color: 'bg-brand-charcoal border-slate-800',
          desc: 'Apoie na recepção do Templo, orientação de assentos e segurança do saguão.',
        }
      ];
    }

    if (brand.id === 'imocarwash') {
      return [
        {
          id: 'vip_club',
          name: 'Clube IMO VIP',
          tag: 'Assinatura Mensal',
          icon: 'workspace_premium',
          color: 'bg-indigo-900 border-indigo-950',
          wide: true,
          desc: 'Acesso a lavagens simples ilimitadas por uma assinatura fixa mensal, ideal para o dia a dia.',
        },
        {
          id: 'xtr_club',
          name: 'Clube Ceramic XTR',
          tag: 'Assinatura Premium',
          icon: 'auto_clean_detail',
          color: 'bg-[#0067b1] border-sky-800',
          desc: 'Acesso ilimitado à nossa melhor lavagem com película protetora Ceramic XTR, brilho e proteção adicionais.',
        },
        {
          id: 'uber_taxi',
          name: 'Clube Motorista Pro',
          tag: 'Parceiro Táxi & Uber',
          icon: 'local_taxi',
          color: 'bg-[#fcaf17] border-yellow-600',
          desc: 'Descontos exclusivos em pacotes de lavagens, ideal para motoristas de aplicativos e taxistas.',
        },
        {
          id: 'corporativo',
          name: 'Frota Corporativa',
          tag: 'Soluções de Frota',
          icon: 'local_shipping',
          color: 'bg-emerald-900 border-emerald-950',
          desc: 'Faturamento simplificado e controle completo de lavagens para veículos de empresas e frotas de entrega.',
        },
        {
          id: 'imo_verde',
          name: 'Clube IMO Verde',
          tag: 'Sustentabilidade',
          icon: 'forest',
          color: 'bg-[#1e293b] border-slate-800',
          desc: 'Participe do nosso programa de compensação de carbono e apoie a reciclagem de até 80% da água usada nas lavagens.',
        }
      ];
    }

    if (brand.id === 'ymcactx') {
      return [
        {
          id: 'tecnico',
          name: 'Auxiliar Técnico',
          tag: 'Esportes & Liderança',
          icon: 'sports',
          color: 'bg-indigo-900 border-indigo-950',
          wide: true,
          desc: 'Auxilie nossos treinadores na preparação de treinos, instruções de jogo e desenvolvimento de atletas.',
        },
        {
          id: 'quadra',
          name: 'Apoio de Quadra (Staff)',
          tag: 'Logística',
          icon: 'sports_basketball',
          color: 'bg-[#fcaf17] border-yellow-600',
          desc: 'Ajude na organização da quadra, cronômetro, placar e distribuição de águas e coletes.',
        },
        {
          id: 'pais',
          name: 'Comitê de Pais',
          tag: 'Integração',
          icon: 'diversity_3',
          color: 'bg-brand-charcoal border-slate-800',
          desc: 'Faça parte da organização de eventos da academia, recepção de novos atletas e reuniões.',
        },
        {
          id: 'lanches',
          name: 'Logística & Lanches',
          tag: 'Bem-estar',
          icon: 'restaurant',
          color: 'bg-emerald-900 border-emerald-950',
          desc: 'Apoie no fornecimento e distribuição de lanches saudáveis e hidratação nos dias de jogo.',
        },
        {
          id: 'midia',
          name: 'Fotografia & Mídia',
          tag: 'Comunicação',
          icon: 'photo_camera',
          color: 'bg-rose-950 border-rose-900',
          desc: 'Registre as partidas, treinos e eventos da academia para divulgação e mídias sociais.',
        },
        {
          id: 'socorros',
          name: 'Primeiros Socorros',
          tag: 'Saúde',
          icon: 'medical_services',
          color: 'bg-[#0f172a] border-[#1e293b]',
          wide: true,
          desc: 'Ofereça suporte preventivo e atendimento básico de primeiros socorros em treinos e torneios.',
        }
      ];
    }

    // Default or Atitude/Lagoinha
    return [
      {
        id: 'louvor',
        name: 'Louvor & Adoração',
        tag: 'Ministério de Música',
        icon: 'music_note',
        color: 'bg-indigo-900 border-indigo-950',
        wide: true,
        desc: `Sirva ao Senhor tocando instrumentos ou cantando no altar de comunhão da ${brand.name}.`,
      },
      {
        id: 'recepcao',
        name: 'Recepção',
        tag: 'Boas-Vindas',
        icon: 'front_hand',
        color: 'bg-brand-red border-brand-red-hover',
        desc: `A primeira impressão que acolhe vidas. Diga "Bem-vindo!" a quem entra na casa de Deus.`,
      },
      {
        id: 'midia',
        name: 'Mídia & Som',
        tag: 'Tecnologia & Projeção',
        icon: 'videocam',
        color: 'bg-brand-charcoal border-slate-800',
        desc: 'Transmissão online, áudio das bandas, fotografia e projeções de letras.',
      },
      {
        id: 'infantil',
        name: `${brand.name} Kids`,
        tag: 'Educação Infantil',
        icon: 'child_care',
        color: 'bg-emerald-900 border-emerald-950',
        desc: 'Ensine o caminho do Senhor de forma divertida para as nossas amadas crianças.',
      },
      {
        id: 'seguranca',
        name: 'Segurança & Apoio',
        tag: 'Zelo & Organização',
        icon: 'verified_user',
        color: 'bg-rose-950 border-rose-900',
        desc: 'Garantir que todos os membros e suas famílias adorem em paz e com segurança.',
      },
      {
        id: 'intercessao',
        name: 'Intercessão',
        tag: 'Espiritualidade & Clamor',
        icon: 'volunteer_activism',
        color: 'bg-amber-950 border-amber-900',
        wide: true,
        desc: 'Sustente o corpo de Cristo e os cultos em oração nos bastidores e vigílias santas.',
      },
      {
        id: 'social',
        name: 'Ação Social',
        tag: 'Apoio Comunitário',
        icon: 'diversity_1',
        color: 'bg-[#0f172a] border-[#1e293b]',
        wide: true,
        desc: `Leve alimentos, roupas, amor e dignidade para as comunidades carentes de ${brand.campusName} e região.`,
      }
    ];
  };

  const ministries = getMinistriesData();

  const handleMinistrySelect = (min: Ministry) => {
    playTapSound();
    setSelectedMinistry(min);
    setActiveField('name'); // focus name first
  };

  const handleClose = () => {
    playTapSound();
    setSelectedMinistry(null);
    setName('');
    setPhone('');
    setActiveField('name');
    setIsSuccess(false);
  };

  const handleKeyboardPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setName((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setName('');
      return;
    }
    if (char === 'SPACE') {
      setName((prev) => prev + ' ');
      return;
    }
    
    // limit name length
    if (name.length < 40) {
      setName((prev) => prev + char);
    }
  };

  const handleKeypadPress = (char: string) => {
    if (char === 'BACKSPACE') {
      setPhone((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'CLEAR') {
      setPhone('');
      return;
    }
    
    const clean = (phone + char).replace(/\D/g, '');
    if (clean.length <= 11) {
      setPhone(clean);
    }
  };

  const formatPhone = (raw: string) => {
    if (!raw) return '';
    const clean = raw.replace(/\D/g, '');
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleRegisterSubmit = () => {
    if (!name.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      alert('Por favor, informe seu celular com WhatsApp válido.');
      return;
    }

    // Save registration to localStorage
    const newReg = {
      id: `ministry_${Date.now()}`,
      name: name,
      phone: phone,
      email: '-',
      type: `${brand.id === 'imocarwash' ? 'Plano/Clube' : brand.type === 'synagogue' ? 'Atividade' : 'Voluntariado'}: ${selectedMinistry?.name || ''}`,
      brandId: brand.id,
      date: new Date().toISOString()
    };

    void saveRegistration(newReg);

    setIsSuccess(true);
    playSuccessSound();
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
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1559027615-cd264cde14b8?w=1600&fit=crop&q=80)`, filter: 'blur(3px)' }}
      />
      <div 
        className="absolute inset-0 z-0 backdrop-blur-lg pointer-events-none" 
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-brand-red-rgb), 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(244, 246, 248, 0.95) 100%)`
        }}
      />

      <header className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-10 py-3 md:py-4 border-b border-[#eceef1] flex items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark">{brand.id === 'imocarwash' ? 'Fidelidade IMO' : 'Quero Participar'}</h1>
        </div>

        <div className="shrink-0">
          <HeaderClock />
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-grow pt-24 pb-32 px-6 md:px-20 max-w-[1550px] mx-auto w-full flex flex-col justify-center relative z-10">
        <header className="mb-8 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
            {brand.id === 'imocarwash' ? 'Selecione o seu plano ou clube' : brand.type === 'synagogue' ? 'Escolha onde você deseja atuar' : 'Escolha onde você deseja servir'}
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            {brand.id === 'imocarwash'
              ? `Adira a um de nossos planos de assinatura e clubes de vantagens e aproveite descontos em todas as lavagens.`
              : brand.type === 'synagogue'
              ? `Descubra o seu propósito de mitzvá e faça parte da nossa comunidade ativa em ${brand.campusName}. Escolha uma das áreas abaixo para participar.`
              : `Descubra o seu propósito de voluntariado e faça parte da nossa comunidade ativa em ${brand.campusName}. Escolha uma das áreas abaixo para participar.`}
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
          {ministries.map((min) => (
            <button
              key={min.id}
              type="button"
              onClick={() => handleMinistrySelect(min)}
              className={`col-span-12 md:col-span-6 text-white rounded-[2.5rem] p-10 text-left flex flex-col justify-between cursor-pointer hover:scale-[1.05] active:scale-[0.96] transition-all duration-300 shadow-md border ${min.color} min-h-[290px] relative overflow-hidden group`}
            >
              {/* Background image related to client virtual identity inside button */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.10] pointer-events-none"
                style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(1px)' }}
              />
              <div className="relative z-10 flex justify-between items-start w-full">
                <span className="material-symbols-outlined !text-6xl text-brand-red group-hover:scale-115 transition-transform">
                  {min.icon}
                </span>
              </div>
              
              <div className="relative z-10 mt-6">
                <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-wide leading-tight break-words">{min.name}</h3>
              </div>

              <div className="absolute right-4 bottom-4 opacity-10">
                <span className="material-symbols-outlined !text-[150px]">{min.icon}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Application overlay modal */}
      {selectedMinistry && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Background image related to client virtual identity inside modal */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
              style={{ backgroundImage: `url(${brand.bgUrl})`, filter: 'blur(2px)' }}
            />
            
            {/* Modal Heading header with ministry colored top */}
            <div className={`relative z-10 p-6 text-white ${selectedMinistry.color} border-b flex justify-between items-center relative shrink-0`}>
              <div>
                <h3 className="text-xl font-bold">{selectedMinistry.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body form view */}
            <div className="relative z-10 p-6 md:p-8 overflow-y-auto flex-grow">
              {isSuccess ? (
                <div className="text-center space-y-4 py-6 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <span className="material-symbols-outlined !text-3xl font-black">done</span>
                  </div>
                  <h4 className="text-xl font-black text-brand-dark">{brand.id === 'imocarwash' ? 'Adesão Confirmada!' : 'Inscrição Realizada!'}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {brand.id === 'imocarwash'
                      ? `Parabéns pela adesão ao ${selectedMinistry.name}! Enviamos os detalhes do seu plano e cupom de ativação para o WhatsApp ${formatPhone(phone)}.`
                      : brand.type === 'synagogue'
                      ? `O coordenador da atividade de ${selectedMinistry.name} entrará em contato com você pelo WhatsApp ${formatPhone(phone)} em breve com os próximos passos.`
                      : `O líder do ministério de ${selectedMinistry.name} entrará em contato com você pelo WhatsApp ${formatPhone(phone)} em breve com os próximos passos.`}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-16 w-full text-white font-black rounded-xl mt-4 cursor-pointer text-base hover:scale-[1.02] active:scale-[0.96] transition-all shadow-md uppercase tracking-wider border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                      boxShadow: `0 4px 12px ${brand.primaryColor}40`
                    }}
                  >
                    {brand.id === 'imocarwash'
                      ? 'Voltar aos Clubes'
                      : brand.type === 'synagogue'
                      ? 'Voltar às Atividades'
                      : 'Voltar aos Ministérios'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Left Column: Form Details & Inputs */}
                  <div className="space-y-4 flex flex-col justify-start">
                    <p className="text-xs text-slate-500 font-semibold mb-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                      {brand.id === 'imocarwash'
                        ? 'Confirme a adesão abaixo. Nossos atendentes entrarão em contato para ativar seu plano.'
                        : brand.type === 'synagogue'
                        ? 'Inscreva-se abaixo. Seus dados serão encaminhados diretamente para os responsáveis pela coordenação.'
                        : 'Inscreva-se abaixo. Seus dados serão encaminhados diretamente para o líder responsável pelo preenchimento de vagas.'}
                    </p>

                    {/* Name Input Box */}
                    <div 
                      onClick={() => { playTapSound(); setActiveField('name'); }}
                      className="space-y-1.5 text-left p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white"
                      style={{ borderColor: activeField === 'name' ? brand.primaryColor : '#e2e8f0' }}
                    >
                      <label 
                        className="block text-xs uppercase tracking-widest font-black ml-1"
                        style={{ color: activeField === 'name' ? brand.primaryColor : '#94a3b8' }}
                      >
                        Seu Nome Completo
                      </label>
                      <div className="h-10 font-bold text-slate-800 flex items-center text-md">
                        {name || <span className="text-slate-400 font-normal">Toque para digitar seu nome</span>}
                      </div>
                    </div>

                    {/* Phone Input Box */}
                    <div 
                      onClick={() => { playTapSound(); setActiveField('phone'); }}
                      className="space-y-1.5 text-left p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white"
                      style={{ borderColor: activeField === 'phone' ? brand.primaryColor : '#e2e8f0' }}
                    >
                      <label 
                        className="block text-xs uppercase tracking-widest font-black ml-1"
                        style={{ color: activeField === 'phone' ? brand.primaryColor : '#94a3b8' }}
                      >
                        Seu WhatsApp / Telefone
                      </label>
                      <div className="h-10 font-bold text-slate-800 flex items-center text-md">
                        {formatPhone(phone) || <span className="text-slate-400 font-normal">Toque para digitar seu celular</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {activeField === 'name' && (
                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 h-16 border border-slate-300 text-slate-650 rounded-xl font-bold hover:bg-slate-50 cursor-pointer text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => { playTapSound(); setActiveField('phone'); }}
                          className="flex-1 h-16 text-white rounded-xl font-black cursor-pointer text-base flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.96] transition-all shadow-md border border-white/10"
                          style={{
                            background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.primaryColorHover} 100%)`,
                            boxShadow: `0 4px 12px ${brand.primaryColor}40`
                          }}
                        >
                          <span>Próximo</span>
                          <span className="material-symbols-outlined !text-base">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Keyboard */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-6 flex items-center justify-center min-h-[300px]">
                    {activeField === 'name' && (
                      <VirtualKeyboard onKeyPress={handleKeyboardPress} />
                    )}
                    {activeField === 'phone' && (
                      <div className="w-full max-w-sm">
                        <NumericKeypad 
                          onKeyPress={handleKeypadPress} 
                          onConfirm={handleRegisterSubmit} 
                          confirmLabel={brand.id === 'imocarwash' ? 'Confirmar Adesão' : 'Confirmar Inscrição'}
                        />
                      </div>
                    )}
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

      {/* Empty block footer layout spacing */}
      <footer className="h-28 w-full" />

    </div>
  );
}
