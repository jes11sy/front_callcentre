'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Users, ClipboardList, DollarSign, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReferencePage() {
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#0f0f23] min-h-screen">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#FFD700] flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Справочник
                </h1>
                <p className="text-gray-400 mt-2">
                  Справочная информация для операторов
                </p>
              </div>
            </div>
          </div>

          {/* Reference Sections */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {referenceSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link key={index} href={section.href} className="group">
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 border-[#FFD700]/30 bg-[#17212b] hover:border-[#FFD700]/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white group-hover:text-[#FFD700] transition-colors">
                        <Icon className="h-6 w-6 text-[#FFD700]" />
                        <span>{section.title}</span>
                        <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-400 mb-2">
                          Содержит разделы:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {section.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Access Info */}
          <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#FFD700]">
                <BookOpen className="h-5 w-5" />
                <span>Быстрый доступ</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Все разделы справочника доступны для быстрого поиска информации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">Цены</Badge>
                  <span className="text-gray-300">Актуальные цены на ремонт по всем категориям техники</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">Правила</Badge>
                  <span className="text-gray-300">Обязательные процедуры и требования для операторов</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">Незаказы</Badge>
                  <span className="text-gray-300">Руководство по обработке отказов и проблемных ситуаций</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
