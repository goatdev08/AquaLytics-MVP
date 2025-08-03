import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/providers/Providers';
import { cn } from "@/lib/utils/cn";
import ErrorBoundary from '@/components/providers/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaLytics - Análisis de Rendimiento en Natación",
  description: "Aplicación web moderna para análisis avanzado de rendimiento en natación competitiva. Transformamos datos manuales en insights visuales accionables.",
  keywords: ["natación", "análisis", "rendimiento", "métricas", "competencia", "entrenamiento"],
  authors: [{ name: "AquaLytics Team" }],
  creator: "AquaLytics",
  publisher: "AquaLytics",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://aqualytics.app",
    title: "AquaLytics - Análisis de Rendimiento en Natación",
    description: "Transformando datos de natación en insights de rendimiento",
    siteName: "AquaLytics",
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaLytics - Análisis de Rendimiento en Natación",
    description: "Transformando datos de natación en insights de rendimiento",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AquaLytics" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#DC2626" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                duration: 2000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: 'red',
                  secondary: 'black',
                },
              },
            }}
          />
          <ErrorBoundary>
            <div className="relative min-h-screen flex flex-col">
              {children}
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
