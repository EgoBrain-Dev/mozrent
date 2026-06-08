import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MozRent - Encontre o seu lar em Moçambique",
  description: "Plataforma de arrendamento de imóveis em Moçambique. Encontre quartos, casas e apartamentos de forma rápida, segura e transparente.",
  keywords: ["arrendamento", "moçambique", "maputo", "quartos", "casas", "aluguel", "imóveis"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  openGraph: {
    title: "MozRent - Encontre o seu lar em Moçambique",
    description: "Plataforma de arrendamento de imóveis em Moçambique. Quartos, casas e apartamentos verificados.",
    type: "website",
    locale: "pt_MZ",
    siteName: "MozRent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-MZ">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
