# CRM Callcentre — Выполненные улучшения

> Анализ и рефакторинг фронтенда колл-центра.

---

## Выполнено

### 1. Удалён мессенджер Авито
- Удалена страница `/messages`
- Удалены все компоненты: `MessageList`, `ChatList`, `ChatHeader`, и т.д. (16 файлов)
- Удалены хуки: `useChats`, `useMessages`, `useSocketMessages`, `useAutoRefresh`, `useAvitoAccounts`, `useAvitoEternalOnline`, `useAvitoReviews`, `useAvitoProxyCheck`, `useAvitoModals`
- Удалены типы: `types/avito.ts`
- Удалены admin-компоненты: `AvitoAccountForm`, `AvitoToolsSection`, `AvitoStatsCards`, `AvitoAccountsTable`, `ReviewsModal`, `ProxyCheckModal`, `EternalOnlineModal`, `DeleteAccountDialog`
- Удалён `AvitoNotificationListener` из `SocketProviders`
- Очищены ссылки в `useStaticData`, `query-optimized`, `validation-schemas`, `api-client`, `types/index`

### 2. Глобальный поиск по клиенту
- Новый компонент `GlobalSearch` в sidebar
- Поиск по телефону, имени клиента — результаты по заказам, звонкам, заявкам с сайта
- Горячая клавиша `Ctrl+K` для быстрого открытия
- Debounce 400ms, минимум 3 символа
- Навигация к нужному разделу по клику на результат

### 3. Quick Actions (альтернатива горячим клавишам)
- FAB-кнопка (Floating Action Button) на мобильных устройствах
- Быстрый доступ к: поиску, телефонии, заказам, обращениям, заявкам, статистике, справочнику
- `Ctrl+K` на десктопе для глобального поиска

### 4. Вкладка "Звонки" в карточке заказа
- Уже была реализована в `OrderViewModal` (вкладка `calls`)
- Показывает все звонки по номеру клиента с возможностью прослушивания

### 5. Индикатор итога звонка в телефонии
- Добавлены поля `orderId` и `appealId` в тип `Call`
- В `CallRowV4` показывается бейдж "Заказ #N" (зелёный) или "Обращение" (фиолетовый)
- Оператор сразу видит, обработан ли звонок

### 6. Напоминания о перезвоне
- Новый хук `useCallbackReminder` — проверяет заявки со статусом "Перезвонить" каждые 60 секунд
- Показывает toast-уведомление когда наступает время перезвона
- Кнопка "Открыть" в уведомлении ведёт на страницу заявок

### 7. Рефакторинг CreateOrderModal
- Разбит на подкомпоненты: `CallHistoryPanel`, `OrderHistoryPanel`, `AudioPlayerBar`
- Основной компонент уменьшен с ~960 строк до ~350
- Убрано дублирование поля РК (было 2 раза)
- Вынесены утилиты форматирования

### 8. Единая пагинация
- Страница site-orders переведена на `OptimizedPagination`
- Компонент `OptimizedPagination` уже используется в телефонии и заказах

### 9. Исправлен баг CallPushListener
- `isPushSubscribed` заменён на `isSubscribed: isPushSubscribed` (деструктуризация с алиасом)
- Теперь логика "не дублировать уведомления при включённом push" работает корректно

### 10. Стандартизация API
- Удалён `chatsApi` из `api-client.ts` (Авито удалён)
- Удалён `createFromChat` из `ordersApi`
- Удалён импорт `CreateOrderFromChatData`

### 11. Удалены дубликаты
- Удалён `useGroupedCalls.ts` — дублировал `useCallsData`, нигде не использовался
- Удалён `secure-storage.ts` — legacy, нигде не импортировался; `remember-me.ts` — актуальный backup storage

---

## Структура новых файлов

```
src/
├── components/
│   ├── layout/
│   │   ├── GlobalSearch.tsx          — глобальный поиск (Ctrl+K)
│   │   ├── QuickActions.tsx          — FAB для мобильных
│   │   └── DashboardLayout.tsx       — обновлён (callback reminder)
│   └── telephony/
│       └── create-order/
│           ├── CallHistoryPanel.tsx   — панель истории звонков
│           ├── OrderHistoryPanel.tsx  — панель истории заказов
│           ├── AudioPlayerBar.tsx     — аудиоплеер
│           └── index.ts              — barrel export
└── hooks/
    └── useCallbackReminder.ts        — напоминания о перезвоне
```

---

## Что осталось (бэкенд)

| Задача | Описание |
|--------|----------|
| `orderId` / `appealId` в звонках | Бэкенд должен возвращать `orderId` и `appealId` в ответе `/calls/grouped` |
| Endpoint `/orders?search=` | Должен поддерживать поиск по телефону и имени |
| Endpoint `/calls?search=` | Должен поддерживать поиск по номеру |
| Endpoint `/site-orders?search=` | Должен поддерживать поиск по телефону и имени |
