"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/types";
import PropertyCard from "@/components/PropertyCard";
import SearchFiltersBar from "@/components/SearchFilters";
import { motion } from "framer-motion";
import { Building2, Loader2 } from "lucide-react";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bairro: "", tipo: "", precoMin: 0, precoMax: 0 });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(collection(db, "properties"), where("status", "==", "active"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Property));
        setProperties(data);
        setFiltered(data);
      } catch (err) {
        console.error("Erro ao carregar imóveis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = [...properties];
    if (filters.bairro) result = result.filter((p) => p.bairro === filters.bairro);
    if (filters.tipo) result = result.filter((p) => p.tipo === filters.tipo);
    if (filters.precoMin) result = result.filter((p) => p.preco >= filters.precoMin);
    if (filters.precoMax) result = result.filter((p) => p.preco <= filters.precoMax);
    setFiltered(result);
  }, [filters, properties]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Explorar Imóveis</h1>
        <p className="text-gray-400 mb-8">Encontre o imóvel ideal para si</p>
      </motion.div>

      <div className="mb-8">
        <SearchFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum imóvel encontrado</h3>
          <p className="text-gray-400">Tente ajustar os filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">{filtered.length} imóvel(is) encontrado(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
