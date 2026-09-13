import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBar from "@/components/layout/MobileBar";
import CartDrawer from "@/components/cart/CartDrawer";
import JsonLd from "@/components/JsonLd";
import { isDemoMode } from "@/lib/data";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[localBusinessJsonLd(), websiteJsonLd()]} />
      {isDemoMode && (
        <div className="bg-brass px-4 py-1.5 text-center text-xs text-white">
          Демо-режим: подключите Supabase в .env.local, чтобы работали реальный каталог и заказы.
        </div>
      )}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        К содержимому
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <CartDrawer />
    </>
  );
}
