/**
 * Hook personalizado para la gestión de Competencias
 * Proporciona operaciones CRUD completas, manejo de estado,
 * y funcionalidades optimizadas para obtener datos de competencias.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

// ===== TIPOS =====

export interface Competition {
  competencia_id: number;
  competencia: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface CompetitionWithStats extends Competition {
  total_nadadores?: number;
  total_pruebas?: number;
  total_registros?: number;
  tiempo_promedio_general?: number | null;
}

export interface CompetitionFormData {
  competencia: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface CompetitionListParams {
  search?: string;
  limit?: number;
  offset?: number;
  includeStats?: boolean;
}

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
  total?: number;
}

interface UseCompetitionsOptions {
  includeStats?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface CompetitionState {
  competitions: CompetitionWithStats[];
  isLoading: boolean;
  error: string | null;
  isOperating: boolean;
}

// ===== FUNCIONES DE API =====

async function fetchCompetitions(params: CompetitionListParams = {}): Promise<ApiResponse<CompetitionWithStats[]>> {
  const searchParams = new URLSearchParams();
  
  if (params.search) searchParams.append('search', params.search);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());
  if (params.includeStats) searchParams.append('includeStats', 'true');

  const response = await fetch(`/api/competitions?${searchParams.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener competencias');
  }

  return response.json();
}

async function createCompetition(competition: CompetitionFormData): Promise<Competition> {
  const response = await fetch('/api/competitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(competition),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear competencia');
  }

  const result: ApiResponse<Competition> = await response.json();
  return result.data;
}

async function updateCompetition(competition: Competition & { competencia_id: number }): Promise<Competition> {
  const response = await fetch('/api/competitions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(competition),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar competencia');
  }

  const result: ApiResponse<Competition> = await response.json();
  return result.data;
}

async function deleteCompetition(id: number): Promise<void> {
  const response = await fetch(`/api/competitions?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar competencia');
  }
}

// ===== HOOK PRINCIPAL =====

export function useCompetitions(options: UseCompetitionsOptions = {}) {
  const { includeStats = false, autoRefresh = false, refreshInterval = 60000 } = options;

  const [state, setState] = useState<CompetitionState>({
    competitions: [],
    isLoading: true,
    error: null,
    isOperating: false,
  });

  const loadCompetitions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetchCompetitions({ includeStats });
      setState(prev => ({ ...prev, competitions: response.data, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [includeStats]);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadCompetitions, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadCompetitions]);

  const performOperation = useCallback(async <T>(operation: Promise<T>, optimisticUpdate?: (state: CompetitionState) => CompetitionState, loadingMessage?: string, successMessage?: string) => {
    const toastId = toast.loading(loadingMessage || 'Procesando...');
    const previousState = state;
    if (optimisticUpdate) {
        setState(optimisticUpdate);
    }
    setState(prev => ({ ...prev, isOperating: true, error: null }));
    try {
        await operation;
        toast.success(successMessage || 'Operación exitosa', { id: toastId });
        await loadCompetitions();
    } catch (error) {
        setState(previousState); // Revertir en caso de error
        const errorMessage = error instanceof Error ? error.message : 'Error en la operación';
        toast.error(errorMessage, { id: toastId });
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
    } finally {
        setState(prev => ({ ...prev, isOperating: false }));
    }
  }, [state, loadCompetitions]);

  const createCompetitionAsync = useCallback((competition: CompetitionFormData) => {
    const optimisticUpdate = (prev: CompetitionState): CompetitionState => ({
        ...prev,
        competitions: [
            { ...competition, competencia_id: Date.now(), fecha_fin: competition.fecha_fin },
            ...prev.competitions
        ],
    });
    return performOperation(
      createCompetition(competition), 
      optimisticUpdate,
      'Creando competencia...',
      'Competencia creada exitosamente'
    );
  }, [performOperation]);

  const updateCompetitionAsync = useCallback((competition: Competition & { competencia_id: number }) => {
    const optimisticUpdate = (prev: CompetitionState): CompetitionState => ({
        ...prev,
        competitions: prev.competitions.map(c =>
            c.competencia_id === competition.competencia_id ? { ...c, ...competition } : c
        ),
    });
    return performOperation(
      updateCompetition(competition),
      optimisticUpdate,
      'Actualizando competencia...',
      'Competencia actualizada exitosamente'
    );
  }, [performOperation]);

  const deleteCompetitionAsync = useCallback((id: number) => {
    const optimisticUpdate = (prev: CompetitionState): CompetitionState => ({
        ...prev,
        competitions: prev.competitions.filter(c => c.competencia_id !== id),
    });
    return performOperation(
      deleteCompetition(id),
      optimisticUpdate,
      'Eliminando competencia...',
      'Competencia eliminada exitosamente'
    );
  }, [performOperation]);

  return {
    competitions: state.competitions,
    isLoading: state.isLoading,
    error: state.error,
    isOperating: state.isOperating,
    createCompetition: createCompetitionAsync,
    updateCompetition: updateCompetitionAsync,
    deleteCompetition: deleteCompetitionAsync,
    refreshCompetitions: loadCompetitions,
    clearError: useCallback(() => setState(prev => ({ ...prev, error: null })), []),
  };
}

// ===== HOOK PARA SELECTOR DE COMPETENCIA =====

export function useCompetitionSelector(initialId?: number) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(initialId || null);
  const { competitions, isLoading, error } = useCompetitions();

  const selectedCompetition = useMemo(() => 
    competitions.find(c => c.competencia_id === selectedCompetitionId) || null,
    [competitions, selectedCompetitionId]
  );

  const selectCompetition = useCallback((id: number) => {
    setSelectedCompetitionId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCompetitionId(null);
  }, []);

  return {
    competitions,
    isLoading,
    error,
    selectedCompetition,
    selectedCompetitionId,
    selectCompetition,
    clearSelection,
    hasSelection: selectedCompetitionId !== null,
  };
} 