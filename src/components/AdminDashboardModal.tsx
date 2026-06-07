import { useState, useMemo, FormEvent } from "react";
import { 
  X, 
  Settings, 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp, 
  Coins, 
  Percent, 
  ClipboardList, 
  Search, 
  Trash2, 
  Unlock, 
  Lock, 
  Sparkles, 
  FileText, 
  Check, 
  Activity, 
  HelpCircle,
  Eye,
  Star,
  Users
} from "lucide-react";

import { Listing, RentBooking, AppSettings } from "../types";

interface AdminDashboardModalProps {
  listings: Listing[];
  bookings: RentBooking[];
  settings: AppSettings;
  onClose: () => void;
  onUpdateListingVerification: (id: string, verified: boolean, featured: boolean) => void;
  onDeleteListing: (id: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateBookingStatus: (id: string, status: 'Pendente' | 'Confirmado' | 'Rejeitado', ref?: string) => void;
}

type TabType = "overview" | "settings" | "moderation" | "bookings";

export default function AdminDashboardModal({
  listings,
  bookings,
  settings,
  onClose,
  onUpdateListingVerification,
  onDeleteListing,
  onUpdateSettings,
  onUpdateBookingStatus
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [authToken, setAuthToken] = useState<string>(() => {
    return sessionStorage.getItem("mozrent_admin_token") || "";
  });
  
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Search and filter inside moderation
  const [modSearch, setModSearch] = useState("");
  const [modCategoryFilter, setModCategoryFilter] = useState<string>("tudo");

  // Local state copy of settings for form manipulation before saving
  const [taxInput, setTaxInput] = useState<number>(settings.taxPercentage);
  const [termsInput, setTermsInput] = useState<string>(settings.termsText);
  const [allowSelfReg, setAllowSelfReg] = useState<boolean>(settings.allowSelfRegistration);
  const [minDurationInput, setMinDurationInput] = useState<number>(settings.minBookingDuration);
  const [adminPinInput, setAdminPinInput] = useState<string>(settings.adminPin || "2026");
  const [showPin, setShowPin] = useState<boolean>(false);

  // Authentication validation
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validPin = settings.adminPin || "2026";
    // Checks against the dynamically configured PIN from Firestore settings or standard secondary 'admin'
    if (pinInput === validPin || pinInput === "admin") {
      setAuthToken("authorized");
      sessionStorage.setItem("mozrent_admin_token", "authorized");
      setAuthError("");
    } else {
      setAuthError("PIN de Administrador inválido! Tente novamente.");
      setPinInput("");
    }
  };

  const handleLogout = () => {
    setAuthToken("");
    sessionStorage.removeItem("mozrent_admin_token");
    setPinInput("");
  };

  // 1. CALCULATED ANALYTICS METRICS (Memoized)
  const stats = useMemo(() => {
    // Total gross volume (only confirmed bookings)
    const confirmedBookings = bookings.filter(b => b.status === "Confirmado");
    
    const rawTotalRevenue = confirmedBookings.reduce((sum, b) => {
      return sum + (b.price * b.duration);
    }, 0);

    // Platform share revenue based on settings
    const systemRevenue = (rawTotalRevenue * settings.taxPercentage) / 100;

    // Counts
    const pendingCount = bookings.filter(b => b.status === "Pendente").length;
    const confirmedCount = confirmedBookings.length;
    const rejectedCount = bookings.filter(b => b.status === "Rejeitado").length;

    // Categories Breakdown
    const categoryTotals = bookings.reduce((acc, b) => {
      const listing = listings.find(l => l.id === b.listingId);
      const cat = listing?.category || "outro";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Total view counts for listings
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

    return {
      rawTotalRevenue,
      systemRevenue,
      pendingCount,
      confirmedCount,
      rejectedCount,
      totalViews,
      categoryTotals: {
        imovel: categoryTotals["imovel"] || 0,
        veiculo: categoryTotals["veiculo"] || 0,
        equipamento: categoryTotals["equipamento"] || 0
      }
    };
  }, [bookings, listings, settings.taxPercentage]);

  // Handle Save settings
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    if (!adminPinInput.trim()) {
      alert("Erro: O PIN de administrador não pode estar em branco!");
      return;
    }
    const updated: AppSettings = {
      taxPercentage: Number(taxInput),
      termsText: termsInput,
      allowSelfRegistration: allowSelfReg,
      minBookingDuration: Number(minDurationInput),
      adminPin: adminPinInput
    };
    onUpdateSettings(updated);
    alert("Configurações guardadas na base de dados Firestore com sucesso!");
  };

  // Filter listings inside moderation tab
  const filteredModListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(modSearch.toLowerCase()) || 
                          l.landlordName.toLowerCase().includes(modSearch.toLowerCase()) ||
                          l.location.toLowerCase().includes(modSearch.toLowerCase());
    const matchesCat = modCategoryFilter === "tudo" ? true : l.category === modCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-5xl rounded-[32px] bg-white border border-black/15 shadow-2xl flex flex-col h-[90vh] overflow-hidden text-left">
        
        {/* Mozambique capulana horizontal striped bar indicator */}
        <div className="h-1.5 w-full capulana-border"></div>

        {/* MODAL TITLE HEADER BAR */}
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Settings className="w-5 h-5 text-[#FCD116] animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-black tracking-tight text-black flex items-center gap-2">
                Painel do Administrador
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Acesso Restrito
                </span>
              </h3>
              <p className="text-[10px] text-neutral-500 font-bold block">
                Monitorização financeira, ajustes de taxas, moderação e termos do MozRent
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="rounded-full bg-neutral-200/70 p-2 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* UNATHORIZED VIEW: PASSCODE PORTAL ENTRY */}
        {!authToken ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 text-center max-h-full overflow-y-auto">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/10 shadow-lg space-y-6">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#E31B23]">
                <Lock className="w-8 h-8 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-[#007A33]"></span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-serif font-black text-black">Introduza o PIN de Acesso</h4>
                <p className="text-xs text-neutral-500">
                  Este painel é confidencial e visível apenas para a equipa gestora do MozRent para monitorizar transações M-Pesa e fiscalizar anúncios.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Introduza o PIN (Ex: 2026)"
                    className="w-full text-center rounded-2xl border-2 border-dashed border-black/15 bg-neutral-50 px-4 py-3 text-base font-bold placeholder:text-neutral-400 focus:bg-white focus:border-[#007A33] focus:outline-none transition-all tracking-widest"
                    autoFocus
                  />
                  {authError && (
                    <span className="text-[11px] text-[#E31B23] font-bold mt-2 animate-bounce flex items-center justify-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{authError}</span>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#007A33] hover:bg-emerald-800 text-white font-extrabold uppercase text-xs py-3.5 rounded-full tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Entrar no Sistema
                </button>
              </form>

              <div className="pt-4 border-t border-black/5 text-[10px] text-neutral-400 font-bold flex items-center justify-center gap-1 leading-normal select-none">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FCD116]" />
                <span>Auditoria digital de segurança activa</span>
              </div>
            </div>
          </div>
        ) : (
          
          /* AUTHORIZED VIEW: COMPREHENSIVE TABS LAYOUT */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Tab selection Nav Menu (Sidebar) */}
            <div className="w-full md:w-60 bg-neutral-50/80 border-b md:border-b-0 md:border-r border-black/10 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0">
              
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                  activeTab === "overview" 
                    ? "bg-black text-white shadow-md" 
                    : "hover:bg-neutral-150 text-neutral-700"
                }`}
              >
                <TrendingUp className="w-4.5 h-4.5 text-[#007A33]" />
                <span className="whitespace-nowrap">Visão Geral & Faturação</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                  activeTab === "settings" 
                    ? "bg-black text-white shadow-md" 
                    : "hover:bg-neutral-150 text-neutral-700"
                }`}
              >
                <Settings className="w-4.5 h-4.5 text-[#FCD116]" />
                <span className="whitespace-nowrap">Definições da App</span>
              </button>

              <button
                onClick={() => setActiveTab("moderation")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                  activeTab === "moderation" 
                    ? "bg-black text-white shadow-md" 
                    : "hover:bg-neutral-150 text-neutral-700"
                }`}
              >
                <ShieldAlert className="w-4.5 h-4.5 text-[#E31B23]" />
                <span className="whitespace-nowrap">Moderação de Anúncios</span>
              </button>

              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                  activeTab === "bookings" 
                    ? "bg-black text-white shadow-md" 
                    : "hover:bg-neutral-150 text-neutral-700"
                }`}
              >
                <ClipboardList className="w-4.5 h-4.5 text-sky-650" />
                <span className="whitespace-nowrap">Todas as Reservas</span>
              </button>

