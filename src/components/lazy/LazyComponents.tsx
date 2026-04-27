// Расширенная система ленивой загрузки для всех тяжелых компонентов
// Уменьшает initial bundle size и улучшает производительность

import { lazy } from 'react';

// ===== МОДАЛЬНЫЕ ОКНА =====
export const LazyCreateOrderModal = lazy(() => 
  import('@/components/orders/CreateOrderModal').then(module => ({ 
    default: module.default 
  }))
);

export const LazyCreateOrderFromChatModal = lazy(async () => ({
  default: () => null,
}));

export const LazyLinkedOrdersModal = lazy(async () => ({
  default: () => null,
}));

export const LazySoundSettingsModal = lazy(async () => ({
  default: () => null,
}));

// ===== ОСНОВНЫЕ СТРАНИЦЫ =====
export const LazyOrdersPage = lazy(() => 
  import('@/app/orders/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyTelephonyPage = lazy(() => 
  import('@/app/telephony/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyStatsPage = lazy(() => 
  import('@/app/stats/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyProfilePage = lazy(() => 
  import('@/app/profile/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyReferencePage = lazy(() => 
  import('@/app/reference/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazySalaryPage = lazy(() => 
  import('@/app/salary/page').then(module => ({ 
    default: module.default 
  }))
);

// ===== ТЯЖЕЛЫЕ UI КОМПОНЕНТЫ =====
export const LazyVirtualizedList = lazy(() => 
  import('@/components/ui/virtualized-list').then(module => ({ 
    default: module.VirtualizedList 
  }))
);

export const LazyVirtualizedTable = lazy(() => 
  import('@/components/ui/virtualized-list').then(module => ({ 
    default: module.VirtualizedTable 
  }))
);

export const LazyInfiniteScrollList = lazy(() => 
  import('@/components/ui/virtualized-list').then(module => ({ 
    default: module.InfiniteScrollList 
  }))
);

export const LazyOptimizedSearch = lazy(() => 
  import('@/components/ui/optimized-search').then(module => ({ 
    default: module.AdvancedSearch 
  }))
);

export const LazyOptimizedPagination = lazy(() => 
  import('@/components/ui/optimized-pagination').then(module => ({ 
    default: module.OptimizedPagination 
  }))
);

// ===== ГРАФИКИ И СТАТИСТИКА =====
// LazyCharts удален - компонент не существует
// LazyStatsCards удален - компонент не существует  
// LazyDataTable удален - компонент не существует

// ===== ФОРМЫ =====
// LazyAdvancedForm удален - компонент не существует

export const LazyFileUpload = lazy(() => 
  import('@/components/ui/file-upload').then(module => ({ 
    default: module.FileUpload 
  }))
);

// ===== АУДИО КОМПОНЕНТЫ =====
export const LazySpotifyAudioPlayer = lazy(() => 
  import('@/components/ui/spotify-audio-player').then(module => ({ 
    default: module.SpotifyAudioPlayer 
  }))
);

export const LazySoundSettings = lazy(() => 
  import('@/components/ui/sound-settings').then(module => ({ 
    default: module.SoundSettings 
  }))
);
