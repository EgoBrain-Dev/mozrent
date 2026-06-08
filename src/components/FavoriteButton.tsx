"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addFavorite, removeFavorite, getFavorites } from "@/lib/favorites";

interface FavoriteButtonProps {
  propertyId: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({ propertyId, size = "sm" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getFavorites(user.uid).then((favs) => {
      setIsFav(favs.includes(propertyId));
    });
  }, [user, propertyId]);

  if (!user) return null;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.uid, propertyId);
        setIsFav(false);
      } else {
        await addFavorite(user.uid, propertyId);
        setIsFav(true);
      }
    } catch (err) {
      console.error("Erro ao alterar favorito:", err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${sizeClasses} rounded-full backdrop-blur-sm flex items-center justify-center border-none cursor-pointer transition-all ${
        isFav
          ? "bg-red-500/80 text-white hover:bg-red-600"
          : "bg-dark-900/60 text-white/70 hover:text-white hover:bg-dark-900/80"
      }`}
      title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFav ? "fav" : "nofav"}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <Heart className={`${iconSize} ${isFav ? "fill-current" : ""}`} />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
