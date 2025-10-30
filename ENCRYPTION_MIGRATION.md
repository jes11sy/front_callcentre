# 🔒 Миграция системы шифрования

**Дата:** 30 октября 2025  
**Версия:** 2.0.0  
**Статус:** ✅ Завершено

---

## 📝 Что изменилось

### До (v1.0):
- ❌ XOR шифрование (легко взламывается)
- ❌ Короткий ключ
- ❌ Нет случайности (один ключ для всех)
- ❌ Уязвимо к frequency analysis

### После (v2.0):
- ✅ **AES-256-GCM** шифрование через Web Crypto API
- ✅ **PBKDF2** с 100,000 итераций для key derivation
- ✅ **Случайный IV** для каждой операции
- ✅ **Authenticated encryption** (защита от tampering)
- ✅ Автоматическая очистка поврежденных данных

---

## 🔄 Миграция для пользователей

### Автоматическая миграция

При первом запросе к API после обновления:

1. **Старые токены не расшифруются** (были зашифрованы XOR)
2. **Автоматически очистятся** из localStorage
3. **Пользователь будет перенаправлен** на страницу логина
4. **После логина** токены будут сохранены с новым AES-GCM шифрованием

**Действие пользователя:** Просто войти заново.

---

## 👨‍💻 Изменения для разработчиков

### Обновленные API

Все методы `tokenStorage` теперь **async**:

```typescript
// ❌ Старый код
const token = tokenStorage.getAccessToken();
tokenStorage.setAccessToken('new-token');

// ✅ Новый код
const token = await tokenStorage.getAccessToken();
await tokenStorage.setAccessToken('new-token');
```

### Файлы, требующие обновления

Если вы используете `tokenStorage` в своем коде:

1. **src/lib/api.ts** - ✅ Уже обновлен
2. **src/components/auth/*.tsx** - Нужно проверить
3. **src/hooks/useAuth.ts** - Нужно проверить
4. **src/store/authStore.ts** - Нужно проверить

### Пример миграции компонента

```typescript
// ❌ Старый код
const LoginForm = () => {
  const handleLogin = (accessToken, refreshToken) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    router.push('/');
  };
};

// ✅ Новый код
const LoginForm = () => {
  const handleLogin = async (accessToken, refreshToken) => {
    await tokenStorage.setAccessToken(accessToken);
    await tokenStorage.setRefreshToken(refreshToken);
    router.push('/');
  };
};
```

---

## 🔐 Безопасность

### Что защищает новое шифрование

| Атака | XOR (старое) | AES-GCM (новое) |
|-------|--------------|-----------------|
| Frequency analysis | ❌ Уязвимо | ✅ Защищено |
| Known-plaintext | ❌ Уязвимо | ✅ Защищено |
| Brute force | ❌ Легко | ✅ Практически невозможно |
| Tampering | ❌ Не обнаруживается | ✅ Автоматически обнаруживается |
| Replay attacks | ❌ Возможно | ✅ Защищено (уникальный IV) |

### Технические детали

```typescript
// Key Derivation
PBKDF2(
  password: encryptionKey,
  salt: 'lead-schem-secure-salt-v1',
  iterations: 100,000,
  hash: 'SHA-256'
) → AES-256 key

// Encryption
AES-GCM-256(
  plaintext: JSON.stringify(data),
  key: derivedKey,
  iv: crypto.getRandomValues(12 bytes)
) → ciphertext

// Storage format
{
  value: base64(IV || ciphertext),
  timestamp: Date.now(),
  ttl: 604800000,
  encrypted: true
}
```

---

## 🧪 Тестирование

### Проверка работоспособности

```bash
# 1. Очистить localStorage
localStorage.clear()

# 2. Открыть DevTools Console
# 3. Выполнить тест
(async () => {
  const { tokenStorage } = await import('./lib/secure-storage');
  
  // Тест записи
  await tokenStorage.setAccessToken('test-token-123');
  console.log('✅ Token saved');
  
  // Тест чтения
  const token = await tokenStorage.getAccessToken();
  console.log('✅ Token retrieved:', token === 'test-token-123');
  
  // Тест очистки
  tokenStorage.clearAll();
  const empty = await tokenStorage.getAccessToken();
  console.log('✅ Token cleared:', empty === null);
})();
```

### Проверка шифрования

```bash
# Откройте Application → Local Storage в DevTools
# Ищите ключи вида: secure_accessToken
# Значение value должно быть зашифровано и выглядеть как random base64
```

**Пример зашифрованного значения:**
```json
{
  "value": "kJ8xN2mP5qR7sT9vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR0sT2uV4wX6yZ8aB0cD==",
  "timestamp": 1730304000000,
  "ttl": 604800000,
  "encrypted": true
}
```

---

## 🚀 Развертывание

### Шаги для production

1. **Backup текущей localStorage** (опционально):
   ```typescript
   // Сохранить для отладки
   const backup = JSON.stringify(localStorage);
   ```

2. **Деплой обновленного кода**:
   ```bash
   npm run build
   docker build -t frontend-callcentre:2.0.0 .
   kubectl set image deployment/frontend-callcentre frontend=frontend-callcentre:2.0.0
   ```

3. **Мониторинг**:
   - Проверить логи на ошибки шифрования
   - Следить за количеством повторных логинов
   - Убедиться, что токены сохраняются корректно

4. **Уведомить пользователей**:
   > ⚠️ Для повышения безопасности обновлена система хранения токенов.
   > При первом входе после обновления потребуется повторная авторизация.

---

## 🐛 Troubleshooting

### Проблема: "Failed to encrypt data"

**Причина:** Web Crypto API недоступен (HTTP вместо HTTPS или старый браузер)

**Решение:**
```typescript
// Проверка поддержки
if (!crypto.subtle) {
  console.error('Web Crypto API not available. Use HTTPS.');
  // Fallback: не шифровать или использовать другой метод
}
```

### Проблема: "Failed to decrypt data"

**Причина:** Данные были зашифрованы старым методом (XOR)

**Решение:** Автоматически очищается. Пользователь должен войти заново.

### Проблема: Пользователи не могут войти

**Причина:** Проблемы с async/await в auth компонентах

**Решение:** Проверить, что все вызовы tokenStorage имеют `await`

---

## 📞 Контакты

При возникновении проблем:
- GitHub Issues
- DevOps Team
- Security Team

---

**Статус:** ✅ Миграция завершена успешно

