import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para external packages (corregido)
  serverExternalPackages: ['pandas', 'numpy'],
  
  // Configuración para deployment en Vercel
  images: {
    domains: ['localhost'],
  },
  
  // Configuración para Phoenix theme
  webpack: (config: any) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
};

export default nextConfig;
