import { MouseEvent } from "react";
import { Home, Car, Wrench, ShieldCheck, MapPin, Eye, Star, Heart } from "lucide-react";
import { Listing } from "../types";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: MouseEvent, id: string) => void;
}

export default function ListingCard({ listing, onSelect, isFavorite, onToggleFavorite }: ListingCardProps) {
  // Category helper mapping strictly to Mozambique Flag Colors: Green (#007A33), Red (#E31B23), Yellow (#FCD116), Black, White
  const renderCategoryBadge = () => {
    switch (listing.category) {
      case "imovel":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white text-[#007A33] text-[11px] font-black px-3 py-1 border border-[#007A33]/25 shadow-xs">
            <Home className="h-3 w-3" />
            Imóvel ({listing.type})
          </span>
        );
      case "veiculo":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white text-black text-[11px] font-black px-3 py-1 border border-black/25 shadow-xs">
            <Car className="h-3 w-3" />
            Viatura
          </span>
        );
      case "equipamento":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white text-[#007A33] text-[11px] font-black px-3 py-1 border border-[#007A33]/25 shadow-xs">
            <Wrench className="h-3 w-3" />
            Serviço/Máquina
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id={`listing-card-${listing.id}`}
      onClick={() => onSelect(listing)}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Visual Header Image with responsive ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
        <img
          src={listing.image}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${!listing.availableNow ? "opacity-65 saturate-50 grayscale-20" : ""}`}
        />

        {/* Verification top-left Badge */}
        {listing.verified && listing.availableNow && (
          <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-[#007A33] px-3 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verificado
          </div>
        )}

        {/* Alugado Badge (takes place of verified badge if rented) */}
        {!listing.availableNow && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-[#E31B23] px-3.5 py-1.5 text-[10px] font-black text-white shadow-lg uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            Alugado
          </div>
        )}

        {/* Dynamic Province badge on overlay */}
        <div className="absolute bottom-4 left-4 rounded-full bg-black px-3 py-1 text-[11px] font-bold text-white shadow-md">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#E31B23]" />
            {listing.province}
          </span>
        </div>

        {/* Favorite Heart Trigger - Strict Mozambican design flag outline/fill red */}
        <button
          onClick={(e) => onToggleFavorite(e, listing.id)}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-95 text-black hover:bg-neutral-50"
          title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
          <Heart 
            className={`h-4.5 w-4.5 ${isFavorite ? "fill-[#E31B23] text-[#E31B23]" : "text-black"}`} 
          />
        </button>

        {/* Featured indicator if any */}
        {listing.featured && (
          <div className="absolute top-4 right-14 flex items-center gap-1 rounded-full bg-[#FCD116] px-2.5 py-1 text-[10px] font-black text-black shadow-md uppercase tracking-wider">
            <Star className="h-3 w-3 fill-black text-black" />
            Destaque
          </div>
        )}
      </div>

      {/* Card Content body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          {renderCategoryBadge()}
          <div className="flex items-center gap-1 text-xs font-black text-[#007A33]">
            <Star className="h-3.5 w-3.5 fill-[#FCD116] text-[#FCD116]" />
            {listing.rating.toFixed(1)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-serif font-black text-black leading-snug group-hover:text-[#007A33] transition-colors line-clamp-1">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-neutral-600 line-clamp-3 leading-relaxed flex-1">
          {listing.description}
        </p>

        {/* Features badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {listing.features.slice(0, 3).map((f, i) => (
            <span key={i} className="text-[10px] font-bold bg-white text-black border border-black/10 rounded-full px-2.5 py-0.5">
              {f}
            </span>
          ))}
          {listing.features.length > 3 && (
            <span className="text-[10px] font-black text-white bg-black px-2 rounded-full border border-black/10">
              +{listing.features.length - 3}
            </span>
          )}
        </div>

        {/* Specifications (Rooms / Area) */}
        <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-3">
            {listing.category === 'imovel' && (
              <>
                {listing.rooms && (
                  <span>
                    <strong>{listing.rooms}</strong> quartos
                  </span>
                )}
                {listing.spaceArea && (
                  <span>
                    <strong>{listing.spaceArea}</strong>
                  </span>
                )}
              </>
            )}
            {listing.category !== 'imovel' && listing.spaceArea && (
              <span>
                Capacidade: <strong>{listing.spaceArea}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
            <Eye className="h-3 w-3" />
            {listing.views}
          </div>
        </div>

        {/* Price Tag with local style */}
        <div className="mt-4 flex items-center justify-between pt-1">
          <div className="text-neutral-500 text-[10px] uppercase tracking-wider font-extrabold">
            Preço do Aluguer
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-[#007A33] font-serif">
              {listing.price.toLocaleString()}
            </span>
            <span className="text-black font-extrabold text-xs ml-1">MT</span>
            <span className="text-neutral-500 text-xs font-semibold">/{listing.period === 'mês' ? 'mês' : 'dia'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
