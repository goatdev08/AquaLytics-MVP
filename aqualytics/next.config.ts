import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para deployment en Vercel
  images: {
    domains: ['localhost'],
    // Agregar dominios adicionales si necesitas cargar imágenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optimización para producción
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'chart.js'],
  },
};

export default nextConfig;
