import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import TopBanner from "@/components/TopBanner";
import Footer from "@/components/Footer";
import FeaturesCarousel from "@/components/FeaturesCarousel";

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
  const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17719649597';
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

  return (
    <html lang="pt-BR">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
              ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-gray-50">
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
