"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, X, Plus, User, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">MozRent</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/imoveis" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 no-underline text-sm font-medium">
              <Search className="w-4 h-4" />
              Explorar
            </Link>
            {user && profile?.role === "owner" && (
              <Link href="/publicar" className="btn-secondary text-sm !py-2 !px-4 no-underline">
                <Plus className="w-4 h-4" />
                Publicar
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/perfil" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 no-underline text-sm">
                  <User className="w-4 h-4" />
                  {profile?.nome?.split(" ")[0] || "Perfil"}
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm !py-2 !px-4 no-underline">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/imoveis" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors no-underline py-2">
                🔍 Explorar Imóveis
              </Link>
              {user && profile?.role === "owner" && (
                <Link href="/publicar" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors no-underline py-2">
                  ➕ Publicar Anúncio
                </Link>
              )}
              {user ? (
                <>
                  <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors no-underline py-2">
                    👤 {profile?.nome || "Perfil"}
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left text-red-400 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer py-2">
                    🚪 Sair
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block btn-primary text-center no-underline py-2">
                  Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
