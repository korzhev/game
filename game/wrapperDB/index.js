var logger = require('../helpers/logger'),
    configPG = require('../config').postgre, // импортируем уже готовый конфиг базы
    reload = require('../helpers/reloader'), // число вопросов в БД
    util = require('util'), // вспомогательные функции
    pg = require('pg');

    var liveConfig = reload('../liveConfig', './liveConfig.json');

function getRandomInt(max){     // получение случайного id вопроса 
  return Math.floor(Math.random() * (max - 2)) + 1;
}

var DB = {
  init: function() {

    DB.client = new pg.Client(configPG);  // соединение с БД
    DB.client.connect();
    return DB;

  },

  get_question: function(callback) {
    var quizeID = getRandomInt(liveConfig.quizeCount);
    var query_string = util.format(
      "select id, question_text, answer from asks_question WHERE id=%s AND status=2;", 
      quizeID
      );
    DB.client.query(query_string, function(err, result) {
      if (err) {
        logger.error('Error get question!: %s', err);
          callback(err); // при ошибке запроса передаём ошибку дальше
        } else {
          if (result.rows.length>0){
            callback(null, result.rows[0]);
          } else {    // при отсутствии активного вопроса с таким id повторяем операцию.
            logger.log('NO ACTIVE QUIZE ID=%s', quizeID);
            DB.get_question(callback);
          }
        }
      });
  }

}

exports.client = DB.init();