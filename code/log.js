var log4js = require('log4js');

log4js.configure({

    appenders: [
        {
            type: 'console'

        }, //控制台输出
        {
            type: "dateFile",
            filename: '../console-logs/',
            pattern: "yyyyMMddhh.txt",
            alwaysIncludePattern: true,
            maxLogSize: 20480,
            category: 'console'

        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels:{
        console: 'debug'
    }
});


var consoleLog = log4js.getLogger('console');
exports.logger = consoleLog;
exports.use = function(app) {
    app.use(log4js.connectLogger(consoleLog, {level:'INFO', format:':method :url'}));
}
