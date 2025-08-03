"""
Data Querying Endpoints - AquaLytics API
"""
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from operations import DataQueryService

# Instancia global del servicio
query_service = DataQueryService()

# === Handlers de Endpoints ===

async def get_rankings_handler(request: Request) -> JSONResponse:
    limit = int(request.query_params.get('limit', 10))
    result = await query_service.get_rankings(limit)
    return JSONResponse(result)

async def get_aggregate_handler(request: Request) -> JSONResponse:
    metrics_param = request.query_params.get('metrics', '')
    metrics = [metric.strip() for metric in metrics_param.split(',') if metric.strip()]
    if not metrics:
        return JSONResponse({"success": False, "error": "Parámetro 'metrics' es requerido."}, status_code=400)
    result = await query_service.get_aggregate_data(metrics)
    return JSONResponse(result)

async def get_performance_progress_handler(request: Request) -> JSONResponse:
    days = int(request.query_params.get('days', 30))
    result = await query_service.get_performance_progress(days)
    return JSONResponse(result)

async def get_swimmer_records_handler(request: Request) -> JSONResponse:
    swimmer_id = int(request.path_params['swimmer_id'])
    result = await query_service.get_swimmer_records(swimmer_id)
    return JSONResponse(result)

async def get_complete_test_handler(request: Request) -> JSONResponse:
    result = await query_service.get_complete_test_record()
    return JSONResponse(result)

async def get_best_times_handler(request: Request) -> JSONResponse:
    try:
        style = request.query_params['style']
        distance = int(request.query_params['distance'])
        course = request.query_params['course']
    except (KeyError, ValueError):
        return JSONResponse({"success": False, "error": "Parámetros requeridos: style, distance (entero), course."}, status_code=400)
    result = await query_service.get_best_times(style, distance, course)
    return JSONResponse(result)

async def get_styles_distribution_handler(request: Request) -> JSONResponse:
    """Handler para obtener la distribución de estilos más practicados"""
    result = await query_service.get_styles_distribution()
    return JSONResponse(result)

# === Rutas ===
routes = [
    Route('/query/rankings', get_rankings_handler, methods=['GET']),
    Route('/query/aggregate', get_aggregate_handler, methods=['GET']),
    Route('/query/performance-progress', get_performance_progress_handler, methods=['GET']),
    Route('/query/swimmer/{swimmer_id:int}', get_swimmer_records_handler, methods=['GET']),
    Route('/query/complete_test', get_complete_test_handler, methods=['GET']),
    Route('/query/best-times', get_best_times_handler, methods=['GET']),
    Route('/query/styles-distribution', get_styles_distribution_handler, methods=['GET']),
]

# === Aplicación Starlette (para pruebas aisladas) ===
if __name__ == "__main__":
    middleware = [
        Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    ]
    app = Starlette(routes=routes, middleware=middleware)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 