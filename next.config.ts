import type { NextConfig } from "next";

// Старые адреса разделов на Tilda → новые разделы каталога (сохраняем позиции в поиске).
const TILDA_REDIRECTS: Record<string, string> = {
  "/unitazy": "/catalog/unitazy",
  "/vanny": "/catalog/vanny",
  "/smesitili": "/catalog/smesiteli",
  "/instaliatsii": "/catalog/installyacii",
  "/tumby_s_rakovinoi": "/catalog/rakoviny",
  "/rakoviny_na_pedestale": "/catalog/rakoviny",
  "/injeniernaia_santehnika": "/catalog",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [360, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 128, 240, 320, 480],
  },
  async redirects() {
    return Object.entries(TILDA_REDIRECTS).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
