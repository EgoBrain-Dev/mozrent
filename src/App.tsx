import { useState, useEffect, useRef, MouseEvent, FormEvent } from "react";
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
  BookOpen,
  Heart,
  Star,
  Info,
  Coins,
  MessageSquare,
  LifeBuoy,
  X,
  CheckCircle,
  Clock,
  PhoneCall,
  Smartphone,
  CreditCard,
  Building2
} from "lucide-react";

import { Listing, RentBooking, CategoryType, UserFeedback, AppSettings } from "./types";
import { MOZAMBIQUE_PROVINCES, RENTAL_GUIDES } from "./data";
import { motion, AnimatePresence } from "motion/react";
import ListingCard from "./components/ListingCard";
import ListingDetailsModal from "./components/ListingDetailsModal";
import AddListingModal from "./components/AddListingModal";
import BookingDashboardModal from "./components/BookingDashboardModal";
import AdminDashboardModal from "./components/AdminDashboardModal";
import AIAssistant from "./components/AIAssistant";
// @ts-ignore
import logoUrl from "./assets/images/logo_1780858493903.png";

import { 
  getPersistedListings, 
  addPersistedListing, 
  updatePersistedListingStock,
  getPersistedBookings, 
  addPersistedBooking, 
  updatePersistedBooking,
  getPersistedFeedbacks,
  addPersistedFeedback,
  getPersistedSettings,
  updatePersistedSettings,
  updatePersistedListingVerification,
  deletePersistedListing
} from "./firebase";

