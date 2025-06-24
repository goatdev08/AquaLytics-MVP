import React from 'react';

// Componentes de iconos SVG personalizados
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 6.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 5.22l1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeamIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M2 12c.6-2.8 1.8-5.2 3.5-7s3.8-2.8 6.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 12c-.6 2.8-1.8 5.2-3.5 7s-3.8 2.8-6.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 20.7c.7-.8 1.8-1.2 2.8-1.2s2.1.4 2.8 1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 3.3c.7.8 1.8 1.2 2.8 1.2s2.1-.4 2.8-1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen phoenix-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 phoenix-gradient opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-6xl md:text-8xl font-bold phoenix-title mb-6 phoenix-pulse">
            AquaLytics
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Plataforma avanzada de análisis de rendimiento para natación competitiva. 
            Transforma datos en victorias con tecnología inteligente.
          </p>
          <button className="phoenix-button text-lg px-8 py-4">
            Comenzar Análisis
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 phoenix-title">
              Características Principales
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para nadadores, entrenadores y equipos de élite
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Análisis de Rendimiento */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <ChartIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Análisis de Rendimiento
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Analiza tiempos, técnica y progreso con métricas avanzadas y visualizaciones interactivas en tiempo real.
              </p>
            </div>

            {/* Cronometraje Inteligente */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <TimerIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Cronometraje Inteligente
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Sistema de cronometraje automático con detección de splits, vueltas y análisis de ritmo por tramo.
              </p>
            </div>

            {/* Comparativas */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <TrophyIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Comparativas Competitivas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Compara rendimiento con competidores, récords históricos y proyecciones de mejora personalizada.
              </p>
            </div>

            {/* Gestión de Equipos */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <TeamIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Gestión de Equipos
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Administra nadadores, planifica entrenamientos y monitorea el progreso grupal e individual.
              </p>
            </div>

            {/* Análisis Técnico */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <WaveIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Análisis Técnico
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluación biomecánica de la técnica de nado con recomendaciones específicas de mejora.
              </p>
            </div>

            {/* Objetivos y Metas */}
            <div className="phoenix-card phoenix-hover group">
              <div className="phoenix-icon-container phoenix-gradient-primary text-white">
                <TargetIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:phoenix-text-gradient transition-all duration-300">
                Objetivos y Metas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Establece metas personalizadas, trackea progreso y recibe notificaciones de logros alcanzados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 phoenix-title">
            Potencia tu Rendimiento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="phoenix-stat">
              <div className="text-4xl md:text-6xl font-bold phoenix-text-gradient mb-2">16+</div>
              <div className="text-lg text-muted-foreground font-medium">Métricas Avanzadas</div>
            </div>
            <div className="phoenix-stat">
              <div className="text-4xl md:text-6xl font-bold phoenix-text-gradient mb-2">5</div>
              <div className="text-lg text-muted-foreground font-medium">Estilos de Natación</div>
            </div>
            <div className="phoenix-stat">
              <div className="text-4xl md:text-6xl font-bold phoenix-text-gradient mb-2">12+</div>
              <div className="text-lg text-muted-foreground font-medium">Distancias Olímpicas</div>
            </div>
            <div className="phoenix-stat">
              <div className="text-4xl md:text-6xl font-bold phoenix-text-gradient mb-2">∞</div>
              <div className="text-lg text-muted-foreground font-medium">Nadadores Conectados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="phoenix-card relative overflow-hidden">
            <div className="absolute inset-0 phoenix-gradient opacity-5"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 phoenix-title leading-tight">
                Lleva tu Natación al Siguiente Nivel
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Únete a la revolución del análisis deportivo. Comienza tu transformación hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="phoenix-button text-lg px-8 py-4">
                  Prueba Gratuita
                </button>
                <button className="px-8 py-4 text-lg font-semibold text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105">
                  Ver Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold phoenix-text-gradient mb-4">AquaLytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transformando la natación competitiva a través del análisis inteligente de datos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Producto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Soporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Estado</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 AquaLytics. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