              <div className="hidden md:block flex-1"></div>

              {/* Exit Admin Mode */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-black/10 text-[10px] uppercase tracking-wider font-extrabold text-red-600 hover:bg-neutral-150 transition-all w-full cursor-pointer mt-4"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Bloquear Painel</span>
              </button>

            </div>

            {/* Panel Tab View Flow */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* === TAB 1: OVERVIEW & ANALYTICS === */}
              {activeTab === "overview" && (
                <div className="space-y-6 text-left">
                  
                  {/* Revenue metrics scoreboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-[#007A33]/5 border border-[#007A33]/25 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#007A33] font-black uppercase tracking-wider block">Volume Transacionado</span>
                        <Coins className="w-4 h-4 text-[#007A33]" />
                      </div>
                      <span className="text-2xl font-black text-black tracking-tight block">
                        {stats.rawTotalRevenue.toLocaleString()} MT
                      </span>
                      <span className="text-[10px] text-neutral-500 block">Soma de reservas confirmadas</span>
                    </div>

                    <div className="bg-[#FCD116]/10 border border-[#FCD116]/40 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-orange-850 font-black uppercase tracking-wider block">Receita de Comissão (MozRent)</span>
                        <Percent className="w-4 h-4 text-orange-800" />
                      </div>
                      <span className="text-2xl font-black text-[#007A33] tracking-tight block">
                        {stats.systemRevenue.toLocaleString()} MT
                      </span>
                      <span className="text-[10px] text-neutral-600 font-bold block">
                        Taxa ativa de {settings.taxPercentage}%
                      </span>
                    </div>

                    <div className="bg-neutral-50 border border-black/5 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block">Reservas Correntes</span>
                        <ClipboardList className="w-4 h-4 text-neutral-600" />
                      </div>
                      <span className="text-2xl font-black text-black tracking-tight block">
                        {bookings.length}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        {stats.confirmedCount} Ativas | {stats.pendingCount} Pendentes
                      </span>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-600 font-black uppercase tracking-wider block">Visualizações Totais</span>
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-2xl font-black text-black tracking-tight block">
                        {stats.totalViews}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">Audiência orgânica no feed</span>
                    </div>

                  </div>

                  {/* Visual Charts Container (SVG Renderings) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* SVG Progress bar representing Booking Volume by Category */}
                    <div className="bg-white p-5 rounded-3xl border border-black/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <h4 className="text-xs font-black uppercase tracking-wide text-neutral-600">Número de Alugueres por Categoria</h4>
                        <Activity className="w-4 h-4 text-neutral-400" />
                      </div>

                      <div className="space-y-4 pt-2 text-xs">
                        
                        {/* 1. Imóveis */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-neutral-700">Imóveis / Vivendas / Quartos</span>
                            <span className="text-black font-extrabold">{stats.categoryTotals.imovel} alugueres</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-3/5 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-black text-[10px] font-bold text-white text-center rounded-full transition-all duration-1000"
                              style={{ width: `${bookings.length > 0 ? (stats.categoryTotals.imovel / bookings.length) * 100 : 0}%`, minHeight: '10px' }}
                            ></div>
                          </div>
                        </div>

                        {/* 2. Viaturas */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-neutral-700">Viaturas GD6 & Jipes 4x4</span>
                            <span className="text-black font-extrabold">{stats.categoryTotals.veiculo} alugueres</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-3/5 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-[#E31B23] text-[10px] font-bold text-white text-center rounded-full transition-all duration-1000"
                              style={{ width: `${bookings.length > 0 ? (stats.categoryTotals.veiculo / bookings.length) * 100 : 0}%`, minHeight: '10px' }}
                            ></div>
                          </div>
                        </div>

                        {/* 3. Equipamentos */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-neutral-700">Equipamento & Salões de Festa</span>
                            <span className="text-black font-extrabold">{stats.categoryTotals.equipamento} alugueres</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-3/5 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-[#007A33] text-[10px] font-bold text-white text-center rounded-full transition-all duration-1000"
                              style={{ width: `${bookings.length > 0 ? (stats.categoryTotals.equipamento / bookings.length) * 100 : 0}%`, minHeight: '10px' }}
                            ></div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bookings Status Donut simulation with SVG visual breakdown */}
                    <div className="bg-white p-5 rounded-3xl border border-black/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <h4 className="text-xs font-black uppercase tracking-wide text-neutral-600">Taxa de Conversão e Sucesso</h4>
                        <span className="text-[10px] bg-[#007A33]/15 text-[#007A33] px-2 py-0.5 rounded-full font-bold">Rácio Financeiro</span>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row items-center justify-around gap-4">
                        {/* Circular ring representation */}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-28 h-28 transform -rotate-90">
                            <circle cx="56" cy="56" r="45" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="45" 
                              stroke="#007A33" 
                              strokeWidth="10" 
                              fill="transparent" 
                              strokeDasharray="282.7"
                              strokeDashoffset={bookings.length > 0 ? 282.7 - (282.7 * stats.confirmedCount) / bookings.length : 0}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-black leading-none">
                              {bookings.length > 0 ? Math.round((stats.confirmedCount / bookings.length) * 100) : 0}%
                            </span>
                            <span className="text-[8px] text-neutral-400 font-bold uppercase mt-1">Concluído</span>
                          </div>
                        </div>

                        {/* Side breakdown */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#007A33]"></span>
                            <span className="text-neutral-500">Confirmado M-Pesa:</span>
                            <span className="text-black font-extrabold">{stats.confirmedCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#FCD116]"></span>
                            <span className="text-neutral-500">Pendentes por Validar:</span>
                            <span className="text-black font-extrabold">{stats.pendingCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#E31B23]"></span>
                            <span className="text-neutral-500">Reservas Rejeitadas:</span>
                            <span className="text-black font-extrabold">{stats.rejectedCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black/5 text-[10px] text-neutral-500 italic flex items-center gap-1.5 font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                        <span>Dica de Gestor: Sempre que aprovar mais reservas pendentes, os fundos de Garantia MozRent são atualizados instantaneamente.</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* === TAB 2: SYSTEM CONFIGURATION (SETTINGS) === */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-5 text-left">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <Settings className="w-5 h-5 text-[#FCD116]" />
                    <h4 className="text-sm font-black text-black">Parâmetros Operacionais da Plataforma</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    
                    {/* Tax configuration */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-neutral-700">
                        Comissão do MozRent (%) sobre cada Aluguer:
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={taxInput}
                          onChange={(e) => setTaxInput(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-black/10 rounded-lg cursor-pointer accent-[#007A33]"
                        />
                        <span className="font-extrabold text-white bg-[#007A33] px-3 py-1 rounded-xl block shrink-0 text-center min-w-[50px]">
                          {taxInput}%
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block leading-normal">
                        Esta percentagem será deduzida administrativamente do landlord e acumulada na rúbrica de receitas do sistema.
                      </span>
                    </div>

                    {/* Minimum Booking Duration */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-neutral-700">
                        Duração Mínima Obrigatória de Reserva:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={minDurationInput}
                          onChange={(e) => setMinDurationInput(Number(e.target.value))}
                          className="w-full text-xs font-bold rounded-xl border border-black/10 px-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none"
                        />
                        <span className="font-bold text-neutral-600 block shrink-0">Bens (Dias/Eventos)</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block leading-normal">
                        Evita o registo de alugueres abusivos com menos de {minDurationInput} período letivo mínimo.
                      </span>
                    </div>

                  </div>

                  {/* Security config - Dynamic PIN Change */}
                  <div className="p-5 rounded-2xl bg-red-50/40 border border-red-100 text-xs space-y-3">
                    <div className="flex items-center gap-2 text-red-700 font-bold">
                      <Unlock className="w-4 h-4" />
                      <span>Segurança & Código PIN Administrativo</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1">
                        <label className="block font-bold text-neutral-700">
                          Código PIN de Acesso Administrador:
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showPin ? "text" : "password"}
                            maxLength={12}
                            value={adminPinInput}
                            onChange={(e) => setAdminPinInput(e.target.value)}
                            placeholder="Ex: 2026"
                            className="w-full text-xs font-mono font-bold rounded-xl border border-black/10 pl-3 pr-16 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 text-[#007A33] hover:text-[#007A33]/80 font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            {showPin ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-neutral-500 leading-normal">
                        Defina um código numérico ou alfanumérico seguro para acesso restrito. O PIN padrão é <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-black font-extrabold">2026</code>. Guarde as alterações para persistir de forma definitiva no Firestore.
                      </div>
                    </div>
                  </div>

                  {/* Slider checklist/options toggling */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-xs">
                    <label className="flex items-center gap-3.5 cursor-pointer select-none font-bold text-black">
                      <input
                        type="checkbox"
                        checked={allowSelfReg}
                        onChange={(e) => setAllowSelfReg(e.target.checked)}
                        className="h-4.5 w-4.5 accent-[#007A33] rounded"
                      />
                      <div>
                        <span>Permitir auto-registo livre de novos Senhorios ("Arrendar Meu Bem")</span>
                        <span className="text-[10px] text-neutral-500 block font-normal mt-0.5">
                          Se desmarcado, apenas senhorios previamente verificados e certificados por contrato físico na sede podem postar no catálogo.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* System Terms & Conditions (Editable) */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block font-bold text-neutral-700">
                      Termos e Condições Gerais do MozRent (Editável):
                    </label>
                    <textarea
                      rows={6}
                      value={termsInput}
                      onChange={(e) => setTermsInput(e.target.value)}
                      placeholder="Os termos aqui mostrados serão mostrados aos utilizadores ao acederem à página e ao alugarem bens..."
                      className="w-full text-xs rounded-2xl border border-black/10 px-4 py-3 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007A33] leading-relaxed font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 block">
                      Qualquer ajuste de regras legais moçambicanas reflete instantaneamente para todos os utilizadores em tempo real.
                    </span>
                  </div>

                  {/* Actions save */}
                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#007A33] hover:bg-emerald-800 text-white font-extrabold uppercase text-xs px-6 py-3 rounded-full transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Guardar Alterações na Firestore
                    </button>
                  </div>

                </form>
              )}

              {/* === TAB 3: LISTINGS MODERATION === */}
              {activeTab === "moderation" && (
                <div className="space-y-4 text-left">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#E31B23]" />
                      <h4 className="text-sm font-black text-black">Fiscalização e Moderação do Catálogo ({listings.length})</h4>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold bg-neutral-105 px-2 py-0.5 rounded">
                      Verifique novos anúncios cadastrados por proprietários
                    </span>
                  </div>

                  {/* Navigation row, search bar and categories filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="relative sm:col-span-2">
                      <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                        <Search className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        value={modSearch}
                        onChange={(e) => setModSearch(e.target.value)}
                        placeholder="Pesquisar por título de imóvel, proprietário, contacto..."
                        className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-3 py-2.5 pl-9 text-xs font-bold text-black"
                      />
                    </div>

                    <select
                      value={modCategoryFilter}
                      onChange={(e) => setModCategoryFilter(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-black"
                    >
                      <option value="tudo">🚩 Categorias: Mostrar Tudo</option>
                      <option value="imovel">Imóvel</option>
                      <option value="veiculo">Viaturas Jipe GD6</option>
                      <option value="equipamento">Máquinas & Eventos</option>
                    </select>
                  </div>

                  {/* Moderation table or cards grid */}
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {filteredModListings.length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-black/5 text-xs text-neutral-500 font-bold">
                        Nenhum anúncio correspondente para moderar.
                      </div>
                    ) : (
                      filteredModListings.map((listing) => {
                        return (
                          <div 
                            key={listing.id} 
                            className="bg-neutral-50/50 p-4 rounded-2xl border border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3 text-xs leading-normal">
                              {/* Small thumb preview */}
                              <img 
                                src={listing.image} 
                                alt="" 
                                className="w-12 h-12 object-cover rounded-xl border border-black/10 bg-white" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="text-[10px] font-extrabold uppercase text-[#E31B23] block tracking-wide">
                                  {listing.type} • {listing.province}
                                </span>
                                <h5 className="font-extrabold text-black font-serif text-[13px]">{listing.title}</h5>
                                <p className="text-[11px] text-neutral-600 font-bold">
                                  Proprietário: <span className="text-black">{listing.landlordName}</span> ({listing.landlordPhone})
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px]">
                                  <span className="font-bold text-black bg-[#FCD116]/30 px-2 py-0.5 rounded">
                                    {listing.price.toLocaleString()} MT / {listing.period}
                                  </span>
                                  {listing.verified ? (
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Verificado
                                    </span>
                                  ) : (
                                    <span className="text-orange-705 bg-orange-50 px-2 py-0.5 rounded font-bold">
                                      Pendente Inspecção
                                    </span>
                                  )}
                                  {listing.featured && (
                                    <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                                      <Sparkles className="w-3 h-3 fill-purple-400" /> Destaque
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Verification Toggle and moderating Actions buttons */}
                            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto text-xs font-black">
                              
                              {/* Toggle verified */}
                              <button
                                onClick={() => onUpdateListingVerification(listing.id, !listing.verified, listing.featured)}
                                className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                                  listing.verified 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                                    : "bg-white text-neutral-700 border-black/15 hover:bg-neutral-100"
                                }`}
                              >
                                {listing.verified ? "Desmarcar Verificado" : "Aprovar e Verificar"}
                              </button>

                              {/* Toggle Featured */}
                              <button
                                onClick={() => onUpdateListingVerification(listing.id, listing.verified, !listing.featured)}
                                className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                                  listing.featured 
                                    ? "bg-purple-50 text-purple-700 border-purple-300" 
                                    : "bg-white text-neutral-700 border-black/15 hover:bg-neutral-100"
                                }`}
                              >
                                {listing.featured ? "Desmarcar Destaque" : "Destacar no Topo"}
                              </button>

                              {/* Delete Listing completely */}
                              <button
                                onClick={() => {
                                  if (confirm(`🚨 Tem certeza absoluta que deseja ELIMINAR permanentemente o anúncio "${listing.title}" do catálogo do MozRent? Esta ação é irreversível na Firestore.`)) {
                                    onDeleteListing(listing.id);
                                    alert(`O anúncio "${listing.title}" foi removido.`);
                                  }
                                }}
                                className="p-2 rounded-xl text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                title="Eliminar Anúncio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

              {/* === TAB 4: TRANSACTION HISTORY & ALL BOOKINGS === */}
              {activeTab === "bookings" && (
                <div className="space-y-4 text-left">
                  
                  <div className="border-b border-black/5 pb-2">
                    <h4 className="text-sm font-black text-black flex items-center gap-1.5">
                      <ClipboardList className="w-5 h-5 text-sky-650" />
                      <span>Histórico Geral de Arrendamentos ({bookings.length})</span>
                    </h4>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {bookings.length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-black/5 text-xs text-neutral-500 font-bold">
                        Nenhuma reserva registada até ao momento.
                      </div>
                    ) : (
                      bookings.map((book) => {
                        const amount = book.price * book.duration;
                        return (
                          <div 
                            key={book.id} 
                            className="bg-neutral-50/50 p-4 rounded-xl border border-black/5 text-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black/5 pb-2">
                              <div>
                                <span className="font-mono text-[9px] text-neutral-450 block uppercase">ID Reserva: {book.id}</span>
                                <h5 className="font-extrabold text-black text-[13px]">{book.listingTitle}</h5>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide block ${
                                book.status === "Confirmado" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                                  : book.status === "Rejeitado" 
                                  ? "bg-red-50 text-red-700 border border-red-200" 
                                  : "bg-amber-50 text-amber-700 border border-amber-300 animate-pulse"
                              }`}>
                                ● {book.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-neutral-600 leading-normal select-none">
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold">CLIENTE:</span>
                                <span className="font-extrabold text-black block">{book.userName}</span>
                                <span className="block font-medium">{book.userPhone}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold">DOCUMENTO:</span>
                                <span className="font-extrabold text-black uppercase block">{book.documentType}: {book.userIdentity}</span>
                                <span className="block italic text-[10px] text-neutral-400">Anexo validado digitalmente</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold">VALOR ARRENDAMENTO:</span>
                                <span className="font-black text-black block text-sm">{amount.toLocaleString()} MT</span>
                                <span className="block font-medium text-[10px]">({book.duration} {book.period === "mês" ? "meses" : "dias"})</span>
                              </div>
                            </div>

                            {/* Direct payment channel info with prompt text verification input */}
                            <div className="p-3 bg-white rounded-xl border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-neutral-500 text-[10px] uppercase block">Canal Pagamento:</span>
                                <span className="font-black text-black select-all text-xs">
                                  {book.paymentMethod.toUpperCase()} (Nº {book.mpesaNumber || "Cartão Visa"})
                                </span>
                                {book.referenceNumber && (
                                  <span className="font-bold text-neutral-500 block text-[9px] mt-0.5">
                                    Ref: <span className="text-teal-700 font-mono select-all font-extrabold">{book.referenceNumber}</span>
                                  </span>
                                )}
                              </div>

                              {/* Status update triggers */}
                              {book.status === "Pendente" && (
                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                  <button
                                    onClick={() => {
                                      const ref = prompt("Introduza a referência M-Pesa/e-Mola válida:");
                                      if (ref !== null) {
                                        onUpdateBookingStatus(book.id, "Confirmado", ref);
                                        alert("Pagamento aprovado administrativamente.");
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-[#007A33] hover:bg-emerald-800 text-white font-extrabold uppercase text-[9px] tracking-wider transition-all cursor-pointer"
                                  >
                                    Aprovar Pagamento
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Tem a certeza que deseja rejeitar o aluguer ${book.id}?`)) {
                                        onUpdateBookingStatus(book.id, "Rejeitado");
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-[9px] tracking-wider transition-all cursor-pointer"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
