'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Users, ClipboardList, DollarSign, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';

export default function ReferencePage() {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const referenceSections = [
    {
      title: 'Правила сотрудника',
      description: 'Основные правила и требования для операторов',
      href: '/reference/employee-rules',
      icon: Users,
      features: ['Рабочее время', 'Обязанности', 'Запреты']
    },
    {
      title: 'Правило приема заказов',
      description: 'Процедуры и требования при создании заказов',
      href: '/reference/order-rules',
      icon: ClipboardList,
      features: ['Обязательные поля', 'Временные слоты', 'Типы заявок']
    },
    {
      title: 'Прайс',
      description: 'Актуальные цены на услуги по ремонту',
      href: '/reference/pricing',
      icon: DollarSign,
      features: ['КП (Компьютеры)', 'БТ (Бытовая техника)', 'МНЧ (Муж на час)']
    },
    {
      title: 'Незаказы',
      description: 'Причины отказа от заказов и правила обработки',
      href: '/reference/non-orders',
      icon: XCircle,
      features: ['Технические причины', 'Отказ клиента', 'Некорректные обращения']
    }
  ];

  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="py-10 px-10 min-h-screen bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
        <div className="max-w-4xl">
          <div className="space-y-2">
            {referenceSections.map((section, index) => {
              return (
                <Link 
                  key={index} 
                  href={section.href} 
                  className="group flex items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700 hover:border-[#FEC004] transition-colors"
                >
                  <div>
                    <div className="text-gray-900 dark:text-gray-100 group-hover:text-[#FEC004] transition-colors text-base">
                      {section.title}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      {section.description}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-[#FEC004] group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
