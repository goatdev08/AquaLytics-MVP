import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Solo aplicar middleware a rutas de API
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(request)
  }
  
  return NextResponse.next()
}

function handleApiRequest(request: NextRequest) {
  const startTime = Date.now()
  const { method, url } = request
  
  console.log(`🌐 ${method} ${url} - Started`)
  
  // Crear respuesta con CORS headers
  const response = NextResponse.next()
  
  // Configurar CORS
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Manejar preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
  
  // Logging de tiempo de respuesta
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
  
  return response
}

// Configurar matcher para que solo aplique a rutas específicas
export const config = {
  matcher: [
    '/api/:path*',
  ],
} 