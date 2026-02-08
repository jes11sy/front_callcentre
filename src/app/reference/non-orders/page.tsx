'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, AlertTriangle, Phone, MessageSquare, Clock, Wrench, ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

export default function NonOrdersPage() {
  const router = useRouter();
  const nonOrderReasons = [
    {
      category: 'Техника и проблемы которые мы НЕ решаем',
      icon: Wrench,
      reasons: [
        {
          title: 'Не выкупаем технику',
          description: 'Мы не занимаемся выкупом техники у клиентов',
          action: 'Вежливо объяснить, что мы не выкупаем технику, предложить другие услуги'
        },
        {
          title: 'Не ездим только ради диагностики',
          description: 'Не выезжаем только для диагностики без последующего ремонта',
          action: 'Объяснить, что диагностика бесплатна только при заказе ремонта'
        },
        {
          title: 'Не ремонтируем/меняем матрицы',
          description: 'Не занимаемся ремонтом и заменой матриц экранов',
          action: 'Объяснить, что мы не работаем с матрицами, предложить другие услуги'
        },
        {
          title: 'Не ремонтируем мелкую бытовую технику',
          description: 'Не ремонтируем обычные пылесосы, сушилки для овощей, тостеры и прочую мелочовку',
          action: 'Объяснить, что мы не занимаемся мелкой бытовой техникой, предложить крупную технику'
        }
      ]
    },
    {
      category: 'Технические причины',
      icon: AlertTriangle,
      reasons: [
        {
          title: 'Неточный адрес',
          description: 'Клиент не может указать точный адрес или адрес не существует',
          action: 'Попросить уточнить адрес, если не получается - отклонить заказ'
        },
        {
          title: 'Недоступный номер телефона',
          description: 'Номер телефона не отвечает или неверный',
          action: 'Попробовать связаться 2-3 раза, если не получается - отклонить'
        },
        {
          title: 'Невозможно дозвониться',
          description: 'Клиент не отвечает на звонки в течение дня',
          action: 'Оставить заказ в статусе "Ожидает", повторить попытку на следующий день'
        }
      ]
    },
    {
      category: 'Отказ клиента',
      icon: XCircle,
      reasons: [
        {
          title: 'Передумал',
          description: 'Клиент передумал и не хочет заказывать услугу',
          action: 'Вежливо попрощаться, предложить обращаться в будущем'
        },
        {
          title: 'Цена не подходит',
          description: 'Клиент считает цену слишком высокой',
          action: 'Объяснить ценовую политику, предложить альтернативы'
        },
        {
          title: 'Нашел другого мастера',
          description: 'Клиент уже нашел другого исполнителя',
          action: 'Поблагодарить за обращение, предложить обращаться в будущем'
        }
      ]
    },
    {
      category: 'Некорректные обращения',
      icon: MessageSquare,
      reasons: [
        {
          title: 'Спам/Реклама',
          description: 'Обращение не связано с нашими услугами',
          action: 'Вежливо объяснить, что мы не занимаемся этим, завершить разговор'
        },
        {
          title: 'Неподходящий тип техники',
          description: 'Клиент обращается по поводу техники, которую мы не ремонтируем',
          action: 'Объяснить, какие типы техники мы ремонтируем, предложить альтернативы'
        },
        {
          title: 'Грубое поведение',
          description: 'Клиент ведет себя неадекватно или грубо',
          action: 'Сохранять вежливость, при необходимости завершить разговор'
        }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="py-6 sm:py-10 px-4 sm:px-10 min-h-screen bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
        <div className="max-w-4xl space-y-8 sm:space-y-10">
          
          {/* Кнопка назад - только мобилка */}
          <button
            onClick={() => router.back()}
            className="sm:hidden flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 -mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>

          {/* Что мы НЕ делаем - в начале */}
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-500/30">
            <h2 className="text-lg text-red-700 dark:text-red-400 mb-4">Что мы НЕ делаем</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><span className="text-red-600 dark:text-red-400 font-medium">Не выкупаем технику</span> — мы не занимаемся выкупом</li>
              <li><span className="text-red-600 dark:text-red-400 font-medium">Не ездим только ради диагностики</span> — диагностика бесплатна только при ремонте</li>
              <li><span className="text-red-600 dark:text-red-400 font-medium">Не ремонтируем/меняем матрицы</span> — не работаем с матрицами экранов</li>
              <li><span className="text-red-600 dark:text-red-400 font-medium">Не ремонтируем мелкую бытовую технику</span> — пылесосы, тостеры и прочую мелочовку</li>
            </ul>
          </section>

          {/* Категории причин */}
          {nonOrderReasons.slice(1).map((category, index) => (
            <section key={index}>
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">{category.category}</h2>
              <div className="space-y-4">
                {category.reasons.map((reason, reasonIndex) => (
                  <div key={reasonIndex} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{reason.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{reason.description}</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">Действие: {reason.action}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Правила обработки */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Правила обработки незаказов</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Всегда сохранять вежливый тон, даже при отказе клиента</li>
              <li>Обязательно записывать причину отказа в системе</li>
              <li>Не тратить более 5 минут на попытки убедить клиента</li>
              <li>При грубом поведении — завершить разговор, не отвечать грубостью</li>
            </ul>
          </section>

          {/* Советы */}
          <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-500/30">
            <h2 className="text-lg text-green-700 dark:text-green-400 mb-4">Как минимизировать незаказы</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Четко объяснять ценовую политику с самого начала</li>
              <li>Уточнять удобное время для клиента</li>
              <li>Подчеркивать гарантийные обязательства</li>
              <li>Рассказывать о опыте и квалификации мастеров</li>
            </ul>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
