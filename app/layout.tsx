import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import TopBanner from "@/components/TopBanner";
import Footer from "@/components/Footer";
import FeaturesCarousel from "@/components/FeaturesCarousel";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Obom Velhinho - Árvores e Decorações de Natal",
  description: "As melhores árvores e decorações de natal para sua casa. Toda loja com até 80% de desconto!",
  icons: {
    icon: "/logoOBomvelhinho.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-gray-50">
        <Analytics />
        <CartProvider>
          <TopBanner />
          <Header />
          
          <main className="min-h-screen" style={{ marginTop: '76px' }}>
            {children}
          </main>
        
          <div className="container mx-auto px-4 mt-16 mb-8">
            <FeaturesCarousel />
          </div>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
