# Инструкция по деплою

## Настройка GitHub Secrets

GitHub узнает о твоем Docker Hub через секреты, которые ты настроишь. Вот как это работает:

### Как GitHub узнает о твоем Docker Hub?

В файле `.github/workflows/docker-deploy.yml` есть строка:
```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository }}
```

- `REGISTRY: docker.io` - указывает на Docker Hub
- `IMAGE_NAME: ${{ github.repository }}` - использует название твоего GitHub репозитория

Например, если твой репозиторий называется `username/frontend-callcentre`, то образ будет загружен как `docker.io/username/frontend-callcentre`

### Настройка секретов:

1. Перейди в Settings → Secrets and variables → Actions твоего репозитория
2. Добавь следующие секреты:

### DOCKER_USERNAME
- Твой username в Docker Hub (например: `marta123`)

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
docker run -p 3001:3001 your-username/frontend-callcentre
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
- Проверь, что порт 3001 свободен
- Убедись, что все переменные окружения настроены
