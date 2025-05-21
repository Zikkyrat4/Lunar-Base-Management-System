# Lunar Base Management System

## Описание проекта

Система управления лунной базой - современное веб-приложение для мониторинга и управления ресурсами, объектами и инфраструктурой лунной базы. Проект включает в себя:

- **Управление ресурсами**: Мониторинг уровня энергии, воды, кислорода и продовольствия
- **Картография**: Работа с геопространственными данными (GeoTIFF, Shapefile)
- **Объекты базы**: Размещение и управление различными типами объектов (жилые модули, исследовательские лаборатории, производственные цеха и др.)
- **Система уведомлений**: Оповещения о важных событиях и изменениях состояния базы
- **Аналитическая панель**: Визуализация ключевых показателей работы базы

## Технологический стек

- **Frontend**: React.js
- **Backend**: FastAPI
- **База данных**: PostgreSQL
- **Геоданные**: GeoServer
- **Хранилище файлов**: MinIO
- **Контейнеризация**: Docker

## Архитектура проекта

```
/frontend        # Клиентская часть приложения
/backend         # Серверная часть на FastAPI
/docker-compose.yml # Основной docker-compose файл
/nginx.conf      # Конфигурация Nginx
```

## Установка и запуск

### Предварительные требования:
1. Docker и Docker Compose
2. Минимум 4GB свободной RAM

### Шаги установки:

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Zikkyrat4/Lunar-Base-Management-System.git
cd Lunar-Base-Management-System
```
2. Установка зависимостей frontend:
```bash
cd frontend
npm install
cd ..
```

3. Запуска проекта
```bash
docker compose up -d --build
```

4. Дождитесь инициализации всех сервисов (может занять несколько минут):
```bash
docker-compose logs -f
```

5. Приложение будет доступно по адресу:
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/v1/docs
- GeoServer: http://localhost:8080/geoserver


## Функциональные возможности

### Поддерживаемые форматы карт:
- GeoTIFF (.tif, .tiff)
- Shapefile (.shp + дополнительные файлы)

### Максимальный размер загружаемых файлов:
- 50GB

### Основные API эндпоинты:
- `/api/v1/maps` - управление картами
- `/api/v1/objects` - управление объектами
- `/api/v1/resources` - мониторинг ресурсов
- `/api/v1/modules` - управление модулями

## Настройка окружения

| Переменная | Описание | Пример значения |
|------------|----------|-----------------|
| DATABASE_URL | Строка подключения к PostgreSQL | postgresql://user:password@db:5432/dbname |
| GEOSERVER_URL | URL GeoServer | http://geoserver:8080/geoserver |
| MINIO_ENDPOINT | Endpoint MinIO | minio:9000 |
| SECRET_KEY | Секретный ключ для JWT | случайная строка |
| ACCESS_TOKEN_EXPIRE_MINUTES | Время жизни токена | 1440 |


## Авторы

Sherlock team
