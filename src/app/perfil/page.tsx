"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types";
import { getFavorites } from "@/lib/favorites";
import PropertyCard from "@/components/PropertyCard";
import { motion } from "framer-motion";
import { User, Building2, ShieldCheck, LogOut, Trash2, Loader2, Heart, Edit3, Plus } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"anuncios" | "favoritos">("anuncios");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user's own properties
        if (profile?.role === "owner") {
          const q = query(collection(db, "properties"), where("ownerId", "==", user.uid));
          const snapshot = await getDocs(q);
          setMyProperties(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Property)));
        }

        // Fetch favorites
        const favIds = await getFavorites(user.uid);
        if (favIds.length > 0) {
          const favProperties: Property[] = [];
          for (const fid of favIds) {
            const docSnap = await getDoc(doc(db, "properties", fid));
            if (docSnap.exists()) {
              favProperties.push({ id: docSnap.id, ...docSnap.data() } as Property);
            }
          }
          setFavoriteProperties(favProperties);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, profile, router]);

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Tem certeza que deseja apagar este anúncio?")) return;
    try {
      await deleteDoc(doc(db, "properties", propertyId));
      setMyProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {profile.nome?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{profile.nome}</h1>
              {profile.verified && (
                <span className="badge-verified"><ShieldCheck className="w-3 h-3" /> Verificado</span>
              )}
            </div>
            <p className="text-gray-400">{profile.email}</p>
            <p className="text-gray-400 text-sm">📱 {profile.telefone || "Sem telefone"}</p>
            <span className="inline-block mt-2 bg-primary-600/20 text-primary-300 px-3 py-1 rounded-full text-xs font-medium">
              {profile.role === "owner" ? "🏠 Proprietário" : "🔍 Inquilino"}
            </span>
          </div>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="btn-primary !bg-red-500/20 !text-red-400 hover:!bg-red-500/30 text-sm"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {profile.role === "owner" && (
          <button
            onClick={() => setActiveTab("anuncios")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeTab === "anuncios"
                ? "bg-primary-600/20 text-primary-300 border-primary-500"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" /> Meus Anúncios ({myProperties.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab("favoritos")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-none cursor-pointer flex items-center gap-2 ${
            activeTab === "favoritos"
              ? "bg-red-500/20 text-red-300"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" /> Favoritos ({favoriteProperties.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
      ) : activeTab === "anuncios" && profile.role === "owner" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary-400" /> Meus Anúncios
            </h2>
            <Link href="/publicar" className="btn-secondary text-sm !py-2 !px-4 no-underline">
              <Plus className="w-4 h-4" /> Publicar
            </Link>
          </div>

          {myProperties.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Ainda não publicou nenhum anúncio.</p>
              <Link href="/publicar" className="btn-secondary text-sm no-underline">
                <Plus className="w-4 h-4" /> Publicar primeiro anúncio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((p, i) => (
                <div key={p.id} className="relative group">
                  <PropertyCard property={p} index={i} />
                  <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/publicar?edit=${p.id}`}
                      className="w-8 h-8 rounded-full bg-primary-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary-600 no-underline"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 border-none cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-400" /> Meus Favoritos
          </h2>

          {favoriteProperties.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Ainda não adicionou nenhum imóvel aos favoritos.</p>
              <Link href="/imoveis" className="btn-primary text-sm no-underline">
                Explorar Imóveis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
