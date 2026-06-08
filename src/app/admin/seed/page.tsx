"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Database, Check, Loader2, AlertTriangle } from "lucide-react";

// Imagens reais de alta qualidade do Unsplash (gratuitas para uso)
const DUMMY_PROPERTIES = [
  {
    title: "Quarto Moderno no Sommerschield 2",
    bairro: "Sommerschield",
    cidade: "Maputo",
    preco: 12500,
    tipo: "quarto",
    descricao: "Quarto espaçoso em vivenda moderna no coração do Sommerschield. Inclui água 24h, eletricidade e internet fibra óptica. Segurança 24h com guarda noturno. Acesso a cozinha e lavandaria compartilhadas. Ambiente tranquilo, ideal para profissionais.",
    imagens: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    amenidades: ["Água 24h", "Internet/WiFi", "Segurança 24h", "Mobiliado"],
    status: "active",
    featured: true,
  },
  {
    title: "T2 na Polana Cimento - Vista Mar",
    bairro: "Polana Cimento",
    cidade: "Maputo",
    preco: 45000,
    tipo: "t2",
    descricao: "Apartamento T2 totalmente mobilado e equipado no prestigiado bairro da Polana Cimento. Vista parcial para o mar. Sala ampla com varanda, 2 quartos com roupeiros embutidos, cozinha americana equipada. Edifício com elevador e estacionamento.",
    imagens: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
    amenidades: ["Ar condicionado", "Mobiliado", "Varanda", "Segurança 24h", "Garagem"],
    status: "active",
    featured: true,
  },
  {
    title: "Vivenda T3 Independente na Matola",
    bairro: "Matola",
    cidade: "Matola",
    preco: 25000,
    tipo: "vivenda",
    descricao: "Vivenda T3 independente com quintal amplo, garagem para 2 carros e dependência para empregada. 3 quartos sendo 1 suite, 2 casas de banho, sala de estar e jantar, cozinha grande. Murada com portão automático.",
    imagens: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    amenidades: ["Quintal", "Garagem", "Água 24h", "Casa de banho privativa"],
    status: "active",
    featured: false,
  },
  {
    title: "Flat Moderno na Costa do Sol",
    bairro: "Costa do Sol",
    cidade: "Maputo",
    preco: 35000,
    tipo: "flat",
    descricao: "Flat moderno e espaçoso na Costa do Sol. Condomínio fechado com piscina, ginásio e segurança 24h. Apartamento totalmente mobilado com acabamentos premium. Perto da praia e de restaurantes.",
    imagens: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    amenidades: ["Piscina", "Ar condicionado", "Mobiliado", "Segurança 24h", "Internet/WiFi"],
    status: "active",
    featured: false,
  },
  {
    title: "Quarto para Estudante no Alto Maé",
    bairro: "Alto Maé",
    cidade: "Maputo",
    preco: 5500,
    tipo: "quarto",
    descricao: "Quarto individual ideal para estudantes. Localização privilegiada perto da UEM e ISPJorge Dimitrov. Inclui água e luz. Ambiente seguro e tranquilo com regras de convivência.",
    imagens: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    ],
    amenidades: ["Água 24h", "Luz incluída"],
    status: "active",
    featured: false,
  },
  {
    title: "T3 Luxo no KaMpfumo - Prédio Novo",
    bairro: "KaMpfumo",
    cidade: "Maputo",
    preco: 85000,
    tipo: "t3",
    descricao: "Apartamento T3 de luxo em prédio recém-construído no centro da cidade. 3 suites com closet, sala de estar e jantar com 60m², cozinha gourmet, lavandaria, dependência completa. 2 vagas de estacionamento. Vista panorâmica da cidade.",
    imagens: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    amenidades: ["Ar condicionado", "Mobiliado", "Garagem", "Segurança 24h", "Cozinha equipada", "Varanda", "Casa de banho privativa"],
    status: "active",
    featured: true,
  },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  const handleSeed = async () => {
    setLoading(true);
    setCount(0);
    try {
      for (const prop of DUMMY_PROPERTIES) {
        await addDoc(collection(db, "properties"), {
          ...prop,
          ownerId: "system_seed",
          ownerName: "MozRent Demo",
          ownerPhone: "840000000",
          createdAt: serverTimestamp(),
        });
        setCount((c) => c + 1);
      }
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass-card p-8 text-center">
        <Database className="w-16 h-16 text-primary-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Dados de Demonstração</h1>
        <p className="text-gray-400 mb-8">
          Clique no botão abaixo para preencher o Firestore com {DUMMY_PROPERTIES.length} imóveis de exemplo com imagens reais.
        </p>

        {done ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-white" />
            </div>
            <p className="text-secondary-400 font-medium mb-2">Sucesso! {DUMMY_PROPERTIES.length} imóveis criados.</p>
            <p className="text-gray-500 text-sm mb-6">Com imagens reais do Unsplash</p>
            <button onClick={() => (window.location.href = "/imoveis")} className="btn-primary w-full justify-center">
              Ver Imóveis
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Isto irá adicionar {DUMMY_PROPERTIES.length} documentos reais à sua coleção &quot;properties&quot; no Firestore.</span>
            </div>

            {loading && (
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / DUMMY_PROPERTIES.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <button
              onClick={handleSeed}
              disabled={loading}
              className="btn-secondary w-full justify-center gap-2 !py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> A criar ({count}/{DUMMY_PROPERTIES.length})...
                </>
              ) : (
                "Criar Dados de Exemplo"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
