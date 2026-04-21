'use client';

import { ArrowRight, Users, ClipboardList, DollarSign, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

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
      <div className="py-6 px-4 min-h-screen bg-[#f5f5f7] dark:bg-[#111113] font-myriad">
        <div className="max-w-4xl rounded-[20px] border bg-white border-black/[0.08] dark:bg-white/[0.03] dark:border-white/10 p-2 sm:p-4">
          <div className="space-y-1">
            {referenceSections.map((section, index) => {
              return (
                <Link 
                  key={index} 
                  href={section.href} 
                  className="group flex items-center justify-between rounded-xl px-3 py-4 border border-transparent hover:border-black/[0.08] dark:hover:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div>
                    <div className="text-gray-900 dark:text-gray-100 transition-colors text-base">
                      {section.title}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      {section.description}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
