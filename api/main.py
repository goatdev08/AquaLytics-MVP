"""
Main Backend Server - AquaLytics API
Servidor unificado para desarrollo local que incluye todos los endpoints
"""

import logging
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.requests import Request

# Importar las rutas de cada microservicio
from ingest import routes as ingest_routes
from query import routes as query_routes  
from preview import routes as preview_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def root_handler(request: Request) -> JSONResponse:
    """Endpoint raíz para verificar que el servidor está funcionando"""
    return JSONResponse({
        "message": "AquaLytics Backend API",
        "version": "1.0.0",
        "status": "running",
        "available_endpoints": {
            "ingest": ["/ingest/record", "/ingest/csv"],
            "query": [
                "/query/swimmer/{swimmer_id}", 
                "/query/complete_test", 
                "/query/rankings", 
                "/query/aggregate", 
                "/query/performance-progress",
                "/query/best-times",
                "/query/styles-distribution"
            ],
            "preview": ["/preview/calculate"],
            "health": ["/health"]
        }
    })

# Crear la ruta raíz
root_route = [Route('/', root_handler, methods=['GET'])]

# Combinar todas las rutas
all_routes = root_route + ingest_routes + query_routes + preview_routes

# Configurar middleware
middleware = [
    Middleware(
        CORSMiddleware, 
        allow_origins=['*'], 
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
        allow_headers=['*'],
        allow_credentials=True
    )
]

# Crear la aplicación unificada
app = Starlette(routes=all_routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 