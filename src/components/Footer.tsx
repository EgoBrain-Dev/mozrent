"use client";

import Link from "next/link";
import { Home, Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 no-underline mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MozRent</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              A plataforma #1 de arrendamento em Moçambique. Encontre o seu lar ideal com transparência e segurança.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/imoveis" className="text-gray-400 hover:text-secondary-400 transition-colors text-sm no-underline">
                  Explorar Imóveis
                </Link>
              </li>
              <li>
                <Link href="/registro" className="text-gray-400 hover:text-secondary-400 transition-colors text-sm no-underline">
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-secondary-400 transition-colors text-sm no-underline">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Cidades */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Cidades</h4>
            <ul className="space-y-2">
              {["Maputo", "Matola", "Beira", "Nampula", "Quelimane"].map((city) => (
                <li key={city}>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-secondary-500" /> {city}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <a href="mailto:info@mozrent.co.mz" className="hover:text-white transition-colors no-underline text-gray-400">
                  info@mozrent.co.mz
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+258 84 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} MozRent. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-500" /> em Moçambique
          </p>
        </div>
      </div>
    </footer>
  );
}
