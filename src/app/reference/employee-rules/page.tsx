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

  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen ${isV2 ? 'bg-[#F3F3EE] font-myriad' : 'bg-[#0f0f23]'}`}>
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          {!isV2 && (
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
          )}

          <div className="grid gap-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Clock className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Рабочий график</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Требования к рабочему времени и графику</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Рабочий график:</strong> с 9:00 до 20:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Перерыв:</strong> 1 час (сообщать заранее)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Отметка:</strong> каждое утро отмечаться в рабочем чате</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Users className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Общение с руководством</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Правила общения с директорами и руководством</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Общение с руководством и директорами</strong> производится исключительно в специальных чатах</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Общение должно быть максимально вежливое и тактичное</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Phone className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Основные обязанности</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Что входит в обязанности оператора</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Прием входящих звонков</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Перенос клиентов на другое время</strong> по запросу директора</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Обзванивать клиентов</strong> по запросу директора</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Отвечать на сообщения в Авито</strong> (Центр сообщений)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <FileText className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Контроль качества</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Обязательные процедуры контроля качества</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={isV2 ? "bg-amber-50 p-4 rounded-lg border border-amber-200" : "bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30"}>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className={isV2 ? "h-4 w-4 text-amber-600" : "h-4 w-4 text-yellow-400"} />
                    <span className={isV2 ? "font-semibold text-amber-700" : "font-semibold text-yellow-300"}>Обзвон клиентов за прошлый день</span>
                  </div>
                  <div className={`text-sm space-y-2 ${isV2 ? 'text-amber-700' : 'text-yellow-200'}`}>
                    <div>• Уточнение по поводу качественно выполненного ремонта</div>
                    <div>• Уточнение суммы</div>
                    <div>• <strong>Если клиент не доволен или цена отличается от заявленной в CRM - срочно оповестить директора</strong></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <MessageSquare className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Примеры общения по заказам</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Стандартные фразы для общения с руководством</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className={isV2 ? "bg-blue-50 p-3 rounded-lg border border-blue-200" : "bg-blue-900/20 p-3 rounded-lg border border-blue-500/30"}>
                    <div className={isV2 ? "font-semibold text-blue-700" : "font-semibold text-blue-300"}>Заказ 123 перенос на 15:00</div>
                  </div>
                  <div className={isV2 ? "bg-red-50 p-3 rounded-lg border border-red-200" : "bg-red-900/20 p-3 rounded-lg border border-red-500/30"}>
                    <div className={isV2 ? "font-semibold text-red-700" : "font-semibold text-red-300"}>Заказ 123 отмена</div>
                  </div>
                  <div className={isV2 ? "bg-orange-50 p-3 rounded-lg border border-orange-200" : "bg-orange-900/20 p-3 rounded-lg border border-orange-500/30"}>
                    <div className={isV2 ? "font-semibold text-orange-700" : "font-semibold text-orange-300"}>Заказ 123 сумма отличается от базы, клиент сообщил &quot;сумма&quot;</div>
                  </div>
                  <div className={isV2 ? "bg-red-50 p-3 rounded-lg border border-red-200" : "bg-red-900/20 p-3 rounded-lg border border-red-500/30"}>
                    <div className={isV2 ? "font-semibold text-red-700" : "font-semibold text-red-300"}>Заказ 123 негатив, клиент не доволен тем то тем то</div>
                  </div>
                  <div className={isV2 ? "bg-amber-50 p-3 rounded-lg border border-amber-200" : "bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30"}>
                    <div className={isV2 ? "font-semibold text-amber-700" : "font-semibold text-yellow-300"}>Заказ 123 нет мастера, когда будет?</div>
                  </div>
                  <div className={isV2 ? "bg-blue-50 p-3 rounded-lg border border-blue-200" : "bg-blue-900/20 p-3 rounded-lg border border-blue-500/30"}>
                    <div className={isV2 ? "font-semibold text-blue-700" : "font-semibold text-blue-300"}>Заказ 123 клиент уточняет что с техникой, ждет информации от мастера</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Hash className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Сокращения и аббревиатуры</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Обязательные сокращения для использования в работе</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КП</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Компьютерная помощь (ремонт цифровой техники)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>БТ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Бытовая техника</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>МНЧ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Муж на час</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ПК</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Персональный компьютер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>СМ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Стиральная машина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ПМ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Посудомоечная машина</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КМ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Кофемашина</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ДШ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Духовой шкаф</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ВП</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Варочная панель, электроплита</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>КДЦ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Кондиционер</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>ХД</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Холодильник</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={badgeClass}>МС</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Мастер</span>
                      </div>
                    </div>
                  </div>
                  <div className={`border-t pt-4 ${isV2 ? 'border-gray-200' : 'border-gray-600'}`}>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className={isV2 ? "bg-red-100 text-red-700 border-red-200" : "bg-red-900/20 text-red-300 border-red-500/30"}>Незаказ</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Техника, которую не ремонтируем</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={isV2 ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-gray-700 text-gray-300 border-gray-600"}>Модерн</Badge>
                        <span className={`text-sm ${isV2 ? 'text-gray-600' : 'text-gray-300'}`}>Модернизация/мастер забрал технику на ремонт</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isV2 ? "border border-red-200 bg-red-50" : "border-2 border-red-500/30 bg-red-900/20"}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-red-700' : 'text-red-300'}`}>
                  <Badge variant="destructive" className={isV2 ? "bg-red-100 text-red-700 border-red-200" : "bg-red-900/20 text-red-300 border-red-500/30"}>Важно</Badge>
                  <span>Дополнительные вопросы</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-sm ${isV2 ? 'text-red-700' : 'text-red-200'}`}>
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
