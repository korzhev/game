/**
 * Created by vladimir on 09.03.14.
 */
var config = require('../config').logger,
    fs = require('fs');

var ConfigObj = config.toFile ? {
    level: config.level,
    format : "{{timestamp}} <{{title}}> {{message}} (in {{path}} | {{file}}:{{line}})",
    transport: function(data) {
        console.log(data.output);
        // var stream = fs.createWriteStream("./logs/stream.log", {
        //     flags: "a",
        //     encoding: "utf8",
        //     mode: 0666
        // }).write(data.output+"\n");
    }
} : {
    level:config.level
};

var logger = require('tracer').colorConsole(ConfigObj);

module.exports = logger;