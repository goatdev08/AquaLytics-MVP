/**
 * API Route: Previsualización de Cálculos de Métricas
 * Endpoint para calcular métricas sin persistencia
 */

import { NextRequest, NextResponse } from 'next/server';

// Definir la URL del backend Python
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el cuerpo de la solicitud
    if (!body.manual_metrics || !body.distancia_total) {
      return NextResponse.json(
        { 
          success: false, 
          errors: ['Faltan campos requeridos: manual_metrics, distancia_total'],
          data: null
        },
        { status: 400 }
      );
    }

    console.log('Enviando solicitud al backend Python:', `${PYTHON_API_URL}/preview/calculate`);
    
    // Enviar la solicitud al backend Python
    const response = await fetch(`${PYTHON_API_URL}/preview/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Manejar la respuesta del backend
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del backend Python:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          errors: [`Error del servicio de cálculo: ${response.status} ${response.statusText}`],
          data: null
        },
        { status: 500 }
      );
    }

    // Procesar la respuesta exitosa
    const result = await response.json();
    console.log('Respuesta del backend Python:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error en endpoint de previsualización:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        data: null
      },
      { status: 500 }
    );
  }
} 