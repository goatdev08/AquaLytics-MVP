'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';

// ===== TIPOS =====
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// ===== COMPONENTE ERROR BOUNDARY =====
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Aquí puedes registrar el error en un servicio de monitorización
    // Ejemplo: console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback por defecto si no se proporciona uno
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
          <div className="text-center p-8 border border-destructive/50 rounded-lg bg-destructive/10">
            <h1 className="text-3xl font-bold text-destructive mb-2">
              Algo salió mal
            </h1>
            <p className="text-destructive/80 mb-4">
              Lo sentimos, ha ocurrido un error inesperado en la aplicación.
            </p>
            <details className="text-left text-xs text-muted-foreground bg-background/50 p-2 rounded">
              <summary>Detalles del error</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 