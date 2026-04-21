'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { GlobalSearchOverlay } from './GlobalSearch';
import { 
  User, 
  SunMedium,
  MoonStar,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Check,
<<<<<<< Updated upstream
=======
  Trash2,
  Phone,
  ClipboardList,
  Globe,
  Gavel,
  ChartColumnBig,
  BookOpenText,
>>>>>>> Stashed changes
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  FileText,
  Info,
  GripHorizontal,
  MessageSquare,
  Search,
  type LucideIcon
} from 'lucide-react';

// Ключ для localStorage
const NOTIFICATIONS_POSITION_KEY = 'notifications-panel-position';
const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed-cc';

// Дефолтная позиция
const DEFAULT_POSITION = { x: 240, y: 100 }; // left-60 = 240px

export function Sidebar() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });
  const [hasLoadedSidebarState, setHasLoadedSidebarState] = useState(() => typeof window !== 'undefined');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const mobileNotificationsPanelRef = useRef<HTMLDivElement>(null);
  
  // Push notifications
  const { 
    isSupported: isPushSupported, 
    isSubscribed: isPushSubscribed, 
    permission: pushPermission,
    subscribe: subscribePush,
    isSubscribing: isPushSubscribing,
    isLoading: isPushLoading,
  } = usePushNotifications();
  
  // Позиция окна уведомлений
  const [panelPosition, setPanelPosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Загружаем позицию из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_POSITION_KEY);
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        setPanelPosition(pos);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    setHasLoadedSidebarState(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSidebarState) return;
    const html = document.documentElement;
    html.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
    return () => {
      html.classList.remove('sidebar-collapsed');
    };
  }, [isSidebarCollapsed, hasLoadedSidebarState]);

  // Сохраняем позицию в localStorage
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    localStorage.setItem(NOTIFICATIONS_POSITION_KEY, JSON.stringify(pos));
  }, []);

  // Обработчики drag
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const panel = notificationsPanelRef.current;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    let lastPos = panelPosition;

    const handleMouseMove = (e: MouseEvent) => {
      // Ограничиваем только чтобы хотя бы 100px окна было видно на экране
      const newX = Math.max(-300, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));
      lastPos = { x: newX, y: newY };
      setPanelPosition(lastPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePosition(lastPos);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, savePosition]);
  
  // Реальные уведомления из хука
  const {
    notifications,
    unreadCount,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Закрываем меню при смене маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
    closeDropdown();
  }, [pathname, closeDropdown]);

  // Блокируем скролл body при открытом меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Не закрываем если drag
      if (isDragging) return;
      
      const target = event.target as Node;
      const isInsideButton = notificationsRef.current?.contains(target);
      const isInsideDesktopPanel = notificationsPanelRef.current?.contains(target);
      const isInsideMobilePanel = mobileNotificationsPanelRef.current?.contains(target);
      
      // Не закрываем если клик внутри любой из панелей
      if (!isInsideButton && !isInsideDesktopPanel && !isInsideMobilePanel) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, closeDropdown, isDragging]);

  // Форматирование времени уведомления
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  // Иконка для типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call_incoming':
        return PhoneIncoming;
      case 'call_missed':
        return PhoneMissed;
      case 'call_outgoing':
        return PhoneOutgoing;
      case 'order_created':
      case 'order_edited':
        return FileText;
      default:
        return Info;
    }
  };

  // Обработка клика на уведомление
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.orderId) {
      router.push(`/orders?id=${notification.orderId}`);
      closeDropdown();
    }
  };

