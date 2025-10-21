'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Badge removed - not used
import { 
  DollarSign, 
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function SalaryPage() {
  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#0f0f23] min-h-screen">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#FFD700] flex items-center">
                  <DollarSign className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Зарплата
                </h1>
                <p className="text-gray-400 mt-2">
                  Информация о заработной плате и выплатах
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <Card className="max-w-2xl mx-auto border-2 border-[#FFD700]/30 bg-[#17212b]">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-[#FFD700]" />
              </div>
              <CardTitle className="text-2xl text-white">Скоро будет доступно</CardTitle>
              <CardDescription className="text-lg text-gray-400">
                Раздел &quot;Зарплата&quot; находится в разработке
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                В этом разделе вы сможете просматривать:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-3 p-4 bg-[#0f0f23] rounded-lg border border-[#FFD700]/30">
                  <Calendar className="h-5 w-5 text-[#FFD700]" />
                  <div className="text-left">
                    <p className="font-medium text-white">История выплат</p>
                    <p className="text-sm text-gray-400">Все предыдущие зарплаты</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-[#0f0f23] rounded-lg border border-[#FFD700]/30">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-white">Статистика доходов</p>
                    <p className="text-sm text-gray-400">Графики и аналитика</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-[#0f0f23] rounded-lg border border-[#FFD700]/30">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <div className="text-left">
                    <p className="font-medium text-white">Отработанные часы</p>
                    <p className="text-sm text-gray-400">Учет рабочего времени</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-[#0f0f23] rounded-lg border border-[#FFD700]/30">
                  <FileText className="h-5 w-5 text-orange-400" />
                  <div className="text-left">
                    <p className="font-medium text-white">Справки и документы</p>
                    <p className="text-sm text-gray-400">Скачивание документов</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
                <p className="text-[#FFD700] font-medium">
                  Ожидаемая дата запуска: Q1 2025
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Следите за обновлениями в системе
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
