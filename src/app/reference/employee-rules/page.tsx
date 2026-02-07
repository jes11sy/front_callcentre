'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, AlertCircle, CheckCircle, MessageSquare, Phone, Users, FileText, Hash } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';

export default function EmployeeRulesPage() {
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  
  const cardClass = isV2 
    ? "border border-gray-200 bg-white font-myriad"
    : "border-2 border-[#FFD700]/30 bg-[#17212b]";
  
  const badgeClass = isV2 
    ? "border-[#FEC004]/30 text-[#FEC004]"
    : "border-[#FFD700]/30 text-[#FFD700]";

  // V2: Минималистичная версия
  if (isV2) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className="py-10 px-10 min-h-screen bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
          <div className="max-w-4xl space-y-10">
            
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

  // V1: Оригинальный дизайн с карточками
  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen bg-[#0f0f23]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center text-[#FFD700]">
                  <UserCheck className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Правила сотрудника
                </h1>
                <p className="mt-2 text-gray-400">
                  Основные правила и требования для операторов
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Clock className="h-5 w-5 text-[#FFD700]" />
                  <span>Рабочий график</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Требования к рабочему времени и графику</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Рабочий график:</strong> с 9:00 до 20:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Перерыв:</strong> 1 час (сообщать заранее)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Отметка:</strong> каждое утро отмечаться в рабочем чате</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5 text-[#FFD700]" />
                  <span>Общение с руководством</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Правила общения с директорами и руководством</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Общение с руководством и директорами</strong> производится исключительно в специальных чатах</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Общение должно быть максимально вежливое и тактичное</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Phone className="h-5 w-5 text-[#FFD700]" />
                  <span>Основные обязанности</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Что входит в обязанности оператора</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Прием входящих звонков</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Перенос клиентов на другое время</strong> по запросу директора</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Обзванивать клиентов</strong> по запросу директора</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white"><strong>Отвечать на сообщения в Авито</strong> (Центр сообщений)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5 text-[#FFD700]" />
                  <span>Контроль качества</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Обязательные процедуры контроля качества</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span className="font-semibold text-yellow-300">Обзвон клиентов за прошлый день</span>
                  </div>
                  <div className="text-sm space-y-2 text-yellow-200">
                    <div>• Уточнение по поводу качественно выполненного ремонта</div>
                    <div>• Уточнение суммы</div>
                    <div>• <strong>Если клиент не доволен или цена отличается от заявленной в CRM - срочно оповестить директора</strong></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MessageSquare className="h-5 w-5 text-[#FFD700]" />
                  <span>Примеры общения по заказам</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Стандартные фразы для общения с руководством</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    <div className="font-semibold text-blue-300">Заказ 123 перенос на 15:00</div>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    <div className="font-semibold text-red-300">Заказ 123 отмена</div>
                  </div>
                  <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30">
                    <div className="font-semibold text-orange-300">Заказ 123 сумма отличается от базы, клиент сообщил &quot;сумма&quot;</div>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    <div className="font-semibold text-red-300">Заказ 123 негатив, клиент не доволен тем то тем то</div>
                  </div>
                  <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                    <div className="font-semibold text-yellow-300">Заказ 123 нет мастера, когда будет?</div>
                  </div>
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    <div className="font-semibold text-blue-300">Заказ 123 клиент уточняет что с техникой, ждет информации от мастера</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Hash className="h-5 w-5 text-[#FFD700]" />
                  <span>Сокращения и аббревиатуры</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Обязательные сокращения для использования в работе</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КП</Badge>
                        <span className="text-sm text-gray-300">Компьютерная помощь (ремонт цифровой техники)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>БТ</Badge>
                        <span className="text-sm text-gray-300">Бытовая техника</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>МНЧ</Badge>
                        <span className="text-sm text-gray-300">Муж на час</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ПК</Badge>
                        <span className="text-sm text-gray-300">Персональный компьютер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>СМ</Badge>
                        <span className="text-sm text-gray-300">Стиральная машина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ПМ</Badge>
                        <span className="text-sm text-gray-300">Посудомоечная машина</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КМ</Badge>
                        <span className="text-sm text-gray-300">Кофемашина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ДШ</Badge>
                        <span className="text-sm text-gray-300">Духовой шкаф</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ВП</Badge>
                        <span className="text-sm text-gray-300">Варочная панель, электроплита</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КДЦ</Badge>
                        <span className="text-sm text-gray-300">Кондиционер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ХД</Badge>
                        <span className="text-sm text-gray-300">Холодильник</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>МС</Badge>
                        <span className="text-sm text-gray-300">Мастер</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4 border-gray-600">
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="bg-red-900/20 text-red-300 border-red-500/30">Незаказ</Badge>
                        <span className="text-sm text-gray-300">Техника, которую не ремонтируем</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">Модерн</Badge>
                        <span className="text-sm text-gray-300">Модернизация/мастер забрал технику на ремонт</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500/30 bg-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-300">
                  <Badge variant="destructive" className="bg-red-900/20 text-red-300 border-red-500/30">Важно</Badge>
                  <span>Дополнительные вопросы</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-red-200">
                  <div className="font-semibold mb-2">Занимаемся ли ремонтом инверторов у СМ?</div>
                  <div>Если да, то на какое время принять и от какой суммы.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
