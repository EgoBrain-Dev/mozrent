import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <span className="text-[10rem] font-extrabold text-white/[0.03] leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
              <Home className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Página não encontrada</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          A página que procura pode ter sido removida, teve o nome alterado ou está temporariamente indisponível.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary no-underline justify-center">
            <ArrowLeft className="w-4 h-4" /> Página Inicial
          </Link>
          <Link href="/imoveis" className="btn-secondary no-underline justify-center">
            <Search className="w-4 h-4" /> Explorar Imóveis
          </Link>
        </div>
      </div>
    </div>
  );
}
