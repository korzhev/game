var Room = require('./room'),
    Player = require('./player'),
    util = require('util'),
    db = require('../wrapperDB').client;

// Статический класс игры
var Game = {
  init: function() {
    // Игровые комнаты
    Game.rooms = [];

    return Game;
  }

  // Получение комнаты. Если нет идентификатора - то последняя
  // Если последняя заполнена - то создаётся новая и добавляется в список
  , getRoom: function(roomId) {
    if (!roomId) {
      if (Game.rooms.length != 0 && !Game.rooms[Game.rooms.length-1].is_full) {
        return Game.rooms[Game.rooms.length-1];
      } else {
        var r = new Room();
        Game.rooms.push(r);

        return r;
      }
    } else {
      // Получение комнаты по идентификатору
    }
  }
  // Игрок заходит в игру - включаем его в последнюю комнату
  , playerEntersTheGame: function(options) {
    var player = new Player(options);
    // Добавляем пользователя в комнату
    Game.getRoom().add(player);

    return player;
  }

  , handleClientEvent: function(player, data) {
    switch (data.event) {
      case 'check_answer':
        player.room.checkAnswer(player, data);
        break;
      case 'auth': // получаем сообщение с кукой
        var query_string = util.format(
          "SELECT session_data FROM django_session WHERE session_key=%s;", 
          data.cookie
          );
        DB.client.query(query_string, function(err, result) { // достаём id пользователя на основе куки
          if (err) {
            logger.error('Error get USER by cookie!: %s', err);
              // callback(err); // при ошибке запроса передаём ошибку дальше
            } else {
              if (result.rows.length>0){
                player.pid = parseInt(result.rows[0]['session_data'].split(':')[3]); // устанавливаем пользователю id из БД
              } else {    // при отсутствии активного вопроса с таким id повторяем операцию.
                logger.log('NO user with data= %s', data);
                player.destroy()
              }
            }
          });
        break;
        // здесь другие типы событий от пользователя
    }
  }
}


exports.Game = Game.init();