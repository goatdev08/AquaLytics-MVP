# AquaLytics Backend - Guía de Desarrollo

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales de Supabase
nano .env
```

**Variables requeridas:**

```env
SUPABASE_URL=https://ombbxzdptnasoipzpmfh.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

### 2. Activar Entorno Virtual

```bash
source venv/bin/activate  # Linux/Mac
# o venv\Scripts\activate  # Windows
```

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 4. Iniciar Servidor de Desarrollo

```bash
# Servidor unificado (recomendado para desarrollo)
python main.py

# Uvicorn directo (alternativo)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

🌐 **Servidor disponible en:** <http://localhost:8000>

## 📋 Endpoints Disponibles

### Información del Sistema

- `GET /` - Información completa del API y endpoints disponibles
- `GET /health` - Health check básico

### Ingesta de Datos (ingest.py)

- `POST /ingest/record` - Insertar registro individual de métrica
- `POST /ingest/csv` - Procesamiento masivo desde archivo CSV

### Consultas (query.py)

- `GET /query/swimmer/{swimmer_id}` - Obtener todos los registros de un nadador
- `GET /query/complete_test` - Obtener prueba completa con métricas calculadas
  - Parámetros: `prueba_id`, `nadador_id`, `fecha`

### Previsualización (preview.py)

- `POST /preview/calculate` - Calcular métricas sin persistir en base de datos

## 🏗️ Arquitectura Modular

### Servidor Principal (main.py)

Combina todos los microservicios en un servidor unificado para desarrollo local:

```python
# Importa rutas de cada módulo
from ingest import routes as ingest_routes
from query import routes as query_routes  
from preview import routes as preview_routes

# Combina todas las rutas
all_routes = root_route + ingest_routes + query_routes + preview_routes
```

### Microservicios Independientes

#### 1. Ingesta (ingest.py)

**Clase:** `DataIngestionService`

- Procesamiento de archivos CSV con validación
- Inserción de registros individuales
- Conversión automática de datos a formato largo
- Gestión de errores y validaciones

#### 2. Consultas (query.py)

**Clase:** `DataQueryService`

- Consultas optimizadas por nadador
- Obtención de pruebas completas usando función SQL
- Integración con `get_complete_test_record()` de PostgreSQL

#### 3. Previsualización (preview.py)

**Clase:** `DataPreviewService`

- Cálculos de métricas sin persistencia
- Validación de datos de entrada
- Respuesta inmediata para UI

## 🗄️ Integración con Base de Datos

### Cliente Supabase (utils/supabase_client.py)

**Clase Principal:** `SupabaseClient`

#### Métodos de Gestión de Entidades

```python
# Nadadores
get_or_create_nadador(nombre, edad=None, peso=None) -> int

# Pruebas (usa nueva estructura)
get_prueba_by_name(nombre_prueba) -> Optional[int]
get_prueba_by_details(distancia, estilo, curso='largo') -> Optional[int]

# Métricas
get_metrica_id(nombre_metrica) -> Optional[int]
get_all_metricas() -> List[Dict]

# Competencias
get_or_create_competencia(nombre_competencia) -> int

# Fases
get_fase_id(nombre_fase) -> Optional[int]
```

#### Métodos de Registros

```python
# Inserción optimizada
insert_metric_records(records: List[MetricRecord]) -> Dict[str, Any]

# Consultas
get_registros_by_swimmer(nadador_id) -> List[Dict]
get_registros_by_prueba(prueba_id) -> List[Dict]
```

#### Optimizaciones

- **Caché interno** para IDs frecuentemente consultados
- **Batch inserts** para mejor rendimiento
- **Gestión de errores** con rollback automático

### Estructura MetricRecord

```python
@dataclass
class MetricRecord:
    id_nadador: int
    prueba_id: int          # ⚠️ IMPORTANTE: Usa prueba_id, no distancia_id + estilo_id
    metrica_id: int
    valor: float
    fecha: str
    segmento: Optional[int] = None
    competencia_id: Optional[int] = None
    fase_id: Optional[int] = None
```

### Funciones SQL Integradas

#### 1. get_complete_test_record()

**Uso desde Python:**

```python
params = {
    'p_prueba_id': prueba_id,
    'p_nadador_id': nadador_id,
    'p_fecha': fecha
}
result = supabase_client.client.rpc('get_complete_test_record', params).execute()
```

**Retorna:**

```json
{
  "prueba_id": 1,
  "nadador_id": 1,
  "fecha": "2024-01-15",
  "manual_metrics": {
    "Tiempo Total": 25.43,
    "Brazadas Totales": 18
  },
  "auto_metrics": {
    "Velocidad Promedio": 1.967,
    "Distancia por Brazada": 2.78
  }
}
```

#### 2. calculate_automatic_metrics (Trigger)

Se ejecuta automáticamente al insertar métricas manuales:

- Calcula Velocidad Promedio, Distancia por Brazada, etc.
- Usa `ON CONFLICT` para evitar duplicados
- Solo procesa métricas tipo 'M' (manuales)

## 🔄 Flujo de Desarrollo

### Agregar Nuevo Endpoint

#### 1. Endpoint de Consulta

```python
# En query.py
async def nuevo_endpoint(request: Request) -> JSONResponse:
    try:
        await query_service.initialize()
        
        # Obtener parámetros
        params = request.query_params
        
        # Lógica del endpoint
        result = await query_service.nueva_funcionalidad(params)
        
        return JSONResponse({
            'success': True,
            'data': result
        })
    except Exception as e:
        logger.error(f"Error en nuevo endpoint: {str(e)}")
        return JSONResponse({
            'success': False, 
            'error': str(e)
        }, status_code=500)

