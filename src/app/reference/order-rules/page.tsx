'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, FileText, Clock, CheckCircle, AlertCircle, User, MessageSquare, DollarSign, Phone, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';

export default function OrderRulesPage() {
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  
  const cardClass = isV2 
    ? "border border-gray-200 bg-white font-myriad"
    : "border-2 border-[#FFD700]/30 bg-[#17212b]";

  return (
    <DashboardLayout>
      <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen ${isV2 ? 'bg-[#F3F3EE] font-myriad' : 'bg-[#0f0f23]'}`}>
        <div className="flex items-center space-x-3 mb-8">
          <ClipboardList className={`h-8 w-8 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
          <div>
            <h1 className={`text-3xl font-bold ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'}`}>Правила приема заказов</h1>
            <p className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Процедуры и требования при создании заказов</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                <User className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                <span>Роли и представление</span>
              </CardTitle>
              <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Как представляться клиентам</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Общение ведется от лица мастера/напарника мастера/жены мастера</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>При первом звонке:</strong> &quot;Здравствуйте, это [Имя] мастер по ремонту [тип техники]&quot;</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>При повторном звонке с негативом:</strong> представиться напарником мастера/женой и сказать что передадите всю информацию, вопрос решится в ближайшие минуты</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Если клиент спрашивает про компанию:</strong> говорить что работаем индивидуально, но с напарниками</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <MessageSquare className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Этика общения</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Правила вежливого общения с клиентами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>НЕ грубить/не хамить</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>НЕ перебивать клиента</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>НЕ использовать жаргон и мат</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Всегда вежливо и профессионально</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Говорить четко и понятно</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Слушать клиента до конца</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Использовать &quot;Вы&quot; при обращении</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Извиняться за неудобства, если они есть</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <FileText className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Обязательные поля</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Поля, которые должны быть заполнены при создании заказа</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Имя клиента</strong> - обязательно для всех заказов</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Номер телефона</strong> - для связи с клиентом</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Адрес</strong> - место выполнения работ</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Дата встречи</strong> - когда мастер приедет</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Тип техники</strong> - КП, БТ или МНЧ</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Описание проблемы</strong> - что нужно починить</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <DollarSign className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Правила работы с ценами</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Как правильно говорить о ценах с клиентами</CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className={`font-semibold mb-2 ${isV2 ? 'text-red-600' : 'text-red-400'}`}>🚫 Что НЕ говорить:</h4>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>&quot;В районе&quot;, &quot;до&quot;, &quot;примерно&quot;</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Конкретные суммы без диагностики</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-2 ${isV2 ? 'text-green-600' : 'text-green-400'}`}>✅ Что говорить:</h4>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>&quot;Цены ОТ [сумма]&quot;</strong> - всегда &quot;ОТ&quot;, никаких других формулировок</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>&quot;Давайте лучше подъеду, посмотрю и на месте все скажу&quot;</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>&quot;Не волнуйтесь, о цене договоримся, главное чтобы вы остались довольны&quot;</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>&quot;По вашему описанию сложно сказать в чем именно проблема, лучше посмотреть на месте. Цену озвучу сразу после диагностики&quot;</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`font-semibold mb-2 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`}>🎯 Стратегия ухода от цен:</h4>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Всегда стараться уходить от вопросов о цене</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Говорить о необходимости диагностики</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Цену обсудим на месте сразу до начала работ</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Если клиент очень настаивает - назвать сумму из прайса</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

            <Card className={isV2 ? "border border-red-200 bg-red-50" : "border-2 border-red-500/30 bg-red-900/20"}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-red-700' : 'text-red-300'}`}>
                  <Badge variant="destructive" className={isV2 ? "bg-red-100 text-red-700 border-red-200" : ""}>КРИТИЧЕСКИ ВАЖНО</Badge>
                  <span>Правила заполнения описания проблемы</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Обязательные требования к описанию проблемы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className={isV2 ? "bg-amber-50 p-4 rounded-lg border border-amber-200" : "bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30"}>
                    <h4 className={`font-semibold mb-2 ${isV2 ? 'text-amber-700' : 'text-yellow-400'}`}>💰 Обязательно указывать суммы:</h4>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-amber-600' : 'text-yellow-400'}`} />
                      <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>В описании проблемы ВСЕГДА указывать суммы, которые были озвучены клиенту</strong></span>
                    </div>
                    <div className={`mt-2 text-sm ${isV2 ? 'text-amber-700' : 'text-yellow-300'}`}>
                      <strong>Пример:</strong> &quot;Проблема: не включается ноутбук. Озвучена цена ОТ 1500₽ за диагностику&quot;
                    </div>
                  </div>

                  <div className={isV2 ? "bg-red-50 p-4 rounded-lg border border-red-200" : "bg-red-900/20 p-4 rounded-lg border border-red-500/30"}>
                    <h4 className={`font-semibold mb-2 ${isV2 ? 'text-red-700' : 'text-red-400'}`}>📱 Для заказов с Авито:</h4>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                      <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>В описание проблемы ОБЯЗАТЕЛЬНО дописывать: &quot;ОБЯЗАТЕЛЬНО ОТЗЫВ!&quot;</strong></span>
                    </div>
                    <div className={`mt-2 text-sm ${isV2 ? 'text-red-700' : 'text-red-300'}`}>
                      <strong>Пример:</strong> &quot;Проблема: сломался холодильник. Озвучена цена ОТ 2000₽. ОБЯЗАТЕЛЬНО ОТЗЫВ!&quot;
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Phone className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Техника ведения разговора</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Как правильно вести разговор с клиентом</CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Начинать с приветствия и представления</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Уточнять удобное время для звонка/встречи</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Задавать уточняющие вопросы о проблеме</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Всегда благодарить за обращение</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Shield className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Критические ситуации</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Как вести себя в сложных ситуациях</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>При агрессии клиента - сохранять спокойствие, не отвечать грубостью</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>При технических проблемах - честно говорить о возможных сложностях</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${isV2 ? 'text-red-600' : 'text-red-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>При сомнениях в диагнозе - предлагать диагностику</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Clock className={`h-5 w-5 ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`} />
                  <span>Временные слоты</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Доступные временные интервалы для записи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Интервалы: каждые 30 минут с 10:00 до 22:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Максимум 3 заказа на один временной слот</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}>Распределение по типам техники: КП, БТ, МНЧ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                  <Badge variant="outline" className={isV2 ? "border-[#FEC004]/30 text-[#FEC004]" : "border-[#FFD700]/30 text-[#FFD700]"}>Информация</Badge>
                  <span>Типы заявок</span>
                </CardTitle>
                <CardDescription className={isV2 ? 'text-gray-500' : 'text-gray-400'}>Различные типы заявок и их особенности</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Впервые</strong> - новый клиент, первое обращение</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Повтор</strong> - повторное обращение существующего клиента</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${isV2 ? 'text-orange-600' : 'text-orange-400'}`} />
                    <span className={isV2 ? 'text-gray-900' : 'text-white'}><strong>Гарантия</strong> - обращение по гарантийному случаю</span>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
