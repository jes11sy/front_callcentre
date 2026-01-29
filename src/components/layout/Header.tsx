'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  // NavigationMenuIndicator removed - not used
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuViewport removed - not used
} from '@/components/ui/navigation-menu';
// Оптимизированные импорты иконок
import { 
  FileText, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  PhoneCall,
  TrendingUp,
  Wallet,
  Bell,
  BookOpen,
  AlertTriangle,
  Globe
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: 'Телефония', href: '/telephony', icon: PhoneCall },
    // { name: 'Центр сообщений', href: '/messages', icon: MessageSquare }, // Временно скрыто
    { name: 'Заказы', href: '/orders', icon: FileText },
    { name: 'Заявки Сайт', href: '/site-orders', icon: Globe },
    { name: 'Штрафы', href: '/penalties', icon: AlertTriangle },
    { name: 'Статистика', href: '/stats', icon: TrendingUp },
    { name: 'Справочник', href: '/reference', icon: BookOpen },
  ];

  const isActive = (href: string) => pathname === href;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Modern Header with shadcn/ui + reui */}
      <header className="sticky top-0 z-50 w-full border-b border-[#FFD700] bg-[#02111B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#02111B]/60 shadow-[0_0_20px_rgba(255,215,0,0.6)]">
        <div className="flex h-16 items-center justify-between px-0 w-full">
          {/* Пустой блок слева для баланса */}
          <div className="w-4" />

          {/* Desktop Navigation - по центру */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                        active 
                          ? 'bg-[#FFD700] text-[#02111B] shadow-sm hover:bg-[#FFD700] hover:text-[#02111B]' 
                          : 'text-[#F8F7F9] hover:bg-[#FFD700]/20 hover:text-[#FFD700]'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
              
              
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions - справа */}
          <div className="flex items-center gap-2">
            {/* Simple notification icon */}
            <Button variant="ghost" size="icon" className="text-[#FFD700] hover:text-[#02111B] hover:bg-[#FFD700]">
              <Bell className="h-4 w-4" />
            </Button>


            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-[#F8F7F9]/20">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.name || user?.login} />
                    <AvatarFallback className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#02111B] font-semibold">
                      {getUserInitials(user?.name || user?.login || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#17212b] border-2 border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.3)] rounded-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[#F8F7F9]">
                      {user?.name || user?.login}
                    </p>
                    <p className="text-xs leading-none text-[#F8F7F9]/80">
                      Оператор
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#FFD700]/30" />
                <DropdownMenuItem asChild className="text-[#F8F7F9] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20 hover:text-[#FFD700] focus:text-[#FFD700] transition-colors">
                  <a href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-[#FFD700]" />
                    <span>Профиль</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#F8F7F9] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20 hover:text-[#FFD700] focus:text-[#FFD700] transition-colors">
                  <a href="#" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-[#FFD700]" />
                    <span>Настройки</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#F8F7F9] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20 hover:text-[#FFD700] focus:text-[#FFD700] transition-colors">
                  <a href="/salary" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4 text-[#FFD700]" />
                    <span>Зарплата</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#FFD700]/30" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 hover:bg-red-400/20 focus:bg-red-400/20 hover:text-red-300 focus:text-red-300 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-400" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#FFD700] hover:text-[#02111B] hover:bg-[#FFD700]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#F8F7F9]/30 bg-[#02111B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#02111B]/60">
          <div className="container px-4 py-4">
            <div className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.name}
                    variant={active ? "secondary" : "ghost"}
                    className={`justify-start h-12 ${
                      active 
                        ? 'bg-[#FFD700] text-[#02111B]' 
                        : 'text-[#F8F7F9] hover:bg-[#FFD700]/20 hover:text-[#FFD700]'
                    }`}
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <a href={item.href}>
                      <Icon className="mr-2 h-5 w-5" />
                      {item.name}
                    </a>
                  </Button>
                );
              })}
              
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
