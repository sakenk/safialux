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

// Основной адрес без www: все запросы на www переезжают на него одним переходом.
const SITE_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://safialux.kz").host;

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [360, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 128, 240, 320, 480],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: `www.${SITE_HOST}` }],
        destination: `https://${SITE_HOST}/:path*`,
        permanent: true,
      },
      ...Object.entries(TILDA_REDIRECTS).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
