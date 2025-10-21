// Утилита для условного логирования
// В development показывает логи, в production скрывает

interface LoggerConfig {
  enableInProduction?: boolean;
  prefix?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableInProduction: false,
      prefix: '',
      ...config
    };
  }

  private shouldLog(): boolean {
    return this.isDevelopment === true || this.config.enableInProduction === true;
  }

  private formatMessage(message: string, ...args: unknown[]): [string, ...unknown[]] {
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    return [`${prefix}${message}`, ...args];
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.log(...this.formatMessage(message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn(...this.formatMessage(message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Ошибки всегда логируем
    console.error(...this.formatMessage(message, ...args));
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.info(...this.formatMessage(message, ...args));
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.debug(...this.formatMessage(message, ...args));
    }
  }

  // Специальные методы для разных компонентов
  auth(message: string, ...args: unknown[]): void {
    this.log(`🔐 AUTH: ${message}`, ...args);
  }

  api(message: string, ...args: unknown[]): void {
    this.log(`🌐 API: ${message}`, ...args);
  }

  socket(message: string, ...args: unknown[]): void {
    this.log(`🔌 SOCKET: ${message}`, ...args);
  }

  ui(message: string, ...args: unknown[]): void {
    this.log(`🎨 UI: ${message}`, ...args);
  }

  performance(message: string, ...args: unknown[]): void {
    this.log(`⚡ PERF: ${message}`, ...args);
  }

  security(message: string, ...args: unknown[]): void {
    this.log(`🛡️ SECURITY: ${message}`, ...args);
  }
}

// Создаем экземпляры логгера для разных компонентов
export const logger = new Logger();
export const authLogger = new Logger({ prefix: 'AUTH' });
export const apiLogger = new Logger({ prefix: 'API' });
export const socketLogger = new Logger({ prefix: 'SOCKET' });
export const uiLogger = new Logger({ prefix: 'UI' });
export const perfLogger = new Logger({ prefix: 'PERF' });
export const securityLogger = new Logger({ prefix: 'SECURITY' });

// Условное логирование для development
export const devLog = {
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, ...args);
    }
  }
};

// Утилита для измерения производительности
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  if (duration > 100) { // Логируем только медленные операции
    perfLogger.warn(`${name} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

export default logger;
