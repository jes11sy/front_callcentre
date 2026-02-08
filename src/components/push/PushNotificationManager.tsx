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
            ? 'text-green-500 hover:bg-green-500/10' 
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
    <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg
            ${isSubscribed 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-gray-500/10 text-gray-500'
            }
          `}>
            {isSubscribed ? <BellRing size={24} /> : <BellOff size={24} />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
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
                : 'bg-blue-500 text-white hover:bg-blue-600'
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
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
          <p className="font-medium mb-1">Уведомления заблокированы</p>
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
                  w-10 h-6 rounded-full transition-colors relative
                  ${settings.callIncoming 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <span className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${settings.callIncoming ? 'left-5' : 'left-1'}
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
                  w-10 h-6 rounded-full transition-colors relative
                  ${settings.callMissed 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <span className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${settings.callMissed ? 'left-5' : 'left-1'}
                `} />
              </button>
            </label>
          </div>

          {/* Тестовое уведомление */}
          <button
            onClick={sendTestNotification}
            className="mt-4 w-full py-2 text-sm text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
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
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-[#1e2736] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <Bell size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            Включить уведомления?
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Получайте уведомления о входящих и пропущенных звонках, даже когда вкладка закрыта
          </p>
          <div className="flex gap-2">
            <button
              onClick={subscribe}
              disabled={isSubscribing}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubscribing ? 'Подключение...' : 'Включить'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-500 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
