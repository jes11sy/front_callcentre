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
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    subscribe, 
    isSubscribing, 
    isIOSPWARequired,
    error,
    isLoading,
  } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Проверяем localStorage при монтировании
  useEffect(() => {
    const wasDismissed = localStorage.getItem('push-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  // Обёртка для subscribe с отслеживанием состояния
  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      await subscribe();
    } finally {
      // Даём время на обработку
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  // Показываем инструкцию для iOS если нужно установить PWA
  if (isIOSPWARequired && !dismissed) {
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
              Установите приложение
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Для получения уведомлений на iPhone/iPad:
            </p>
            <ol className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1 list-decimal list-inside">
              <li>Нажмите кнопку «Поделиться» <span className="inline-block w-4 h-4 align-middle">⎙</span></li>
              <li>Выберите «На экран Домой»</li>
              <li>Нажмите «Добавить»</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#252d3a] rounded-lg transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ждём загрузки
  if (isLoading) {
    return null;
  }

  // Не показываем если:
  // - Не поддерживается
  // - Уже подписан
  // - Разрешение denied (уже отклонено в браузере)
  // - Баннер был закрыт
  if (!isSupported || isSubscribed || dismissed || permission === 'denied') {
    return null;
  }

  // Показываем баннер только если permission === 'default' или 'granted' но не подписан
  const showBanner = permission === 'default' || (permission === 'granted' && !isSubscribed);
  if (!showBanner) {
    return null;
  }

  const buttonDisabled = isSubscribing || isProcessing;
  const buttonText = isSubscribing 
    ? 'Подключение...' 
    : isProcessing 
      ? 'Обработка...' 
      : 'Включить';

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-[#1e2530] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in slide-in-from-bottom-4 font-myriad">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        disabled={buttonDisabled}
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
          
          {/* Показываем ошибку если есть */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleSubscribe}
              disabled={buttonDisabled}
              className="px-4 py-2 bg-[#FEC004] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#e6ac00] disabled:opacity-50 disabled:cursor-wait transition-colors flex items-center gap-2"
            >
              {buttonDisabled && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {buttonText}
            </button>
            <button
              onClick={handleDismiss}
              disabled={buttonDisabled}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#252d3a] rounded-lg transition-colors disabled:opacity-50"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
