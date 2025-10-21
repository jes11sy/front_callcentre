'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
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
// Badge removed - not used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Оптимизированные импорты иконок
import { 
  Phone, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  Users,
  PhoneCall,
  TrendingUp,
  Wallet,
  // Mail removed - not used
  Bell,
  Circle,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  variant?: 'operator' | 'admin';
}

export function Header({ variant = 'operator' }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workStatus, setWorkStatus] = useState('online');

  // Загружаем текущий статус работы из БД при инициализации
  useEffect(() => {
    const loadWorkStatus = async () => {
      try {
        const token = await import('@/lib/secure-storage').then(m => m.tokenStorage.getAccessToken());
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${await token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.statusWork) {
            setWorkStatus(data.statusWork);
          }
        }
      } catch (error) {
        console.error('Error loading work status:', error);
      }
    };

    if (variant === 'operator') {
      loadWorkStatus();
    }
  }, [variant]);

  const handleWorkStatusChange = async (newStatus: string) => {
    try {
      const token = await import('@/lib/secure-storage').then(m => m.tokenStorage.getAccessToken());
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees/work-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statusWork: newStatus }),
      });

      if (response.ok) {
        setWorkStatus(newStatus);
        // Work status updated successfully
      } else {
        const errorData = await response.json();
        console.error('Failed to update work status:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error updating work status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Устанавливаем статус "оффлайн" перед выходом
      if (variant === 'operator') {
        try {
          const token = await import('@/lib/secure-storage').then(m => m.tokenStorage.getAccessToken());
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees/work-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${await token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ statusWork: 'offline' }),
          });
          // Work status set to offline before logout
        } catch (statusError) {
          console.error('Error setting offline status:', statusError);
          // Продолжаем logout даже если не удалось установить статус
        }
      }

      await authApi.logout();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/login');
    }
  };

  const operatorNavItems = [
    { name: 'Телефония', href: '/telephony', icon: PhoneCall },
    { name: 'Центр сообщений', href: '/messages', icon: MessageSquare },
    { name: 'Заказы', href: '/orders', icon: FileText },
    { name: 'Статистика', href: '/stats', icon: TrendingUp },
    { name: 'Справочник', href: '/reference', icon: BookOpen },
  ];


  const adminNavItems = [
    { name: 'Сотрудники', href: '/admin/employees', icon: Users },
    { name: 'Авито', href: '/admin/avito', icon: MessageSquare },
    { name: 'Телефония', href: '/admin/telephony', icon: Phone },
    { name: 'Статистика', href: '/admin/stats', icon: BarChart3 },
  ];

  const navItems = variant === 'admin' ? adminNavItems : operatorNavItems;
  const basePath = variant === 'admin' ? '/admin' : '';

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
          {/* Logo and Brand - слева */}
          <div className="flex items-center gap-0 -ml-12 -mt-4">
            <Image 
              src="/logo.png" 
              alt="Lead Schem Logo" 
              width={288}
              height={224}
              className="h-56 w-72 object-contain"
            />
          </div>

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
            {/* Work Status - только для операторов */}
            {variant === 'operator' && (
              <div className="hidden md:flex items-center gap-2">
                <Circle 
                  className={`h-2 w-2 ${
                    workStatus === 'online' ? 'text-green-500' : 
                    workStatus === 'offline' ? 'text-red-500' : 
                    'text-yellow-500'
                  }`} 
                />
                <Select value={workStatus} onValueChange={handleWorkStatusChange}>
                  <SelectTrigger className="w-32 h-8 text-sm bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#02111B] border-[#F8F7F9]/30">
                    <SelectItem value="online" className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">Онлайн</SelectItem>
                    <SelectItem value="offline" className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">Оффлайн</SelectItem>
                    <SelectItem value="break" className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">Перерыв</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
                      {variant === 'admin' ? 'Администратор' : 'Оператор'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#FFD700]/30" />
                <DropdownMenuItem asChild className="text-[#F8F7F9] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20 hover:text-[#FFD700] focus:text-[#FFD700] transition-colors">
                  <a href={`${basePath}/profile`} className="cursor-pointer">
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
                {variant === 'operator' && (
                  <DropdownMenuItem asChild className="text-[#F8F7F9] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20 hover:text-[#FFD700] focus:text-[#FFD700] transition-colors">
                    <a href="/salary" className="cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4 text-[#FFD700]" />
                      <span>Зарплата</span>
                    </a>
                  </DropdownMenuItem>
                )}
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
