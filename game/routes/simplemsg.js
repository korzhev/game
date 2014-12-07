/**
 * Created by vladimir on 09.03.14.
 */
var logger = require('../helpers/logger'); // логгер

module.exports = function(clients, data, id) { // посылка в сокет сообщения одному клиенту
    clients[id]['ws'].send(JSON.stringify(data), { masked: true, binary: false }, function(err) { // уже объяснял =)
        if (err) {
            logger.error(err);
        } else {
            logger.log('SEND!');
        }
    });
};