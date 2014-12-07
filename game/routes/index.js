// Зависимости из NodeModules
var EE = require('events').EventEmitter;    // ивентэмиттер, для обработки событий, создание/прослушка
var logger = require('../helpers/logger');  // логгер


// Функции обработки событий
var simpleMsg = require('./simplemsg')      // отправка простого сообщения
    , broadcastMsg = require('./broadcast')
    ;
// здесь импортируем новые функции по мере появвления


var emitter = new EE; // Объект эмиттера


var listen = function() {   // функции прослушки
    emitter.on('error', function(){console.log('EE error!')}); // слушаем событие ошибки

    emitter.addListener('simple', function(clients, data, id){   // добавляем слушателя на простое сообщение
        simpleMsg(clients, data, id);
    });

    emitter.addListener('broadcast', function(clients, data, id){   // добавляем слушателя на массовую рассылку
        broadcastMsg(clients, data, id);
    });

    // здесь добавляем новые события на прослушку

    emitter.addListener('game_started', function(clients, data, id) {
        broadcastMsg(clients, data);
    });

    emitter.addListener('next_question', function(clients, data, id) {
        broadcastMsg(clients, data);
    });

    // Получен неправильный ответ от пользователя
    // Возвращаем ему данные, что он ответил неправильно
    emitter.addListener('got_wrong_answer', function(client, data, id) {
        client.ws.send(JSON.stringify(data)
                , { masked: true, binary: false }, function(err) { 
            if (err) {
                logger.error(err);
            } else {
                logger.log('SEND!');
            }
        });
    });

    // Получен неправильный ответ от пользователя
    // Возвращаем ему данные, что он ответил неправильно
    emitter.addListener('got_right_answer', function(clients, data, id) {
        for (var i = 0; i < clients.length; i++) {
            clients[i].ws.send(JSON.stringify(data)
                    , { masked: true, binary: false }, function(err) { 
                if (err) {
                    logger.error(err);
                } else {
                    logger.log('SEND!');
                }
            });
        }
    });


    // Событие окончания игры
    emitter.addListener('game_ended', function(clients, data, id) {
       for (var i = 0; i < clients.length; i++) {
        clients[i].ws.send(JSON.stringify(data)
            , { masked: true, binary: false }, function(err) {
                 if (err) {
                    logger.error(err);
                } else {
                    logger.log('SEND!');
                }
            });
       }
    });
};

var run = function(clients, data, id) {  // функция генерации ошибки. id - guid, data - данные в JSON, clients - клиенты
    emitter.emit(data.event, clients, data, id); // data.event - тип события, event - обязательный аттрибут данных
}

Router = function () { // Объект роутер
    return {

        listen: listen,
        run: run
    };
};

module.exports = Router(); // экспрот данных