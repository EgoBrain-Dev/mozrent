"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Banknote, BedDouble, ShieldCheck, Star } from "lucide-react";
import { Property, PROPERTY_TYPES } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/imoveis/${property.id}`} className="block no-underline">
        <div className="glass-card overflow-hidden group">
          {/* Image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {property.imagens.length > 0 ? (
              <Image
                src={property.imagens[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                <BedDouble className="w-12 h-12 text-gray-600" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {property.featured && (
                <span className="bg-accent-500 text-dark-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> Destaque
                </span>
              )}
              <span className="bg-dark-900/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                {PROPERTY_TYPES[property.tipo] || property.tipo}
              </span>
            </div>

            {/* Favorite button */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
              {property.title}
            </h3>

            <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
              <MapPin className="w-4 h-4 text-secondary-400 shrink-0" />
              <span className="line-clamp-1">{property.bairro}, {property.cidade || "Maputo"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Banknote className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-400 font-bold text-lg">
                  {formatPrice(property.preco)} MZN
                </span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>

              {property.status === "active" && (
                <span className="badge-verified">
                  <ShieldCheck className="w-3 h-3" /> Ativo
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
