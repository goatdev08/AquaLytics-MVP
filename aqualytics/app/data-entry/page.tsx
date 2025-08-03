'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function DataEntryRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a la página de carga de CSV
    router.replace('/data-entry/csv')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Redirigiendo a la página de carga de CSV...
      </p>
    </div>
  )
} 