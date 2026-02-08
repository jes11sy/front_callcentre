'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, FileText, Clock, CheckCircle, AlertCircle, User, MessageSquare, DollarSign, Phone, Shield, ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';
import { useRouter } from 'next/navigation';

export default function OrderRulesPage() {
  const router = useRouter();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

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

          {/* Роли и представление */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Роли и представление</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Общение ведется от лица мастера/напарника мастера/жены мастера</li>
              <li>При первом звонке: «Здравствуйте, это [Имя] мастер по ремонту [тип техники]»</li>
              <li>При повторном звонке с негативом: представиться напарником/женой и сказать что передадите информацию</li>
              <li>Если клиент спрашивает про компанию: работаем индивидуально, но с напарниками</li>
            </ul>
          </section>

          {/* Этика общения */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Этика общения</h2>
            <div className="space-y-4">
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Запрещено:</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Грубить/хамить</li>
                  <li>Перебивать клиента</li>
                  <li>Использовать жаргон и мат</li>
                </ul>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium mb-2">Обязательно:</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Вежливо и профессионально</li>
                  <li>Говорить четко и понятно</li>
                  <li>Слушать клиента до конца</li>
                  <li>Использовать «Вы» при обращении</li>
                  <li>Извиняться за неудобства</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Обязательные поля */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Обязательные поля заказа</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Имя клиента</li>
              <li>Номер телефона</li>
              <li>Адрес</li>
              <li>Дата встречи</li>
              <li>Тип техники (КП, БТ или МНЧ)</li>
              <li>Описание проблемы</li>
            </ul>
          </section>

          {/* Правила работы с ценами */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Правила работы с ценами</h2>
            <div className="space-y-4">
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Что НЕ говорить:</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>«В районе», «до», «примерно»</li>
                  <li>Конкретные суммы без диагностики</li>
                </ul>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium mb-2">Что говорить:</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>«Цены ОТ [сумма]» — всегда «ОТ», никаких других формулировок</li>
                  <li>«Давайте лучше подъеду, посмотрю и на месте все скажу»</li>
                  <li>«Не волнуйтесь, о цене договоримся, главное чтобы вы остались довольны»</li>
                  <li>«По вашему описанию сложно сказать, лучше посмотреть на месте»</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Описание проблемы - важно */}
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-500/30">
            <h2 className="text-lg text-red-700 dark:text-red-400 mb-4">Критически важно: описание проблемы</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-medium mb-1">Обязательно указывать суммы:</p>
                <p>В описании ВСЕГДА указывать суммы, озвученные клиенту</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Пример: «Проблема: не включается ноутбук. Озвучена цена ОТ 1500₽»</p>
              </div>
              <div>
                <p className="font-medium mb-1">Для заказов с Авито:</p>
                <p className="text-red-600 dark:text-red-400">Обязательно дописывать: «ОБЯЗАТЕЛЬНО ОТЗЫВ!»</p>
              </div>
            </div>
          </section>

          {/* Техника ведения разговора */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Техника ведения разговора</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Начинать с приветствия и представления</li>
              <li>Уточнять удобное время для звонка/встречи</li>
              <li>Задавать уточняющие вопросы о проблеме</li>
              <li>Всегда благодарить за обращение</li>
            </ul>
          </section>

          {/* Критические ситуации */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Критические ситуации</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>При агрессии клиента — сохранять спокойствие, не отвечать грубостью</li>
              <li>При технических проблемах — честно говорить о возможных сложностях</li>
              <li>При сомнениях в диагнозе — предлагать диагностику</li>
            </ul>
          </section>

          {/* Временные слоты */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Временные слоты</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Интервалы: каждые 30 минут с 10:00 до 22:00</li>
              <li>Максимум 3 заказа на один временной слот</li>
              <li>Распределение по типам: КП, БТ, МНЧ</li>
            </ul>
          </section>

          {/* Типы заявок */}
          <section>
            <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Типы заявок</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><span className="text-blue-600 dark:text-blue-400">Впервые</span> — новый клиент, первое обращение</li>
              <li><span className="text-green-600 dark:text-green-400">Повтор</span> — повторное обращение существующего клиента</li>
              <li><span className="text-orange-600 dark:text-orange-400">Гарантия</span> — обращение по гарантийному случаю</li>
            </ul>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
