// Единый глобальный Socket.IO менеджер
// Предотвращает множественные подключения и обеспечивает оптимальную производительность

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
// 🍪 tokenStorage больше не нужен - используем httpOnly cookies

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

console.log('🔌 Socket URL:', SOCKET_URL, {
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

class SocketManager {
  private static instance: SocketManager;
  private socket: { 
    connected?: boolean; 
    on: (event: string, callback: (...args: unknown[]) => void) => void; 
    off: (event: string, callback: (...args: unknown[]) => void) => void; 
    onAny: (callback: (event: string, ...args: unknown[]) => void) => void;
    emit: (event: string, ...args: unknown[]) => void;
    disconnect: () => void;
    connect: () => void;
  } | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlersSetup = false; // Флаг для предотвращения повторной установки обработчиков

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  async connect(): Promise<unknown> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      // Ждем завершения текущего подключения
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            resolve(null);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    try {
      // Динамический импорт Socket.IO
      const { io } = await import('socket.io-client');
      
      console.log('🔌 Connecting to Socket.IO...');
      
      // ⚠️ ВАЖНО: WebSocket НЕ МОЖЕТ использовать httpOnly cookies!
      // Создаем соединение БЕЗ токена, токен отправим в событии authenticate
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        autoConnect: false,
        forceNew: false,
        path: '/socket.io/'
      });

      this.setupEventHandlers();
      
      console.log('🔌 Socket configured, calling connect()...');
      
      // Явно подключаемся
      this.socket.connect();
      
      console.log('🔌 Connect() called, socket.connected:', this.socket.connected);
      
      this.reconnectAttempts = 0;
      
      return this.socket;
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
      this.isConnecting = false;
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) {
      console.log('⏭️ No socket, skipping handler setup...');
      return;
    }

    // Проверяем что обработчики еще не установлены
    if (this.handlersSetup) {
      console.log('⏭️ Handlers already setup, skipping...');
      return;
    }

    console.log('🔧 Setting up socket event handlers...');
    this.handlersSetup = true;

    this.socket.on('connect', async () => {
      console.log('🟢 Socket connected:', this.socket?.connected);
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
      
      // 🔌 Получаем SHORT-LIVED токен из httpOnly cookie для Socket.IO
      try {
        const { default: api } = await import('@/lib/api');
        const response = await api.get('/auth/socket-token');
        const token = response.data.data.token;
        
        console.log('🔑 Got socket token, authenticating...');
        this.socket?.emit('authenticate', { token });
      } catch (error) {
        console.error('❌ Failed to get socket token:', error);
        this.socket?.disconnect();
      }
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('✅ Socket authenticated successfully:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('disconnect', (...args: unknown[]) => {
      console.log('🔴 Socket disconnected:', args[0]);
      this.emit('connection', { status: 'disconnected' });
    });

    this.socket.on('connect_error', (error: unknown) => {
      console.error('❌ Socket.IO connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection', { status: 'error', error });
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('exception', (error: any) => {
      console.error('❌ Socket exception:', error);
    });

    // Проксируем все события
    this.socket.onAny((event: string, ...args: unknown[]) => {
      console.log('📨 Socket event received:', event, args);
      
      // 🔍 DEBUG: Визуальный debug для call:new
      if (event === 'call:new') {
        import('sonner').then(({ toast }) => {
          toast.info('🔍 DEBUG: call:new получен в SocketManager', { duration: 5000 });
        });
      }
      
      this.emit(event, ...args);
    });
  }

  // Подписка на события
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Don't subscribe to socket directly - onAny already handles all events
    // if (this.socket?.connected) {
    //   this.socket.on(event, callback);
    // }

    return () => this.off(event, callback);
  }

  // Отписка от событий
  off(event: string, callback: (...args: unknown[]) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    // Don't call socket.off directly - we're using onAny proxy pattern
    // if (this.socket) {
    //   this.socket.off(event, callback);
    // }
  }

  // Эмит событий
  emit(event: string, ...args: unknown[]) {
    const eventListeners = this.listeners.get(event);
    
    // 🔍 DEBUG: Проверяем наличие listeners
    if (event === 'call:new') {
      import('sonner').then(({ toast }) => {
        toast.info(`🔍 DEBUG: emit call:new, listeners: ${eventListeners?.size || 0}`, { duration: 5000 });
      });
    }
    
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Отправка сообщения
  send(event: string, data: unknown) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, message not sent:', event, data);
    }
  }

  // Переаутентификация с новым токеном
  authenticate(token: string) {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { token });
    } else {
      console.warn('Socket not connected, cannot authenticate');
    }
  }

  // Получение статуса подключения
  get isConnected() {
    return this.socket?.connected || false;
  }

  // Отключение
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.handlersSetup = false; // Сбрасываем флаг при отключении
  }

  // Публичный метод для получения socket
  getSocketInstance() {
    return this.socket;
  }
}

// Хок для использования глобального сокета
export const useGlobalSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketManager = useRef<SocketManager | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Если пользователь не аутентифицирован, отключаем socket
      if (socketManager.current?.isConnected) {
        socketManager.current.disconnect();
      }
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    const initSocket = async () => {
      setIsLoading(true);
      socketManager.current = SocketManager.getInstance();
      
      // Подписываемся на изменения статуса ПЕРЕД connect()
      // чтобы не пропустить асинхронное подключение
      const unsubscribe = socketManager.current.on('connection', (data: any) => {
        const connected = socketManager.current?.isConnected || false;
        console.log('🔌 Connection status changed:', connected, data);
        setIsConnected(connected);
        setIsLoading(false);
      });
      
      // Также подписываемся на authenticated для надёжности
      const unsubAuth = socketManager.current.on('authenticated', () => {
        console.log('✅ Authenticated - setting isConnected=true');
        setIsConnected(true);
        setIsLoading(false);
      });
      
      const socket = await socketManager.current.connect();
      
      // Проверяем начальное состояние
      if (socket && (socket as any).connected) {
        setIsConnected(true);
        setIsLoading(false);
      }
      
      return () => {
        unsubscribe();
        unsubAuth();
      };
    };

    const cleanup = initSocket();

    return () => {
      cleanup.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [isAuthenticated]);

  const send = useCallback((event: string, data: unknown) => {
    if (socketManager.current) {
      socketManager.current.send(event, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    if (socketManager.current) {
      return socketManager.current.on(event, callback);
    }
    return () => {};
  }, []);

  const off = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    if (socketManager.current) {
      socketManager.current.off(event, callback);
    }
  }, []);

  return {
    socket: socketManager.current?.getSocketInstance() || null,
    isConnected,
    isLoading,
    send,
    on,
    off
  };
};
