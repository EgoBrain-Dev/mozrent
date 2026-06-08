"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Home, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { registerEmail, loginGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", password: "", role: "tenant" as "owner" | "tenant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerEmail(form.email, form.password, form.nome, form.telefone, form.role);
      router.push("/imoveis");
    } catch {
      setError("Erro ao criar conta. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginGoogle();
      router.push("/imoveis");
    } catch {
      setError("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute top-20 left-20 w-64 h-64 bg-secondary-500/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-400">Junte-se ao MozRent hoje</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Role selector com explicações */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "tenant" })}
            className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              form.role === "tenant"
                ? "border-secondary-500 bg-secondary-500/10 text-secondary-400"
                : "border-white/10 bg-transparent text-gray-400 hover:border-white/20"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Inquilino</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "owner" })}
            className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              form.role === "owner"
                ? "border-primary-500 bg-primary-500/10 text-primary-400"
                : "border-white/10 bg-transparent text-gray-400 hover:border-white/20"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Proprietário</span>
          </button>
        </div>
        
        <p className="text-[10px] text-center text-gray-500 mb-6 px-2">
          {form.role === "tenant" 
            ? "Como inquilino poderá pesquisar e contactar proprietários." 
            : "Como proprietário poderá publicar anúncios e gerir os seus imóveis."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input-glass !pl-11" required />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-glass !pl-11" required />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="tel" placeholder="Telefone (ex: 84 123 4567)" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="input-glass !pl-11" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="password" placeholder="Senha (mín. 6 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-glass !pl-11" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base !py-3 disabled:opacity-50">
            {loading ? "A criar..." : "Criar Conta"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-sm">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button onClick={handleGoogle} className="w-full glass-card !rounded-xl p-3 flex items-center justify-center gap-3 text-white font-medium hover:border-white/20 transition-all cursor-pointer bg-transparent">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-secondary-400 hover:text-secondary-300 no-underline font-medium">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}
