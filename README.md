# WOD курсач

Запуск:

1. Ставим зависимости `npm i`.
2. Создаем файлик .env и прописываем в нем: `TOKEN, host, port, username, password, database`. Посмотреть некоторые из них можно в `docker-compose.yml` в /docker.
3. Запускаем бд: `cd docker`, `sudo docker-compose up -d`.
4. Билдим сам проект `npm run build`.
5. Запускам проект `npm run start`.
