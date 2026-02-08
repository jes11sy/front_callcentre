'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Wrench, Monitor, Home, ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const router = useRouter();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const pricingData = [
    {
      category: 'КП (Компьютеры)',
      icon: Monitor,
      subcategories: [
        {
          name: 'ПК/Ноутбуки/Моноблоки',
          services: [
            { name: 'Чистка от пыли', price: 'от 1500₽' },
            { name: 'Замена термопасты', price: 'от 500₽' },
            { name: 'Пайка платы', price: 'от 2000₽' },
            { name: 'Сборка компьютера с 0', price: 'от 3000₽' },
            { name: 'Обучение пользоваться', price: 'от 1500₽' },
            { name: 'Замена комплектующих', price: 'от 500₽' },
            { name: 'Установка виндовс/mac/linux', price: 'от 1000₽' },
            { name: 'Установка драйверов', price: 'от 500₽' },
            { name: 'Установка программ', price: 'от 500₽' },
            { name: 'Удаление вирусов', price: 'от 500₽' },
            { name: 'Установка антивируса', price: 'от 1000₽' },
            { name: 'Установка офис', price: 'от 1000₽' },
            { name: 'Настройка виндовс/mac/linux', price: 'от 500₽' },
            { name: 'Восстановление данных', price: 'от 1000₽' },
            { name: 'Прошивка/сброс bios', price: 'от 1500₽' },
            { name: 'Настройка bios(ПК)', price: 'от 1000₽' },
            { name: 'Улучшение ПК/Ноутбука/Моноблока', price: 'от 2000₽' },
            { name: 'Настройка интернета', price: 'от 1000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'ТВ',
          services: [
            { name: 'Ремонт мат платы', price: 'от 2000₽' },
            { name: 'Ремонт блока питания', price: 'от 2000₽' },
            { name: 'Замена подсветки (до 43 диагонали)', price: 'от 3000₽' },
            { name: 'Замена подсветки (43-55 диагонали)', price: 'от 5000₽' },
            { name: 'Замена подсветки (свыше 55 диагонали)', price: 'от 7000₽' },
            { name: 'Прошивка тв', price: 'от 2500₽' },
            { name: 'Настройка тв', price: 'от 1000₽' },
            { name: 'Настройка приставки', price: 'от 500₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        }
      ]
    },
    {
      category: 'БТ (Бытовая техника)',
      icon: Wrench,
      subcategories: [
        {
          name: 'СМ/ПМ (Стиральные машины/Посудомоечные машины)',
          services: [
            { name: 'Не сливает (помпа/засор/модуль)', price: 'от 1000₽' },
            { name: 'Не греет (тэн/модуль)', price: 'от 1000₽' },
            { name: 'Не отжимает (двигатель/щетки/модуль)', price: 'от 1000₽' },
            { name: 'Замена подшипника', price: 'от 3000₽' },
            { name: 'Замена крестовины', price: 'от 3000₽' },
            { name: 'Пайка бака', price: 'от 500₽' },
            { name: 'Замена шланга', price: 'от 500₽' },
            { name: 'Замена амортизаторов', price: 'от 800₽' },
            { name: 'Замена замка открывания(убл)', price: 'от 1000₽' },
            { name: 'Замена манжеты', price: 'от 1500₽' },
            { name: 'Замена кэна (не набирает воду)', price: 'от 1000₽' },
            { name: 'Замена пресостата (не набирает воду/много воды)', price: 'от 1000₽' },
            { name: 'Ремонт модуля', price: 'от 1500₽' },
            { name: 'Замена аквастопа (не включается у некоторых см)', price: 'от 1000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'ХД (Холодильники)',
          services: [
            { name: 'Утечка фреона', price: 'от 3000₽' },
            { name: 'Заправка фреона', price: 'от 1500₽' },
            { name: 'Замена компрессора', price: 'от 3500₽' },
            { name: 'Ремонт модуля', price: 'от 2000₽' },
            { name: 'Замена термостата', price: 'от 800₽' },
            { name: 'Замена пускового реле (ПЗР)', price: 'от 800₽' },
            { name: 'Устранение утечки в запенке', price: 'от 7000₽' },
            { name: 'Установка обманки (инверторные компрессора)', price: 'от 9000₽' },
            { name: 'Замена уплотнительных резинок', price: 'от 2500₽' },
            { name: 'Замена тэна', price: 'от 2500₽' },
            { name: 'Замена температурного датчика', price: 'от 1300₽' },
            { name: 'Замена предохранителя тэна', price: 'от 1000₽' },
            { name: 'Замена лампочки', price: 'от 1000₽' },
            { name: 'Замена вентилятора', price: 'от 1500₽' },
            { name: 'Замена заслонки', price: 'от 1500₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'ДШ (Духовые шкафы)',
          services: [
            { name: 'Замена термостата(не включатся)', price: 'от 1000₽' },
            { name: 'Замена тэна(не греет/не включается)', price: 'от 1000₽' },
            { name: 'Ремонт модуля управления', price: 'от 1500₽' },
            { name: 'Замена таймера', price: 'от 1000₽' },
            { name: 'Ремонт/замена петли', price: 'от 1500₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'ВП (Варочные панели)',
          services: [
            { name: 'Замена конфорки', price: 'от 1500₽' },
            { name: 'Замена датчика температуры', price: 'от 1500₽' },
            { name: 'Ремонт модуля', price: 'от 2000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'Водонагреватели/бойлеры',
          services: [
            { name: 'Замена тэна', price: 'от 2000₽' },
            { name: 'Замена термостата', price: 'от 1500₽' },
            { name: 'Ремонт модуля', price: 'от 2000₽' },
            { name: 'Замена УЗО', price: 'от 1000₽' },
            { name: 'Чистка бака', price: 'от 2000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'КДЦ (Кондиционеры)',
          services: [
            { name: 'Заправка фреоном', price: 'от 1500₽' },
            { name: 'Чистка фильтров', price: 'от 1000₽' },
            { name: 'Мойка кондиционера', price: 'от 2000₽' },
            { name: 'Замена температурного датчика', price: 'от 1500₽' },
            { name: 'Замена помпы', price: 'от 6000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'КМ (Кофемашины)',
          services: [
            { name: 'Замена помпы', price: 'от 3000₽' },
            { name: 'Замена тэна', price: 'от 3000₽' },
            { name: 'Комплексное обслуживание', price: 'от 5000₽' },
            { name: 'Замена датчиков', price: 'от 2000₽' },
            { name: 'Ремонт модуля', price: 'от 3000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        }
      ]
    },
    {
      category: 'МНЧ (Муж на час)',
      icon: Home,
      subcategories: [
        {
          name: 'Сантехника',
          services: [
            { name: 'Установка/замена раковины', price: 'от 2000₽' },
            { name: 'Установка смесителя', price: 'от 1500₽' },
            { name: 'Установка ванны', price: 'от 3500₽' },
            { name: 'Установка полотенцесушителя', price: 'от 2000₽' },
            { name: 'Установка унитаза', price: 'от 2500₽' },
            { name: 'Установка бачка унитаза', price: 'от 2000₽' },
            { name: 'Установка стиральной/посудомоечной машины с подведеными трубами', price: 'от 2000₽' },
            { name: 'Установка стиральной/посудомоечной машины без подводки', price: 'от 3500₽' },
            { name: 'Устранение протечки труб', price: 'от 2000₽' },
            { name: 'Устранение протечки унитаза/ванны/раковины/батареи', price: 'от 2000₽' },
            { name: 'Установка бойлера', price: 'от 3000₽' },
            { name: 'Разводка труб', price: 'от 3000₽' },
            { name: 'Установка/замена батареи', price: 'от 3000₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'Электрика',
          services: [
            { name: 'Замена розетки', price: 'от 800₽' },
            { name: 'Замена выключателя', price: 'от 800₽' },
            { name: 'Установка люстры', price: 'от 1500₽' },
            { name: 'Подключение электроплиты/духового шкафа', price: 'от 2000₽' },
            { name: 'Установка УЗО', price: 'от 1000₽' },
            { name: 'Установка электросчетчика', price: 'от 2000₽' },
            { name: 'Установка звонка', price: 'от 800₽' },
            { name: 'Установка светильников', price: 'от 1000₽' },
            { name: 'Монтаж автоматов защиты', price: 'от 1000₽' },
            { name: 'Монтаж электрощита', price: 'от 3500₽' },
            { name: 'Монтаж электропроводки', price: 'от 100₽/пог.м' },
            { name: 'Установка распред коробки', price: 'от 800₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
        },
        {
          name: 'Муж на час',
          services: [
            { name: 'Замена зеркал', price: 'от 1000₽' },
            { name: 'Мелкий бытовой ремонт', price: 'от 1000₽' },
            { name: 'Сборка мебели', price: 'от 1500₽' },
            { name: 'Другие услуги', price: 'уточнять у директора' },
          ]
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

          {pricingData.map((category, index) => (
            <section key={index}>
              <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-300 dark:border-gray-700">{category.category}</h2>
              
              <div className="space-y-8">
                {category.subcategories.map((subcategory, subIndex) => (
                  <div key={subIndex}>
                    <h3 className="text-base text-gray-700 dark:text-gray-300 mb-3">{subcategory.name}</h3>
                    <div className="space-y-1">
                      {subcategory.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-300">{service.name}</span>
                          <span className="text-[#FEC004] font-medium">{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Доп информация */}
          <section className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-500/30">
            <h2 className="text-lg text-orange-700 dark:text-orange-400 mb-4">Дополнительная информация</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>Гарантия на все виды работ — 3-6 месяцев</li>
              <li>Оплата производится после выполнения работ</li>
              <li>Постоянным клиентам скидки до 15%</li>
              <li>Выезд мастера: 500₽ (засчитывается в стоимость ремонта)</li>
            </ul>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
