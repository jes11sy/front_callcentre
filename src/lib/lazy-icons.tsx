// Система ленивой загрузки иконок
// Загружает иконки только когда они действительно нужны

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Fallback компонент для загрузки
const IconFallback = () => (
  <div className="inline-flex items-center justify-center w-4 h-4">
    <Loader2 className="w-3 h-3 animate-spin" />
  </div>
);

// Создаем ленивые компоненты для редко используемых иконок
export const LazyMessageSquare = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.MessageSquare 
  }))
);

export const LazySearch = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Search 
  }))
);

export const LazyFilter = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Filter 
  }))
);

export const LazyRefreshCw = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.RefreshCw 
  }))
);

export const LazySettings = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Settings 
  }))
);

export const LazyUsers = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Users 
  }))
);

export const LazyUser = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.User 
  }))
);

export const LazyHome = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Home 
  }))
);

export const LazyMenu = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Menu 
  }))
);

export const LazyX = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.X 
  }))
);

export const LazyCheck = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Check 
  }))
);

export const LazyPlus = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Plus 
  }))
);

export const LazyEdit = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Edit 
  }))
);

export const LazyTrash2 = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Trash2 
  }))
);

export const LazyEye = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.Eye 
  }))
);

export const LazyEyeOff = lazy(() => 
  import('lucide-react').then(module => ({ 
    default: module.EyeOff 
  }))
);

// Компонент-обертка для ленивых иконок
export const LazyIcon = ({
  icon: Icon,
  className,
  ...props
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  [key: string]: unknown;
}) => (
  <Suspense fallback={<IconFallback />}>
    <Icon className={className} {...props} />
  </Suspense>
);