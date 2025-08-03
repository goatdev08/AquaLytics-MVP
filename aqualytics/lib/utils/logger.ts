/**
 * Sistema de logging unificado para AquaLytics Frontend
 * Compatible con Next.js SSR y client-side rendering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

class AquaLogger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(data && { data })
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // En producción, solo logea warn y error
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private getEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }

  debug(message: string, data?: any) {
    if (!this.shouldLog('debug')) return;
    
    const logEntry = this.formatMessage('debug', message, data);
    console.log(`${this.getEmoji('debug')} [${this.context}] ${message}`, data || '');
  }

  info(message: string, data?: any) {
    if (!this.shouldLog('info')) return;
    
    const logEntry = this.formatMessage('info', message, data);
    console.info(`${this.getEmoji('info')} [${this.context}] ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    if (!this.shouldLog('warn')) return;
    
    const logEntry = this.formatMessage('warn', message, data);
    console.warn(`${this.getEmoji('warn')} [${this.context}] ${message}`, data || '');
    
    // En producción, podríamos enviar warnings a un servicio de logging
  }

  error(message: string, error?: any) {
    if (!this.shouldLog('error')) return;
    
    const logEntry = this.formatMessage('error', message, error);
    console.error(`${this.getEmoji('error')} [${this.context}] ${message}`, error || '');
    
    // En producción, podríamos enviar errores a un servicio de monitoreo
  }

  // Métodos de compatibilidad con console.log existente
  log(message: string, data?: any) {
    this.info(message, data);
  }
}

/**
 * Factory function para crear loggers con contexto
 * Uso: const logger = createLogger('ComponentName')
 */
export function createLogger(context: string): AquaLogger {
  return new AquaLogger(context);
}

/**
 * Logger por defecto para uso general
 */
export const logger = createLogger('AquaLytics');

export default logger;