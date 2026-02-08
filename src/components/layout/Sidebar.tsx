'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  User, 
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Check,
  Trash2
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuthStore();
  const { version, toggleVersion, theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, closeDropdown]);

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

  const navItems = [
    { name: 'Телефония', href: '/telephony', icon: '/img/navigate/telephony.svg' },
    { name: 'Заказы', href: '/orders', icon: '/img/navigate/orders.svg' },
    { name: 'Заявки Сайт', href: '/site-orders', icon: '/img/navigate/site-orders.svg' },
    { name: 'Штрафы', href: '/penalties', icon: '/img/navigate/penalties.svg' },
    { name: 'Статистика', href: '/stats', icon: '/img/navigate/stats.svg' },
    { name: 'Справочник', href: '/reference', icon: '/img/navigate/reference.svg' },
  ];

  const isActive = (href: string) => pathname === href;

  // Контент меню (переиспользуется для десктопа и мобильной версии)
  const MenuContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Navigation */}
      <nav className={`flex-1 px-5 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-icon-hover relative flex items-center gap-3 px-3 font-normal transition-colors group ${
                isMobile ? 'py-2.5 text-base' : 'py-2.5 text-sm'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Индикатор активной вкладки - тонкая скобка */}
              <span 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] transition-all ${
                  active ? 'opacity-100' : 'opacity-0'
                } ${isMobile ? 'h-10' : 'h-10'}`}
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
              <Image 
                src={item.icon} 
                alt={item.name} 
                width={isMobile ? 24 : 20} 
                height={isMobile ? 24 : 20} 
                className={`nav-icon transition-all ${active ? 'nav-icon-active' : ''} ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`}
              />
              <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`px-5 ${isMobile ? 'space-y-2 pb-4 mt-2' : 'space-y-3 pb-6'}`}>
        {/* Version Toggle - только для V1 */}
        {version === 'v1' && (
          <div className={`flex items-center gap-3 px-3 ${isMobile ? 'py-2' : 'py-2'}`}>
            <span className={`transition-colors ${isMobile ? 'text-base' : 'text-sm'} ${version === 'v1' ? 'text-[#FEC004]' : 'text-gray-400'}`}>V1</span>
            <button
              onClick={toggleVersion}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                version === 'v2' ? 'bg-[#FEC004]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  version === 'v2' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`transition-colors ${isMobile ? 'text-base' : 'text-sm'} ${version === 'v2' ? 'text-[#FEC004]' : 'text-gray-400'}`}>V2</span>
          </div>
        )}

        {/* Theme Toggle - только для V2 */}
        {version === 'v2' && (
          <div className={`flex items-center gap-3 px-3 ${isMobile ? 'py-2' : 'py-2'}`}>
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
        )}

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
              <div className="fixed left-60 bottom-24 w-96 bg-white dark:bg-[#252d3a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
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
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                          !notification.read ? 'bg-[#FEC004]/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
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
                    ))
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
            isMobile ? 'py-2.5 text-base' : 'py-2.5 text-sm'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] transition-all ${
              isActive('/profile') ? 'opacity-100' : 'opacity-0'
            } ${isMobile ? 'h-10' : 'h-10'}`}
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
        <div className="flex items-center gap-2">
          {/* Mobile Notifications Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleDropdown}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#FEC004] transition-colors relative"
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
              <div className="fixed left-4 right-4 top-20 bg-white dark:bg-[#252d3a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[10000]">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
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
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                          !notification.read ? 'bg-[#FEC004]/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
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
                    ))
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
        <div className="pt-4 flex flex-col h-full overflow-y-auto pb-safe">
          <MenuContent isMobile={true} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 bg-white dark:bg-[#1e2530] h-screen flex-col border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 font-myriad">
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
    </>
  );
}
