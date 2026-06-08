"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property, PROPERTY_TYPES } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Banknote, BedDouble, ShieldCheck, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Check, Loader2, Share2, Heart } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docSnap = await getDoc(doc(db, "properties", id));
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() } as Property);
        }
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <BedDouble className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Imóvel não encontrado</h2>
        <p className="text-gray-400 mb-6">Este anúncio pode ter sido removido ou o link está incorreto.</p>
        <Link href="/imoveis" className="btn-primary no-underline">← Voltar aos imóveis</Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal" }).format(price);

  const whatsappUrl = `https://wa.me/258${property.ownerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá! Vi o seu anúncio "${property.title}" no MozRent e estou interessado. Podemos conversar?`
  )}`;

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `${property.title} - ${formatPrice(property.preco)} MZN/mês em ${property.bairro}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/imoveis" className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors no-underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton propertyId={property.id} size="md" />
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white border-none cursor-pointer transition-colors"
            title="Partilhar"
          >
            {shared ? <Check className="w-5 h-5 text-secondary-400" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image carousel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
              {property.imagens.length > 0 ? (
                <Image
                  src={property.imagens[currentImg]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                  <BedDouble className="w-16 h-16 text-gray-600" />
                </div>
              )}

              {property.imagens.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImg((p) => (p === 0 ? property.imagens.length - 1 : p - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 backdrop-blur-sm flex items-center justify-center text-white border-none cursor-pointer hover:bg-dark-900 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImg((p) => (p === property.imagens.length - 1 ? 0 : p + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 backdrop-blur-sm flex items-center justify-center text-white border-none cursor-pointer hover:bg-dark-900 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-dark-900/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                    {currentImg + 1} / {property.imagens.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {property.imagens.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {property.imagens.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                      i === currentImg ? "border-secondary-400" : "border-transparent opacity-60 hover:opacity-80"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h1 className="text-2xl font-bold text-white mb-3">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary-600/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                {PROPERTY_TYPES[property.tipo] || property.tipo}
              </span>
              <span className="flex items-center gap-1 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-secondary-400" /> {property.bairro}, {property.cidade || "Maputo"}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{property.descricao}</p>

            {/* Amenidades */}
            {property.amenidades && property.amenidades.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenidades.map((a) => (
                    <span key={a} className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-sm">
                      <Check className="w-3 h-3 text-secondary-400" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Price + Contact */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-1">Preço mensal</p>
              <div className="flex items-center gap-2">
                <Banknote className="w-6 h-6 text-secondary-400" />
                <span className="text-3xl font-bold text-white">{formatPrice(property.preco)}</span>
                <span className="text-gray-400">MZN</span>
              </div>
            </div>

            {/* Owner info */}
            <div className="border-t border-white/10 pt-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Publicado por</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-600/30 flex items-center justify-center text-white font-bold">
                  {property.ownerName?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <p className="text-white font-medium">{property.ownerName || "Proprietário"}</p>
                  <span className="badge-verified text-xs">
                    <ShieldCheck className="w-3 h-3" /> Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp button */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full justify-center text-base !py-3.5">
              <MessageCircle className="w-5 h-5" /> Contactar via WhatsApp
            </a>

            <p className="text-gray-500 text-xs text-center mt-3">
              Será redirecionado para o WhatsApp do proprietário
            </p>

            {/* Share hint */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                onClick={handleShare}
                className="text-gray-500 hover:text-gray-300 text-xs transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 mx-auto"
              >
                <Share2 className="w-3 h-3" /> {shared ? "Link copiado!" : "Partilhar este anúncio"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
