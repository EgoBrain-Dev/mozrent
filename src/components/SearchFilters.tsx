"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPES, BAIRROS_MAPUTO } from "@/types";

interface SearchFiltersProps {
  filters: {
    bairro: string;
    tipo: string;
    precoMin: number;
    precoMax: number;
  };
  onChange: (filters: SearchFiltersProps["filters"]) => void;
}

export default function SearchFiltersBar({ filters, onChange }: SearchFiltersProps) {
  const handleChange = (key: string, value: string | number) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-5 h-5 text-secondary-400" />
        <h3 className="text-white font-semibold">Filtrar Imóveis</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bairro */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Bairro</label>
          <select
            value={filters.bairro}
            onChange={(e) => handleChange("bairro", e.target.value)}
            className="input-glass cursor-pointer"
          >
            <option value="" className="bg-dark-800">Todos os bairros</option>
            {BAIRROS_MAPUTO.map((b) => (
              <option key={b} value={b} className="bg-dark-800">{b}</option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Tipo</label>
          <select
            value={filters.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
            className="input-glass cursor-pointer"
          >
            <option value="" className="bg-dark-800">Todos os tipos</option>
            {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
              <option key={key} value={key} className="bg-dark-800">{label}</option>
            ))}
          </select>
        </div>

        {/* Preço Min */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Preço mín. (MZN)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.precoMin || ""}
            onChange={(e) => handleChange("precoMin", Number(e.target.value))}
            className="input-glass"
          />
        </div>

        {/* Preço Max */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Preço máx. (MZN)</label>
          <input
            type="number"
            placeholder="50000"
            value={filters.precoMax || ""}
            onChange={(e) => handleChange("precoMax", Number(e.target.value))}
            className="input-glass"
          />
        </div>
      </div>

      <button
        onClick={() => onChange({ bairro: "", tipo: "", precoMin: 0, precoMax: 0 })}
        className="mt-4 text-sm text-gray-400 hover:text-secondary-400 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1"
      >
        <Search className="w-3 h-3" /> Limpar filtros
      </button>
    </div>
  );
}
