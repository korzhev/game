var fs = require('fs'),
    logger = require('./logger');  // логгер

module.exports = function(modulename, versionfile) {
    var mymodule = require(modulename);
    fs.openSync(versionfile, 'r');
    fs.watchFile(versionfile, function (current, previous) {
        if (current.mtime.toString() !== previous.mtime.toString()) {
            logger.info('reloading module:' + modulename);
            delete require.cache[require.resolve(modulename)];
            mymodule = require(modulename);
        }
    });
    return mymodule;
};