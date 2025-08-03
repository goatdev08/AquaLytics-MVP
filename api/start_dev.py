#!/usr/bin/env python3
"""
Script de desarrollo para AquaLytics Backend
Inicia el servidor unificado con todas las configuraciones para desarrollo local
"""

import os
import sys
import uvicorn
from pathlib import Path

def main():
    """Función principal para iniciar el servidor de desarrollo"""
    
    # Configurar el directorio de trabajo
    current_dir = Path(__file__).parent
    os.chdir(current_dir)
    
    # Verificar variables de entorno requeridas
    required_env_vars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY', 
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print("❌ Error: Faltan las siguientes variables de entorno:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Asegúrate de tener un archivo .env en la carpeta api/ con estas variables.")
        sys.exit(1)
    
    print("🚀 Iniciando AquaLytics Backend en modo desarrollo...")
    print("📍 Servidor disponible en: http://localhost:8000")
    print("📋 Endpoints disponibles:")
    print("   • GET  /                    - Info del API")
    print("   • POST /ingest/record       - Registro individual")
    print("   • POST /ingest/csv          - Carga masiva CSV")
    print("   • GET  /query/metrics       - Consultar métricas")
    print("   • GET  /query/aggregate     - Métricas agregadas")
    print("   • GET  /query/rankings      - Rankings")
    print("   • GET  /query/reference     - Datos de referencia")
    print("   • GET  /query/complete_test - Prueba completa")
    print("   • POST /preview/calculate   - Previsualización")
    print("   • GET  /health              - Health check")
    print("\n🔄 Auto-reload activado. Presiona Ctrl+C para detener.\n")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=[".", "utils", "calculations"],
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido. ¡Hasta luego!")
    except Exception as e:
        print(f"\n❌ Error iniciando el servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 