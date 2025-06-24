import MainLayout from '@/components/layout/MainLayout'

// Componentes de iconos SVG Phoenix
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Home() {
  return (
    <MainLayout>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
          <div className="absolute inset-0 phoenix-pattern opacity-5" />
          
          <div className="relative container mx-auto max-w-screen-2xl px-6 py-24 text-center">
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-muted/50 border border-border mb-8">
              <svg className="mr-2 h-4 w-4 text-phoenix-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Bienvenido a AquaLytics v1.0
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight phoenix-text-gradient sm:text-7xl mb-6">
              Análisis de Rendimiento
              <br />
              en Natación
            </h1>
            
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground mb-10 leading-relaxed">
              Transformamos datos manuales de natación en <strong className="text-foreground">insights visuales accionables</strong> 
              para mejorar el rendimiento deportivo mediante análisis avanzado de métricas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button className="phoenix-button px-8 py-4 text-lg">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Comenzar Análisis
              </button>
              <button className="px-8 py-4 text-lg border border-border rounded-lg hover:bg-accent transition-colors">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver Demo
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 phoenix-title">
                Características Principales
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Herramientas profesionales diseñadas para nadadores, entrenadores y equipos de élite
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="phoenix-card p-8">
                <div className="phoenix-icon-container mb-6">
                  <ChartIcon />
                </div>
                <h3 className="phoenix-title text-xl font-semibold mb-4">Análisis Avanzado</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Métricas detalladas de rendimiento, segmentación de nado y comparaciones temporales con visualizaciones interactivas.
                </p>
              </div>

              <div className="phoenix-card p-8">
                <div className="phoenix-icon-container mb-6">
                  <TimerIcon />
                </div>
                <h3 className="phoenix-title text-xl font-semibold mb-4">Cronometraje Inteligente</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sistema automático con detección de splits, vueltas y análisis de ritmo por tramo en tiempo real.
                </p>
              </div>

              <div className="phoenix-card p-8">
                <div className="phoenix-icon-container mb-6">
                  <TrophyIcon />
                </div>
                <h3 className="phoenix-title text-xl font-semibold mb-4">Comparativas Competitivas</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compara rendimiento con competidores, récords históricos y proyecciones de mejora personalizada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="container mx-auto max-w-screen-2xl text-center">
            <h2 className="text-4xl font-bold mb-16 phoenix-title">
              Potencia tu Rendimiento
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="phoenix-stat space-y-2">
                <div className="text-4xl md:text-5xl font-bold phoenix-text-gradient">16+</div>
                <div className="text-sm text-muted-foreground">Métricas Avanzadas</div>
              </div>
              <div className="phoenix-stat space-y-2">
                <div className="text-4xl md:text-5xl font-bold phoenix-text-gradient">100%</div>
                <div className="text-sm text-muted-foreground">Datos Validados</div>
              </div>
              <div className="phoenix-stat space-y-2">
                <div className="text-4xl md:text-5xl font-bold phoenix-text-gradient">24/7</div>
                <div className="text-sm text-muted-foreground">Disponibilidad</div>
              </div>
              <div className="phoenix-stat space-y-2">
                <div className="text-4xl md:text-5xl font-bold phoenix-text-gradient">∞</div>
                <div className="text-sm text-muted-foreground">Nadadores</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="text-center phoenix-card p-12 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">¿Listo para optimizar tu rendimiento?</h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Únete a entrenadores y nadadores que ya están utilizando AquaLytics 
                para llevar sus entrenamientos al siguiente nivel.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="phoenix-button px-8 py-4 text-lg w-full sm:w-auto">
                  Comenzar Ahora
                </button>
                <button className="px-8 py-4 text-lg border border-border rounded-lg hover:bg-accent transition-colors w-full sm:w-auto">
                  Contactar Ventas
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
