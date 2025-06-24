# AquaLytics 🏊‍♂️

> **Aplicación web moderna para análisis avanzado de rendimiento en natación competitiva**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

## 🎯 Valor Core

Transformar datos manuales de natación en **insights visuales accionables** para mejorar el rendimiento deportivo mediante análisis avanzado de métricas de natación competitiva.

## ✨ Características Principales

### 🏆 **Ingesta de Datos Inteligente**
- ✅ Entrada manual con validación en tiempo real
- ✅ Carga CSV con procesamiento batch
- ✅ Validación avanzada con **Zod** y reglas de consistencia

### 📊 **Análisis Automático de Métricas**
- ✅ **6 métricas automáticas** calculadas desde 10 métricas manuales
- ✅ Validación de coherencia de velocidades
- ✅ Detección de inconsistencias en tiempos y brazadas

### 🎨 **Tema Phoenix Moderno**
- ✅ Diseño responsive (320px - 1920px)
- ✅ Gradientes sutiles y UI moderna
- ✅ Modo claro/oscuro con TailwindCSS 4

### ⚡ **Performance Optimizada**
- ✅ Carga inicial < 2 segundos
- ✅ Procesamiento < 500ms para 100 registros
- ✅ Validación en tiempo real optimizada

## 🏗️ Stack Tecnológico

### Frontend
```typescript
- Next.js 15 (App Router)     ✅ Configurado
- React 19.0.0 LTS           ✅ Configurado
- TypeScript 5.x             ✅ Configurado
- TailwindCSS 4              ✅ Tema Phoenix implementado
- Zod 3.25.67               ✅ Validación completa
- React Hook Form 7.58.1    ✅ Formularios optimizados
- Chart.js 4.5.0            🔄 Próxima implementación
- Zustand 4.5.7             🔄 State management pendiente
```

### Backend
```python
- Python 3.11               ✅ Funciones serverless listas
- Supabase PostgreSQL       ✅ Schema completo + RLS
- Pandas 2.3               ✅ Análisis de datos
- FastAPI/Starlette        ✅ API endpoints
```

### Base de Datos
```sql
- Supabase 'Phoenixdb'      ✅ Configurado y conectado
- 16 métricas definidas     ✅ Schema implementado
- RLS políticas             ✅ Seguridad implementada
- Migraciones              ✅ Performance optimizado
```

## 📋 Estado del Proyecto

### ✅ **Completado (8/25 tareas - 32%)**
1. **✅ Next.js 15 Project** - Inicializado con App Router
2. **✅ Configuración Supabase** - Cliente y variables de entorno
3. **✅ Tema Phoenix TailwindCSS** - Paleta de colores y responsive
4. **✅ Schema Base de Datos** - Tablas, relaciones y datos semilla
5. **✅ Componentes UI Base** - Biblioteca de componentes reutilizables
6. **✅ Tipos TypeScript** - Interfaces completas para BD y APIs
7. **✅ Funciones Python Serverless** - API de procesamiento
8. **✅ Sistema de Validación** - Zod schemas + validación backend

### 🔄 **En Progreso**
- **Tarea #11**: Sistema de Gestión de Nadadores (CRUD completo)

### 📅 **Próximas Prioridades**
- **Tarea #12**: Gestión de Datos de Referencia
- **Tarea #13**: Formulario de Métricas Manuales
- **Tarea #15**: Motor de Cálculo Automático
- **Tarea #16**: Componentes de Visualización Chart.js

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
- Node.js 18+ 
- Python 3.11+
- Cuenta Supabase
```

### Instalación
```bash
# Clonar repositorio
git clone [repo-url]
cd AquaLytics-dev

# Frontend (Next.js)
cd aqualytics
npm install
npm run dev

# Backend (Python)
cd ../api
pip install -r requirements.txt
```

### Variables de Entorno
Crear `.env.local` en `/aqualytics`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
```

## 🏊‍♂️ Métricas de Natación

