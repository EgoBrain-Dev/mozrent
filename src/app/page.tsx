"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Home, ShieldCheck, MessageCircle, ArrowRight, Building2, Users, TrendingUp, Sparkles, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* BG Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block badge-verified mb-6 text-sm">
              🇲🇿 A plataforma #1 de Moçambique
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Encontre o seu <span className="gradient-text">lar ideal</span> com confiança
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Quartos, casas e apartamentos verificados em todo Moçambique. Sem confusão, sem fraudes — só transparência.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/imoveis" className="btn-primary text-lg !py-4 !px-8 no-underline">
              <Search className="w-5 h-5" />
              Explorar Imóveis
            </Link>
            <Link href="/registro" className="btn-secondary text-lg !py-4 !px-8 no-underline">
              <Home className="w-5 h-5" />
              Publicar Grátis
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Building2, label: "Imóveis Ativos", value: "500+", color: "text-primary-400" },
            { icon: Users, label: "Utilizadores", value: "2.000+", color: "text-secondary-400" },
            { icon: TrendingUp, label: "Arrendamentos/mês", value: "150+", color: "text-accent-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-6 text-center"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Como <span className="gradient-text">funciona</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Pesquise", desc: "Filtre por bairro, tipo e preço para encontrar o imóvel perfeito.", step: "01" },
              { icon: ShieldCheck, title: "Verifique", desc: "Veja fotos reais, detalhes e o selo de proprietário verificado.", step: "02" },
              { icon: MessageCircle, title: "Contacte", desc: "Fale diretamente com o proprietário via WhatsApp.", step: "03" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-8 text-center relative"
              >
                <span className="absolute top-4 right-4 text-5xl font-extrabold text-white/5">{item.step}</span>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Porquê <span className="gradient-text">MozRent</span>?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Projetado especificamente para o mercado imobiliário moçambicano</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Proprietários Verificados", desc: "Cada anúncio é verificado para garantir autenticidade e segurança." },
              { icon: MessageCircle, title: "Contacto Direto via WhatsApp", desc: "Sem intermediários. Fale diretamente com quem aluga." },
              { icon: MapPin, title: "Todos os Bairros", desc: "Cobertura completa de Maputo, Matola e outras cidades." },
              { icon: Sparkles, title: "100% Gratuito", desc: "Publicar e procurar é totalmente grátis. Sem taxas escondidas." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/20 to-secondary-500/20 flex items-center justify-center shrink-0">
                  <feat.icon className="w-6 h-6 text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-sm">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card p-10 sm:p-14 text-center pulse-glow"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tem um imóvel para arrendar?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Publique gratuitamente e alcance milhares de interessados em todo Moçambique.
          </p>
          <Link href="/registro" className="btn-secondary text-lg !py-4 !px-10 no-underline">
            Começar agora <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
