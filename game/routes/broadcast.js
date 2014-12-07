/**
 * Created by vladimir on 09.03.14.
 */
var logger = require('../helpers/logger')   // логгер
    , helper = require('../helpers')        // вспомогательные функции
;

module.exports = function(clients, data, id) { // экспорт данных
    helper.broadcast(clients, data);
};