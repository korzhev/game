// Зависимости из NodeModules
var logger = require('./logger');  // логгер
var _ = require('underscore');

var broadcast = function (clients, data) {  // Функция рассылки сообщения всем. clients - кому рассылаем,
    var keys = _.keys(clients),        // data - что рассылаем JSON.
        count = keys.length;                // Такой формат цикла обусловлен его скоростью,
    var i;                                  // при большом количестве элементов он быстрее чем
    var msg = JSON.stringify(data);
    for (i=count; --i >= 0; ) {              // forEach.
        clients[keys[i]]['ws'].send(
            msg,                           // masked: true - данные под маской, для защиты
            { masked: true, binary: false },// binary: false - данные передаются строкой
            function(err) {                 // колбэк при отправке, возможно не обязателен
                if (err) {                  // обработка ошибки при отправке
                    logger.error(err);
                } else {
                    logger.log('BROADCAST!');
                }
            }
        );
    }
};


var pingPong = function (ws) {  // Функция пинга. Для того, что бы соединение не закрывалось для простоя
    var timer = setTimeout(     // вызывается раз в 30 секунд
        function(){
            ws.ping('ping',{ masked: true, binary: true },true);    // пингуем. последний параметр, игнорирует ошибку
            clearTimeout(timer);                                    // закрытия соединения. Не разобрался до конца.
        }
        ,30000
    );
    timer.unref();  // Информируем, что таймер не блокирует процесс, подробнее в скринкасте ноды
};


Helper = function () { // Объект помошник
    return {
        broadcast: broadcast,
        pingPong: pingPong
    };
};

module.exports = Helper(); // экспрот данных