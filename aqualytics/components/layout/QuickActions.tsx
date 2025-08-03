'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SwimmerComparison from '@/components/comparison/SwimmerComparison';

const QuickActions: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-phoenix-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones Rápidas
          </h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => setShowComparison(true)}
              variant="phoenix"
              size="md"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comparar Nadadores
            </Button>
            
            <div className="text-xs text-muted-foreground text-center mt-2">
              Compara métricas entre nadadores en la misma prueba
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de comparación */}
      <SwimmerComparison 
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
};

export default QuickActions; 