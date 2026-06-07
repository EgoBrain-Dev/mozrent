import { useState, FormEvent } from "react";
import { X, ShieldCheck, MapPin, Phone, MessageSquare, Star, Users, Calendar, AlertTriangle, ArrowRight, ShieldAlert, CreditCard, Sparkles, Upload } from "lucide-react";
import { Listing, RentBooking } from "../types";

interface ListingDetailsModalProps {
  listing: Listing;
  onClose: () => void;
  onBook: (booking: Omit<RentBooking, "id" | "createdAt" | "status">) => void;
}

export default function ListingDetailsModal({ listing, onClose, onBook }: ListingDetailsModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking Form States
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [documentType, setDocumentType] = useState<'bi' | 'passaporte' | 'dire'>('bi');
  const [tenantIdentity, setTenantIdentity] = useState(""); // Mozambique BI
  const [documentFile, setDocumentFile] = useState<string>(""); // Uploaded identity photography file
  const [isDragging, setIsDragging] = useState(false);

  const [rentDuration, setRentDuration] = useState(1);
  const [rentStartDate, setRentStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'ponto24' | 'mkesh' | 'visa'>('mpesa');
  
  // Account/Channel details
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [visaCardNo, setVisaCardNo] = useState("");
  const [visaExpiry, setVisaExpiry] = useState("");
  const [visaCvv, setVisaCvv] = useState("");

  // Simulated Overlay Gateway Pin Dialog States
  const [showPinOverlay, setShowPinOverlay] = useState(false);
  const [simulatedPin, setSimulatedPin] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Compute estimate
  const totalAmount = listing.price * rentDuration;

  // Manual document number validator
  const validateDocumentNumber = (): boolean => {
    const value = tenantIdentity.trim().toUpperCase();
    if (documentType === 'bi') {
      // Mozambique BI: 12 digits + 1 upper case letter
      const biPattern = /^\d{12}[A-Z]$/;
      if (!biPattern.test(value)) {
        alert("O Bilhete de Identidade (BI) deve ter exatamente 12 números seguidos de 1 letra maiúscula (ex: 110203040506A).");
        return false;
      }
    } else if (documentType === 'passaporte') {
      // Passport: e.g. minimum 7 alphanumeric chars
      if (value.length < 7 || value.length > 12) {
        alert("O Passaporte deve conter entre 7 e 12 caracteres alfanuméricos (ex: AA1234567).");
        return false;
      }
    } else if (documentType === 'dire') {
      // DIRE: e.g. minimum 6 chars
      if (value.length < 6 || value.length > 12) {
        alert("O DIRE deve conter entre 6 e 12 caracteres alfanuméricos.");
        return false;
      }
    }
    return true;
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantPhone.trim() || !tenantIdentity.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios para prosseguir.");
      return;
    }

    // Document validation
    if (!validateDocumentNumber()) {
      return;
    }

    if (!documentFile) {
      alert("Por favor, carregue a foto do seu documento de identificação (BI/Passaporte/DIRE) para fins de autenticidade.");
      return;
    }

    if (paymentMethod === 'visa') {
      if (!visaCardNo.trim() || !visaExpiry.trim() || !visaCvv.trim()) {
        alert("Por favor, introduza os dados do seu cartão VISA.");
        return;
      }
    } else if (paymentMethod !== 'ponto24') {
      // Wallet payments: M-Pesa, e-Mola, Mkesh
      if (!mpesaNumber.trim()) {
        alert(`Por favor, introduza o número do telemóvel associado ao seu ${paymentMethod.toUpperCase()} para receber o prompt de PIN.`);
        return;
      }
    }

    // Show operator push SMS popup!
    setShowPinOverlay(true);
  };

  const handleConfirmPinPayment = () => {
    if (paymentMethod === 'visa' && !simulatedOtp.trim()) {
      alert("Por favor, introduza o código de autenticação VISA OTP enviado para o seu telemóvel.");
      return;
    } else if (paymentMethod !== 'visa' && paymentMethod !== 'ponto24' && !simulatedPin.trim()) {
      alert("Por favor, introduza o seu PIN de segurança da carteira móvel.");
      return;
    }

    setIsProcessingPayment(true);

    // Simulate real delay to connect with Vodacom/Movitel/TMcel API
    setTimeout(() => {
      // Generate a realistic SMS Transaction Reference Number
      let refNum = "";
      const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randIdx = Math.floor(Math.random() * 90000) + 10000;
      if (paymentMethod === 'mpesa') {
        refNum = `MP${randIdx}.${randHex}`;
      } else if (paymentMethod === 'emola') {
        refNum = `EM${randIdx}.${randHex}`;
      } else if (paymentMethod === 'mkesh') {
        refNum = `MK${randIdx}.${randHex}`;
      } else if (paymentMethod === 'visa') {
        refNum = `VS${randIdx}.${randHex}`;
      } else {
        refNum = `PT${randIdx}.${randHex}`;
      }
      setReferenceCode(refNum);

      // Book listing in state!
      onBook({
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.image,
        price: listing.price,
        period: listing.period,
        userName: tenantName,
        userPhone: tenantPhone,
        userIdentity: tenantIdentity.trim().toUpperCase(),
        documentType,
        documentFile,
        startDate: rentStartDate,
        duration: rentDuration,
        paymentMethod,
        mpesaNumber: mpesaNumber || undefined,
        visaCardNumber: paymentMethod === 'visa' ? visaCardNo : undefined,
        referenceNumber: refNum
      });

      setIsProcessingPayment(false);
      setShowPinOverlay(false);
      setBookingSuccess(true);
    }, 2000);
  };

  return (
    <div 
      id={`details-modal-${listing.id}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-[32px] bg-white border border-natural-border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Images & Gallery */}
        <div className="w-full md:w-1/2 bg-natural-aside flex flex-col justify-between p-5 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-200">
            <img
              src={listing.gallery[activePhotoIndex] || listing.image}
              alt={listing.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            
            {/* Index Display */}
            <div className="absolute bottom-3 right-3 rounded-full bg-brand-black/85 px-3 py-1 text-xs font-semibold text-white">
              {activePhotoIndex + 1} de {listing.gallery.length}
            </div>
            
            {/* Live validation tag */}
            {listing.verified && (
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded bg-[#00843D] px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow">
                <ShieldCheck className="h-3 w-3" />
                Dono Verificado
              </div>
            )}
          </div>

          {/* Photo Thumbnails */}
          {listing.gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {listing.gallery.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIndex(i)}
                  className={`relative h-14 w-18 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activePhotoIndex ? "border-brand-green scale-95 shadow-xs" : "border-transparent"
                  }`}
                >
                  <img
                    src={photo}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Localized Mozambique Tip Box */}
          <div className="rounded-2xl bg-[#FDF8F1] border border-natural-border p-4 text-xs text-[#6B665F] leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-brand-black mb-1.5">
              <AlertTriangle className="h-4 w-4 text-brand-yellow" />
              <span>Dica MozRent de Segurança</span>
            </div>
            <span>
              {listing.category === 'imovel' 
                ? "Este imóvel possui reservas automáticas de água FIPAG. Recomendamos sempre verificar a electrobomba pessoalmente antes de efectuar o primeiro pagamento."
                : "Para viaturas, consulte o estado das estradas e mantenha sempre o contacto do proprietário em caso de assistência mecânica voluntária."}
            </span>
          </div>
        </div>

        {/* Right Side: Details & Simulated Checkout */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[90vh] border-l border-natural-border">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B665F]">
              {listing.category === 'imovel' ? 'ARRENDAMENTO IMOBILIÁRIO' : listing.category === 'veiculo' ? 'ALUGUER DE VIATURA' : 'MAQUINARIA' }
            </span>
            <button 
              onClick={onClose}
              className="rounded-full bg-natural-aside p-2 text-[#6B665F] hover:bg-neutral-200 hover:text-brand-black transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-black leading-tight">
                {listing.title}
              </h2>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B665F] font-bold">
                <MapPin className="h-4 w-4 text-brand-red" />
                <span>{listing.location}</span>
              </div>
            </div>

            {/* Price Tag Details */}
            <div className="flex items-baseline justify-between rounded-2xl bg-natural-aside border border-natural-border p-4">
              <div>
                <span className="text-[10px] text-[#6B665F] font-bold block uppercase tracking-wider">
                  Custo Local
                </span>
                <span className="text-2xl font-bold font-serif text-brand-green">
                  {listing.price.toLocaleString()}
                </span>
                <span className="text-brand-black font-extrabold text-sm ml-1">MT</span>
                <span className="text-[#6B665F] text-xs"> /{listing.period === 'mês' ? 'mês' : 'dia'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-white px-2.5 py-1.5 rounded-xl border border-natural-border font-bold shadow-xs">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{listing.rating.toFixed(1)} de 5</span>
              </div>
            </div>

            {/* Property parameters if any */}
            {listing.category === 'imovel' && (
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="rounded-xl bg-natural-aside border border-natural-border p-2">
                  <span className="text-[9px] text-[#6B665F] font-bold uppercase block">Quartos</span>
                  <span className="text-sm font-extrabold text-brand-black">{listing.rooms || "N/A"}</span>
                </div>
                <div className="rounded-xl bg-natural-aside border border-natural-border p-2">
                  <span className="text-[9px] text-[#6B665F] font-bold uppercase block">Casas Banho</span>
                  <span className="text-sm font-extrabold text-brand-black">{listing.bathrooms || "N/A"}</span>
                </div>
                <div className="rounded-xl bg-natural-aside border border-natural-border p-2">
                  <span className="text-[9px] text-[#6B665F] font-bold uppercase block">Dimensão</span>
                  <span className="text-sm font-extrabold text-brand-black">{listing.spaceArea || "N/A"}</span>
                </div>
              </div>
            )}

            {/* General item parameters */}
            {listing.category !== 'imovel' && (
              <div className="rounded-xl bg-natural-aside border border-natural-border p-3 flex justify-between text-xs text-[#6B665F] font-medium">
                <span>Capacidade / Potência de Trabalho:</span>
                <strong className="text-brand-black">{listing.spaceArea || "N/A"}</strong>
              </div>
            )}

            {/* About text */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B665F] mb-1.5">
                Descrição Detalhada
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                {listing.description}
              </p>
            </div>

            {/* Ample features list */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B665F] mb-1.5">
                Comodidades & Recursos
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {listing.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full bg-natural-aside px-3 py-1.5 border border-natural-border text-xs text-[#6B665F] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green"></span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Landlord meta box */}
            <div className="rounded-2xl border border-natural-border bg-[#FDF8F1] p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-yellow text-brand-black font-extrabold text-sm flex items-center justify-center">
                  {listing.landlordName.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#6B665F] block font-bold uppercase leading-none">Anunciante Proprietário</span>
                  <span className="text-xs font-bold text-brand-black mt-1 block">{listing.landlordName}</span>
                  <span className="text-[10px] text-[#6B665F] block mt-0.5">{listing.landlordPhone}</span>
                </div>

                {/* Secure WhatsApp launcher link */}
                <a 
                  href={listing.landlordWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00843D] hover:bg-emerald-800 text-white shadow transition-all hover:scale-110 active:scale-95"
                  title="Conversar direto no WhatsApp"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
                
                <a 
                  href={`tel:${listing.landlordPhone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow hover:bg-amber-500 text-brand-black shadow transition-all hover:scale-110 active:scale-95"
                  title="Telefonar Directo"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Interactive Rent booking CTA or visual forms */}
          <div className="mt-6 pt-4 border-t border-natural-border">
            {bookingSuccess ? (
              <div className="rounded-2xl bg-[#FDF8F1] border border-natural-border p-4 text-center">
                <ShieldCheck className="h-10 w-10 text-brand-green mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-brand-black">Pedido Enviado com Sucesso!</h4>
                <p className="mt-1 text-xs text-[#6B665F] leading-relaxed">
                  Enviámos um prompt de pagamento para o seu telemóvel via <strong>{paymentMethod.toUpperCase()}</strong>. Digite o PIN para autorizar. Pode acompanhar o estado na aba \"Os Meus Alugueres\".
                </p>
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setShowBookingForm(false);
                    onClose();
                  }}
                  className="mt-3.5 w-full bg-brand-black hover:bg-neutral-800 text-white rounded-full py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Continuar a Procurar
                </button>
              </div>
            ) : !showBookingForm ? (
              <button
                id="rent-now-button"
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-[#00843D] hover:bg-emerald-800 text-white font-extrabold rounded-full py-4 text-sm transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] cursor-pointer"
              >
                <span>Alugar Agora com Segurança</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 bg-natural-aside p-4 rounded-2xl border border-natural-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-brand-black uppercase tracking-wide flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-brand-green" />
                    Reserva Segura MozRent
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowBookingForm(false)} 
                    className="text-xs text-brand-red hover:underline font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-2 text-left">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">Seu Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Ex: Mateus Tembe"
                      className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">Telemóvel Pessoal *</label>
                    <input
                      type="tel"
                      required
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="Ex: 841112222"
                      className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                    />
                  </div>

                  {/* Document Type Selection & Custom Validator */}
                  <div className="p-3 bg-white rounded-xl border border-natural-border space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#6B665F] mb-1">Tipo Identificação *</label>
                        <select
                          value={documentType}
                          onChange={(e) => {
                            setDocumentType(e.target.value as 'bi' | 'passaporte' | 'dire');
                            setTenantIdentity(""); // Clear validation match
                          }}
                          className="w-full rounded-xl border border-natural-border bg-[#FAF5EE]/35 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green font-bold text-neutral-800"
                        >
                          <option value="bi">Bilhete (BI)</option>
                          <option value="passaporte">Passaporte</option>
                          <option value="dire">D.I.R.E.</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#6B665F] mb-1">Nº do Documento *</label>
                        <input
                          type="text"
                          required
                          value={tenantIdentity}
                          onChange={(e) => setTenantIdentity(e.target.value)}
                          placeholder={
                            documentType === 'bi' 
                              ? "12 nrs + 1 letra" 
                              : documentType === 'passaporte'
                              ? "Ex: AA1234567"
                              : "Nº de DIRE"
                          }
                          className="w-full rounded-xl border border-natural-border bg-white px-2.5 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none font-bold placeholder:font-normal placeholder:text-neutral-400"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] leading-relaxed text-[#6B665F] font-semibold bg-[#FAF5EE]/40 p-2 rounded-lg border border-dashed border-natural-border">
                      {documentType === 'bi' && "📋 Formato do BI: 12 algarismos seguidos de 1 letra (Ex: 110203040506A)."}
                      {documentType === 'passaporte' && "📋 Formato do Passaporte: De 7 a 12 caracteres alfanuméricos."}
                      {documentType === 'dire' && "📋 Formato do DIRE: De 6 a 12 caracteres de residente."}
                    </div>

                    {/* Upload simulated box with drag-and-drop support */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-extrabold text-[#6B665F] mb-1">Fazer Upload ou Foto do Doc *</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setDocumentFile(e.dataTransfer.files[0].name);
                          }
                        }}
                        onClick={() => {
                          const docName = `${documentType.toUpperCase()}_Foto_${tenantName ? tenantName.replace(/\s+/g, '_') : 'Doc'}.pdf`;
                          setDocumentFile(docName);
                        }}
                        className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                          isDragging ? 'bg-emerald-50 border-[#00843D]' : 'bg-[#FAF5EE]/20 border-natural-border hover:bg-[#FAF5EE]/50'
                        }`}
                      >
                        <Upload className="h-5 w-5 mx-auto text-[#6B665F]/60 mb-1" />
                        {documentFile ? (
                          <div className="text-xs font-bold text-[#00843D] flex flex-col items-center justify-center">
                            <span className="truncate max-w-[200px]">✓ {documentFile}</span>
                            <span className="text-[9px] text-[#6B665F] font-normal mt-0.5">(Clique para substituir)</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] font-bold text-brand-black">Arraste ou clique para carregar</p>
                            <p className="text-[9px] text-[#6B665F]">BI, Passaporte ou DIRE (Máx 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">Início do Aluguer</label>
                      <input
                        type="date"
                        value={rentStartDate}
                        onChange={(e) => setRentStartDate(e.target.value)}
                        className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">
                        Duração ({listing.period === 'mês' ? 'Meses' : listing.period === 'evento' ? 'Eventos' : 'Dias'})
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={rentDuration}
                        onChange={(e) => setRentDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Gateway choice */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">Escolher Canal de Pagamento</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-center font-bold">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`rounded-xl py-2 px-1 text-[11px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === 'mpesa' 
                            ? 'bg-rose-50 text-rose-700 border-[#E31B23] shadow-xs ring-1 ring-[#E31B23]' 
                            : 'bg-white text-neutral-600 border-natural-border hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-[#E31B23]">M-Pesa</span>
                        <span className="text-[8px] font-medium text-[#6B665F]">Vodacom</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('emola')}
                        className={`rounded-xl py-2 px-1 text-[11px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === 'emola' 
                            ? 'bg-orange-50 text-orange-700 border-orange-500 shadow-xs ring-1 ring-orange-500' 
                            : 'bg-white text-neutral-600 border-natural-border hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-orange-600">e-Mola</span>
                        <span className="text-[8px] font-medium text-[#6B665F]">Movitel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mkesh')}
                        className={`rounded-xl py-2 px-1 text-[11px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === 'mkesh' 
                            ? 'bg-amber-50 text-amber-700 border-amber-500 shadow-xs ring-1 ring-amber-500' 
                            : 'bg-white text-neutral-600 border-natural-border hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-amber-600">mkesh</span>
                        <span className="text-[8px] font-medium text-[#6B665F]">Tmcel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('visa')}
                        className={`rounded-xl py-2 px-1 text-[11px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === 'visa' 
                            ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-xs ring-1 ring-blue-600' 
                            : 'bg-white text-neutral-600 border-natural-border hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-blue-600 font-sans">VISA</span>
                        <span className="text-[8px] font-medium text-[#6B665F]">Internacional</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ponto24')}
                        className={`rounded-xl py-2 px-1 text-[11px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          paymentMethod === 'ponto24' 
                            ? 'bg-emerald-50 text-brand-green border-brand-green shadow-xs ring-1 ring-brand-green' 
                            : 'bg-white text-neutral-600 border-natural-border hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-[#00843D]">Ponto24</span>
                        <span className="text-[8px] font-medium text-[#6B665F]">Interbancos</span>
                      </button>
                    </div>
                  </div>

                  {/* Conditional Account Fields */}
                  {paymentMethod === 'visa' ? (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-natural-border space-y-2 text-left">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold text-[#6B665F] mb-0.5">Número do Cartão VISA *</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={visaCardNo}
                          onChange={(e) => setVisaCardNo(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          placeholder="Ex: 4000 1234 5678 9010"
                          className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-bold text-[#6B665F] mb-0.5">Expiração (MM/AA) *</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={visaExpiry}
                            onChange={(e) => setVisaExpiry(e.target.value)}
                            placeholder="MM/AA"
                            className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-bold text-[#6B665F] mb-0.5">CVV (Segurança) *</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={visaCvv}
                            onChange={(e) => setVisaCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ex: 123"
                            className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ) : paymentMethod !== 'ponto24' ? (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B665F] mb-1">
                        Conta Móvel • {paymentMethod === 'mpesa' ? 'M-Pesa Vodacom' : paymentMethod === 'emola' ? 'e-Mola Movitel' : 'mkesh Tmcel'} (9 dígitos) *
                      </label>
                      <input
                        type="tel"
                        maxLength={9}
                        required
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder={paymentMethod === 'mpesa' ? "Ex: 84xxxxxxx" : paymentMethod === 'emola' ? "Ex: 86xxxxxxx" : "Ex: 82xxxxxxx"}
                        className="w-full rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none font-bold"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50/50 text-[#00843D] rounded-xl border border-[#00843D]/20 text-[10px] font-bold text-center">
                      ✓ Redireccionamento seguro Ponto24. Não precisa inserir número de conta móvel.
                    </div>
                  )}
                </div>

                {/* Estimate calculations */}
                <div className="rounded-xl border border-natural-border bg-white p-3 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-[#6B665F]">
                    <span>Taxa base ({rentDuration}x):</span>
                    <span>{(listing.price * rentDuration).toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#6B665F]">
                    <span>Stock Disponível Actual:</span>
                    <span className="font-extrabold text-neutral-850 bg-neutral-100 px-1.5 py-0.5 rounded">{listing.stock ?? 1} unidades</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#6B665F]">
                    <span>Taxa de Verificação/Selo:</span>
                    <span className="text-brand-green font-extrabold">Grátis</span>
                  </div>
                  <div className="border-t border-natural-border my-1.5 pt-1.5 flex justify-between font-black text-brand-black text-sm">
                    <span>Total Estimado:</span>
                    <span className="text-[#00843D]">{totalAmount.toLocaleString()} MT</span>
                  </div>
                </div>

                {/* Security warning */}
                <p className="text-[9px] text-[#6B665F] leading-normal flex items-start gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-brand-yellow flex-shrink-0 mt-0.5" />
                  <span>
                    O MozRent nunca partilha o seu PIN do M-Pesa. Receberá o prompt oficial da operadora directamente no seu telemóvel para autorização.
                  </span>
                </p>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#00843D] hover:bg-[#006F33] text-white font-extrabold rounded-full py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  Confirmar e Solicitar PIN {totalAmount.toLocaleString()} MT
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Renders Operator PUSH PIN input prompt simulator */}
      {showPinOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[32px] bg-neutral-900 border border-neutral-700 text-white overflow-hidden shadow-2xl p-6 relative">
            <div className="flex flex-col items-center text-center space-y-4">
              
              {paymentMethod === 'mpesa' && (
                <>
                  <div className="h-14 w-14 rounded-full bg-[#E31B23] flex items-center justify-center text-white font-bold text-xl select-none">M</div>
                  <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">VODACOM M-PESA PUSH</h3>
                  <p className="text-xs text-neutral-400">
                    Deseja autorizar o pagamento de <strong className="text-white font-black">{totalAmount.toLocaleString()} MT</strong> para <strong className="text-white">MozRent Lda.</strong>?
                  </p>
                  <div className="w-full space-y-1">
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider text-left">Introduza o PIN do M-Pesa (4 dígitos) *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={simulatedPin}
                      onChange={(e) => setSimulatedPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: ••••"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-center text-xl text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'emola' && (
                <>
                  <div className="h-14 w-14 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl select-none">e-M</div>
                  <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">MOVITEL E-MOLA PUSH</h3>
                  <p className="text-xs text-neutral-400">
                    Deseja autorizar o pagamento de <strong className="text-white font-black">{totalAmount.toLocaleString()} MT</strong> para <strong className="text-white">MozRent Lda.</strong>?
                  </p>
                  <div className="w-full space-y-1">
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider text-left">Introduza o PIN do e-Mola (4 dígitos) *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={simulatedPin}
                      onChange={(e) => setSimulatedPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: ••••"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-center text-xl text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'mkesh' && (
                <>
                  <div className="h-14 w-14 rounded-full bg-amber-500 flex items-center justify-center text-neutral-900 font-bold text-xl select-none">mk</div>
                  <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">TMCEL M-KESH PUSH</h3>
                  <p className="text-xs text-neutral-400">
                    Deseja autorizar o pagamento de <strong className="text-white font-black">{totalAmount.toLocaleString()} MT</strong> para <strong className="text-white">MozRent Lda.</strong>?
                  </p>
                  <div className="w-full space-y-1">
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider text-left">Introduza o PIN do mkesh (4 dígitos) *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={simulatedPin}
                      onChange={(e) => setSimulatedPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: ••••"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-center text-xl text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'visa' && (
                <>
                  <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold select-none"><CreditCard className="h-6 w-6" /></div>
                  <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">VERIFIED BY VISA OTP</h3>
                  <p className="text-xs text-neutral-400">
                    O Banco emissor enviou um código de autorização SMS de 6 dígitos para o número <strong className="text-white font-extrabold">{tenantPhone}</strong>.
                  </p>
                  <div className="w-full space-y-1">
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider text-left">Código de Autenticação (6 dígitos) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={simulatedOtp}
                      onChange={(e) => setSimulatedOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 123456"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-center text-md text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'ponto24' && (
                <>
                  <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm select-none">P24</div>
                  <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">PONTO24 TRANSACÇÃO COM CARTÃO</h3>
                  <p className="text-xs text-neutral-400">
                    Deseja autorizar o débito directo de <strong className="text-white font-black">{totalAmount.toLocaleString()} MT</strong> na sua conta interbancária para <strong className="text-white">MozRent Lda.</strong>?
                  </p>
                  <div className="w-full space-y-1">
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider text-left">Introduza o PIN do Cartão / Conta *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={simulatedPin}
                      onChange={(e) => setSimulatedPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: ••••"
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-center text-xl text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div className="w-full pt-4 space-y-1.5">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPinPayment}
                  className="w-full rounded-full py-3 text-xs bg-[#00843D] hover:bg-emerald-800 text-white font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 shadow disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {isProcessingPayment ? "A processar..." : "Autorizar e Confirmar Pagamento"}
                </button>
                
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => {
                    setShowPinOverlay(false);
                    setSimulatedPin("");
                    setSimulatedOtp("");
                  }}
                  className="w-full text-neutral-500 hover:text-white transition-colors text-xs py-1 font-bold"
                >
                  Cancelar Pagamento
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