# Agregar a routes
routes = [
    # ... existing routes
    Route('/query/nuevo-endpoint', nuevo_endpoint, methods=['GET'])
]
```

#### 2. Endpoint de Ingesta

```python
# En ingest.py
async def nuevo_ingest(request: Request) -> JSONResponse:
    try:
        await ingestion_service.initialize()
        
        data = await request.json()
        
        # Validar datos de entrada
        if not data.get('campo_requerido'):
            return JSONResponse({
                'success': False,
                'message': 'Campo requerido faltante'
            }, status_code=400)
        
        # Procesar datos
        result = await ingestion_service.procesar_datos(data)
        
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({
            'success': False,
            'error': str(e)
        }, status_code=500)
```

#### 3. Actualizar main.py

```python
# En main.py, actualizar available_endpoints
"available_endpoints": {
    "ingest": ["/ingest/record", "/ingest/csv", "/ingest/nuevo"],
    "query": ["/query/complete_test", "/query/swimmer/{id}", "/query/nuevo-endpoint"],
    # ... rest
}
```

### Integración con Frontend

El frontend Next.js está configurado para redirigir `/api/*` al backend Python:

**En desarrollo:**

```
Frontend /api/query/complete_test → Backend /query/complete_test
```

**Configuración (next.config.ts):**

```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8000/:path*'
        : '/api/',
    },
  ]
}
```

## 🧪 Testing y Validación

### Probar Endpoints Localmente

```bash
# Health check
curl http://localhost:8000/

# Información completa del API
curl http://localhost:8000/ | jq

# Prueba completa
curl "http://localhost:8000/query/complete_test?prueba_id=1&nadador_id=1&fecha=2024-01-15"

# Registros por nadador
curl http://localhost:8000/query/swimmer/1
```

### Validar Conexión con Supabase

```bash
cd api
python -c "
from utils.supabase_client import SupabaseClient
client = SupabaseClient()
print('Conexión:', client.test_connection())
print('Estadísticas:', client.get_summary_stats())
"
```

### Depuración de Errores

```python
# En cualquier endpoint, agregar logging detallado
import logging
logger = logging.getLogger(__name__)

try:
    # Tu código aquí
    logger.info(f"Procesando request: {request.url}")
    result = procesar_datos()
    logger.info(f"Resultado: {result}")
except Exception as e:
    logger.error(f"Error detallado: {str(e)}", exc_info=True)
```

## 📊 Estado Actual del Sistema

### Base de Datos Phoenixdb (Supabase)

- **Proyecto ID:** ombbxzdptnasoipzpmfh
- **Estado:** ACTIVE_HEALTHY
- **Región:** us-east-2
- **PostgreSQL:** 15.8.1.100

### Tablas Principales

- `nadadores` (5 registros)
- `pruebas` (34+ pruebas definidas)
- `metricas` (10 métricas: 7 manuales + 3 automáticas)
- `registros` (tabla central con datos de rendimiento)
- `competencias`, `distancias`, `estilos`, `fases` (datos de referencia)

### Métricas Disponibles

**Manuales (tipo 'M'):**

- Tiempo 15m, Tiempo 25m, Tiempo Total
- Brazadas por Tramo, Brazadas Totales
- Flecha por Tramo

**Automáticas (tipo 'A'):**

- Velocidad Promedio
- Distancia por Brazada  
- Distancia sin Flecha

## ⚠️ Consideraciones Importantes

### Estructura de Datos

- **SIEMPRE** usar `prueba_id` en lugar de `distancia_id` + `estilo_id`
- Las métricas automáticas se calculan vía triggers SQL
- Validar que IDs de referencia existan antes de insertar

### Performance

- El cliente mantiene caché de IDs para optimización
- Usar batch inserts para múltiples registros
- Las consultas complejas usan funciones SQL optimizadas

### CORS y Middleware

- CORS configurado para `allow_origins=['*']` en desarrollo
- Middleware de logging automático para todas las requests
- Manejo de preflight requests (OPTIONS)

### Deployment

- Cada microservicio puede desplegarse como función serverless
- `main.py` es solo para desarrollo local
- En producción, cada archivo expone handler para Vercel

## 📚 Recursos Adicionales

- **Documentación Principal:** `.cursor/rules/aqualytics-database-guide.md`
- **Frontend:** `aqualytics/README.md`
- **Base de Datos:** `database/docs/`
- **Esquema actual:** Consultar MCP tools para estructura actualizada

---

**🏊‍♂️ AquaLytics Backend** - *API optimizada para análisis de natación competitiva*
