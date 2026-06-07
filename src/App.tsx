/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Home, 
  Car, 
  Wrench, 
  Sparkles, 
  PlusCircle, 
  ClipboardList, 
  Search, 
  MapPin, 
  Compass, 
  AlertCircle, 
  Flame, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  BookOpen
} from "lucide-react";

import { Listing, RentBooking, CategoryType } from "./types";
import { INITIAL_LISTINGS, MOZAMBIQUE_PROVINCES, RENTAL_GUIDES } from "./data";
import ListingCard from "./components/ListingCard";
import ListingDetailsModal from "./components/ListingDetailsModal";
import AddListingModal from "./components/AddListingModal";
import BookingDashboardModal from "./components/BookingDashboardModal";
import AIAssistant from "./components/AIAssistant";

export default function App() {
  // 1. Core States
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem("mozrent_listings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao analisar anúncios do localStorage", e);
      }
    }
    return INITIAL_LISTINGS;
  });

  const [bookings, setBookings] = useState<RentBooking[]>(() => {
    const saved = localStorage.getItem("mozrent_bookings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao analisar reservas do localStorage", e);
      }
    }
    return [];
  });

  // 2. Filter states
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "tudo">("tudo");
  const [selectedProvince, setSelectedProvince] = useState<string>("tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(150000);

  // 3. Modals & Context States
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("mozrent_listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("mozrent_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Handle new landlord listing
  const handleAddListing = (newListingData: Omit<Listing, "id" | "views" | "rating" | "verified" | "featured">) => {
    const id = `lst-added-${Date.now()}`;
    const newListing: Listing = {
      ...newListingData,
      id,
      views: Math.floor(Math.random() * 80) + 5,
      rating: 4.5 + Math.random() * 0.5,
      verified: false, // Self listed listings go through verify checkpoint
      featured: false
    };

    setListings(prev => [newListing, ...prev]);
  };

  // Handle new tenant booking
  const handleNewBooking = (bookingData: Omit<RentBooking, "id" | "createdAt" | "status">) => {
    const id = `bk-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Compute simulated expiration timestamp based on rental period
    const startMs = bookingData.startDate ? new Date(bookingData.startDate).getTime() : Date.now();
    const durationDays = bookingData.period === 'mês' ? bookingData.duration * 30 : bookingData.duration;
    const expiresAt = startMs + (durationDays * 24 * 60 * 60 * 1000);

    const newBooking: RentBooking = {
      ...bookingData,
      id,
      status: "Pendente",
      createdAt: new Date().toLocaleDateString(),
      expiresAt: expiresAt
    };

    setBookings(prev => [newBooking, ...prev]);
  };

  // Extend booking lease
  const handleExtendBooking = (id: string, extraDuration: number) => {
    setBookings(prev => prev.map(book => {
      if (book.id === id) {
        const currentExpiresAt = book.expiresAt ?? Date.now();
        const durationDays = book.period === 'mês' ? extraDuration * 30 : extraDuration;
        const extraMs = durationDays * 24 * 60 * 60 * 1000;
        
        return {
          ...book,
          expiresAt: currentExpiresAt + extraMs,
          duration: book.duration + extraDuration,
          status: "Confirmado"
        };
      }
      return book;
    }));
  };

  // Simulate Passage of Time (for testing warning pings easily)
  const handleSimulateTimePassage = () => {
    setBookings(prev => prev.map(book => {
      if (book.status === 'Confirmado') {
        const ageMs = 10 * 24 * 60 * 60 * 1000; // Subtract 10 days
        const currentExpires = book.expiresAt ?? Date.now();
        return {
          ...book,
          expiresAt: currentExpires - ageMs
        };
      }
      return book;
    }));
  };

  // Update booking status (simulating carrier MPesa USSD ping confirmations)
  const handleUpdateBookingStatus = (id: string, status: 'Pendente' | 'Confirmado' | 'Rejeitado', ref?: string) => {
    setBookings(prev => prev.map(book => {
      if (book.id === id) {
        // If status changes to Confirmado, decrease corresponding item stock
        if (status === "Confirmado" && book.status !== "Confirmado") {
          setListings(prevListings => prevListings.map(lst => {
            if (lst.id === book.listingId) {
              const currentStock = lst.stock ?? 1;
              const newStock = Math.max(0, currentStock - 1);
              return {
                ...lst,
                stock: newStock,
                availableNow: newStock > 0
              };
            }
            return lst;
          }));
        }

        return {
          ...book,
          status,
          referenceNumber: ref || book.referenceNumber
        };
      }
      return book;
    }));
  };

  // Filter computation
  const filteredListings = listings.filter(item => {
    const matchesCategory = selectedCategory === "tudo" ? true : item.category === selectedCategory;
    const matchesProvince = selectedProvince === "tudo" ? true : item.province === selectedProvince;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= priceRange;

    return matchesCategory && matchesProvince && matchesSearch && matchesPrice;
  });

  // Calculate featured lists
  const featuredOnly = listings.filter(item => item.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-natural-bg text-brand-black font-sans flex flex-col selection:bg-brand-yellow selection:text-brand-black">
      
      {/* 🔴 Mozambican Header Visual Banner */}
      <div className="h-2 w-full capulana-border relative z-50"></div>

      {/* Primary Clean Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-natural-border py-4 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 self-start sm:self-auto cursor-pointer" onClick={() => {
            setSelectedCategory("tudo");
            setSelectedProvince("tudo");
            setSearchQuery("");
          }}>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00843D] via-[#F7D117] to-[#E31B23] shadow-lg text-white font-black text-xl">
              M
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3 rounded-full bg-brand-green border-2 border-white"></span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-brand-black font-serif leading-none">
                Moz<span className="text-brand-red">Rent</span>
              </h1>
              <span className="text-[10px] text-[#6B665F] font-bold block tracking-wider uppercase mt-1">
                Alugue o que quiser, quando quiser
              </span>
            </div>
          </div>

          {/* Core Navigation Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* Lister / Landlord entry trigger */}
            <button
              id="lister-mode-trigger"
              onClick={() => setIsAddListingOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-natural-border bg-white hover:bg-natural-aside px-4 py-2.5 text-xs font-bold text-[#6B665F] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-brand-green" />
              <span>Arrendar Meu Bem</span>
            </button>

            {/* Bookings Tracker entry trigger */}
            <button
              id="renter-dashboard-trigger"
              onClick={() => setIsDashboardOpen(true)}
              className="relative flex items-center gap-1.5 rounded-full bg-brand-black hover:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95 shadow cursor-pointer"
            >
              <ClipboardList className="h-4 w-4 text-brand-yellow" />
              <span>Os Meus Alugueres</span>

              {bookings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white shadow">
                  {bookings.filter(b => b.status === 'Pendente').length > 0 ? (
                    <span className="absolute inset-0 rounded-full bg-brand-red animate-ping opacity-75"></span>
                  ) : null}
                  <span className="relative">{bookings.length}</span>
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
        
        {/* HERO SECTION with local capulana design overlay */}
        <section className="relative rounded-[32px] overflow-hidden bg-brand-black text-white p-6 md:p-12 shadow-xl">
          {/* Abstract warm gradient background representing African Sun */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-neutral-900/95 to-emerald-950/40 mix-blend-multiply"></div>
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-yellow/15 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-red/10 blur-3xl"></div>

          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#FAF5EE]">
              <Sparkles className="h-3.5 w-3.5 text-brand-yellow animate-spin" />
              Inovação de Arrendamento em Moçambique
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif leading-tight">
              Encontre o seu imóvel ideal, viatura ou gerador.
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed max-w-lg">
              Evite corretores abusivos e burlas. No **MozRent**, todos os senhorios são inspecionados, o pagamento é feito de forma rastreada por M-Pesa/e-Mola, e o nosso assistente IA ajuda na escolha certa.
            </p>

            {/* Quick stats board */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs">
                <span className="text-brand-yellow font-extrabold text-sm block">100%</span>
                <span className="text-neutral-400 tracking-wide font-semibold">Bens Verificados</span>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs">
                <span className="text-brand-green font-extrabold text-sm block">M-Pesa / e-Mola</span>
                <span className="text-neutral-400 tracking-wide font-semibold">Checkout Protegido</span>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs">
                <span className="text-brand-red font-extrabold text-sm block">Assistência</span>
                <span className="text-neutral-400 tracking-wide font-semibold">Inteligência Artificial</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE FILTER ENGINE */}
        <section className="bg-white rounded-[32px] p-6 border border-natural-border shadow-xs space-y-4">
          
          {/* Row 1: Search & Province selectors side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search inputs */}
            <div className="relative md:col-span-2">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#6B665F]">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                id="search-bar-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por bairros ou palavras-chave (ex: Polana, Sommerschield, 4x4, ar condicionado)..."
                className="w-full rounded-full border border-natural-border bg-[#FAF5EE]/45 px-4 py-3.5 pl-11 text-xs focus:bg-white focus:ring-2 focus:ring-brand-green/35 focus:outline-none transition-all placeholder:text-[#6B665F]"
              />
            </div>

            {/* Province drop down */}
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#6B665F]">
                <MapPin className="h-4.5 w-4.5 text-brand-red" />
              </span>
              <select
                id="province-select-filter"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-full border border-natural-border bg-[#FAF5EE]/45 px-4 py-3.5 pl-10 text-xs font-bold text-brand-black focus:bg-white focus:ring-2 focus:ring-brand-green/35 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="tudo">🚩 Todas as Províncias</option>
                {MOZAMBIQUE_PROVINCES.map((prov, i) => (
                  <option key={i} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Row 2: Category choice Tabs and Price Range sliders */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-3 border-t border-natural-border">
            
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory("tudo")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "tudo" 
                    ? "bg-brand-green text-white shadow" 
                    : "bg-natural-aside hover:bg-natural-border/30 text-[#6B665F] border border-natural-border"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                Mostrar Tudo
              </button>
              <button
                onClick={() => setSelectedCategory("imovel")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "imovel" 
                    ? "bg-teal-700 text-white shadow" 
                    : "bg-natural-aside hover:bg-natural-border/30 text-[#6B665F] border border-natural-border"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                Imóveis / Quartos
              </button>
              <button
                onClick={() => setSelectedCategory("veiculo")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "veiculo" 
                    ? "bg-indigo-700 text-white shadow" 
                    : "bg-natural-aside hover:bg-natural-border/30 text-[#6B665F] border border-natural-border"
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                Viaturas GD6
              </button>
              <button
                onClick={() => setSelectedCategory("equipamento")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "equipamento" 
                    ? "bg-brand-yellow text-brand-black shadow" 
                    : "bg-natural-aside hover:bg-natural-border/30 text-[#6B665F] border border-natural-border"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                Salões & Máquinas
              </button>
            </div>

            {/* Price slider */}
            <div className="w-full md:w-72 space-y-1.5">
              <div className="flex justify-between text-xs text-[#6B665F] font-bold uppercase">
                <span>Preço Máximo</span>
                <span className="text-brand-green font-extrabold">{priceRange.toLocaleString()} MT</span>
              </div>
              <input
                type="range"
                min="3000"
                max="150000"
                step="3000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-green h-1.5 bg-natural-border rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Quick Active metrics indicator */}
          <div className="flex gap-2 text-xs font-medium text-[#6B665F] items-center">
            <span>Resultados activos:</span>
            <span className="text-brand-black font-extrabold">{filteredListings.length} anúncios encontrados</span>
            {searchQuery && (
              <span className="bg-natural-aside border border-natural-border text-brand-black px-2 py-0.5 rounded truncate max-w-xs">
                Filtro: "{searchQuery}"
              </span>
            )}
            {selectedProvince !== 'tudo' && (
              <span className="bg-brand-red/10 border border-brand-red/20 text-brand-red px-2 py-0.5 rounded">
                Província: {selectedProvince}
              </span>
            )}
          </div>

        </section>

        {/* INTERACTIVE ALUGUER CATALOG GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-brand-black flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-[#E31B23] fill-[#E31B23] animate-pulse" />
              <span>Destaques em <span className="italic underline decoration-[#F7D117] decoration-4 underline-offset-4">Moçambique</span></span>
            </h3>
            {filteredListings.length > 0 && (
              <span className="text-xs text-[#6B665F] font-bold">
                Pressione os anúncios para agendar ou perguntar à I.A.
              </span>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-natural-border py-16 text-center space-y-4 shadow-xs">
              <AlertCircle className="h-12 w-12 text-brand-red mx-auto text-[#E31B23]" />
              <h3 className="text-base font-bold text-brand-black">Nenhum aluguer correspondente encontrado</h3>
              <p className="text-xs text-[#6B665F] max-w-md mx-auto leading-relaxed">
                Tente redefinir o seu filtro de preço máximo, limpar o termo de pesquisa ou selecionar outra província como <strong>Maputo Cidade</strong> ou <strong>Matola</strong>.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvince("tudo");
                  setSelectedCategory("tudo");
                  setPriceRange(150000);
                }}
                className="rounded-full bg-brand-green hover:bg-emerald-800 text-white font-bold px-5 py-2.5 text-xs transition-all cursor-pointer shadow-sm"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map(listing => (
                <div key={listing.id} className="h-full">
                  <ListingCard
                    listing={listing}
                    onSelect={(item) => setSelectedListing(item)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EXPERT MOZAMBICAN RENTAL EDUCATIONAL CAROUSEL */}
        <section className="bg-gradient-to-tr from-emerald-950 via-brand-green to-teal-905 rounded-[32px] p-6 md:p-8 text-white shadow-lg space-y-6 border border-natural-border/20">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-yellow" />
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">Dicas MozRent • Como evitar problemas ao arrendar</h3>
              <span className="text-[11px] text-[#FAF5EE]/90 font-medium block uppercase tracking-wider mt-0.5">Conhecimento local adaptado à nossa realidade</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {RENTAL_GUIDES.map((guide, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5 flex-1 select-none">
                  <h4 className="text-xs font-black tracking-wide text-brand-yellow flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-brand-black text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {guide.title}
                  </h4>
                  <p className="text-[11px] text-neutral-100 leading-relaxed text-left">
                    {guide.content}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Consulte o nosso assistente IA no botão flutuante para um questionamento detalhado sobre "${guide.title}"!`)}
                  className="text-left text-[10px] font-bold text-brand-yellow hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Saber mais com a I.A.</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SOBRE NÓS & CONTACTE-NOS CONTAINER */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-[32px] p-6 md:p-10 border border-natural-border shadow-xs text-left">
          
          {/* Column 1: Sobre */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-black text-brand-black flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-green" />
              <span>Sobre o MozRent</span>
            </h3>
            <p className="text-xs text-[#6B665F] leading-relaxed font-semibold">
              O <strong className="text-brand-black">MozRent</strong> é a primeira plataforma de economia compartilhada focada exclusivamente na realidade moçambicana. O nosso lema é <strong className="text-brand-black">"Alugue o que quiser, quando quiser"</strong>. Viemos para unificar o mercado nacional de aluguer, garantindo que qualquer cidadão de Maputo ao Niassa possa arrendar uma vivenda, um jipe 4x4 ou uma betoneira em total segurança.
            </p>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              Eliminamos a necessidade de intermediários ou comissões abusivas. Todos os anúncios passam por uma verificação rigorosa, com suporte para assinatura de termos de responsabilidade digital e validação integrada de documentos nacionais como BI, Passaporte e DIRE. É simples, rápido e totalmente blindado contra burlas de falso depósito.
            </p>
          </div>

          {/* Column 2: Contacte-nos */}
          <div className="bg-[#FAF5EE] rounded-[24px] p-6 border border-natural-border space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-[#00843D] mb-4">
                ℹ️ Informações de Contacto & Suporte ao Cliente
              </h3>
              <div className="space-y-3.5 text-xs text-[#2F2C29]">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#6B665F] w-24 select-none">GitHub Oficial:</span>
                  <a 
                    href="https://github.com/EgoBrain-Dev" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-teal-700 hover:underline font-extrabold"
                  >
                    github.com/EgoBrain-Dev
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#6B665F] w-24 select-none">WhatsApp:</span>
                  <a 
                    href="https://wa.me/258843617130" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#00843D] hover:underline font-extrabold"
                  >
                    +258 843617130
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-extrabold text-[#6B665F] w-24 select-none">Contacto Geral:</span>
                  <span className="text-brand-black font-extrabold">
                    843617130 <span className="text-neutral-300">|</span> 823400945 <span className="text-neutral-300">|</span> 843617130
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#6B665F] w-24 select-none">E-mail:</span>
                  <a 
                    href="mailto:egobrain.mz@gmail.com" 
                    className="text-brand-black hover:underline font-extrabold"
                  >
                    egobrain.mz@gmail.com
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-2 text-[10px] text-[#6B665F] font-bold border-t border-natural-border mt-2">
              ⚠️ Em caso de litígio, consulte o nosso Centro de Mediação Integrado no menu do WhatsApp.
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white text-brand-black mt-12 py-10 px-4 md:px-8 border-t border-natural-border text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-natural-border pb-8 mb-8">
          
          <div className="text-left space-y-1.5">
            <h4 className="text-2xl font-serif font-extrabold leading-none">
              Moz<span className="text-brand-red">Rent</span>
            </h4>
            <p className="text-xs text-[#6B665F] max-w-sm">
              Alugue o que quiser, quando quiser. A rede de arrendamento transparente em Moçambique unindo inquilinos e proprietários com pagamentos via carteira móvel e segurança digital.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#6B665F]">
            <a href="https://github.com/EgoBrain-Dev" target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors">Termos e Condições</a>
            <a href="#" className="hover:text-brand-red transition-colors">Como funciona o M-Pesa / e-Mola</a>
            <a href="#" className="hover:text-brand-red transition-colors">Segurança no Lobolo</a>
            <a href="mailto:egobrain.mz@gmail.com" className="hover:text-brand-red transition-colors">Suporte ao Cliente</a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B665F] font-medium">
          <p>@ 2026 MozRent. Todos os direitos resevados. Desenvolvido por EgoBrain</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-green"></span>
            <span>Central MozRent Cooperativa (Porto 3000)</span>
          </div>
        </div>
      </footer>

      {/* 4. MODALS INTERACTION STYLES */}

      {/* A. Rental Description Detail modal */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onBook={handleNewBooking}
        />
      )}

      {/* B. Lister landlord add modal */}
      {isAddListingOpen && (
        <AddListingModal
          onClose={() => setIsAddListingOpen(false)}
          onAddListing={handleAddListing}
        />
      )}

      {/* C. Renter Dashboard Modal */}
      {isDashboardOpen && (
        <BookingDashboardModal
          bookings={bookings}
          onClose={() => setIsDashboardOpen(false)}
          onUpdateStatus={handleUpdateBookingStatus}
          onExtendBooking={handleExtendBooking}
          onSimulateTimePassage={handleSimulateTimePassage}
        />
      )}

      {/* D. FLOATING INTELLIGENT AI CAPULANA CHAT ASSISTANT */}
      <AIAssistant 
        currentPropertyContext={selectedListing} 
      />

    </div>
  );
}
