// Зависимости из NodeModules
var WebSocketServer = require('ws').Server, // библиотека для работы с вебсокетами, импорт сокет сервера
    _ = require('underscore');      // клиент/серверная библиотека, куча полезных обёрток, доки на сайте библиотеки


// Зависимости из проекта
var config = require('./config')    // Конфигурация проекта, файл config.json
    , routes = require('./routes')  // Роуты, в зависимости от входящего сообщения, выполняет действия
    , logger = require('./helpers/logger')  // отличный логгер, включил окраску в консоли, модифийировал
    , helper = require('./helpers') // вспомогательные функции
    ;


// Глобальные переменные
var wsServer = new WebSocketServer({port:config.websock.port})  // Создаём сервер сокетов, слушает localhost:8000
    , clients = {}  // Объект содержащий объекты всех подключённых пользователей
    , Game = require('./gameController').Game
    ;

// Подключение
routes.listen();    // Включаем события в роутах
logger.info('WS server is up & running');

// Приложение


var Guid = require('guid');         // генератор/валидатор уникальных ключей


wsServer.on('connection', function(ws) {    // Обработка события "подключение к серверу"
    var userGuid = Guid.create(),           // создаём уникальный идентификатор для пользователя
        id = userGuid.value;                // вида '6fdf6ffc-ed77-94fa-407e-a7b86ed9e59d'
    clients[id] = Game.playerEntersTheGame({ ws: ws, id: id, pid:undefined });  // запоминаем пользователя, и сохраняем его соединение в объекте, не уверен, что так и останется

    // События
    ws.on('message', function(message) {    // Обработка события "новое сообщение"
        logger.warn(message);
        // routes.run(clients, JSON.parse(message), id);// передаём обработку собственных событий роутам

        // Обработка событий от клиентов главным контроллером приложения
        message = JSON.parse(message);
        Game.handleClientEvent(clients[id], message);
    });

    ws.on('error', function(err){           // Обработка события "ошибка"
        logger.error('ERROR: %s', err);
        ws.close(1003, err);                // разрываем соединение пользователя, со статусом ошибки 1003
        clients[id] = null;
        delete clients[id];
        // clients[id].ws.terminate();      // как ещё можно получить соединение
    });

    ws.on('close', function(){  // Обработка события "закрытие соединения"
        logger.info('closed');
        clients[id] = null;
        logger.trace(id);
        delete clients[id];     // удаляем пользователя из соединений
    });

    ws.on('pong', function (data, flags) {  // Обработка события "понг", приходит от клиента, браузер сам это отправляет.
        if (data.toString('utf-8') != 'ping') { // проверям тели данные вернул браузер
            ws.terminate();                     // обрываем соединение если неверные
            clients[id] = null;
            delete clients[id];
        } else {
            logger.trace('pong');
            helper.pingPong(ws); // Отправка "пинг". Это для того что бы всякие фаирфоксы не обрывали
        }
    });

    ws.ping('ping',{ masked: true, binary: true }, true);   // начинаем пинговать клиент при подключени
                                                            // , параметры объяснены в других местах
});

wsServer.on('error', function(err){    // Обработка события "ошибка СЕРВЕРА"
    logger.error('ERROR SERVER: %s', err);
});

wsServer.on('headers', function(headers){   // Обработка события "получение заголовков".
    logger.log('HEADERS: %s', headers);    // Событие чисто из любопытства.
});