import { useState, useEffect, useCallback } from 'react';
import type { ApiError, CompleteTestRecord } from '@/lib/types/api';

interface UseCompleteTestResult {
  data: CompleteTestRecord | null;
  isLoading: boolean;
  error: ApiError | null;
  fetchTest: (pruebaId: number, nadadorId: number, fecha: string) => void;
}

export function useCompleteTest(): UseCompleteTestResult {
  const [data, setData] = useState<CompleteTestRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTest = useCallback(async (pruebaId: number, nadadorId: number, fecha: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const queryParams = new URLSearchParams({
        prueba_id: pruebaId.toString(),
        nadador_id: nadadorId.toString(),
        fecha: fecha,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/query/complete_test?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError({ success: false, message: result.error || 'No se encontraron datos.', error: result.error || 'No se encontraron datos.', timestamp: new Date().toISOString() });
      }

    } catch (err) {
      setError({ 
        success: false,
        message: err instanceof Error ? err.message : 'Ocurrió un error desconocido.',
        error: err instanceof Error ? err.message : 'Ocurrió un error desconocido.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchTest };
} 