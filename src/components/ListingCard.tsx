import { Home, Car, Wrench, ShieldCheck, MapPin, Eye, Star } from "lucide-react";
import { Listing } from "../types";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

export default function ListingCard({ listing, onSelect }: ListingCardProps) {
  // Category helper
  const renderCategoryBadge = () => {
    switch (listing.category) {
      case "imovel":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-natural-aside text-brand-green text-[11px] font-bold px-3 py-1 border border-natural-border">
            <Home className="h-3 w-3" />
            Imóvel ({listing.type})
          </span>
        );
      case "veiculo":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-natural-aside text-[#4F46E5] text-[11px] font-bold px-3 py-1 border border-[#E0E7FF]">
            <Car className="h-3 w-3" />
            Viatura
          </span>
        );
      case "equipamento":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/10 text-[#B45309] text-[11px] font-bold px-3 py-1 border border-brand-yellow/20">
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
      className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-natural-border bg-white shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Visual Header Image with responsive ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-150">
        <img
          src={listing.image}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Verification top-left Badge */}
        {listing.verified && (
          <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-brand-green px-3 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verificado
          </div>
        )}

        {/* Dynamic Province badge on overlay */}
        <div className="absolute bottom-4 left-4 rounded-full bg-brand-black/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-brand-red" />
            {listing.province}
          </span>
        </div>

        {/* Featured Star visual */}
        {listing.featured && (
          <div className="absolute top-4 right-4 flex items-center justify-center rounded-full bg-brand-yellow p-1.5 text-brand-black shadow-md">
            <Star className="h-3.5 w-3.5 fill-brand-black text-brand-black" />
          </div>
        )}
      </div>

      {/* Card Content body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          {renderCategoryBadge()}
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {listing.rating.toFixed(1)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-serif font-bold text-brand-black leading-snug group-hover:text-brand-green transition-colors line-clamp-1">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-neutral-500 line-clamp-3 leading-relaxed flex-1">
          {listing.description}
        </p>

        {/* Features badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {listing.features.slice(0, 3).map((f, i) => (
            <span key={i} className="text-[10px] font-semibold bg-natural-aside text-[#6B665F] border border-natural-border rounded-full px-2.5 py-0.5">
              {f}
            </span>
          ))}
          {listing.features.length > 3 && (
            <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2 rounded-full border border-emerald-100">
              +{listing.features.length - 3}
            </span>
          )}
        </div>

        {/* Specifications (Rooms / Area) */}
        <div className="mt-3 pt-3 border-t border-natural-border flex items-center justify-between text-xs text-neutral-500">
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
          <div className="text-[#6B665F] text-[10px] uppercase tracking-wider font-extrabold">
            Preço do Aluguer
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-[#00843D] font-serif">
              {listing.price.toLocaleString()}
            </span>
            <span className="text-brand-black font-extrabold text-xs ml-1">MT</span>
            <span className="text-[#6B665F] text-xs font-semibold">/{listing.period === 'mês' ? 'mês' : 'dia'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
