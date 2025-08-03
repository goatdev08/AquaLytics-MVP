'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Nadador {
  id_nadador: number;
  nombre: string;
}

interface Prueba {
  id: number;
  nombre: string;
  curso: string;
  distancias?: {
    distancia: number;
  };
  estilos?: {
    nombre: string;
  };
}

interface ComparisonMetric {
  metric_name: string;
  swimmer1_value: number;
  swimmer2_value: number;
  difference: number;
  percentage_diff: number;
  unit: string;
}

interface SwimmerComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const SwimmerComparison: React.FC<SwimmerComparisonProps> = ({ isOpen, onClose }) => {
  const [swimmers, setSwimmers] = useState<Nadador[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [selectedSwimmer1, setSelectedSwimmer1] = useState<number>(0);
  const [selectedSwimmer2, setSelectedSwimmer2] = useState<number>(0);
  const [selectedPrueba, setSelectedPrueba] = useState<number>(0);
  const [comparisonData, setComparisonData] = useState<ComparisonMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar nadadores
        const swimmersResponse = await fetch('/api/swimmers');
        const swimmersResult = await swimmersResponse.json();
        if (swimmersResult.success) {
          setSwimmers(swimmersResult.data);
        }

        // Cargar pruebas
        const pruebasResponse = await fetch('/api/pruebas');
        const pruebasResult = await pruebasResponse.json();
        if (pruebasResult.data) {
          // Adaptar la estructura de datos del endpoint /api/pruebas
          const adaptedPruebas = pruebasResult.data.map((prueba: any) => ({
            id: prueba.id,
            nombre: prueba.nombre,
            curso: prueba.curso,
            distancias: prueba.distancias,
            estilos: prueba.estilos
          }));
          setPruebas(adaptedPruebas);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Realizar comparación
  const performComparison = async () => {
    if (!selectedSwimmer1 || !selectedSwimmer2 || !selectedPrueba) {
      setError('Por favor selecciona ambos nadadores y una prueba');
      return;
    }

    if (selectedSwimmer1 === selectedSwimmer2) {
      setError('Por favor selecciona nadadores diferentes');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query/compare-swimmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swimmer1_id: selectedSwimmer1,
          swimmer2_id: selectedSwimmer2,
          prueba_id: selectedPrueba,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setComparisonData(result.data);
      } else {
        setError(result.error || 'Error en la comparación');
      }
    } catch (error) {
      console.error('Error in comparison:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const getValueColor = (difference: number) => {
    if (difference > 0) return 'text-green-600 dark:text-green-400';
    if (difference < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getDifferenceSymbol = (difference: number) => {
    if (difference > 0) return '+';
    return '';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 's') {
      return `${value.toFixed(2)}s`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  const selectedSwimmer1Name = swimmers.find(s => s.id_nadador === selectedSwimmer1)?.nombre || '';
  const selectedSwimmer2Name = swimmers.find(s => s.id_nadador === selectedSwimmer2)?.nombre || '';
  const selectedPruebaInfo = pruebas.find(p => p.id === selectedPrueba);
  const selectedPruebaName = selectedPruebaInfo 
    ? `${selectedPruebaInfo.distancias?.distancia || ''}m ${selectedPruebaInfo.estilos?.nombre || ''} (${selectedPruebaInfo.curso})`
    : '';

  // Preparar opciones para los selects
  const swimmerOptions = [
    { value: "0", label: "Seleccionar nadador..." },
    ...swimmers.map(swimmer => ({
      value: swimmer.id_nadador.toString(),
      label: swimmer.nombre
    }))
  ];

  const pruebaOptions = [
    { value: "0", label: "Seleccionar prueba..." },
    ...pruebas.map(prueba => ({
      value: prueba.id.toString(),
      label: `${prueba.distancias?.distancia || ''}m ${prueba.estilos?.nombre || ''} (${prueba.curso})`
    }))
  ];

  return (
    <Modal open={isOpen} onClose={onClose} title="Comparar Nadadores">
      <div className="space-y-6">
        {/* Selección simple de nadadores y prueba */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Primer Nadador"
              options={swimmerOptions}
              value={selectedSwimmer1.toString()}
              onChange={(value: string) => setSelectedSwimmer1(parseInt(value))}
              placeholder="Seleccionar nadador..."
            />
            <Select
              label="Segundo Nadador"
              options={swimmerOptions}
              value={selectedSwimmer2.toString()}
              onChange={(value: string) => setSelectedSwimmer2(parseInt(value))}
              placeholder="Seleccionar nadador..."
            />
          </div>
          
          <Select
            label="Prueba a Comparar"
            options={pruebaOptions}
            value={selectedPrueba.toString()}
            onChange={(value: string) => setSelectedPrueba(parseInt(value))}
            placeholder="Seleccionar prueba..."
          />
        </div>

        <Button
          onClick={performComparison}
          disabled={!selectedSwimmer1 || !selectedSwimmer2 || !selectedPrueba || isLoading}
          className="w-full"
        >
          {isLoading ? <LoadingSpinner size="sm" text="Comparando..." /> : 'Comparar Rendimiento'}
        </Button>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Resultados de la comparación */}
        {comparisonData.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                {selectedSwimmer1Name} vs {selectedSwimmer2Name}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Prueba: {selectedPruebaName}
              </p>

              <div className="space-y-4">
                {comparisonData.map((metric, index) => (
                  <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-foreground">{metric.metric_name}</h4>
                      <div className={`text-sm font-medium ${getValueColor(metric.difference)}`}>
                        {getDifferenceSymbol(metric.difference)}{formatValue(Math.abs(metric.difference), metric.unit)}
                        {metric.percentage_diff !== 0 && (
                          <span className="ml-1">
                            ({getDifferenceSymbol(metric.percentage_diff)}{Math.abs(metric.percentage_diff).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">{selectedSwimmer1Name}</div>
                        <div className="font-semibold text-foreground">
                          {formatValue(metric.swimmer1_value, metric.unit)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">{selectedSwimmer2Name}</div>
                        <div className="font-semibold text-foreground">
                          {formatValue(metric.swimmer2_value, metric.unit)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default SwimmerComparison; 