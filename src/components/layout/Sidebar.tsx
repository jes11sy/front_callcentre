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
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Check,
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

// Дефолтная позиция
const DEFAULT_POSITION = { x: 240, y: 100 }; // left-60 = 240px

export function Sidebar() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const [searchOpen, setSearchOpen] = useState(false);

  const navItems: Array<{ name: string; href: string; icon?: string; lucideIcon?: LucideIcon }> = [
    { name: 'Телефония', href: '/telephony', icon: '/img/navigate/telephony.svg' },
    { name: 'Заказы', href: '/orders', icon: '/img/navigate/orders.svg' },
    { name: 'Обращения', href: '/appeals', lucideIcon: MessageSquare },
    { name: 'Заявки Сайт', href: '/site-orders', icon: '/img/navigate/site-orders.svg' },
    { name: 'Штрафы', href: '/penalties', icon: '/img/navigate/penalties.svg' },
    { name: 'Статистика', href: '/stats', icon: '/img/navigate/stats.svg' },
    { name: 'Справочник', href: '/reference', icon: '/img/navigate/reference.svg' },
  ];

  const isActive = (href: string) => pathname === href;

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
      <nav className={`flex-1 px-5 ${isMobile ? 'space-y-4' : 'space-y-3'}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-icon-hover relative flex items-center gap-3 px-3 font-normal transition-colors group ${
                isMobile ? 'py-3.5 text-base' : 'py-2.5 text-sm'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
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
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`px-5 ${isMobile ? 'space-y-4 pb-16' : 'space-y-3 pb-6'}`}>
        {/* Theme Toggle */}
        <div className={`flex items-center gap-3 px-3 ${isMobile ? 'py-3' : 'py-2'}`}>
          <Sun className={`transition-colors ${isMobile ? 'h-6 w-6' : 'h-5 w-5'} ${theme === 'light' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-[#FEC004]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <Moon className={`transition-colors ${isMobile ? 'h-6 w-6' : 'h-5 w-5'} ${theme === 'dark' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
        </div>

        {/* Notifications - только для десктопа */}
        {!isMobile && (
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleDropdown}
              className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal text-gray-800 dark:text-gray-200 hover:text-[#FEC004] transition-colors w-full group"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="group-hover:text-[#FEC004] transition-colors">
                Уведомления
              </span>
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <div 
                ref={notificationsPanelRef}
                className="fixed w-96 max-h-96 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999] flex flex-col bg-white dark:bg-[#1e2736]"
                style={{ left: panelPosition.x, top: panelPosition.y }}
              >
                <div 
                  className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 cursor-move select-none"
                  onMouseDown={handleDragStart}
                >
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                        className="text-xs text-[#FEC004] hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Прочитать все
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1a1f2e]">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${
                            !notification.read 
                              ? 'bg-[#FEC004]/10 hover:bg-[#FEC004]/20' 
                              : 'bg-white dark:bg-[#1a1f2e] hover:bg-gray-50 dark:hover:bg-[#252d3a]'
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
                              <span className="w-2 h-2 bg-[#FEC004] rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
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
          className={`nav-icon-hover relative flex items-center gap-3 px-3 font-normal transition-colors group ${
            isMobile ? 'py-3.5 text-base' : 'py-2.5 text-sm'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] transition-all ${
              isActive('/profile') ? 'opacity-100' : 'opacity-0'
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
          <User className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
          <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
            {user?.name || user?.login || 'Профиль'}
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 w-screen z-[9999] h-16 bg-white dark:bg-[#1e2530] flex items-center justify-between px-6 transition-all ${
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
              className={`p-2 transition-colors relative ${
                isDropdownOpen 
                  ? 'text-[#FEC004]' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#FEC004]'
              }`}
              aria-label="Уведомления"
            >
              <Bell className="h-6 w-6" />
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
                className="fixed left-4 right-4 top-20 bg-white dark:bg-[#252d3a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[10000]"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#FEC004] hover:underline flex items-center gap-1"
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
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                            !notification.read ? 'bg-[#FEC004]/5' : ''
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
                              <span className="w-2 h-2 bg-[#FEC004] rounded-full flex-shrink-0 mt-1.5" />
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
        className={`lg:hidden fixed top-16 left-0 w-screen h-[calc(100vh-4rem)] bg-white dark:bg-[#1e2530] z-[9998] transform transition-transform duration-300 ease-in-out flex flex-col font-myriad ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-6 flex flex-col h-full overflow-y-auto">
          <MenuContent isMobile={true} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 bg-white dark:bg-[#1e2530] h-screen flex-col border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 font-myriad z-[100]">
        {/* Logo */}
        <div className="p-6 pb-16">
          <Link href="/telephony">
            <Image 
              src={theme === 'dark' ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"} 
              alt="Logo" 
              width={160} 
              height={45} 
              className="h-10 w-auto cursor-pointer" 
            />
          </Link>
        </div>

        <MenuContent isMobile={false} />
      </aside>

      {/* Global Search Overlay */}
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
