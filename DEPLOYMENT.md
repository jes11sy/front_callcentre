# Инструкция по деплою

## Настройка GitHub Secrets

Для автоматического деплоя в Docker Hub необходимо добавить следующие секреты в настройках репозитория GitHub:

1. Перейди в Settings → Secrets and variables → Actions
2. Добавь следующие секреты:

### DOCKER_USERNAME
- Твой username в Docker Hub

### DOCKER_PASSWORD
- Твой password или access token в Docker Hub

## Создание Access Token в Docker Hub

1. Зайди в Docker Hub
2. Перейди в Account Settings → Security
3. Создай новый Access Token
4. Скопируй токен и используй его как DOCKER_PASSWORD

## Локальная сборка и тестирование

### Сборка Docker образа
```bash
docker build -t your-username/frontend-callcentre .
```

### Запуск контейнера
```bash
docker run -p 3000:3000 your-username/frontend-callcentre
```

### Использование docker-compose
```bash
docker-compose up -d
```

## Автоматический деплой

После настройки секретов, при каждом push в ветку `main` или `master`:

1. GitHub Actions автоматически соберет Docker образ
2. Образ будет загружен в твой Docker Hub репозиторий
3. Будут созданы теги: `latest`, `main`, и тег с SHA коммита

## Теги образов

- `latest` - последняя версия из main ветки
- `main` - версия из main ветки
- `{branch}-{sha}` - версия с конкретным коммитом

## Мониторинг

Проверь статус сборки в разделе Actions твоего GitHub репозитория.

## Проблемы и решения

### Ошибка авторизации в Docker Hub
- Проверь правильность DOCKER_USERNAME и DOCKER_PASSWORD
- Убедись, что используешь Access Token, а не пароль

### Ошибка сборки
- Проверь, что Dockerfile корректен
- Убедись, что все зависимости указаны в package.json

### Ошибка запуска контейнера
- Проверь, что порт 3000 свободен
- Убедись, что все переменные окружения настроены
