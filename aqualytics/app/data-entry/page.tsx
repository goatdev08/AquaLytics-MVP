'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function DataEntrySelectionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-phoenix-red via-phoenix-orange to-phoenix-yellow bg-clip-text text-transparent">
              Entrada de Datos
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Selecciona cómo deseas ingresar los datos de natación
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Entry Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div 
              onClick={() => router.push('/data-entry/manual')}
              className="flex flex-col items-center text-center space-y-4"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Entrada Manual
              </h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400">
                Ingresa los datos de métricas de natación uno por uno mediante un formulario detallado
              </p>

              {/* Features */}
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Validación en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Cálculo automático de métricas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ideal para registros individuales</span>
                </div>
              </div>

              {/* Button */}
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/data-entry/manual')
                }}
              >
                Entrada Manual →
              </Button>
            </div>
          </Card>

          {/* CSV Upload Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div 
              onClick={() => router.push('/data-entry/csv')}
              className="flex flex-col items-center text-center space-y-4"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Carga CSV
              </h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400">
                Sube un archivo CSV con múltiples registros de natación para procesamiento en lote
              </p>

              {/* Features */}
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Procesamiento masivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vista previa y validación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ideal para múltiples registros</span>
                </div>
              </div>

              {/* Button */}
              <Button 
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/data-entry/csv')
                }}
              >
                Cargar CSV →
              </Button>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 <strong>Consejo:</strong> Usa entrada manual para registros individuales o carga CSV para importar múltiples datos de competencias
          </p>
        </div>

        {/* Sample CSV Link */}
        <div className="mt-6 text-center">
          <a 
            href="/sample-data/ejemplo_natacion.csv" 
            download
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm inline-flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar archivo CSV de ejemplo</span>
          </a>
        </div>
      </div>
    </div>
  )
} 