# Первичное развертывание
### Бэк

- `py -3.8 -m venv .venv`
- `.venv\Scripts\activate`
- ` py -m pip install -U pip`
- `pip install -e .`
- создать папку `/API/certs/` с файлами для ключей `jwt_private.pem` | `jwt_public.pem`
- настроить `ALLOWED_ORIGINS=["Список клиентских доменов"]` в `./config/path_config.py`
- `cd API`
- `py db.py`

### Фронт

 - `npm i`
 - В `src/config/api.constants.ts` установить `baseURL = "URL вашего сервера"` 

## Очистка БД

- удалить файл `my_database.db`
- `py db.py`

# Запуск

### Бэк 

- `py main.py`

### Фронт

 - `npx vite`