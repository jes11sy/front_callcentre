'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { authApi } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { version, toggleVersion, theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/login');
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
  const MenuContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 px-5 space-y-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className="nav-icon-hover relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Индикатор активной вкладки - тонкая скобка */}
              <span 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] h-10 transition-all ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
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
                width={20} 
                height={20} 
                className={`nav-icon w-5 h-5 transition-all ${active ? 'nav-icon-active' : ''}`}
              />
              <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-5 pb-6 space-y-3">
        {/* Version Toggle */}
        <div className="flex items-center gap-3 px-3 py-2">
          <span className={`text-sm transition-colors ${version === 'v1' ? 'text-[#FEC004]' : 'text-gray-400'}`}>V1</span>
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
          <span className={`text-sm transition-colors ${version === 'v2' ? 'text-[#FEC004]' : 'text-gray-400'}`}>V2</span>
        </div>

        {/* Theme Toggle - только для V2 */}
        {version === 'v2' && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Sun className={`h-5 w-5 transition-colors ${theme === 'light' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
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
            <Moon className={`h-5 w-5 transition-colors ${theme === 'dark' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
          </div>
        )}

        {/* Profile with user name */}
        <Link
          href="/profile"
          className="nav-icon-hover relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors group"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[6px] h-10 transition-all ${
              isActive('/profile') ? 'opacity-100' : 'opacity-0'
            }`}
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
          <User className={`nav-icon h-5 w-5 text-gray-600 dark:text-gray-400 ${isActive('/profile') ? 'nav-icon-active' : ''}`} />
          <span className="text-gray-800 dark:text-gray-200 group-hover:text-[#FEC004] transition-colors">
            {user?.name || user?.login || 'Профиль'}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal text-gray-800 dark:text-gray-200 hover:text-[#FEC004] transition-colors w-full group"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-[60] h-16 bg-white dark:bg-[#1e2530] flex items-center justify-between px-6 transition-all ${
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
        className={`lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-white dark:bg-[#1e2530] z-[60] transform transition-transform duration-300 ease-in-out flex flex-col font-myriad ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-6 flex flex-col h-full overflow-y-auto">
          <MenuContent />
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

        <MenuContent />
      </aside>
    </>
  );
}
