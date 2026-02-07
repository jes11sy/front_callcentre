'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { 
  User, 
  Sun,
  Moon,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useState as useStateReact } from 'react';

export function Sidebar() {
  const { user } = useAuthStore();
  const { version, toggleVersion, theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useStateReact(false);

  // Закрываем меню при смене маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  // Моковые уведомления (потом заменить на реальные данные)
  const notifications = [
    { id: 1, text: 'Новый заказ #1234', time: '5 мин назад', read: false },
    { id: 2, text: 'Заказ #1230 закрыт', time: '15 мин назад', read: false },
    { id: 3, text: 'Мастер принял заказ #1228', time: '1 час назад', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

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
      <div className={`px-5 pb-6 ${isMobile ? 'space-y-4' : 'space-y-3'}`}>
        {/* Version Toggle - только для V1 */}
        {version === 'v1' && (
          <div className={`flex items-center gap-3 px-3 ${isMobile ? 'py-3' : 'py-2'}`}>
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
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative flex items-center gap-3 px-3 font-normal text-gray-800 dark:text-gray-200 hover:text-[#FEC004] transition-colors w-full group ${
              isMobile ? 'py-3.5 text-base' : 'py-2.5 text-sm'
            }`}
          >
            <div className="relative">
              <Bell className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="group-hover:text-[#FEC004] transition-colors">
              Уведомления
            </span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className={`absolute ${isMobile ? 'left-0 right-0 mx-3' : 'left-full ml-2 w-72'} bottom-full mb-2 bg-white dark:bg-[#252d3a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50`}>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Уведомления</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        !notification.read ? 'bg-[#FEC004]/5' : ''
                      }`}
                    >
                      <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                        {notification.text}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Нет уведомлений
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-[#FEC004] hover:underline w-full text-center">
                  Показать все
                </button>
              </div>
            </div>
          )}
        </div>

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
