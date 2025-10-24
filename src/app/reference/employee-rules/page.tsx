'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, AlertCircle, CheckCircle, MessageSquare, Phone, Users, FileText, Hash } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function EmployeeRulesPage() {
  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#0f0f23] min-h-screen">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#FFD700] flex items-center">
                  <UserCheck className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Правила сотрудника
                </h1>
                <p className="text-gray-400 mt-2">
                  Основные правила и требования для операторов
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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

            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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

            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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

            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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
                  <div className="text-sm text-yellow-200 space-y-2">
                    <div>• Уточнение по поводу качественно выполненного ремонта</div>
                    <div>• Уточнение суммы</div>
                    <div>• <strong>Если клиент не доволен или цена отличается от заявленной в CRM - срочно оповестить директора</strong></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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

            <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
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
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">КП</Badge>
                        <span className="text-sm text-gray-300">Компьютерная помощь (ремонт цифровой техники)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">БТ</Badge>
                        <span className="text-sm text-gray-300">Бытовая техника</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">МНЧ</Badge>
                        <span className="text-sm text-gray-300">Муж на час</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">ПК</Badge>
                        <span className="text-sm text-gray-300">Персональный компьютер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">СМ</Badge>
                        <span className="text-sm text-gray-300">Стиральная машина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">ПМ</Badge>
                        <span className="text-sm text-gray-300">Посудомоечная машина</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">КМ</Badge>
                        <span className="text-sm text-gray-300">Кофемашина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">ДШ</Badge>
                        <span className="text-sm text-gray-300">Духовой шкаф</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">ВП</Badge>
                        <span className="text-sm text-gray-300">Варочная панель, электроплита</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">КДЦ</Badge>
                        <span className="text-sm text-gray-300">Кондиционер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">ХД</Badge>
                        <span className="text-sm text-gray-300">Холодильник</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">МС</Badge>
                        <span className="text-sm text-gray-300">Мастер</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-600 pt-4">
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
