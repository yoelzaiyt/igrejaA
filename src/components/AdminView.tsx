import React, { useEffect, useState } from 'react';
import { BrandConfig, getStoredBrands, saveStoredBrands } from '../utils/brand';
import { Pastor, CellGroup, Slide } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { speakText } from '../utils/tts';
import { Lang } from '../utils/i18n';
import { clearRegistrations, deleteRegistration, fetchRegistrations, TotemRegistration } from '../lib/registrations';

interface AdminViewProps {
  onBack: () => void;
  brand: BrandConfig;
  lang: Lang;
}

type ActiveTab = 'general' | 'visual' | 'vocabulary' | 'pastors' | 'cells' | 'slides' | 'registrations';

export default function AdminView({ onBack, brand: activeBrand, lang }: AdminViewProps) {
  const [allBrands, setAllBrands] = useState<Record<string, BrandConfig>>(() => getStoredBrands());
  const [selectedBrandId, setSelectedBrandId] = useState<string>(activeBrand.id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [registrations, setRegistrations] = useState<TotemRegistration[]>([]);

  useEffect(() => {
    void fetchRegistrations().then(setRegistrations);
  }, []);

  // Selected brand state
  const currentEditingBrand = allBrands[selectedBrandId] || allBrands.atitude;

  // Pastor adding state
  const [newPastor, setNewPastor] = useState<Omit<Pastor, 'id'>>({
    name: '',
    role: '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80',
    available: true,
  });

  // Cell adding state
  const [newCell, setNewCell] = useState<Omit<CellGroup, 'id'>>({
    name: '',
    neighborhood: '',
    day: 'Quarta-feira',
    hour: '20:00',
    leader: '',
    phone: '',
  });

  // Slide adding state
  const [newSlide, setNewSlide] = useState<Slide>({
    bgUrl: '',
    verse: '',
    verseRef: '',
  });

  const handleFieldChange = (key: keyof BrandConfig, value: any) => {
    setAllBrands((prev) => {
      const updated = { ...prev };
      updated[selectedBrandId] = {
        ...currentEditingBrand,
        [key]: value,
      };
      return updated;
    });
  };

  const handleAddNewBrand = () => {
    playSuccessSound();
    const newId = `new_church_${Date.now()}`;
    const newConfig: BrandConfig = {
      id: newId,
      name: 'Nova Igreja',
      campusName: 'Sede',
      logoUrl: 'https://static.wixstatic.com/media/33ca7d_8cb69c0ba912431985faa315621a35eb~mv2_d_3985_1810_s_2.png',
      bgUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=1600&auto=format&fit=crop&q=80',
      primaryColor: '#ea492e',
      primaryColorHover: '#d13a20',
      accentColor: '#116dff',
      glowColor: 'rgba(234, 73, 46, 0.25)',
      badgeBgColor: '#ffb22a',
      badgeTextColor: '#0a0a0a',
      badgeLabel: 'Nova Igreja',
      accentSplashColor: '#ffb22a',
      type: 'church',
      termPastor: 'Pastor',
      termPastors: 'Pastores',
      termPastoral: 'Atendimento Pastoral',
      termCult: 'Celebração',
      termCults: 'Celebrações de Domingo',
      termDonation: 'Dízimo ou Oferta',
      termDonations: 'Dízimos e Ofertas',
      termConnect: 'Grupo',
      termConnects: 'Grupos de Conexão',
      termMember: 'Novo Membro',
      location: 'Endereço da Igreja, 123',
      wifi: 'Wifi_Igreja',
      pixKey: 'pix@igreja.org',
      pastors: [],
      cellGroups: [],
    };

    setAllBrands((prev) => ({
      ...prev,
      [newId]: newConfig,
    }));
    setSelectedBrandId(newId);
    speakText('Nova igreja adicionada. Preencha as informações necessárias.');
  };

  const handleDeleteBrand = (id: string) => {
    if (Object.keys(allBrands).length <= 1) {
      alert('Não é possível remover a última igreja do sistema.');
      return;
    }
    if (confirm('Deseja realmente remover esta igreja do sistema?')) {
      playTapSound();
      setAllBrands((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      if (selectedBrandId === id) {
        setSelectedBrandId(Object.keys(allBrands).filter((k) => k !== id)[0]);
      }
      speakText('Igreja removida com sucesso.');
    }
  };

  const handleSaveAll = (shouldRedirect: boolean = false) => {
    playSuccessSound();
    saveStoredBrands(allBrands);
    speakText('Configurações salvas no sistema!');
    
    if (shouldRedirect) {
      // Refresh current page with the client parameter and admin flag
      window.location.search = `?client=${selectedBrandId}&admin=true`;
    } else {
      alert('Configurações salvas com sucesso localmente!');
    }
  };

  // Pastors Management
  const handleAddPastor = () => {
    if (!newPastor.name || !newPastor.role) {
      alert('Preencha o nome e o cargo do pastor/rabino.');
      return;
    }
    playSuccessSound();
    const id = `pastor_${Date.now()}`;
    const updatedPastors = [...(currentEditingBrand.pastors || []), { ...newPastor, id }];
    handleFieldChange('pastors', updatedPastors);
    setNewPastor({
      name: '',
      role: '',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80',
      available: true,
    });
    speakText('Líder adicionado.');
  };

  const handleDeletePastor = (pastorId: string) => {
    playTapSound();
    const updatedPastors = (currentEditingBrand.pastors || []).filter((p) => p.id !== pastorId);
    handleFieldChange('pastors', updatedPastors);
  };

  // Cells Management
  const handleAddCell = () => {
    if (!newCell.name || !newCell.leader || !newCell.phone) {
      alert('Preencha o nome da célula/GC, líder e telefone de contato.');
      return;
    }
    playSuccessSound();
    const id = `cell_${Date.now()}`;
    const updatedCells = [...(currentEditingBrand.cellGroups || []), { ...newCell, id }];
    handleFieldChange('cellGroups', updatedCells);
    setNewCell({
      name: '',
      neighborhood: '',
      day: 'Quarta-feira',
      hour: '20:00',
      leader: '',
      phone: '',
    });
    speakText('Grupo de conexão adicionado.');
  };

  const handleDeleteCell = (cellId: string) => {
    playTapSound();
    const updatedCells = (currentEditingBrand.cellGroups || []).filter((c) => c.id !== cellId);
    handleFieldChange('cellGroups', updatedCells);
  };

  // Slides Management
  const handleAddSlide = () => {
    if (!newSlide.bgUrl || !newSlide.verse) {
      alert('Preencha a URL da imagem e o texto (aviso/versículo).');
      return;
    }
    playSuccessSound();
    const updatedSlides = [...(currentEditingBrand.slides || []), { ...newSlide }];
    handleFieldChange('slides', updatedSlides);
    setNewSlide({ bgUrl: '', verse: '', verseRef: '' });
    speakText('Slide adicionado.');
  };

  const handleDeleteSlide = (index: number) => {
    playTapSound();
    const updatedSlides = (currentEditingBrand.slides || []).filter((_, i) => i !== index);
    handleFieldChange('slides', updatedSlides);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-[#191c1e] flex flex-col font-sans">
      
      {/* Admin Header */}
      <header className="bg-white border-b border-[#e1e4e8] px-6 py-4 fixed top-0 left-0 w-full z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-yellow-400 rounded-xl flex items-center justify-center font-black shadow-md">
            <span className="material-symbols-outlined !text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Painel Administrativo</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Multi-Client Totem Controller</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveAll(false)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-slate-300 active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined !text-lg">save</span>
            <span>Salvar</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSaveAll(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined !text-lg animate-pulse">pageview</span>
            <span>Salvar e Visualizar</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-300 mx-2" />

          <button
            type="button"
            onClick={() => {
              playTapSound();
              onBack();
            }}
            style={{
              '--hover-bg': activeBrand.primaryColor
            } as React.CSSProperties}
            className="flex items-center gap-1 bg-[#191c1e] hover:bg-[var(--hover-bg)] hover:text-white text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined !text-lg">close</span>
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow pt-24 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Church/Client List Sidebar */}
        <aside className="w-full md:w-80 bg-white border-r border-[#e1e4e8] flex flex-col h-1/3 md:h-full overflow-y-auto p-4 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">Igrejas & Clientes</h2>
            <button
              type="button"
              onClick={handleAddNewBrand}
              className="flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 rounded-full w-8 h-8 cursor-pointer shadow-sm"
              title="Adicionar Igreja/Cliente"
            >
              <span className="material-symbols-outlined !text-lg font-black">add</span>
            </button>
          </div>

          <div className="space-y-2 flex-grow">
            {Object.values(allBrands).map((b: any) => (
              <div
                key={b.id}
                onClick={() => {
                  playTapSound();
                  setSelectedBrandId(b.id);
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  selectedBrandId === b.id
                    ? 'border-slate-800 bg-slate-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 w-4/5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                    <img className="max-w-full max-h-full object-contain" src={b.logoUrl} alt={b.name} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-extrabold text-sm text-slate-800 truncate">{b.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{b.campusName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBrand(b.id);
                  }}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Excluir"
                >
                  <span className="material-symbols-outlined !text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Form Editor Panel */}
        <main className="flex-grow bg-[#f3f5f8] flex flex-col h-2/3 md:h-full overflow-hidden p-6">
          
          {/* Tab Navigation */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-[#e1e4e8] mb-6 shrink-0 overflow-x-auto gap-1">
            {[
              { id: 'general', label: 'Dados Gerais', icon: 'info' },
              { id: 'visual', label: 'Identidade Visual', icon: 'palette' },
              { id: 'vocabulary', label: 'Vocabulário', icon: 'dictionary' },
              { id: 'pastors', label: 'Pastores/Líderes', icon: 'groups' },
              { id: 'cells', label: 'Células/GCs', icon: 'hub' },
              { id: 'slides', label: 'Avisos/Carrossel', icon: 'view_carousel' },
              { id: 'registrations', label: 'Cadastros & Solicitações', icon: 'list_alt' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveTab(tab.id as ActiveTab);
                }}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined !text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Fields Scrolling Area */}
          <div className="flex-grow bg-white border border-[#e1e4e8] rounded-3xl p-6 shadow-sm overflow-y-auto">
            
            {/* TAB 1: GENERAL DATA */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">info</span>
                  <span>Informações Gerais da Instituição</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Código de Identificação (Slug URL)</label>
                    <input
                      type="text"
                      disabled={true}
                      value={currentEditingBrand.id}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-400 font-bold text-sm cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 font-semibold">O código de acesso é usado no link, por exemplo: ?client={currentEditingBrand.id}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Nome da Igreja/Sinagoga</label>
                    <input
                      type="text"
                      value={currentEditingBrand.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Campus / Sede / Região</label>
                    <input
                      type="text"
                      value={currentEditingBrand.campusName}
                      onChange={(e) => handleFieldChange('campusName', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Tipo de Instituição</label>
                    <select
                      value={currentEditingBrand.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    >
                      <option value="church">Igreja Cristã</option>
                      <option value="synagogue">Sinagoga Judaica</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Chave PIX para Contribuições</label>
                    <input
                      type="text"
                      value={currentEditingBrand.pixKey}
                      onChange={(e) => handleFieldChange('pixKey', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Nome da Rede Wi-Fi</label>
                    <input
                      type="text"
                      value={currentEditingBrand.wifi}
                      onChange={(e) => handleFieldChange('wifi', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Endereço de Localização</label>
                    <input
                      type="text"
                      value={currentEditingBrand.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL IDENTITY */}
            {activeTab === 'visual' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">palette</span>
                  <span>Identidade Visual & Cores</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b pb-1">Mídias e Imagens</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">URL do Logo (PNG Transparente preferível)</label>
                      <input
                        type="text"
                        value={currentEditingBrand.logoUrl}
                        onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">URL da Imagem de Fundo (Splash screen)</label>
                      <input
                        type="text"
                        value={currentEditingBrand.bgUrl}
                        onChange={(e) => handleFieldChange('bgUrl', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b pb-1">Paleta de Cores</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Cor Principal</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.primaryColor}
                            onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.primaryColor}
                            onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Principal (Hover)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.primaryColorHover}
                            onChange={(e) => handleFieldChange('primaryColorHover', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.primaryColorHover}
                            onChange={(e) => handleFieldChange('primaryColorHover', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Cor de Destaque</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.accentColor}
                            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.accentColor}
                            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Glow da Splash</label>
                        <input
                          type="text"
                          value={currentEditingBrand.glowColor}
                          onChange={(e) => handleFieldChange('glowColor', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-mono text-xs focus:border-slate-800 outline-none"
                          placeholder="e.g. rgba(234, 73, 46, 0.25)"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Pill Badge Fundo</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.badgeBgColor}
                            onChange={(e) => handleFieldChange('badgeBgColor', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.badgeBgColor}
                            onChange={(e) => handleFieldChange('badgeBgColor', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Pill Badge Texto</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.badgeTextColor}
                            onChange={(e) => handleFieldChange('badgeTextColor', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.badgeTextColor}
                            onChange={(e) => handleFieldChange('badgeTextColor', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Glow do Badge Pill</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentEditingBrand.accentSplashColor}
                            onChange={(e) => handleFieldChange('accentSplashColor', e.target.value)}
                            className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={currentEditingBrand.accentSplashColor}
                            onChange={(e) => handleFieldChange('accentSplashColor', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Rótulo do Badge (Nome)</label>
                        <input
                          type="text"
                          value={currentEditingBrand.badgeLabel}
                          onChange={(e) => handleFieldChange('badgeLabel', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VOCABULARY */}
            {activeTab === 'vocabulary' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">dictionary</span>
                  <span>Customização de Linguagem e Vocabulário</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Pastor (Singular)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termPastor}
                      onChange={(e) => handleFieldChange('termPastor', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Pastor (Plural)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termPastors}
                      onChange={(e) => handleFieldChange('termPastors', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Pastoral (Atendimento)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termPastoral}
                      onChange={(e) => handleFieldChange('termPastoral', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Culto (Singular)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termCult}
                      onChange={(e) => handleFieldChange('termCult', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Culto (Plural)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termCults}
                      onChange={(e) => handleFieldChange('termCults', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Contribuição (Singular)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termDonation}
                      onChange={(e) => handleFieldChange('termDonation', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Contribuição (Plural)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termDonations}
                      onChange={(e) => handleFieldChange('termDonations', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Célula (Singular)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termConnect}
                      onChange={(e) => handleFieldChange('termConnect', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Célula (Plural)</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termConnects}
                      onChange={(e) => handleFieldChange('termConnects', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Termo Membro</label>
                    <input
                      type="text"
                      value={currentEditingBrand.termMember}
                      onChange={(e) => handleFieldChange('termMember', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:border-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEADERS & PASTORS */}
            {activeTab === 'pastors' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">groups</span>
                  <span>Gerenciar Líderes / {currentEditingBrand.termPastors}</span>
                </h3>

                {/* Form to Add New Pastor */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Adicionar Novo Líder</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do Líder"
                      value={newPastor.name}
                      onChange={(e) => setNewPastor(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Cargo ou Função (Ex: Coordenador)"
                      value={newPastor.role}
                      onChange={(e) => setNewPastor(prev => ({ ...prev, role: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="URL da Foto"
                      value={newPastor.photoUrl}
                      onChange={(e) => setNewPastor(prev => ({ ...prev, photoUrl: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPastor.available}
                        onChange={(e) => setNewPastor(prev => ({ ...prev, available: e.target.checked }))}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>Disponível para Plantão</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddPastor}
                      className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 shadow-sm active:scale-95"
                    >
                      Adicionar Líder
                    </button>
                  </div>
                </div>

                {/* Pastor List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Líderes Cadastrados</h4>
                  
                  {(!currentEditingBrand.pastors || currentEditingBrand.pastors.length === 0) ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs">
                      Nenhum líder cadastrado nesta unidade.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentEditingBrand.pastors.map((p: any) => (
                        <div key={p.id} className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-3 truncate">
                            <img className="w-12 h-12 rounded-xl object-cover border border-slate-200" src={p.photoUrl} alt={p.name} />
                            <div className="truncate">
                              <h5 className="font-extrabold text-sm text-slate-800 truncate">{p.name}</h5>
                              <p className="text-xs text-slate-400 font-bold truncate">{p.role}</p>
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${p.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {p.available ? 'No Templo (Disponível)' : 'Indisponível'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePastor(p.id)}
                            className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: CELL GROUPS */}
            {activeTab === 'cells' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">hub</span>
                  <span>Gerenciar {currentEditingBrand.termConnects}</span>
                </h3>

                {/* Form to Add New Cell */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Adicionar Novo Grupo</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nome da Célula/GC"
                      value={newCell.name}
                      onChange={(e) => setNewCell(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={newCell.neighborhood}
                      onChange={(e) => setNewCell(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dia (Ex: Quarta-feira)"
                      value={newCell.day}
                      onChange={(e) => setNewCell(prev => ({ ...prev, day: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Horário (Ex: 20:00)"
                      value={newCell.hour}
                      onChange={(e) => setNewCell(prev => ({ ...prev, hour: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Líder responsável"
                      value={newCell.leader}
                      onChange={(e) => setNewCell(prev => ({ ...prev, leader: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Telefone de contato"
                      value={newCell.phone}
                      onChange={(e) => setNewCell(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddCell}
                      className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 shadow-sm active:scale-95"
                    >
                      Adicionar Grupo
                    </button>
                  </div>
                </div>

                {/* Cell List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Grupos Ativos</h4>
                  
                  {(!currentEditingBrand.cellGroups || currentEditingBrand.cellGroups.length === 0) ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs">
                      Nenhum grupo ou célula cadastrado nesta unidade.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentEditingBrand.cellGroups.map((c) => (
                        <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors">
                          <div className="space-y-1 truncate">
                            <h5 className="font-extrabold text-sm text-slate-800 truncate">{c.name}</h5>
                            <div className="text-xs font-bold text-slate-500 flex gap-2">
                              <span>📍 {c.neighborhood}</span>
                              <span>•</span>
                              <span>📅 {c.day} às {c.hour}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold">Líder: {c.leader} ({c.phone})</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCell(c.id)}
                            className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SLIDES */}
            {activeTab === 'slides' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">view_carousel</span>
                  <span>Avisos e Imagens do Carrossel (Tela Inicial)</span>
                </h3>

                {/* Form to Add New Slide */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Adicionar Novo Slide</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="URL da Imagem de Fundo (16:9 Recomendado)"
                      value={newSlide.bgUrl}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, bgUrl: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Texto do Aviso ou Versículo"
                      value={newSlide.verse}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, verse: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Referência (Opcional, Ex: João 3:16 ou Eventos)"
                      value={newSlide.verseRef}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, verseRef: e.target.value }))}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 shadow-sm active:scale-95"
                    >
                      Adicionar Slide
                    </button>
                  </div>
                </div>

                {/* Slides List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Slides Atuais</h4>
                  
                  {(!currentEditingBrand.slides || currentEditingBrand.slides.length === 0) ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs">
                      Nenhum slide cadastrado nesta unidade.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentEditingBrand.slides.map((s, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-slate-300 transition-colors">
                          <img src={s.bgUrl} alt="Slide Background" className="w-full h-32 object-cover rounded-xl border border-slate-100" />
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 truncate">
                              <h5 className="font-extrabold text-sm text-slate-800 truncate">"{s.verse}"</h5>
                              <p className="text-xs text-slate-500 font-semibold">— {s.verseRef || 'Sem referência'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(idx)}
                              className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            >
                              <span className="material-symbols-outlined !text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: REGISTRATIONS */}
            {activeTab === 'registrations' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">list_alt</span>
                    <span>Registros e Solicitações Recebidas</span>
                  </h3>
                  {registrations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja realmente limpar todos os registros do sistema?')) {
                          playTapSound();
                          void clearRegistrations().then(() => {
                            setRegistrations([]);
                            speakText('Registros apagados.');
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer text-xs border border-red-200 active:scale-95"
                    >
                      <span className="material-symbols-outlined !text-base font-black">delete_sweep</span>
                      <span>Limpar Todos</span>
                    </button>
                  )}
                </div>

                {registrations.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-405 font-bold text-xs space-y-2">
                    <span className="material-symbols-outlined !text-4xl text-slate-350">inbox</span>
                    <p>Nenhuma solicitação ou cadastro recebido no totem ainda.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="p-4">Data</th>
                            <th className="p-4">Unidade / Marca</th>
                            <th className="p-4">Nome / Contato</th>
                            <th className="p-4">WhatsApp</th>
                            <th className="p-4">E-mail</th>
                            <th className="p-4">Tipo / Módulo</th>
                            <th className="p-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                          {registrations.map((reg) => {
                            const dateFormatted = new Date(reg.date).toLocaleString('pt-BR');
                            const brandName = allBrands[reg.brandId]?.name || reg.brandId;
                            return (
                              <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 whitespace-nowrap text-slate-450">{dateFormatted}</td>
                                <td className="p-4 font-bold text-slate-800">{brandName}</td>
                                <td className="p-4 font-bold text-slate-800">{reg.name}</td>
                                <td className="p-4 font-mono">{reg.phone}</td>
                                <td className="p-4 font-mono">{reg.email}</td>
                                <td className="p-4">
                                  <span className="bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                                    {reg.type}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playTapSound();
                                      void deleteRegistration(reg.id).then(setRegistrations);
                                    }}
                                    className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                                    title="Remover Registro"
                                  >
                                    <span className="material-symbols-outlined !text-lg">delete</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
