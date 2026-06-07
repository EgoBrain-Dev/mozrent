import { useState } from "react";
import { X, CheckCircle, Clock, AlertTriangle, ShieldCheck, Zap, CornerDownRight, ArrowUpRight, Compass } from "lucide-react";
import { RentBooking } from "../types";

interface BookingDashboardModalProps {
  bookings: RentBooking[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'Pendente' | 'Confirmado' | 'Rejeitado', ref?: string) => void;
  onExtendBooking: (id: string, extraDuration: number) => void;
}

export default function BookingDashboardModal({ 
  bookings, 
  onClose, 
  onUpdateStatus,
  onExtendBooking
}: BookingDashboardModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trxCodes, setTrxCodes] = useState<Record<string, string>>({});
  const [notificationPermission, setNotificationPermission] = useState<string>(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  // Renewal form interactive state
  const [activeRenewalId, setActiveRenewalId] = useState<string | null>(null);
  const [renewalDuration, setRenewalDuration] = useState<number>(1);
  const [renewalOp, setRenewalOp] = useState<'mpesa' | 'emola' | 'mkesh' | 'visa'>('mpesa');
  const [renewalPhone, setRenewalPhone] = useState<string>("");
  const [renewalPin, setRenewalPin] = useState<string>("");
  const [isRenewing, setIsRenewing] = useState<boolean>(false);

  const simulateCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const submitTransactionCode = (id: string) => {
    const code = trxCodes[id]?.trim();
    if (!code) {
      alert("Por favor, digite o código de transacção SMS recebido para validar.");
      return;
    }
    onUpdateStatus(id, "Confirmado", code);
    alert(`Pagamento validado com sucesso! Transação ${code} vinculada ao seu aluguer.`);
  };

  // Process renewal extension
  const handleProceedRenewal = (book: RentBooking) => {
    // Check if user has too much remaining days (rule: prevent early renewals if significant days match)
    const timeLeftMs = (book.expiresAt ?? 0) - Date.now();
    const daysRemaining = Math.ceil(timeLeftMs / (1000 * 60 * 60 * 24));

    if (daysRemaining > 1) {
      alert(`Aviso de Economia de Saldo MozRent: Ainda tem ${daysRemaining} dias de contrato activo para este item!\n\nSó permitimos efectuar pagamentos de renovação quando restarem menos de 24 horas (1 dia) para expirar. Assim evita gastos desnecessários ou acumulações acidentais.`);
      return;
    }

    // Otherwise, toggle the renewal checkout section
    if (activeRenewalId === book.id) {
      setActiveRenewalId(null);
    } else {
      setActiveRenewalId(book.id);
      setRenewalDuration(1);
      setRenewalPin("");
      setRenewalPhone(book.userPhone);
    }
  };

  // Confirms renewal and processes PIN simulation
  const handleConfirmRenewalSubmit = (book: RentBooking) => {
    if (!renewalPin.trim() || renewalPin.length < 4) {
      alert("Por favor, introduza o PIN de segurança com 4 dígitos da sua carteira móvel.");
      return;
    }

    setIsRenewing(true);

    // Simulate real delay
    setTimeout(() => {
      onExtendBooking(book.id, renewalDuration);
      
      // Reset renewal state
      setActiveRenewalId(null);
      setRenewalPin("");
      setIsRenewing(false);
      alert(`Aluguer renovado com sucesso! Foram adicionados +${renewalDuration} ${book.period === 'mês' ? 'meses' : book.period === 'evento' ? 'eventos' : 'dias'} ao seu período total de aluguer. O status e os dias foram atualizados.`);
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs overflow-y-auto font-sans"
    >
      <div 
        id="booking-dashboard-modal"
        className="relative w-full max-w-2xl rounded-[32px] bg-white border border-natural-border shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-natural-border pb-4 mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-brand-black flex items-center gap-1.5">
              <span>Os Meus Alugueres • Painel MozRent</span>
              <span className="rounded-full bg-brand-green/15 text-brand-green text-[11px] font-bold px-3 py-0.5 border border-brand-green/20">
                {bookings.length} Activos
              </span>
            </h2>
            <span className="text-xs text-[#6B665F] font-bold block mt-1">
              Gerencie seus pagamentos, documentos e faça renovações em tempo real
            </span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-natural-aside p-2 text-[#6B665F] hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Flow */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Notification Permission Quick Banner */}
          {"Notification" in window && (
            <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-2xl flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 text-neutral-700">
                <span className={`flex h-2 w-2 rounded-full ${notificationPermission === "granted" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
                <span>
                  {notificationPermission === "granted" ? (
                    <span className="text-[#007A33] font-bold">🟢 Notificações ativas! Receberá alertas quando o estado mudar.</span>
                  ) : notificationPermission === "denied" ? (
                    <span className="text-[#E31B23] font-semibold">🔴 Notificações bloqueadas nas configurações do seu navegador.</span>
                  ) : (
                    <span>Deseja receber alertas sonoros/visuais quando o status do seu aluguer mudar?</span>
                  )}
                </span>
              </div>
              {notificationPermission === "default" && (
                <button
                  onClick={() => {
                    Notification.requestPermission().then(permission => {
                      setNotificationPermission(permission);
                    });
                  }}
                  className="bg-[#007A33] hover:bg-emerald-800 text-white font-black px-3.5 py-1.5 rounded-full transition-all active:scale-95 text-[10px] cursor-pointer"
                >
                  Ativar Alertas
                </button>
              )}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="py-12 text-center text-[#6B665F] space-y-3">
              <Clock className="h-12 w-12 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-brand-black">Nenhum pedido de arrendamento feito até agora.</p>
              <p className="text-xs max-w-sm mx-auto text-[#6B665F]/80 leading-normal">
                Escolha qualquer imóvel, viatura tradicional ou máquina do catálogo do MozRent e clique no botão <strong className="text-brand-black">"Alugar Agora"</strong> para efetuar a reserva.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((book) => {
                const isPending = book.status === 'Pendente';
                const isConfirmed = book.status === 'Confirmado';
                
                // Calculate time left in days
                const timeLeftMs = (book.expiresAt ?? 0) - Date.now();
                const daysRemaining = Math.ceil(timeLeftMs / (1000 * 60 * 60 * 24));
                const isNearExpiration = isConfirmed && daysRemaining <= 1;
                const isExpired = isConfirmed && daysRemaining <= 0;

                return (
                  <div 
                    key={book.id} 
                    className={`rounded-[24px] border p-4 text-left transition-all ${
                      isExpired 
                        ? 'border-brand-red bg-rose-50/30'
                        : isNearExpiration
                        ? 'border-brand-yellow bg-amber-50/20'
                        : book.status === 'Confirmado' 
                        ? 'border-brand-green/35 bg-[#FAF5EE]/30' 
                        : 'border-brand-yellow/30 bg-[#FAF5EE]/40'
                    }`}
                  >
                    {/* Upper row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-natural-border mb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={book.listingImage} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="h-11 w-11 rounded-xl object-cover bg-neutral-100 flex-shrink-0 border border-natural-border"
                        />
                        <div>
                          <h4 className="text-xs font-extrabold text-brand-black line-clamp-1">{book.listingTitle}</h4>
                          <span className="text-[10px] text-[#6B665F] block font-bold mt-0.5">ID Aluguer: <strong className="text-brand-black font-extrabold">{book.id}</strong></span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-brand-red text-[11px] font-extrabold px-3 py-1 border border-brand-red/20 shadow-xs">
                            <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
                            Expirado !
                          </span>
                        ) : isNearExpiration ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-extrabold px-3 py-1 border border-brand-yellow animate-pulse">
                            <Clock className="h-3.5 w-3.5" />
                            Prestes a Expirar
                          </span>
                        ) : book.status === 'Confirmado' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-[#00843D] text-[11px] font-extrabold px-3 py-1 border border-brand-green/20">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Pago & Confirmado
                          </span>
                        ) : book.status === 'Pendente' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/20 text-[#B45309] text-[11px] font-extrabold px-3 py-1">
                            <Clock className="h-3.5 w-3.5" />
                            Aguardando PIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-brand-red text-[11px] font-extrabold px-3 py-1">
                            <X className="h-3.5 w-3.5" />
                            Cancelado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata view */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#6B665F] bg-white p-3 rounded-xl border border-natural-border">
                      <div>
                        <span className="text-[9px] text-[#2F2C29] uppercase font-bold block">Inquilino / Cliente</span>
                        <strong className="text-brand-black font-extrabold truncate block">{book.userName}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#2F2C29] uppercase font-bold block">Doc. Autenticado</span>
                        <strong className="text-brand-black font-extrabold text-[10px] uppercase truncate block">
                          {book.documentType?.toUpperCase()}: {book.userIdentity}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#2F2C29] uppercase font-bold block">Início Contrato</span>
                        <strong className="text-brand-black font-bold block">{book.startDate}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#2F2C29] uppercase font-bold block">Canal Pagamento</span>
                        <strong className="capitalize text-brand-black font-extrabold block">{book.paymentMethod.toUpperCase()}</strong>
                      </div>
                    </div>

                    {/* Expiration display row */}
                    {isConfirmed && (
                      <div className="mt-2.5 px-3 py-2 rounded-xl bg-neutral-105 border border-natural-border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#6B665F]">
                          <Clock className="w-4 h-4 text-brand-green" />
                          <span>Tempo de Contrato Restante:</span>
                          <strong className={daysRemaining <= 1 ? "text-brand-red font-black" : "text-brand-green font-extrabold"}>
                            {daysRemaining <= 0 
                              ? "Nenhum (Contrato Concluído)" 
                              : `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`}
                          </strong>
                        </div>

                        {/* Renewal Button triggers check */}
                        <button
                          onClick={() => handleProceedRenewal(book)}
                          className={`px-3.5 py-1 text-[11px] font-extrabold rounded-lg tracking-wide uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                            isNearExpiration || isExpired
                              ? "bg-brand-red text-white hover:bg-red-800"
                              : "bg-[#00843D] text-white hover:bg-emerald-800"
                          }`}
                        >
                          <span>Estender Aluguer</span>
                          <CornerDownRight className="w-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Interactive Renewal checkout drawer overlay for specific booking */}
                    {activeRenewalId === book.id && (
                      <div className="mt-3.5 p-4 rounded-2xl bg-white border-2 border-brand-green text-xs space-y-3 shadow-lg">
                        <div className="flex items-center justify-between border-b pb-1.5 border-neutral-100">
                          <h5 className="font-extrabold text-brand-black uppercase text-[11px] flex items-center gap-1">
                            <Zap className="h-4 w-4 text-brand-yellow" />
                            Extensão de Aluguer MozRent Local
                          </h5>
                          <button 
                            onClick={() => setActiveRenewalId(null)} 
                            className="text-brand-red text-[10px] font-bold hover:underline cursor-pointer"
                          >
                            Fechar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-[#6B665F] mb-1">Duração Extra ({book.period === 'mês' ? 'Meses' : 'Dias'})</label>
                            <input 
                              type="number"
                              min="1"
                              value={renewalDuration}
                              onChange={(e) => setRenewalDuration(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full rounded-xl border border-natural-border bg-white px-3 py-1.5 text-xs text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-[#6B665F] mb-1">Custo Total de Extensão</label>
                            <span className="block text-md font-black text-[#00843D] pt-1">
                              {(book.price * renewalDuration).toLocaleString()} MT
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {['mpesa', 'emola', 'mkesh'].map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => setRenewalOp(op as any)}
                              className={`rounded-xl py-1.5 text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${
                                renewalOp === op 
                                  ? 'bg-emerald-50 text-[#00843D] border-[#00843D]' 
                                  : 'bg-white border-natural-border text-neutral-600'
                              }`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-[#6B665F] mb-0.5">Telemóvel Carteira Móvel</label>
                            <input 
                              type="text"
                              required
                              maxLength={9}
                              value={renewalPhone}
                              onChange={(e) => setRenewalPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="Telemóvel"
                              className="w-full rounded-xl border border-natural-border bg-white px-3 py-1.5 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-[#6B665F] mb-0.5">Introduza PIN da Carteira</label>
                            <input 
                              type="password"
                              maxLength={4}
                              required
                              value={renewalPin}
                              onChange={(e) => setRenewalPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="PIN"
                              className="w-full rounded-xl border border-natural-border bg-white px-3 py-1.5 text-xs text-center font-mono font-bold tracking-widest focus:ring-1 focus:ring-brand-green focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isRenewing}
                          onClick={() => handleConfirmRenewalSubmit(book)}
                          className="w-full bg-[#00843D] hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 cursor-pointer disabled:bg-[#E8E2D9] disabled:text-neutral-400"
                        >
                          {isRenewing ? "A processar prompt PIN..." : `Autorizar R$ ${(book.price * renewalDuration).toLocaleString()} MT`}
                        </button>
                      </div>
                    )}

                    {/* Calculated Price values */}
                    <div className="mt-3.5 pt-3.5 border-t border-natural-border flex items-center justify-between text-xs font-semibold">
                      <div>
                        <span className="text-[#6B665F]">Total Pago Original:</span>
                        <strong className="ml-1 text-brand-black font-extrabold">{(book.price * book.duration).toLocaleString()} MT</strong>
                        <span className="text-[#6B665F]/80 text-[10px] ml-1">({book.duration}x {book.period === 'mês' ? 'Mês' : 'Dia'})</span>
                      </div>
                      {book.referenceNumber && (
                        <div className="bg-[#FAF5EE] text-[#00843D] px-2.5 py-1 rounded border border-natural-border font-mono text-[10px] font-bold">
                          SMS Ref: {book.referenceNumber}
                        </div>
                      )}
                    </div>

                    {/* Simple validation container if pending */}
                    {isPending && (
                      <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF5EE] border border-brand-yellow/35 text-xs space-y-3 text-left shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                          <Zap className="h-4 w-4 text-brand-yellow" />
                          <span>Simular Pagamento Pendente</span>
                        </div>
                        <p className="text-[11px] text-[#6B665F] leading-normal font-medium">
                          O cliente pode digitar o PIN directamente na operadora móvel. Se recebeu uma SMS com o código do depósito, insira o código do seu depósito OTP ou ID de Envio (ex: <strong>MP260606.0717</strong>) abaixo:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ex: MP260606.0717"
                            value={trxCodes[book.id] || ""}
                            onChange={(e) => setTrxCodes({...trxCodes, [book.id]: e.target.value.toUpperCase()})}
                            className="flex-1 rounded-xl border border-natural-border bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-[#00843D] focus:outline-none"
                          />
                          <button
                            onClick={() => submitTransactionCode(book.id)}
                            className="bg-[#00843D] hover:bg-emerald-800 text-white font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Efetuar PIN</span>
                          </button>
                          <button
                            onClick={() => onUpdateStatus(book.id, "Rejeitado")}
                            className="bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-bold px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer"
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Document attachment label if present */}
                    {book.documentFile && (
                      <div className="mt-2 text-[9px] text-[#6B665F] font-bold text-right flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                        <span>Identidade Autenticada via {book.documentType?.toUpperCase()} ({book.documentFile})</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-natural-border pt-4 mt-4 flex justify-between text-[11px] text-[#6B665F] font-semibold bg-white">
          <span>Sistema de Arrendamento Protegido MozRent</span>
          <span>© 2026 MozRent • EgoBrain</span>
        </div>
      </div>
    </div>
  );
}
