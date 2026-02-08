'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, AlertCircle, CheckCircle, MessageSquare, Phone, Users, FileText, Hash, ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

export default function EmployeeRulesPage() {
  const router = useRouter();

  return (
    <DashboardLayout variant="operator" requiredRole="operator">
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

          {/* Рабочий график */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Рабочий график</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Рабочий график: с 9:00 до 20:00</li>
              <li>Перерыв: 1 час (сообщать заранее)</li>
              <li>Каждое утро отмечаться в рабочем чате</li>
            </ul>
          </section>

          {/* Общение с руководством */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Общение с руководством</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Общение с руководством и директорами производится исключительно в специальных чатах</li>
              <li>Общение должно быть максимально вежливое и тактичное</li>
            </ul>
          </section>

          {/* Основные обязанности */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Основные обязанности</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Прием входящих звонков</li>
              <li>Перенос клиентов на другое время по запросу директора</li>
              <li>Обзванивать клиентов по запросу директора</li>
              <li>Отвечать на сообщения в Авито (Центр сообщений)</li>
            </ul>
          </section>

          {/* Контроль качества */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Контроль качества</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p className="font-medium">Обзвон клиентов за прошлый день:</p>
              <ul className="space-y-1 ml-4">
                <li>Уточнение по поводу качественно выполненного ремонта</li>
                <li>Уточнение суммы</li>
                <li className="text-red-600 dark:text-red-400">Если клиент не доволен или цена отличается от заявленной в CRM — срочно оповестить директора</li>
              </ul>
            </div>
          </section>

          {/* Примеры общения */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Примеры сообщений по заказам</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Заказ 123 перенос на 15:00</li>
              <li>Заказ 123 отмена</li>
              <li>Заказ 123 сумма отличается от базы, клиент сообщил «сумма»</li>
              <li>Заказ 123 негатив, клиент не доволен тем то тем то</li>
              <li>Заказ 123 нет мастера, когда будет?</li>
              <li>Заказ 123 клиент уточняет что с техникой, ждет информации от мастера</li>
            </ul>
          </section>

          {/* Сокращения */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Сокращения</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-700 dark:text-gray-300">
              <div>КП — Компьютерная помощь</div>
              <div>КМ — Кофемашина</div>
              <div>БТ — Бытовая техника</div>
              <div>ДШ — Духовой шкаф</div>
              <div>МНЧ — Муж на час</div>
              <div>ВП — Варочная панель</div>
              <div>ПК — Персональный компьютер</div>
              <div>КДЦ — Кондиционер</div>
              <div>СМ — Стиральная машина</div>
              <div>ХД — Холодильник</div>
              <div>ПМ — Посудомоечная машина</div>
              <div>МС — Мастер</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-gray-700 dark:text-gray-300">
              <div><span className="text-red-600 dark:text-red-400">Незаказ</span> — Техника, которую не ремонтируем</div>
              <div><span className="text-gray-500 dark:text-gray-400">Модерн</span> — Мастер забрал технику на ремонт</div>
            </div>
          </section>

          {/* Важно */}
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-500/30">
            <h2 className="text-lg text-red-700 dark:text-red-400 mb-2">Важно</h2>
            <p className="text-red-700 dark:text-red-400">
              Занимаемся ли ремонтом инверторов у СМ? Если да, то на какое время принять и от какой суммы.
            </p>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
