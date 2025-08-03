# AquaLytics - Análisis de Rendimiento en Natación

> **Aplicación web moderna para análisis avanzado de rendimiento en natación competitiva**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

## 🎯 Descripción

AquaLytics es una plataforma completa para el análisis de rendimiento en natación competitiva. Permite la ingesta de datos de entrenamiento y competencia, calcula métricas automáticas avanzadas, y proporciona visualizaciones para mejorar el rendimiento deportivo.

## 🏗️ Arquitectura del Proyecto

### Base de Datos (Supabase - Phoenixdb)

- **PostgreSQL 15.8** con extensiones avanzadas
- **8 tablas principales** con relaciones optimizadas
- **Funciones SQL automatizadas** para cálculos de métricas
- **Triggers automáticos** para métricas derivadas

### Backend (Python API)

- **FastAPI/Starlette** para endpoints serverless
- **Arquitectura modular** (ingest, query, preview)
- **Cliente Supabase optimizado** con caché interno
- **Validación avanzada** de datos de natación

### Frontend (Next.js)

- **App Router** con TypeScript
- **Proxies configurados** para desarrollo
- **Validación Zod** en tiempo real
- **UI responsive** con TailwindCSS

## 📊 Capacidades de Métricas

### Métricas Manuales (7 tipos)

- Tiempos por segmento (15m, 25m, Total)
- Brazadas por tramo y totales
- Flechas por segmento
- Datos por segmento o globales

### Métricas Automáticas (3 tipos)

- **Velocidad Promedio**: distancia / tiempo_total
- **Distancia por Brazada**: distancia / brazadas_totales  
- **Distancia sin Flecha**: distancia - suma_flechas

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
- Node.js 18+
- Python 3.11+
- Cuenta Supabase configurada
```

### 1. Configurar Variables de Entorno

**Backend (.env en /api):**

```env
SUPABASE_URL=https://ombbxzdptnasoipzpmfh.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
```

**Frontend (.env.local en /aqualytics):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://ombbxzdptnasoipzpmfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
PYTHON_BACKEND_URL=http://localhost:8000
```

### 2. Iniciar Backend Python

```bash
cd api
source venv/bin/activate  # Linux/Mac
# o venv\Scripts\activate   # Windows
python main.py
```

🌐 Backend disponible en <http://localhost:8000>

### 3. Iniciar Frontend Next.js

```bash
cd aqualytics
npm install
npm run dev
```

🌐 Frontend disponible en <http://localhost:3000>

## 📁 Estructura del Proyecto

```
AquaLytics-dev/
├── api/                          # Backend Python
│   ├── main.py                   # Servidor unificado desarrollo
│   ├── ingest.py                 # Endpoints ingesta datos
│   ├── query.py                  # Endpoints consulta
│   ├── preview.py                # Previsualización cálculos
│   └── utils/
│       ├── supabase_client.py    # Cliente BD optimizado
│       ├── csv_processor.py      # Procesamiento CSV
│       └── data_validation.py    # Validaciones
├── aqualytics/                   # Frontend Next.js
│   ├── app/                      # App Router pages
│   ├── components/               # Componentes React
│   ├── lib/                      # Hooks, utils, tipos
│   └── public/                   # Assets estáticos
├── database/                     # Scripts BD
│   ├── migrations/               # Migraciones SQL
│   └── docs/                     # Documentación BD
└── .cursor/
    └── rules/                    # Reglas de desarrollo
```

## 🔧 Endpoints Principales

### Backend Python (puerto 8000)

- `GET /` - Información del API
- `POST /ingest/record` - Ingesta registro individual
- `POST /ingest/csv` - Procesamiento CSV masivo
- `GET /query/complete_test` - Prueba completa con métricas
- `GET /query/swimmer/{id}` - Registros por nadador
- `POST /preview/calculate` - Cálculos sin persistencia

### Frontend Next.js (puerto 3000)

- `POST /api/registros` - Inserción directa Supabase
- `POST /api/process-csv` - Proxy a backend Python
- `GET /api/swimmers` - Lista de nadadores
- `GET /api/competitions` - Lista de competencias

## 🏊‍♂️ Flujo de Datos

### Ingesta de Datos

```
1. CSV Upload → Frontend FormData
2. Next.js Proxy → Python Backend
3. CSV Processor → Validación datos
4. Supabase Insert → Tabla registros
5. Trigger SQL → Cálculo automático métricas
```

### Consulta de Datos

```
1. Frontend Hook → API Request
2. Python Backend → Función SQL get_complete_test_record()
3. Supabase Response → JSON métricas consolidadas
4. Frontend Render → Visualización datos
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

| Tabla | Descripción | Relación |
|-------|-------------|----------|
| `nadadores` | Información atletas | → registros |
| `pruebas` | Definición pruebas (50m Libre, etc.) | → registros |
| `metricas` | Catálogo métricas (manuales/automáticas) | → registros |
| `registros` | **Tabla central** - cada métrica individual | Central |
| `competencias` | Eventos y competencias | → registros |

### Funciones SQL Clave

- `get_complete_test_record()`: Obtiene métricas completas de una prueba
- `calculate_automatic_metrics()`: Trigger para cálculos automáticos

## 🛠️ Desarrollo

### Agregar Nuevo Endpoint

**1. Backend Python:**

```python
# En query.py o ingest.py
async def nuevo_endpoint(request: Request) -> JSONResponse:
    try:
        # Lógica del endpoint
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({'success': False, 'error': str(e)})
```

**2. Frontend Proxy:**

```typescript
// app/api/nuevo/route.ts
export async function GET() {
  const response = await fetch(`${PYTHON_BACKEND_URL}/query/nuevo`)
  return NextResponse.json(await response.json())
}
```

### Comandos de Diagnóstico

```bash
# Verificar backend
curl http://localhost:8000/health

# Verificar conexión BD
cd api && python -c "from utils.supabase_client import SupabaseClient; print(SupabaseClient().test_connection())"

# Verificar proxy frontend
curl http://localhost:3000/api/health
```

## 📈 Estado del Proyecto

### ✅ Completado

- [x] Esquema completo de base de datos
- [x] Backend Python con endpoints core
- [x] Frontend Next.js con proxies
- [x] Sistema de métricas automáticas
- [x] Validación avanzada de datos
- [x] Procesamiento CSV optimizado

### 🔄 En Desarrollo

- [ ] Dashboard de visualizaciones
- [ ] Gestión completa de nadadores
- [ ] Sistema de comparaciones
- [ ] Análisis temporal de rendimiento

## 📚 Documentación

- **🎯 Guía Principal**: `.cursor/rules/aqualytics-database-guide.md`
- **🔧 Backend**: `api/README_DEV.md`
- **🎨 Frontend**: `aqualytics/README.md`
- **🗄️ Base de Datos**: `database/docs/`

## 🤝 Contribución

Este proyecto sigue las reglas definidas en `.cursor/rules/` para mantener consistencia arquitectónica. Consultar la guía de desarrollo antes de realizar modificaciones.

## 📝 Licencia

Proyecto privado para análisis de rendimiento en natación competitiva.

---

**🏊‍♂️ AquaLytics** - *Transformando datos de natación en insights de rendimiento*