<<<<<<< Updated upstream
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems: Array<{ name: string; href: string; icon?: string; lucideIcon?: LucideIcon }> = [
    { name: 'Телефония', href: '/telephony', icon: '/img/navigate/telephony.svg' },
    { name: 'Заказы', href: '/orders', icon: '/img/navigate/orders.svg' },
    { name: 'Обращения', href: '/appeals', lucideIcon: MessageSquare },
    { name: 'Заявки Сайт', href: '/site-orders', icon: '/img/navigate/site-orders.svg' },
    { name: 'Штрафы', href: '/penalties', icon: '/img/navigate/penalties.svg' },
    { name: 'Статистика', href: '/stats', icon: '/img/navigate/stats.svg' },
    { name: 'Справочник', href: '/reference', icon: '/img/navigate/reference.svg' },
=======
  const navItems = [
    { name: 'Телефония', href: '/telephony', icon: Phone },
    { name: 'Заказы', href: '/orders', icon: ClipboardList },
    { name: 'Заявки Сайт', href: '/site-orders', icon: Globe },
    { name: 'Штрафы', href: '/penalties', icon: Gavel },
    { name: 'Статистика', href: '/stats', icon: ChartColumnBig },
    { name: 'Справочник', href: '/reference', icon: BookOpenText },
>>>>>>> Stashed changes
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Контент меню (переиспользуется для десктопа и мобильной версии)
  const MenuContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Search — styled like nav items */}
      <div className={`px-5 ${isMobile ? 'mb-1' : 'mb-1'}`}>
        <button
          onClick={() => { setSearchOpen(true); if (isMobile) setIsMobileMenuOpen(false); }}
          className={`relative flex items-center gap-3 px-3 w-full font-normal transition-colors group ${
            isMobile ? 'py-3.5 text-base' : 'py-2.5 text-sm'
          }`}
        >
          <Search className={`transition-all shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-[#FEC004] ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
          <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
            Поиск
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isMobile ? 'px-5 space-y-4' : isSidebarCollapsed ? 'px-3 space-y-2' : 'px-3 space-y-2'}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isMobile && isSidebarCollapsed ? item.name : undefined}
              className={`group relative flex items-center transition-all duration-200 ${
                isMobile
                  ? 'gap-3 px-3 py-3.5 text-base'
                  : isSidebarCollapsed
                    ? 'mx-auto min-h-[52px] w-14 justify-center rounded-2xl px-0'
                    : 'min-h-[48px] gap-3 rounded-2xl px-4 text-sm'
              } ${
                active
                  ? (isSidebarCollapsed && !isMobile
                      ? 'bg-transparent text-[#FEC004] dark:text-[#FEC004]'
                      : 'cc-sidebar-item-active-expanded')
                  : (isSidebarCollapsed
                      ? 'bg-transparent text-[#6e6e73] hover:text-[#FEC004] dark:text-white/78 dark:hover:text-[#FEC004]'
                      : 'text-[#3a3a3c] hover:bg-black/[0.035] dark:text-white/92 dark:hover:bg-white/[0.04]')
              }`}
              style={
                active && (!isSidebarCollapsed || isMobile)
                  ? (theme === 'dark'
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
                        }
                      : {
                          backgroundColor: '#ececf1',
                          boxShadow: 'inset 0 0 0 1px rgba(17, 17, 19, 0.08)',
                        })
                  : undefined
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
<<<<<<< Updated upstream
              {/* Индикатор активной вкладки - тонкая скобка */}
              <span 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] transition-all ${
                  active ? 'opacity-100' : 'opacity-0'
                } ${isMobile ? 'h-12' : 'h-10'}`}
              >
                <svg viewBox="0 0 6 40" fill="none" className="w-full h-full">
                  <path 
                    d="M5 1C2.5 1 1 4.5 1 10v20c0 5.5 1.5 9 4 9" 
                    stroke="#FEC004" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              {item.lucideIcon ? (
                <item.lucideIcon
                  className={`transition-all shrink-0 ${active ? 'text-[#FEC004]' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#FEC004]'} ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`}
                />
              ) : (
                <Image
                  src={item.icon!}
                  alt={item.name}
                  width={isMobile ? 24 : 20}
                  height={isMobile ? 24 : 20}
                  className={`nav-icon transition-all ${active ? 'nav-icon-active' : ''} ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`}
                />
              )}
              <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
=======
              <Icon
                className={`${isMobile ? 'h-6 w-6' : isSidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 transition-all duration-200 ${
                  !isMobile && isSidebarCollapsed ? 'group-hover:scale-110' : ''
                } ${
                  active
                    ? 'text-[#FEC004] dark:text-[#FEC004]'
                    : (isSidebarCollapsed
                        ? 'text-[#3a3a3c] dark:text-white/78 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]'
                        : 'text-[#3a3a3c] dark:text-white/78 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]')
                }`}
                strokeWidth={1.9}
              />
              <span
                className={`${(!isMobile && isSidebarCollapsed) ? 'hidden' : ''} min-w-0 truncate font-medium tracking-[-0.01em] ${
                  active ? 'text-[#FEC004]' : 'text-[#3a3a3c] dark:text-white/92'
                }`}
              >
>>>>>>> Stashed changes
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`${isMobile ? 'px-5 space-y-4 pb-16' : isSidebarCollapsed ? 'px-3 space-y-2 pb-6' : 'px-3 space-y-2 pb-6'}`}>
        {/* Theme Toggle - same pattern as director */}
        <button
          onClick={toggleTheme}
          title={!isMobile && isSidebarCollapsed ? 'Переключить тему' : undefined}
          className={`group flex items-center transition-all duration-200 ${
            isMobile
              ? 'gap-3 px-3 py-3.5 text-base rounded-2xl text-[#3a3a3c] hover:bg-black/[0.035] hover:text-[#111113] dark:text-white/92 dark:hover:bg-white/[0.04] dark:hover:text-white'
              : isSidebarCollapsed
                ? 'mx-auto min-h-[52px] w-14 justify-center rounded-2xl px-0 bg-transparent text-[#3a3a3c] hover:text-[#FEC004] dark:text-white/92 dark:hover:text-[#FEC004]'
                : 'min-h-[48px] gap-3 rounded-2xl px-4 text-sm text-[#3a3a3c] hover:bg-black/[0.035] dark:text-white/92 dark:hover:bg-white/[0.04]'
          }`}
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? (
            <SunMedium className={`${isMobile ? 'h-5 w-5' : isSidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 text-[#6e6e73] transition-colors duration-200 ${!isMobile ? 'group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]' : 'group-hover:text-[#111113] dark:group-hover:text-white'} dark:text-white/78 ${isSidebarCollapsed && !isMobile ? 'transition-transform duration-200 group-hover:scale-110' : ''}`} />
          ) : (
            <MoonStar className={`${isMobile ? 'h-5 w-5' : isSidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 text-[#6e6e73] transition-colors duration-200 ${!isMobile ? 'group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]' : 'group-hover:text-[#111113] dark:group-hover:text-white'} dark:text-white/78 ${isSidebarCollapsed && !isMobile ? 'transition-transform duration-200 group-hover:scale-110' : ''}`} />
          )}
          {(!isSidebarCollapsed || isMobile) && (
            <span className="truncate text-base font-medium tracking-[-0.01em] text-[#3a3a3c] dark:text-white/92">
              Тема
            </span>
          )}
        </button>

        {/* Notifications - только для десктопа */}
        {!isMobile && (
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleDropdown}
              title={isSidebarCollapsed ? 'Уведомления' : undefined}
              className={`relative flex items-center text-sm font-normal transition-all duration-200 w-full group ${
                isDropdownOpen
                  ? (isSidebarCollapsed
                      ? 'bg-transparent text-[#FEC004] dark:text-[#FEC004]'
                      : 'cc-sidebar-item-active-expanded')
                  : isSidebarCollapsed
                    ? 'text-[#3a3a3c] hover:text-[#FEC004] dark:text-white/78 dark:hover:text-[#FEC004]'
                    : 'text-[#3a3a3c] dark:text-white/92'
              } ${
                isSidebarCollapsed
                  ? 'mx-auto min-h-[52px] w-14 justify-center rounded-2xl px-0'
                  : `gap-3 rounded-2xl px-4 py-2.5 ${isDropdownOpen ? '' : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.04]'}`
              }`}
            >
              <div className="relative">
                <Bell
                  className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                    isDropdownOpen
                      ? 'text-[#FEC004] dark:text-[#FEC004]'
                      : isSidebarCollapsed
                        ? 'text-[#3a3a3c] dark:text-white/78 group-hover:scale-110 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]'
                        : 'text-[#3a3a3c] dark:text-white/78 group-hover:scale-105 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]'
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`${isSidebarCollapsed ? 'hidden' : ''} ${
                  isDropdownOpen ? 'text-[#FEC004]' : 'text-[#3a3a3c] dark:text-white/92'
                }`}
              >
                Уведомления
              </span>
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <div 
                ref={notificationsPanelRef}
                className={`fixed w-96 max-h-96 rounded-2xl shadow-2xl border overflow-hidden z-[9999] flex flex-col ${
                  theme === 'dark'
                    ? 'bg-[#111113] border-white/10'
                    : 'bg-white border-gray-200'
                }`}
                style={{ left: panelPosition.x, top: panelPosition.y }}
              >
                <div 
                  className={`px-4 py-3 border-b flex items-center justify-between flex-shrink-0 cursor-move select-none ${
                    theme === 'dark'
                      ? 'border-white/10 bg-[#1a1a1d]'
                      : 'border-gray-200 bg-white'
                  }`}
                  onMouseDown={handleDragStart}
                >
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
                  </div>
                  <div className="flex items-center gap-3">
<<<<<<< Updated upstream
=======
                    {/* Push notifications button - всегда показываем, как debug кнопка */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        subscribePush(); 
                      }}
                      disabled={isPushSubscribing}
                      className={`text-xs font-medium transition-colors ${
                        isPushSubscribed 
                          ? 'text-emerald-500 dark:text-emerald-300' 
                          : 'text-[#0a4f42] dark:text-[#ffd84a]'
                      } disabled:opacity-50`}
                    >
                      {isPushLoading 
                        ? 'Загрузка...'
                        : isPushSubscribing 
                          ? 'Подключение...' 
                          : isPushSubscribed 
                            ? 'Push включен' 
                            : pushPermission === 'denied'
                              ? 'Push заблокирован'
                              : 'Включить push'
                      }
                    </button>
>>>>>>> Stashed changes
                    {unreadCount > 0 && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                        className="text-xs text-[#0a4f42] dark:text-white/75 hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Прочитать все
                      </button>
                    )}
                  </div>
                </div>
                <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-[#111113]' : 'bg-white'}`}>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${
                            !notification.read 
                              ? 'bg-[#0a4f42]/8 dark:bg-white/10 hover:bg-[#0a4f42]/12 dark:hover:bg-white/15' 
                              : 'bg-white dark:bg-[#111113] hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-[#0a4f42] dark:bg-[#f4c84b] rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Нет уведомлений</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile with user name */}
        <Link
          href="/profile"
          title={!isMobile && isSidebarCollapsed ? (user?.name || user?.login || 'Профиль') : undefined}
          className={`group relative flex items-center font-normal transition-colors ${
            isActive('/profile')
              ? (isSidebarCollapsed && !isMobile
                  ? 'bg-transparent text-[#FEC004] dark:text-[#FEC004]'
                  : 'cc-sidebar-item-active-expanded')
              : 'text-[#3a3a3c] dark:text-white/92'
          } ${
            isMobile
              ? 'gap-3 px-3 py-3.5 text-base'
              : isSidebarCollapsed
                ? 'mx-auto min-h-[52px] w-14 justify-center rounded-2xl px-0'
                : `min-h-[48px] gap-3 rounded-2xl px-4 text-sm ${isActive('/profile') ? '' : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.04]'}`
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <User className={`${isMobile ? 'h-6 w-6' : isSidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 transition-all duration-200 ${
            !isMobile && isSidebarCollapsed ? 'group-hover:scale-110' : ''
          } ${
            isActive('/profile')
              ? 'text-[#FEC004] dark:text-[#FEC004]'
              : (isSidebarCollapsed
                  ? 'text-[#3a3a3c] dark:text-white/78 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]'
                  : 'text-[#3a3a3c] dark:text-white/78 group-hover:text-[#FEC004] dark:group-hover:text-[#FEC004]')
          }`} />
          <span
            className={`${(!isMobile && isSidebarCollapsed) ? 'hidden' : ''} min-w-0 truncate ${
              isActive('/profile') ? 'text-[#FEC004]' : 'text-[#3a3a3c] dark:text-white/92'
            }`}
          >
            {user?.name || user?.login || 'Профиль'}
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 w-screen z-[9999] h-16 bg-white/90 dark:bg-[#1e2530] flex items-center justify-between px-6 transition-all ${
        isMobileMenuOpen ? '' : 'border-b border-gray-200 dark:border-gray-700'
      }`}>
        <Link href="/telephony">
          <Image 
            src={theme === 'dark' ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"} 
            alt="Logo" 
            width={130} 
            height={36} 
            className="h-9 w-auto" 
          />
        </Link>
        <div className="flex items-center gap-1">
          {/* Mobile Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#FEC004] transition-colors"
            aria-label="Поиск"
          >
            <Search className="h-6 w-6" />
          </button>

          {/* Mobile Notifications Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleDropdown}
              className={`group p-2 transition-colors relative ${
                isDropdownOpen
                  ? 'text-[#111113] dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#111113] dark:hover:text-white'
              }`}
              aria-label="Уведомления"
            >
              <Bell className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Notifications Dropdown */}
            {isDropdownOpen && (
              <div 
                ref={mobileNotificationsPanelRef}
                className={`fixed left-4 right-4 top-20 rounded-[24px] shadow-xl border overflow-hidden z-[10000] ${
                  theme === 'dark'
                    ? 'bg-[#111113] border-white/10'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className={`px-4 py-3 border-b flex items-center justify-between ${
                  theme === 'dark'
                    ? 'border-white/10 bg-[#1a1a1d]'
                    : 'border-gray-200 bg-white'
                }`}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
                  <div className="flex items-center gap-3">
<<<<<<< Updated upstream
=======
                    {/* Push notifications button - mobile, всегда показываем */}
                    <button
                      onClick={() => subscribePush()}
                      disabled={isPushSubscribing}
                      className={`text-xs font-medium transition-colors ${
                        isPushSubscribed 
                          ? 'text-emerald-500 dark:text-emerald-300' 
                          : 'text-[#0a4f42] dark:text-[#ffd84a]'
                      } disabled:opacity-50`}
                    >
                      {isPushLoading 
                        ? 'Загрузка...'
                        : isPushSubscribing 
                          ? 'Подключение...' 
                          : isPushSubscribed 
                            ? 'Push включен' 
                            : pushPermission === 'denied'
                              ? 'Push заблокирован'
                              : 'Включить push'
                      }
                    </button>
>>>>>>> Stashed changes
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#0a4f42] dark:text-white/75 hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Прочитать все
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer ${
                            !notification.read ? 'bg-[#0a4f42]/8 dark:bg-white/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-[#0a4f42] dark:bg-[#f4c84b] rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Нет уведомлений</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#FEC004] transition-colors"
            aria-label="Открыть меню"
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Full-screen Menu */}
      <aside 
        className={`lg:hidden fixed top-16 left-0 w-screen h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#1e2530] z-[9998] transform transition-transform duration-300 ease-in-out flex flex-col font-myriad ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-6 flex flex-col h-full overflow-y-auto">
          <MenuContent isMobile={true} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen pointer-events-none">
        <div className={`pointer-events-auto ml-4 mt-4 flex h-[calc(100vh-2rem)] flex-col rounded-[30px] border p-3 font-myriad ${hasLoadedSidebarState ? 'transition-all duration-300' : ''} ${
          isSidebarCollapsed ? 'w-[120px]' : 'w-[272px]'
        } ${theme === 'dark'
          ? 'bg-[#111113]/92 backdrop-blur-xl border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)]'
          : 'bg-[#f5f5f7] border-black/[0.08] shadow-none backdrop-blur-none'
        }`}>
        {/* Logo */}
        <div className={`pb-8 pt-3 ${isSidebarCollapsed ? 'grid w-full grid-cols-[28px_1fr_28px] items-center px-0' : 'flex items-center justify-between px-3'}`}>
          {isSidebarCollapsed && <span aria-hidden="true" className="block h-7 w-7" />}
          <Link href="/telephony">
            <Image 
              src={isSidebarCollapsed ? "/img/logo/favicon.png" : (theme === 'dark' ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png")} 
              alt="Logo" 
              width={160} 
              height={45} 
              className={isSidebarCollapsed ? "h-10 w-10 cursor-pointer object-contain" : "h-10 w-auto cursor-pointer"} 
            />
          </Link>
          {isSidebarCollapsed ? (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex h-7 w-7 items-center justify-center justify-self-end rounded-full text-[#6e6e73] transition-colors hover:bg-black/[0.04] hover:text-[#111113] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white"
              aria-label="Развернуть меню"
              title="Развернуть меню"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6e6e73] transition-colors hover:bg-black/[0.04] hover:text-[#111113] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white"
              aria-label="Свернуть меню"
              title="Свернуть меню"
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <MenuContent isMobile={false} />
        </div>
      </aside>

      {/* Global Search Overlay */}
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
