var request = require('request'),           //простой и удобный клиент для http запросов
  querystring = require('querystring'),   // модуль для преобразования объектов/строк
  logger = require('../helpers/logger');


var getLoot = module.exports = function(loot, player, modeAsync, callback) {
  var ws = player.ws;
  var options = {
    url:
      'http://' 
      + loot.host
      + ':'
      + loot.port
      + loot.url    // формируем адрес запроса
    , body: JSON.stringify(player.currentGameData)                // строка параметров из объекта
    , json: true
  };
  console.log(options.body);
  request.post(options, function(err, response, body) {
    if (err) {                                      // обработка ошибки если проблемы с соединеним
      logger.error('ERROR LOOT REQUEST: %s', err);
      callback(err);
    } else {
      if (modeAsync) {
        ws.send(body, { masked: true, binary: false },
            function(err) {                 
                if (err) {                  
                    logger.error(err);
                } else {
                    callback();
                }
            }
        );
      } else{
        callback(null, body);
      }
      
    };
  });
}



// usage
//
// var date = new Date();
// getloot('money', {
//     "1":{ 'answers': 8}
//     , "2":{ 'answers': 7}
//   }
//   , function(err, response) {
//     logger.log(arguments, 'time:', new Date() - date);
// });
// date = new Date();
// getloot('exp', {
//     "1":{ 'answers': 8}
//     , "2":{ 'answers': 7}
//   }
//   , function(err, response) {
//     logger.log(arguments, 'time:', new Date() - date);
// });