var db = require('../wrapperDB').client,
    routes = require('../routes'),
    logger = require('../helpers/logger'),
    getLoot = require('../loot'),
    config = require('../config'),
    lootService = config.lootService,
    roomPlayersMap = config.roomPlayersMap,
    async = require('async');
// Класс игровой "комнаты"
// По наполнению комнаты инициирует начало игры
// Получение текущего вопроса для комнаты
// определение верного ответа
var Room = function(options) {
  // Игроки в комнате
  this.players = [];
  var options = options || {};
  // Тип комнаты
  // basic|duel|team
  this.type = options.room_type || 'basic';

  // Число игроков в комнате в зависимости от её типа

  this.fullRoom = roomPlayersMap[this.type];    // basic - 5, duel - 2, team - 4

  // Заполнена ли
  this.is_full = false;


  // Количество ответов пользователей
  this.answers = {};
  // Время начала игры
  this.startTime = Date.now();
}

// Добавление игрока в комнату
Room.prototype.add = function(player) {
  player.room = this;
  this.players.push(player);
  this.answers[player.id] = 0;
  // Если комната заполнена - инициируем событие начала игры
  if (this.players.length == this.fullRoom) {
    this.is_full = true;
    this.startGame();
  }

  return this;
}

// Добавление игроку информации о продожительности игры
Room.prototype.getGameTime = function(item, i, arr) {
  var gameDuration = Math.round((this.startTime - Date.now())/1000); // пересчитываем в секунды
  item.currentGameData.time = gameDuration;
  return;
}

Room.prototype.getNextQuestion = function() {
  var room = this;
  // Получение вопроса из базы данных
  // и составление объекта для отправки на клиент
  var timer = setTimeout(function() {
    db.get_question(function(err, question) { 
      if (err) {
        logger.warn('DB error:', err); // Возникла ошибка с БД, надо прекратить игру, разрушить комнату
      } else {
        logger.log('Question#', question.id, 'answer:', question.answer);
        room.currentQuestion = { statement: question.question_text
          , possibleLetters: room.possibleLetters(question.answer)
          , answerLettersCount: question.answer.length
        };
        // Ответ никуда не отправляем, нужен для проверки
        room.currentAnswer = question.answer;

        // Добавляем игрокам инфу, что они увидели новый вопрос
        room.players.forEach(
          function(item, i, arr){
            item.currentGameData.qCount++;
        });

        // Отправляем текущий вопрос для всех в комнате
        routes.run(room.players, { "event": "next_question"
          , "question": room.currentQuestion });
      }
    });
    clearTimeout(timer);
  }, config.nextQuestionTimer*1000);
}


// Получен правильный ответ на текущий вопрос
Room.prototype.gotRightAnswer = function(player, data) {
  this.answers[player.id] = player.gaveRightAnswer();
  // Проверка - есть ли победитель в заезде
  // Победитель есть, ответил правильно на лимит вопросов
  logger.log(this.answers);
  if (this.answers[player.id] == 2) {
    this.gameEnd(player);
  } else {
    // ответ верный
    data['is_right'] = true;
    // Ид правильно ответившего
    data['winner'] = player.id;
    // Тип события - конец круга, для начала нового на клиенте
    data['event'] = 'got_right_answer';

    // Событие для всех пользователей в комнате
    routes.run(this.players, data, player.id);
    this.getNextQuestion();
  }
}


// Проверка ответа пользователя
Room.prototype.checkAnswer = function(player, data) {
  // Ответные данные в событие (для пользователей)

  // Ответ неверный
  if (data.answer !== this.currentAnswer) {
    // пишем, что неверный
    data['is_right'] = false;
    data['event'] = 'got_wrong_answer';
    // Событие отправляется только текущему пользователю
    // Отправляем событие в колбэке
    routes.run(player, data, player.id);
  } else {
    this.gotRightAnswer(player, data);
  }
  
}

// Возможные буквы для ответа пользователя
// Содержат все буквы из правильного ответа
Room.prototype.possibleLetters = function(answer) {
  // var possible = 'абвгдеёжзиклмнопрстуфхцчшщъыьэюя';
  var possible = ['а','б','в','г','д','е','ё','ж','з'
      ,'и','й','к','л','м','н','о','п','р','с','т','у'
      ,'ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];
  // possibleLength = 33
  var letters = answer.split('');
  for (var i=letters.length; i<12; i++) {
      l = possible[Math.floor(Math.random() * 33)];
      letters.push(l);
    }
  
  letters.sort(function(item) { return Math.floor(Math.random() * 2 - 1); })
  return letters;
}

// Начало игры. Рассылаем всем пользователям 
// в комнате соответствующее событие
Room.prototype.startGame = function() {
  // var room = this;

  routes.run(this.players, { 'event': 'game_started' });

  this.getNextQuestion();

  //this.players.map()
}


// Заезд закончился - отправляем всем результаты
Room.prototype.gameEnd = function(winner) {
  routes.run(this.players, { event: 'game_ended', winner: winner.id }, null);
  var room = this;
  winner.currentGameData.wCount++;
  async.series(
    [
      function (callback) {
        var timeNow = Date.now();
        room.players.forEach(
          function(item, i, arr){
            var gameDuration = Math.round((room.startTime - timeNow)/1000); // пересчитываем в секунды
            item.currentGameData.time = gameDuration;
            item.currentGameData.gCount++;
        }); // всем игрокам устанавливаем время проведённое в игре
        
      },
      function (callback) {
        // запрос на подсчёт ачивок
        async.each(
          room.players,
          function(player, callback2){
            getLoot(lootService.achieves, player, false, callback2);
          },
          function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null, true);
            }
          }
        )
      },
      function (callback) {
        // запрос на подсчёт ачивок
        async.each(
          room.players,
          function(player, callback2){
            getLoot(lootService.exp, player, false, callback2);
          },
          function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null, true);
            }
          }
        )
      },
      function (callback) {
        // запрос на подсчёт ачивок
        async.each(
          room.players,
          function(player, callback2){
            getLoot(lootService.money, player, false, callback2);
          },
          function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null, true);
            }
          }
        )
      },
    ],
    function(err, result) {
      if (err) {
        logger.error(err);
      }
      room.destroy();
      // Возможно дисконект игроков
    }
  );
  
}

// Удаление комнаты после окончания игры
Room.prototype.destroy = function() {
  var room = this;
  async.each(
    room.players,
    function(player, callback){
      player.destroy();
    },
    function(err) {
      if (err) {
        logger.error(err);
      }
    }
  );
  delete this;
}

module.exports = Room;