export default function App() {
  // 1. Core State loaded asynchronously from Firebase (Firestore with Real Fallbacks)
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<RentBooking[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Favorites (Bookmark) State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("mozrent_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // 2. Filter states
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "tudo">("tudo");
  const [selectedProvince, setSelectedProvince] = useState<string>("tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(150000);

  // 3. Informational Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    taxPercentage: 6.5,
    termsText: "",
    allowSelfRegistration: true,
    minBookingDuration: 1
  });

  // Fetch Firestore Data on Initial Load
  useEffect(() => {
    async function loadData() {
      try {
        const dbListings = await getPersistedListings();
        setListings(dbListings);
        
        const dbBookings = await getPersistedBookings();
        setBookings(dbBookings);

        const dbFeedbacks = await getPersistedFeedbacks();
        setFeedbacks(dbFeedbacks);

        const dbSettings = await getPersistedSettings();
        setSettings(dbSettings);
      } catch (e) {
        console.error("[MozRent Firebase Init] Falha ao carregar base de dados. Usando réplica local:", e);
      } finally {
        setIsLoadingDb(false);
      }
    }
    loadData();
  }, []);

  // 4. Browser Notification API: Monitor state shifts and trigger native OS alerts
  const prevBookingsRef = useRef<Record<string, 'Pendente' | 'Confirmado' | 'Rejeitado'>>({});

  const triggerStatusNotification = (booking: RentBooking) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const isConfirmed = booking.status === "Confirmado";
      const title = isConfirmed 
        ? "🟢 Aluguer Confirmado! • MozRent" 
        : "🔴 Aluguer Cancelado/Recusado • MozRent";
      const body = isConfirmed
        ? `O seu pedido de aluguer do bem "${booking.listingTitle}" foi ACEITE e confirmado com sucesso.`
        : `O seu pedido de aluguer do bem "${booking.listingTitle}" foi recusado ou cancelado. Abra o painel para ver mais detalhes.`;
        
      try {
        new Notification(title, {
          body,
          icon: booking.listingImage || "/favicon.ico",
          tag: `mozrent-bk-status-${booking.id}`,
          requireInteraction: true
        });
      } catch (err) {
        console.error("Erro ao acionar Notificação do Navegador:", err);
      }
    }
  };

  useEffect(() => {
    if (isLoadingDb) return;

    // Detect if booking status moved from Pendente to Confirmado or Rejeitado
    bookings.forEach(book => {
      const prevStatus = prevBookingsRef.current[book.id];
      if (prevStatus && prevStatus !== book.status) {
        if (prevStatus === "Pendente" && (book.status === "Confirmado" || book.status === "Rejeitado")) {
          triggerStatusNotification(book);
        }
      }
    });

    // Maintain current status keys
    const currentStatusMap: Record<string, 'Pendente' | 'Confirmado' | 'Rejeitado'> = {};
    bookings.forEach(book => {
      currentStatusMap[book.id] = book.status;
    });
    prevBookingsRef.current = currentStatusMap;
  }, [bookings, isLoadingDb]);

  // Periodical Background Synchronization Polling to enable real-time notifications
  useEffect(() => {
    if (isLoadingDb) return;

    const interval = setInterval(async () => {
      try {
        const dbBookings = await getPersistedBookings();
        // Verify real differences to optimize state setting
        const oldStateStr = JSON.stringify(bookings.map(b => ({ id: b.id, s: b.status })));
        const newStateStr = JSON.stringify(dbBookings.map(b => ({ id: b.id, s: b.status })));
        if (oldStateStr !== newStateStr) {
          setBookings(dbBookings);
        }

        const dbListings = await getPersistedListings();
        const oldListStr = JSON.stringify(listings.map(l => ({ id: l.id, av: l.availableNow, stk: l.stock })));
        const newListStr = JSON.stringify(dbListings.map(l => ({ id: l.id, av: l.availableNow, stk: l.stock })));
        if (oldListStr !== newListStr) {
          setListings(dbListings);
        }
      } catch (e) {
        console.warn("[MozRent Background Sync] Erro menor na ligação de sincronização periódica:", e);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [bookings, listings, isLoadingDb]);

  // Sync favorites to local storage on modification
  const handleToggleFavorite = (e: MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid opening the listing details card when heart is pressed
    setFavorites(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id];
      localStorage.setItem("mozrent_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  // Submit Feedback to Firebase
  const handleAddFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackComment.trim()) {
      alert("Por favor, preencha todos os campos da avaliação.");
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const newFb: UserFeedback = {
        id: `fb-${Date.now()}`,
        name: feedbackName.trim(),
        rating: feedbackStars,
        comment: feedbackComment.trim(),
        createdAt: new Date().toLocaleDateString()
      };
      
      await addPersistedFeedback(newFb);
      setFeedbacks(prev => [newFb, ...prev]);
      
      // Reset Form fields
      setFeedbackName("");
      setFeedbackStars(5);
      setFeedbackComment("");
      alert("Obrigado! A sua avaliação para o MozRent foi guardada na base de dados com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao registar a sua avaliação na Base de dados.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Handle new landlord listing adding (Saving to real DB)
  const handleAddListing = async (newListingData: Omit<Listing, "id" | "views" | "rating" | "verified" | "featured">) => {
    const id = `lst-added-${Date.now()}`;
    const newListing: Listing = {
      ...newListingData,
      id,
      views: Math.floor(Math.random() * 80) + 12,
      rating: 4.5 + Math.random() * 0.5,
      verified: false, // Self listed listings go through verify checkpoint
      featured: false
    };

    setListings(prev => [newListing, ...prev]);
    await addPersistedListing(newListing);
  };

  // Handle new tenant booking adding (Saving to real DB)
  const handleNewBooking = async (bookingData: Omit<RentBooking, "id" | "createdAt" | "status">) => {
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
    await addPersistedBooking(newBooking);
  };

  // Handle interactive rating submittal for standard listings
  const handleRateListing = async (id: string, newRating: number) => {
    // 1. Update listings state list
    setListings(prev => prev.map(l => l.id === id ? { ...l, rating: newRating } : l));
    // 2. Upkeep details model selection if open
    if (selectedListing && selectedListing.id === id) {
      setSelectedListing(prev => prev ? { ...prev, rating: newRating } : null);
    }
    // 3. Save to database
    try {
      const { updatePersistedListingRating } = await import("./firebase");
      await updatePersistedListingRating(id, newRating);
    } catch (err) {
      console.error("[MozRent App Error] Erro ao reescrever rating localmente:", err);
    }
  };

  // Extend booking lease (Renewals)
  const handleExtendBooking = async (id: string, extraDuration: number) => {
    let updatedBooking: RentBooking | undefined;
    
    setBookings(prev => prev.map(book => {
      if (book.id === id) {
        const currentExpiresAt = book.expiresAt ?? Date.now();
        const durationDays = book.period === 'mês' ? extraDuration * 30 : extraDuration;
        const extraMs = durationDays * 24 * 60 * 60 * 1000;
        
        updatedBooking = {
          ...book,
          expiresAt: currentExpiresAt + extraMs,
          duration: book.duration + extraDuration,
          status: "Confirmado"
        };
        return updatedBooking;
      }
      return book;
    }));

    if (updatedBooking) {
      await updatePersistedBooking(updatedBooking);
    }
  };

  // Update booking status and subtract corresponding Stock
  const handleUpdateBookingStatus = async (id: string, status: 'Pendente' | 'Confirmado' | 'Rejeitado', ref?: string) => {
    let targetBooking: RentBooking | undefined;

    setBookings(prev => prev.map(book => {
      if (book.id === id) {
        targetBooking = {
          ...book,
          status,
          referenceNumber: ref || book.referenceNumber
        };
        return targetBooking;
      }
      return book;
    }));

    if (targetBooking) {
      await updatePersistedBooking(targetBooking);

      // If status changes to Confirmado, decrease corresponding item stock
      if (status === "Confirmado") {
        const listingId = targetBooking.listingId;
        const currentListing = listings.find(l => l.id === listingId);
        if (currentListing) {
          const currentStock = currentListing.stock ?? 1;
          const newStock = Math.max(0, currentStock - 1);
          
          await updatePersistedListingStock(listingId, newStock);
          
          // Local State Sync
          setListings(prevListings => prevListings.map(lst => {
            if (lst.id === listingId) {
              return {
                ...lst,
                stock: newStock,
                availableNow: newStock > 0
              };
            }
            return lst;
          }));
        }
      }
    }
  };

  const handleUpdateListingVerification = async (id: string, verified: boolean, featured: boolean) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, verified, featured } : l));
    await updatePersistedListingVerification(id, verified, featured);
  };

  const handleDeleteListing = async (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    await deletePersistedListing(id);
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await updatePersistedSettings(newSettings);
  };

  // Filter computation
  const filteredListings = listings.filter(item => {
    const matchesCategory = selectedCategory === "tudo" ? true : item.category === selectedCategory;
    const matchesProvince = selectedProvince === "tudo" ? true : item.province === selectedProvince;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= priceRange;
    const matchesFavoritesOnly = showOnlyFavorites ? favorites.includes(item.id) : true;

    return matchesCategory && matchesProvince && matchesSearch && matchesPrice && matchesFavoritesOnly;
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-black font-sans flex flex-col selection:bg-[#FCD116] selection:text-black">
      
      {/* 🔴 Mozambican Header Visual Banner (Capulana Border using Mozambique Flag colors) */}
      <div className="h-2 w-full capulana-border relative z-50"></div>

      {/* Primary Clean Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/10 py-4 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan (Mozambique flag styling) */}
          <div className="flex items-center gap-3 self-start md:self-auto cursor-pointer select-none" 
            onClick={() => {
              setSelectedCategory("tudo");
              setSelectedProvince("tudo");
              setSearchQuery("");
              setShowOnlyFavorites(false);
            }}
            onDoubleClick={() => {
              setIsAdminOpen(true);
            }}
          >
            <img 
              src={logoUrl} 
              alt="MozRent Logo" 
              className="h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-102" 
            />
          </div>

          {/* Core Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Inline Info buttons equal to other triggers */}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Info className="h-4 w-4 text-[#007A33]" />
              <span>Sobre Nós</span>
            </button>

            <button
              onClick={() => setIsSupportOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <LifeBuoy className="h-4 w-4 text-[#E31B23]" />
              <span>Suporte ao Cliente</span>
            </button>

            {/* Owner Monetization Button Tool */}
            <button
              onClick={() => setIsMonetizationOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#FCD116] bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Coins className="h-4 w-4 text-black" />
              <span>Monetização</span>
            </button>

            {/* Lister / Landlord entry trigger */}
            <button
              id="lister-mode-trigger"
              onClick={() => setIsAddListingOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-[#007A33]" />
              <span>Arrendar Meu Bem</span>
            </button>

            {/* Bookings Tracker entry trigger */}
            <button
              id="renter-dashboard-trigger"
              onClick={() => setIsDashboardOpen(true)}
              className="relative flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95 shadow cursor-pointer bg-gradient-to-r from-black via-neutral-900 to-black"
            >
              <ClipboardList className="h-4 w-4 text-[#FCD116]" />
              <span>Os Meus Alugueres</span>

              {bookings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E31B23] text-[10px] font-bold text-white shadow">
                  {bookings.filter(b => b.status === "Pendente").length > 0 ? (
                    <span className="absolute inset-0 rounded-full bg-[#E31B23] animate-ping opacity-75"></span>
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
        
        {/* HERO SECTION - Enhanced content strictly without Lda and featuring official specifications */}
        <section className="relative rounded-[32px] overflow-hidden bg-black text-white p-6 md:p-12 shadow-xl border border-black/10">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-neutral-950 to-neutral-900 mix-blend-multiply"></div>
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#FCD116]/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#E31B23]/5 blur-3xl"></div>

          <div className="relative z-10 max-w-2xl space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007A33]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3.5 w-3.5 text-[#FCD116] animate-pulse" />
              Inovação de Arrendamento em Moçambique
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight font-serif leading-tight text-white">
              Encontre o seu imóvel ideal, viatura, servico e equipamento.
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed max-w-lg">
              Evite corretores abusivos e burlas. No <strong>MozRent</strong>, todos os senhorios são inspecionados, o pagamento é feito de forma rastreada por M-Pesa/e-Mola/Mkesh, VISA e Ponto24, e o nosso assistente IA ajuda na escolha certa.
            </p>

            {/* High fidelity stats board - Strict Flag Palette */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#007A33]" />
                <div>
                  <span className="text-[#FCD116] font-black text-sm block">100%</span>
                  <span className="text-neutral-300 tracking-wide font-semibold">Bens Verificados</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#FCD116]" />
                <div>
                  <span className="text-white font-black text-sm block">M-Pesa / e-Mola / Mkesh / VISA</span>
                  <span className="text-neutral-300 tracking-wide font-semibold">Checkout Protegido</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/5 backdrop-blur-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E31B23]" />
                <div>
                  <span className="text-[#FCD116] font-black text-sm block">Assistência 24h</span>
                  <span className="text-neutral-300 tracking-wide font-semibold">Assistência Humana & Inteligência Artificial</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE FILTER ENGINE */}
        <section className="bg-white rounded-[32px] p-6 border border-black/10 shadow-xs space-y-4 text-left">
          
          {/* Row 1: Search, Province selectors & Favorites toggle */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search inputs */}
            <div className="relative md:col-span-2">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                id="search-bar-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por bairros ou palavras-chave (ex: Polana, Sommerschield, 4x4, ar condicionado)..."
                className="w-full rounded-full border border-black/10 bg-neutral-50 px-4 py-3.5 pl-11 text-xs focus:bg-white focus:ring-2 focus:ring-[#007A33]/35 focus:outline-none transition-all placeholder:text-neutral-400 font-bold"
              />
            </div>

            {/* Province selector */}
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <MapPin className="h-4.5 w-4.5 text-[#E31B23]" />
              </span>
              <select
                id="province-select-filter"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-full border border-black/10 bg-neutral-50 px-4 py-3.5 pl-10 text-xs font-bold text-black focus:bg-white focus:ring-2 focus:ring-[#007A33]/35 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="tudo">🚩 Todas as Províncias</option>
                {MOZAMBIQUE_PROVINCES.map((prov, i) => (
                  <option key={i} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Favorites Filter Trigger */}
            <button
              onClick={() => setShowOnlyFavorites(prev => !prev)}
              className={`flex items-center justify-center gap-2 w-full rounded-full border text-xs font-extrabold transition-all active:scale-95 cursor-pointer py-3.5 ${
                showOnlyFavorites 
                  ? "bg-[#E31B23] text-white border-2 border-[#E31B23] shadow" 
                  : "bg-white text-neutral-700 border-black/10 hover:bg-neutral-50"
              }`}
            >
              <Heart className={`h-4 w-4 ${showOnlyFavorites ? "fill-white text-white" : "text-[#E31B23]"}`} />
              <span>{showOnlyFavorites ? "Ver Todos os Anúncios" : `Os Meus Favoritos (${favorites.length})`}</span>
            </button>

          </div>

          {/* Row 2: Category choices & Price sliders */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-3 border-t border-black/5">
            
            {/* Category tabs using strict Mozambique flag colors */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory("tudo")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "tudo" 
                    ? "bg-[#007A33] text-white shadow" 
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border border-black/10"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                Mostrar Tudo
              </button>
              <button
                onClick={() => setSelectedCategory("imovel")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "imovel" 
                    ? "bg-black text-white shadow" 
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border border-black/10"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                Imóveis / Quartos
              </button>
              <button
                onClick={() => setSelectedCategory("veiculo")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "veiculo" 
                    ? "bg-[#E31B23] text-white shadow" 
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border border-black/10"
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                Viaturas GD6
              </button>
              <button
                onClick={() => setSelectedCategory("equipamento")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "equipamento" 
                    ? "bg-[#FCD116] text-black shadow-md border-2 border-[#FCD116]" 
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border border-black/10"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                Salões & Máquinas
              </button>
            </div>

            {/* Price slider */}
            <div className="w-full md:w-72 space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-600 font-bold uppercase">
                <span>Preço Máximo</span>
                <span className="text-[#007A33] font-black">{priceRange.toLocaleString()} MT</span>
              </div>
              <input
                type="range"
                min="3000"
                max="150000"
                step="3000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-black/10 rounded-lg cursor-pointer accent-[#007A33]"
              />
            </div>

          </div>

          {/* Quick Active metrics indicator */}
          <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-600 items-center">
            <span>Resultados activos:</span>
            <span className="text-black font-extrabold">{filteredListings.length} anúncios encontrados</span>
            {searchQuery && (
              <span className="bg-neutral-100 border border-neutral-200 text-black px-2 py-0.5 rounded truncate max-w-xs font-semibold">
                Termo: "{searchQuery}"
              </span>
            )}
            {selectedProvince !== "tudo" && (
              <span className="bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] px-2 py-0.5 rounded font-semibold">
                Província: {selectedProvince}
              </span>
            )}
            {showOnlyFavorites && (
              <span className="bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] px-2 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse">
                <Heart className="h-3 w-3 fill-[#E31B23]" /> Filtrado por Favoritos
              </span>
            )}
          </div>

        </section>

        {/* INTERACTIVE ALUGUER CATALOG GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-black flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-[#E31B23] fill-[#E31B23] animate-pulse" />
              <span>Destaques em <span className="italic underline decoration-[#FCD116] decoration-4 underline-offset-4 pointer-events-none">Moçambique</span></span>
            </h3>
            {filteredListings.length > 0 && (
              <span className="text-xs text-neutral-500 font-bold hidden sm:inline">
                Pressione os anúncios para agendar ou perguntar ao assistente.
              </span>
            )}
          </div>

          {isLoadingDb ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-black/10">
              <Clock className="w-10 h-10 animate-spin text-[#007A33] mx-auto" />
              <span className="text-xs text-neutral-500 block font-semibold">A estabelecer ligação com a Base de Dados em tempo real...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-black/10 py-16 text-center space-y-4 shadow-xs">
              <AlertCircle className="h-12 w-12 text-[#E31B23] mx-auto text-[#E31B23]" />
              <h3 className="text-base font-bold text-black">Nenhum aluguer correspondente encontrado</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                Tente redefinir o seu filtro de preço máximo, limpar o termo de pesquisa ou selecionar outra província como <strong>Maputo Cidade</strong> ou <strong>Matola</strong>.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvince("tudo");
                  setSelectedCategory("tudo");
                  setPriceRange(150000);
                  setShowOnlyFavorites(false);
                }}
                className="rounded-full bg-[#007A33] hover:bg-emerald-800 text-white font-bold px-5 py-2.5 text-xs transition-all cursor-pointer shadow-sm"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredListings.map(listing => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.21, 1.02, 0.43, 1.01] // Custom refined spring-like cubic bezier
                    }}
                    className="h-full"
                  >
                    <ListingCard
                      listing={listing}
                      isFavorite={favorites.includes(listing.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={(item) => setSelectedListing(item)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* EXPERT MOZAMBICAN RENTAL EDUCATIONAL CAROUSEL */}
        <section className="bg-gradient-to-tr from-black via-neutral-900 to-black rounded-[32px] p-6 md:p-8 text-white shadow-lg space-y-6 border border-black/10 text-left">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#FCD116]" />
            <div>
              <h3 className="text-lg font-serif font-black tracking-tight">Dicas MozRent • Como evitar problemas ao arrendar</h3>
              <span className="text-[11px] text-white/90 font-medium block uppercase tracking-wider mt-0.5">Conhecimento local adaptado à nossa realidade</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {RENTAL_GUIDES.map((guide, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5 flex-1 select-none">
                  <h4 className="text-xs font-black tracking-wide text-[#FCD116] flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FCD116] text-black text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {guide.title}
                  </h4>
                  <p className="text-[11px] text-neutral-200 leading-relaxed text-left">
                    {guide.content}
                  </p>
                </div>
                <button
                  onClick={() => setChatPrefill(`Explica-me mais detalhadamente sobre o guia de arrendamento em Moçambique: "${guide.title}". Qual é a importância e recomendação prática sobre: "${guide.content}"?`)}
                  className="text-left text-[10px] font-bold text-[#FCD116] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Saber mais com a I.A.</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* REAL CLIENT REVIEWS FEEDBACK SECTION (Added as durable persistence module) */}
        <section className="bg-[#007A33] text-white rounded-[32px] p-6 md:p-10 border border-[#005c26] shadow-md text-left grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feedback Form Submodule */}
          <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-white/20 pb-6 lg:pb-0 lg:pr-8">
            <h3 className="text-xl font-serif font-black text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#FCD116]" />
              <span>Avalie a sua Experiência</span>
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-semibold">
              Adicione a sua avaliação da plataforma em tempo real. Os seus comentários são imediatamente guardados na nossa base de dados Firestore e servem de transparência para toda a comunidade.
            </p>

            <form onSubmit={handleAddFeedbackSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-100 mb-1">Seu Nome *</label>
                <input 
                  type="text" 
                  required
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder="Ex: Celso de Nhakupandene"
                  className="w-full text-xs font-bold rounded-xl border border-white/15 px-3 py-2 bg-[#006028] text-white placeholder-emerald-200/50 focus:bg-[#005021] focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-100 mb-1">Classificação *</label>
                <select
                  value={feedbackStars}
                  onChange={(e) => setFeedbackStars(Number(e.target.value))}
                  className="w-full text-xs font-bold rounded-xl border border-white/15 px-3 py-2 bg-[#006028] text-white focus:bg-[#005021] focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                >
                  <option value="5" className="text-black">★★★★★ Excelente (5 estrelas)</option>
                  <option value="4" className="text-black">★★★★ Muito Bom (4 estrelas)</option>
                  <option value="3" className="text-black">★★★ Razoável (3 estrelas)</option>
                  <option value="2" className="text-black">★★ Insatisfeito (2 estrelas)</option>
                  <option value="1" className="text-black">★ Péssimo (1 estrela)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-100 mb-1">Mensagem / Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Ex: Aluguei um jipe e correu lindamente. Sem intermediários, sem burlas!"
                  className="w-full text-xs rounded-xl border border-white/15 px-3 py-2 bg-[#006028] text-white placeholder-emerald-200/50 focus:bg-[#005021] focus:outline-none focus:ring-1 focus:ring-[#FCD116]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="w-full py-2.5 rounded-full text-xs font-black text-[#007A33] bg-[#FCD116] hover:bg-[#ebd010] tracking-wide transition-all uppercase cursor-pointer"
              >
                {feedbackSubmitting ? "A gravar avaliação..." : "Enviar Avaliação"}
              </button>
            </form>
          </div>

          {/* Feedback Feed Lists Submodule */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <h3 className="text-lg font-serif font-black text-white">
                Comentários dos Clientes do MozRent ({feedbacks.length})
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-[#FCD116]">
                <Star className="h-4 w-4 fill-[#FCD116] text-[#FCD116]" />
                <span>Média: 4.9 / 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-2xl border border-white/10 bg-[#006028] space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{fb.name}</span>
                      <div className="flex text-[#FCD116] text-[10px]">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-[#FCD116] text-[#FCD116]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-100 italic leading-relaxed text-left mt-1.5">
                      "{fb.comment}"
                    </p>
                  </div>
                  <span className="text-[9px] text-emerald-300 font-mono block text-right">
                    Publicado em {fb.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER - Cleaned up to remove MozRent LDA and Central Cooperativa */}
      <footer className="bg-white text-black mt-12 py-10 px-4 md:px-8 border-t border-black/10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 border-b border-black/10 pb-8 mb-8 text-left">
          
          <div className="space-y-3.5 max-w-sm">
            <img 
              src={logoUrl} 
              alt="MozRent Logo" 
              className="h-12 w-auto object-contain" 
            />
            <p className="text-xs text-neutral-500">
              Alugue o que quiser, quando quiser. A rede de arrendamento transparente em Moçambique unindo inquilinos e proprietários com pagamentos via carteira móvel e segurança digital.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black tracking-wider uppercase text-neutral-400 select-none">Links Úteis</span>
            <div className="flex flex-col gap-2 text-xs font-bold text-neutral-600">
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-[#E31B23] text-left transition-colors cursor-pointer bg-transparent border-none">Termos e Condições</button>
              <button onClick={() => setIsHowItWorksOpen(true)} className="hover:text-[#E31B23] text-left transition-colors cursor-pointer bg-transparent border-none">Como funciona o M-Pesa / e-Mola / Mkesh / VISA</button>
              <button onClick={() => setIsSupportOpen(true)} className="hover:text-[#E31B23] text-left transition-colors cursor-pointer bg-transparent border-none">Suporte ao Cliente</button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black tracking-wider uppercase text-neutral-400 select-none">Aplicações Móveis</span>
            <div className="flex flex-row md:flex-col lg:flex-row gap-2.5">
              {/* Google Play Badgie */}
              <a 
                href="#download-playstore" 
                onClick={(e) => { e.preventDefault(); alert("Disponível brevemente na Google Play Store para dispositivos Android!"); }}
                className="flex items-center gap-2 bg-black hover:bg-neutral-900 text-white rounded-xl px-3.5 py-1.5 transition-all active:scale-95 border border-white/10 shadow-xs cursor-pointer"
              >
                <svg className="h-4.5 w-4.5 fill-current text-[#FCD116]" viewBox="0 0 24 24">
                  <path d="M3,5.277L14.71,17l3.743-3.743L3.137,3.136C3.048,3.225,3,3.344,3,3.473V5.277z M20.932,10.74l-3.32-1.92L15.93,10.5l1.682,1.682l3.32-1.92C21.196,11.104,21.196,10.844,20.932,10.74z M3,18.723c0,0.129,0.048,0.248,0.137,0.337l15.316-10.121-3.743-3.743L3,18.723z M18.453,7.561l2.479,1.431c0.264,0.104,0.264,0.364,0,0.468l-2.479,1.432L17.06,10.5L18.453,7.561z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[7px] block text-neutral-400 font-extrabold uppercase">Disponível no</span>
                  <span className="text-[10.5px] font-bold">Google Play</span>
                </div>
              </a>

              {/* Apple App Store Badgie */}
              <a 
                href="#download-appstore" 
                onClick={(e) => { e.preventDefault(); alert("Disponível brevemente na App Store para dispositivos iOS!"); }}
                className="flex items-center gap-2 bg-black hover:bg-neutral-900 text-white rounded-xl px-3.5 py-1.5 transition-all active:scale-95 border border-white/10 shadow-xs cursor-pointer"
              >
                <svg className="h-4.5 w-4.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,21.97C14.32,22,13.89,21.18,12.37,21.18C10.84,21.18,10.37,21.95,9.1,22C7.79,22.05,6.8,20.68,5.96,19.47C4.25,17,2.94,12.45,4.7,9.39C5.57,7.87,7.13,6.91,8.82,6.88C10.1,6.86,11.32,7.75,12.11,7.75C12.89,7.75,14.37,6.68,15.92,6.84C16.57,6.87,18.39,7.1,19.56,8.82C19.47,8.88,17.39,10.1,17.41,12.63C17.44,15.65,20.06,16.66,20.1,16.67C20.08,16.74,19.67,18.11,18.71,19.5M15.97,4.17C16.63,3.37,17.07,2.28,16.95,1C16,1.04,14.9,1.6,14.24,2.38C13.68,3.04,13.19,4.14,13.34,5.39C14.39,5.47,15.4,4.88,15.97,4.17Z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[7px] block text-neutral-400 font-extrabold uppercase">Descarregar na</span>
                  <span className="text-[10.5px] font-bold">App Store</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          <p className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>@ 2026 MozRent. Todos os direitos reservados. Desenvolvido por EgoBrain</span>
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="p-1 rounded text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
              title="Acesso Administrador"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </button>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#007A33]"></span>
            <span>Contacto: egobrain.mz@gmail.com</span>
          </div>
        </div>
      </footer>


      {/* ==== MODALS & INFOPANELS SECTION ==== */}

      {/* 1. SOBRE NÓS MODAL */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-black/10 p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-2">
              <h3 className="text-xl font-serif font-black text-black flex items-center gap-2">
                <Info className="h-5 w-5 text-[#007A33]" />
                <span>Sobre o MozRent</span>
              </h3>
              <button onClick={() => setIsAboutOpen(false)} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-neutral-600 leading-relaxed">
              O <strong>MozRent</strong> é a primeira plataforma de economia compartilhada focada exclusivamente na realidade moçambicana. O nosso lema é <strong>"Alugue o que quiser, quando quiser"</strong>. Viemos para unificar o mercado nacional de aluguer, garantindo que qualquer cidadão de Maputo ao Niassa possa arrendar uma vivenda, um jipe 4x4 ou uma betoneira em total segurança.
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Eliminamos a necessidade de intermediários ou comissões abusivas. Todos os anúncios passam por uma verificação rigorosa, com suporte para assinatura de termos de responsabilidade digital e validação integrada de documentos nacionais como BI, Passaporte e DIRE. É simples, rápido e totalmente blindado contra burlas de falso depósito.
            </p>
            <div className="p-4 rounded-2xl bg-neutral-50/50 border border-black/10">
              <span className="font-extrabold text-[11px] text-[#007A33] block uppercase mb-1">Nosso Propósito</span>
              <p className="text-[11px] text-neutral-500 italic">
                "Promover o acesso democrático ao arrendamento utilitário, eliminando intermediários informais especulativos e criando pontes financeiras digitais seguras baseadas em tecnologia local."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUPORTE AO CLIENTE MODAL */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-black/10 p-6 md:p-8 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-2">
              <h3 className="text-xl font-serif font-black text-black flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-[#E31B23]" />
                <span>Suporte ao Cliente & Contactos</span>
              </h3>
              <button onClick={() => setIsSupportOpen(false)} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-neutral-800">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-neutral-500 w-24">GitHub Oficial:</span>
                <a href="https://github.com/EgoBrain-Dev" target="_blank" rel="noreferrer" className="text-teal-700 hover:underline font-extrabold">
                  github.com/EgoBrain-Dev
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-neutral-500 w-24">WhatsApp:</span>
                <a href="https://wa.me/258843617130" target="_blank" rel="noreferrer" className="text-[#007A33] hover:underline font-extrabold">
                  +258 843617130
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-extrabold text-neutral-500 w-24">Contacto Geral:</span>
                <span className="text-black font-extrabold">
                  (+258) 843617130 <span className="text-neutral-350">|</span> (+258) 823400945
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-neutral-500 w-24">E-mail Support:</span>
                <a href="mailto:egobrain.mz@gmail.com" className="text-black hover:underline font-extrabold">
                  egobrain.mz@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 text-[10px] text-neutral-500 leading-relaxed flex items-start gap-1.5 font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-[#E31B23] flex-shrink-0 mt-0.5" />
              <span>Em caso de litígio, consulte o nosso Centro de Mediação Integrado no menu do WhatsApp acima detalhado. Nós garantimos suporte rápido 24 horas por dia.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. TERMOS E CONDIÇÕES MODAL (Fully Implemented) */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-black/10 p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-2">
              <h3 className="text-lg font-serif font-black text-black flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#007A33]" />
                <span>Termos e Condições Gerais</span>
              </h3>
              <button onClick={() => setIsTermsOpen(false)} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              {settings.termsText ? (
                <div className="whitespace-pre-line leading-relaxed text-left text-neutral-600">
                  {settings.termsText}
                </div>
              ) : (
                <>
                  <div>
                    <strong className="text-black block mb-1">1. Introdução e Objeto</strong>
                    <p>O presente contrato estabelece as normas reguladoras aplicadas aos inquilinos e senhorios cadastrados no ecossistema MozRent. Ao utilizar, concorda com a verificação de idoneidade nacional.</p>
                  </div>
                  <div>
                    <strong className="text-black block mb-1">2. Verificação de Documentação Obrigatória</strong>
                    <p>Todos os clientes devem fornecer de forma obrigatória uma cópia fotográfica legível dos respectivos documentos nacionais válidos (Bilhete de Identidade, Passaporte internacional ou D.I.R.E.) e preencher a numeração correspondente. Falsificação documental resulta em exclusão imediata e reporte às autoridades judiciais moçambicanas.</p>
                  </div>
                  <div>
                    <strong className="text-black block mb-1">3. Garantia de Termo de Responsabilidade Digital</strong>
                    <p>Cada reserva constitui contratualmente uma guarda de responsabilidade civil sobre o bem arrendado (viatura, imóvel ou betoneira). Danos mecânicos ou estruturais não declarados serão alvo de débito escusado através do nosso centro integrado de mediação.</p>
                  </div>
                  <div>
                    <strong className="text-black block mb-1">4. Proteção contra Fraudes no Escrow</strong>
                    <p>Para evitar as burlas típicas de corretores que exigem depósitos sinalizados de forma antecipada, todos os pagamentos passam garantidos pela carteira móvel MozRent. O valor correspondente é retido até que o check-in presencial ocorra, fornecendo 100% de checkout protegido.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. COMO FUNCIONA O PAGAMENTO MODAL (Fully Implemented) */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-black/10 p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-2">
              <h3 className="text-lg font-serif font-black text-black flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#FCD116]" />
                <span>Como Funciona o Pagamento</span>
              </h3>
              <button onClick={() => setIsHowItWorksOpen(false)} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
              <p>O MozRent opera em parceria tecnológica com os principais canais bancários e móveis moçambicanos para garantir fluxos financeiros imediatos sem burocracias:</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                  <strong className="text-black mb-1 select-none flex items-center gap-1.5 font-bold">
                    <Smartphone className="h-4 w-4 text-[#007A33]" />
                    <span>Carteiras Móveis (M-Pesa, e-Mola, Mkesh)</span>
                  </strong>
                  <p>Insira o seu número ao alugar. O sistema enviará automaticamente um pedido de prompt PUSH para a sua tela do telemóvel. Ao preencher o seu PIN privado, a transação SMS correspondente é validada, e o aluguer fica ativo.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                  <strong className="text-black mb-1 select-none flex items-center gap-1.5 font-bold font-sans">
                    <CreditCard className="h-4 w-4 text-[#E31B23]" />
                    <span>Cartões VISA nacionais e internacionais</span>
                  </strong>
                  <p>Disponibilizamos gateway integrado para Visa, onde a autenticação 3D Secure garante o débito rápido e seguro do metical.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                  <strong className="text-black mb-1 select-none flex items-center gap-1.5 font-bold font-sans">
                    <Building2 className="h-4 w-4 text-neutral-700" />
                    <span>Rede Bancária Ponto24</span>
                  </strong>
                  <p>Efetue o seu depósito e indique a referência SMS emitida pelo caixa automático para processamento imediato pelo senhorio.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. USER MONETIZATION BUSINESS MODEL DASHBOARD MODAL */}
      {isMonetizationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-black/10 p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-2">
              <h3 className="text-xl font-serif font-black text-black flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#007A33]" />
                <span>Monetização do Proprietário MozRent</span>
              </h3>
              <button onClick={() => setIsMonetizationOpen(false)} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Como proprietário e dono único da plataforma <strong>MozRent</strong>, o seu modelo de ganhos e rentabilização está estruturado em 3 pilares de monetização integrados:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/10 flex items-start gap-3">
                <span className="flex h-6 w-6 rounded-full bg-[#007A33] text-white font-extrabold text-xs items-center justify-center flex-shrink-0">1</span>
                <div>
                  <strong className="text-black font-extrabold text-xs block">Taxa de Intermediação Escrow (3.5%)</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Para cada transação financeira concluída com sucesso via M-Pesa, e-Mola, Mkesh ou VISA, o MozRent retém automaticamente 3.5% de taxa de comissão administrativa antes de libertar os restantes 96.5% para a conta do senhorio/proprietário do bem.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/10 flex items-start gap-3">
                <span className="flex h-6 w-6 rounded-full bg-[#FCD116] text-black font-extrabold text-xs items-center justify-center flex-shrink-0">2</span>
                <div>
                  <strong className="text-black font-extrabold text-xs block">Destaque Premium (500 MT / semana)</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Os senhorios que desejam maximizar a visualização dos seus imóveis, frotas de carrinhas ou geradores e colocá-los no topo do catálogo de Destaques em Moçambique pagam uma taxa fixa recorrente de 500 MT por semana.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#E31B23]/5 border border-[#E31B23]/15 flex items-start gap-3">
                <span className="flex h-6 w-6 rounded-full bg-[#E31B23] text-white font-extrabold text-xs items-center justify-center flex-shrink-0">3</span>
                <div>
                  <strong className="text-black font-extrabold text-xs block">Taxa de Inspeção "Verificado" (1,200 MT)</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Para exibir o selo oficial de "Dono Verificado", a equipa do MozRent envia voluntariamente inspetores ao local para realizar a auditoria física do motor da viatura ou instalações EDM/FIPAG do imóvel. Esta verificação física custa 1,200 MT de taxa única.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] text-neutral-400 italic">
              * Nota: Estas taxas são processadas diretamente de forma integrada nos gateways das operadoras móveis locais vodacom/movitel e registadas na base de dados do painel administrador.
            </p>
          </div>
        </div>
      )}


      {/* ---- LOWER MODAL COMPONENT INTEGRATIONS ---- */}

      {/* A. Rental Description Detail modal */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onBook={handleNewBooking}
          onRateListing={handleRateListing}
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
        />
      )}

      {/* C2. Admin Confidential Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboardModal
          listings={listings}
          bookings={bookings}
          settings={settings}
          onClose={() => setIsAdminOpen(false)}
          onUpdateListingVerification={handleUpdateListingVerification}
          onDeleteListing={handleDeleteListing}
          onUpdateSettings={handleUpdateSettings}
          onUpdateBookingStatus={handleUpdateBookingStatus}
        />
      )}

      {/* D. FLOATING INTELLIGENT AI CAPULANA CHAT ASSISTANT */}
      <AIAssistant 
        currentPropertyContext={selectedListing} 
        chatPrefill={chatPrefill}
        onClearPrefill={() => setChatPrefill(null)}
      />

    </div>
  );
}
