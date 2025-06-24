/**
 * Footer Component - AquaLytics
 * Footer principal con información de la app y enlaces útiles
 */

import Link from 'next/link'

const footerLinks = {
  product: {
    title: 'Producto',
    links: [
      { name: 'Dashboard', href: '/' },
      { name: 'Análisis', href: '/analytics' },
      { name: 'Ingreso de Datos', href: '/data-entry' },
      { name: 'Nadadores', href: '/swimmers' },
    ]
  },
  resources: {
    title: 'Recursos',
    links: [
      { name: 'Documentación', href: '/docs' },
      { name: 'Guía de Uso', href: '/guide' },
      { name: 'API Reference', href: '/api-docs' },
      { name: 'Soporte', href: '/support' },
    ]
  },
  company: {
    title: 'Empresa',
    links: [
      { name: 'Acerca de', href: '/about' },
      { name: 'Contacto', href: '/contact' },
      { name: 'Privacidad', href: '/privacy' },
      { name: 'Términos', href: '/terms' },
    ]
  }
}

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/aqualytics',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/aqualytics',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/aqualytics',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-screen-2xl">
        {/* Enlaces principales */}
        <div className="grid grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-yellow">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.3-.97-.63-.9-1.3-1.93-1.3-3.03 0-.79.35-1.51.9-2 .35-.31.57-.76.57-1.26 0-.83-.67-1.5-1.5-1.5S13.5 13.91 13.5 14.74c0 .38-.31.69-.69.69s-.69-.31-.69-.69c0-1.01.82-1.83 1.83-1.83 1.01 0 1.83.82 1.83 1.83 0 .18-.03.35-.08.52.35.5.56 1.11.56 1.78 0 .83-.33 1.58-.87 2.13C17.65 19.91 20 16.21 20 12c0-4.41-3.59-8-8-8z"/>
                </svg>
              </div>
              <span className="font-bold phoenix-text-gradient text-xl">
                AquaLytics
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transformando datos de natación en insights de rendimiento. 
              Análisis avanzado para nadadores competitivos.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-phoenix-red transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Seguir en ${item.name}`}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Enlaces por categoría */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-phoenix-red transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-border" />

        {/* Copyright y información adicional */}
        <div className="flex flex-col items-center justify-between px-6 py-6 md:flex-row">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AquaLytics. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Hecho con</span>
              <svg className="h-3 w-3 text-phoenix-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>y Next.js</span>
            </div>
          </div>

          {/* Badge de versión y estado */}
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Todos los sistemas operativos</span>
            </div>
            <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
              v1.0.0
            </div>
          </div>
        </div>

        {/* Información adicional para móviles */}
        <div className="px-6 pb-6 md:hidden">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Optimizado para dispositivos móviles y tablets
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 