### Métricas Manuales (10)
| Métrica | Descripción | Rango |
|---------|-------------|-------|
| T15(1/2) | Tiempo 15m por segmento | 3.00-30.00s |
| BRZ(1/2) | Brazadas por segmento | 1-50 brazadas |
| T25(1/2) | Tiempo 25m por segmento | 5.00-60.00s |
| F(1/2) | Flecha por segmento | 0.00-15.00m |
| T_TOTAL | Tiempo total 50m | 10.00-120.00s |
| BRZ_TOTAL | Total de brazadas | 2-100 brazadas |

### Métricas Automáticas (6)
| Métrica | Fórmula | Unidad |
|---------|---------|--------|
| V1/V2 | 25 / T25(1/2) | m/s |
| V_promedio | 50 / T_TOTAL | m/s |
| DIST_x_BRZ | 50 / BRZ_TOTAL | m/brazada |
| DIST_sin_F | 50 - (F1 + F2) | metros |
| F_promedio | (F1 + F2) / 2 | metros |

## 🎨 Tema Phoenix

### Paleta de Colores
```css
--phoenix-red: #DC2626      /* Rojo principal */
--phoenix-orange: #EA580C   /* Naranja transición */
--phoenix-yellow: #D97706   /* Amarillo brillante */

/* Gradientes */
--gradient-phoenix: linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #D97706 100%)
--gradient-phoenix-soft: linear-gradient(135deg, #FEE2E2 0%, #FED7AA 50%, #FEF3C7 100%)
```

### Elementos con Gradientes
- Headers principales (H1, títulos)
- Botones de acción primaria
- Cards de métricas destacadas
- Progress bars y borders activos

## 🧪 Validación de Datos

### Frontend (Zod)
- ✅ Validación en tiempo real
- ✅ Reglas de consistencia avanzadas
- ✅ Mensajes de error contextuales
- ✅ Soporte para CSV batch

### Backend (Python)
- ✅ Validación estricta (tolerancia 10%)
- ✅ Detección de velocidades incoherentes
- ✅ Validación de rangos de flechas
- ✅ Consistencia tiempo/brazadas

## 📚 Arquitectura del Proyecto

```
aqualytics/
├── app/                    # Next.js App Router
│   ├── globals.css        # ✅ Estilos Phoenix
│   ├── layout.tsx         # ✅ Layout principal
│   └── page.tsx           # ✅ Dashboard home
├── components/            # ✅ Componentes UI
│   └── ui/               # ✅ Componentes base
├── lib/                   # ✅ Configuraciones
│   ├── supabase.ts       # ✅ Cliente configurado
│   ├── types/            # ✅ Tipos TypeScript
│   ├── utils/            # ✅ Validadores Zod
│   └── hooks/            # ✅ Hooks personalizados
└── public/               # Assets estáticos

api/                       # ✅ Python Serverless
├── ingest.py             # ✅ Ingesta datos
├── query.py              # ✅ Consultas
├── calculations/         # ✅ Cálculo métricas
└── utils/                # ✅ Validación backend
```

## 🤝 Contribuciones

Este proyecto sigue las mejores prácticas de desarrollo:

### Reglas de Código
- ✅ **Pydantic** para validación de datos
- ✅ **Docstrings Google style** en todas las funciones
- ✅ **Comentarios `# Reason:`** para lógica compleja
- ✅ **Archivos < 500 líneas** (modularización)
- ✅ **Convenciones de naming consistentes**

### Workflow de Desarrollo
1. Usar **TaskMaster AI** para gestión de tareas
2. Seguir el PRD para alineación del proyecto
3. Implementar optimizaciones sin afectar funcionalidad
4. Actualizar README con nuevas características

## 📄 Licencia

Proyecto privado para análisis de rendimiento en natación competitiva.

---

**🏊‍♂️ AquaLytics** - *Transformando datos de natación en insights de rendimiento*
