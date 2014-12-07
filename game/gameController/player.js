
var Player = function(options) {
  this.ws = options.ws;
  this.room = null;
  // this.answers = 0;
  this.place = 0;
  this.id = options.id;
  this.pid = options.pid; // id пользователя из БД
  this.currentGameData = { // данные за конкретную игру, необходимы для подсчёта ачивок
    qCount:0,
    aCount:0,
    time:0,
    gCount:0,
    wCount:0
  };

}

Player.prototype.gaveRightAnswer = function() {
  return ++this.currentGameData.aCount;
  //return ++this.answers;
}


Player.prototype.destroy = function() {
  this.ws.close();
  delete this;
}

module.exports = Player;