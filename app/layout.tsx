import type { Metadata } from "next";
import Script from "next/script";
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
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

  return (
    <html lang="pt-BR">
      <head>
        {/* Google Ads Global Site Tag */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
          `}
        </Script>

        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
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
