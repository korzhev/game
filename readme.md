# README к части NODE.JS игры "Гонки разума"
---

## Общее

Не до конца реализованный проект игры. Сервер отвечает за реалтаймовую составляющую игры.

Сервера запускаются командой ```node server.js```
___
## Структура
* **game/** - папка с игровым сервером
	- **config.json** - файл конфигурации, все константы в нём
	- **package.json** - файл с данными о приложении, там же список зависимостей
	- **server.js** - главное приложение
	- **node_modules/** - папка с установленными модулями
	- **logs/** - папка с логами
		* **stream.log** - логи
___
## Модули
- **[ws]** - чистые вебсокеты
- **[supervisor]** - автоперезапуск проекта, как в джанго(нужно только для разработки и не обязательно, ставится глобально с влагом *-g*, проект запускать ```supervisor server.js``` )
- **[underscore]** - полезные обёртки
- **[async]** - управление асинронными функциями
- **[pg]** - чистый драйвер для PostgeSql / если надо заменю на ORM
- **[guid]** - генератор/валидатор уникальных ключей. [GUID wiki]
- **[tracer]** - отличный логгер с уровнями и транспортом
- **[request]** - хороший http клиент
___
## Команды
- ```
npm i <имя пакета> --save
``` установить пакет, флаг *--save* автоматически запишет информацию о пакете в **package.json**
- ```npm i``` установить все зависимости
__
## Полезно
Полезно почитать:
- [websockets] - Вебсокеты

[websockets]:http://learn.javascript.ru/websockets
[ws]:https://github.com/einaros/ws
[supervisor]:https://github.com/isaacs/node-supervisor
[underscore]:http://underscorejs.org/
[async]:https://github.com/caolan/async
[pg]:https://github.com/brianc/node-postgres
[guid]:https://github.com/dandean/guid
[GUID wiki]:http://ru.wikipedia.org/wiki/GUID
[tracer]:https://github.com/baryon/tracer
[request]:https://www.npmjs.org/package/request