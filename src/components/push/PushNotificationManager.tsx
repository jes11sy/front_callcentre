'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, BellRing, Settings, X, Check } from 'lucide-react';

interface PushNotificationManagerProps {
  /** Показывать как компактную кнопку */
  compact?: boolean;
}

/**
 * Компонент управления push-уведомлениями
 * Показывает статус и позволяет включить/выключить push
 */
export function PushNotificationManager({ compact = false }: PushNotificationManagerProps) {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
    sendTestNotification,
    isSubscribing,
    isUnsubscribing,
  } = usePushNotifications();

  const [showSettings, setShowSettings] = useState(false);

  // Не показываем если не поддерживается
  if (!isSupported && !isLoading) {
    return null;
  }

  // Компактный режим - только кнопка
  if (compact) {
    return (
      <button
        onClick={isSubscribed ? () => setShowSettings(true) : subscribe}
        disabled={isLoading || isSubscribing}
        className={`
          p-2 rounded-lg transition-colors
          ${isSubscribed 
            ? 'text-[#FEC004] hover:bg-[#FEC004]/10' 
            : 'text-gray-400 hover:bg-gray-500/10'
          }
          disabled:opacity-50
        `}
        title={isSubscribed ? 'Push-уведомления включены' : 'Включить push-уведомления'}
      >
        {isSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e2530] rounded-xl border border-gray-200 dark:border-gray-700 p-4 font-myriad">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2.5 rounded-xl
            ${isSubscribed 
              ? 'bg-[#FEC004]/10' 
              : 'bg-gray-100 dark:bg-gray-700/50'
            }
          `}>
            {isSubscribed ? <BellRing size={24} className="text-[#FEC004]" /> : <BellOff size={24} className="text-gray-400" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Push-уведомления
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading 
                ? 'Загрузка...' 
                : isSubscribed 
                  ? 'Включены' 
                  : permission === 'denied'
                    ? 'Заблокированы в браузере'
                    : 'Выключены'
              }
            </p>
          </div>
        </div>

        {/* Основная кнопка */}
        {permission !== 'denied' && (
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading || isSubscribing || isUnsubscribing}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isSubscribed 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                : 'bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]'
              }
              disabled:opacity-50
            `}
          >
            {isSubscribing 
              ? 'Подключение...' 
              : isUnsubscribing 
                ? 'Отключение...'
                : isSubscribed 
                  ? 'Отключить' 
                  : 'Включить'
            }
          </button>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Инструкция при заблокированных уведомлениях */}
      {permission === 'denied' && (
        <div className="p-3 bg-[#FEC004]/10 border border-[#FEC004]/20 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
          <p className="font-medium mb-1 text-gray-900 dark:text-white">Уведомления заблокированы</p>
          <p>Разрешите уведомления в настройках браузера для этого сайта, затем обновите страницу.</p>
        </div>
      )}

      {/* Настройки типов уведомлений */}
      {isSubscribed && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Типы уведомлений
            </span>
          </div>

          <div className="space-y-3">
            {/* Входящие звонки */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Входящие звонки
              </span>
              <button
                onClick={() => updateSettings({ callIncoming: !settings.callIncoming })}
                className={`
                  w-11 h-6 rounded-full transition-colors relative
                  ${settings.callIncoming 
                    ? 'bg-[#FEC004]' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <span className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                  ${settings.callIncoming ? 'left-6' : 'left-1'}
                `} />
              </button>
            </label>

            {/* Пропущенные звонки */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Пропущенные звонки
              </span>
              <button
                onClick={() => updateSettings({ callMissed: !settings.callMissed })}
                className={`
                  w-11 h-6 rounded-full transition-colors relative
                  ${settings.callMissed 
                    ? 'bg-[#FEC004]' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <span className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                  ${settings.callMissed ? 'left-6' : 'left-1'}
                `} />
              </button>
            </label>
          </div>

          {/* Тестовое уведомление */}
          <button
            onClick={sendTestNotification}
            className="mt-4 w-full py-2 text-sm text-[#FEC004] hover:bg-[#FEC004]/10 rounded-lg transition-colors font-medium"
          >
            Отправить тестовое уведомление
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Баннер для первого запроса разрешения
 */
export function PushPermissionBanner() {
  const { isSupported, isSubscribed, permission, subscribe, isSubscribing } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Проверяем localStorage при монтировании
  useEffect(() => {
    const wasDismissed = localStorage.getItem('push-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Не показываем если:
  // - Не поддерживается
  // - Уже подписан
  // - Уже отклонил
  // - Разрешение уже запрошено (granted или denied)
  // - Баннер был закрыт
  if (!isSupported || isSubscribed || dismissed || permission !== 'default') {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-[#1e2530] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in slide-in-from-bottom-4 font-myriad">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-[#FEC004]/10 rounded-xl">
          <Bell size={26} className="text-[#FEC004]" />
        </div>
        <div className="flex-1 pr-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-base">
            Включить уведомления?
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Получайте уведомления о входящих и пропущенных звонках, даже когда вкладка закрыта
          </p>
          <div className="flex gap-3">
            <button
              onClick={subscribe}
              disabled={isSubscribing}
              className="px-4 py-2 bg-[#FEC004] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#e6ac00] disabled:opacity-50 transition-colors"
            >
              {isSubscribing ? 'Подключение...' : 'Включить'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#252d3a] rounded-lg transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
