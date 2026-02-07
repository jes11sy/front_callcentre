'use client';

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
  Moon
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { version, toggleVersion, theme, toggleTheme } = useDesignStore();
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <aside className="w-56 bg-white h-screen flex flex-col border-r border-gray-200 fixed left-0 top-0 font-myriad">
      {/* Logo */}
      <div className="p-6 pb-16">
        <Link href="/telephony">
          <Image src="/img/logo/logo_v2.png" alt="Logo" width={160} height={45} className="h-10 w-auto cursor-pointer" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 space-y-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className="nav-icon-hover relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors group"
            >
              {/* Индикатор активной вкладки - скобка */}
              <span 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all ${
                  active ? 'bg-[#FEC004]' : 'bg-transparent'
                }`}
              />
              <Image 
                src={item.icon} 
                alt={item.name} 
                width={20} 
                height={20} 
                className={`nav-icon w-5 h-5 transition-all ${active ? 'nav-icon-active' : ''}`}
              />
              <span className="text-gray-800 group-hover:text-[#FEC004] transition-colors">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-5 pb-6 space-y-2">
        {/* Version Toggle - кнопки V1/V2 */}
        <div className="px-3 py-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => version !== 'v1' && toggleVersion()}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                version === 'v1' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              V1
            </button>
            <button
              onClick={() => version !== 'v2' && toggleVersion()}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                version === 'v2' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              V2
            </button>
          </div>
        </div>

        {/* Theme Toggle - только для V2 */}
        {version === 'v2' && (
          <div className="px-3 py-1 flex justify-center">
            <div className="flex items-center gap-2">
              <Sun className={`h-3.5 w-3.5 transition-colors ${theme === 'light' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
              <button
                onClick={toggleTheme}
                className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-[#FEC004]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <Moon className={`h-3.5 w-3.5 transition-colors ${theme === 'dark' ? 'text-[#FEC004]' : 'text-gray-400'}`} />
            </div>
          </div>
        )}

        {/* Profile with user name */}
        <Link
          href="/profile"
          className="nav-icon-hover relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors group"
        >
          <span 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all ${
              isActive('/profile') ? 'bg-[#FEC004]' : 'bg-transparent'
            }`}
          />
          <User className={`nav-icon h-5 w-5 text-gray-600 ${isActive('/profile') ? 'nav-icon-active' : ''}`} />
          <span className="text-gray-800 group-hover:text-[#FEC004] transition-colors">
            {user?.name || user?.login || 'Профиль'}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-normal text-gray-800 hover:text-[#FEC004] transition-colors w-full group"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
