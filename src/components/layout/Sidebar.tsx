'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { authApi } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Palette
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { version, toggleVersion } = useDesignStore();
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
    <aside className="w-52 bg-white h-screen flex flex-col border-r border-gray-200 fixed left-0 top-0 font-myriad">
      {/* Logo */}
      <div className="p-6 pb-10">
        <Image src="/img/logo/logo_v2.png" alt="Logo" width={180} height={60} className="h-14 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.name}
              href={item.href}
              className={`nav-icon-hover flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-colors ${
                active 
                  ? 'bg-[#FEC004]/10 text-gray-800' 
                  : 'text-gray-800 hover:text-[#FEC004]'
              }`}
            >
              <Image 
                src={item.icon} 
                alt={item.name} 
                width={20} 
                height={20} 
                className={`nav-icon w-5 h-5 transition-all ${active ? 'nav-icon-active' : ''}`}
              />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 space-y-1">
        {/* Profile with user name */}
        <a
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-colors ${
            isActive('/profile') 
              ? 'bg-[#FEC004]/10 text-[#FEC004]' 
              : 'text-gray-800 hover:text-[#FEC004]'
          }`}
        >
          <User className={`h-5 w-5 ${isActive('/profile') ? 'text-[#FEC004]' : ''}`} />
          {user?.name || user?.login || 'Профиль'}
        </a>

        {/* Version Toggle */}
        <button
          onClick={toggleVersion}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-800 hover:text-[#FEC004] transition-colors w-full"
        >
          <Palette className="h-5 w-5" />
          Дизайн: {version.toUpperCase()}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-800 hover:text-[#FEC004] transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
