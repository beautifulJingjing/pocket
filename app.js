"use strict";

global.host = 'http://mt.ringbox.cn/';
// global.host = 'http://localhost:/';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var RedisStore = require('connect-redis')(session);
var log1 = require('./code/log');
var logger = require('./code/log').logger;
var domain = require('domain');
var alipayconfig = require('./code/payment-modules/alipay_config');
var wxpayconfig = require('./code/payment-modules/wxpay_config');
var app = express();
var cacheconfig=require('./cacheconfig.json')




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(function (req, res, next) {
  var reqDomain = domain.create();
  reqDomain.on('error', function (err) {  // 下面抛出的异常在这里被捕获,触发此事件
    console.log('捕获到错误');
    res.send(500, err.stack);           // 成功给用户返回了 500
  });
  reqDomain.run(next);
});

process.on('uncaughtException', function (err) {
  console.error("uncaughtException ERROR");
  if (typeof err === 'object') {
    if (err.message) {
      console.error('ERROR: ' + err.message)
    }
    if (err.stack) {
      console.error(err.stack);
    }
  } else {
    console.error('argument is not an object');
  }
});

app.use(function(req,res,next){
    var url= req.path
    var arr = url.split('.');
    var len = arr.length;
    var append= arr[len-1]
    console.log(append)
    var isExist=false
    for (var attr in cacheconfig) {
        if(append==attr)
        {isExist=true
            res.setHeader('Cache-Control', 'public,max-age='+cacheconfig[attr] );
        }
    }
    if (!isExist)
    {
        res.setHeader('Cache-Control', 'public,max-age='+cacheconfig['default'] );
    }
    next()
})

log1.use(app);
app.use('/wxpay', bodyParser.text({type: '*/*'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//if (process.env.NODE_ENV === 'development') {


app.use(session({
    name: 'sessionid',
    secret:'000',
    resave: false,
    saveUninitialized: false
}));
//app.use(session({
//    name: 'sessionid',
//    secret:'000',
//    store:new RedisStore({host:'127.0.0.1',port:6379}),
//    resave: false,
//    saveUninitialized: false
//}));
app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error('can not connect redis')) ;// handle error
  }
  next() ;// otherwise continue
});

//}
//else{
//  var AceSessionStore = global.MemcachedStore(session);
//  app.use(session({
//    key: 'sessionid',
//    store: new AceSessionStore({
//      prefix: 'ringbox'
//    }),
//    secret: '000'
//  }));
//}

//声明全局
global.extend = require('util')._extend;
global.CONST = {
  SPINFOCODE: '00000550471',
  PHONE_REGEX: new RegExp('^1\\d{10}$'),
  UNICOM_PHONE_REGEX: new RegExp('^((13[0-2])|145|(15[5|6])|176|(18[5|6]))\\d{8}$'),
  TELCOM_PHONE_REGEX: new RegExp('^(133|153|177|173|(18[0|1|9]))\\d{8}$'),
  MOBILE_PHONE_REGEX: new RegExp('^((13[4-9])|147|(15[0|1|2|7|8|9])|178|(18[2|3|4|7|8]))\\d{8}$'),
  _MOBILE_PHONE_REGEX: new RegExp('^((13[4-9])|147|(15[0|1|2|7|8|9])|178|(18[2|3|4|7|8]))')
};


var index = require('./routes/index');
var mindex = require('./routes/m-index');
var download = require('./routes/download');
var payment = require('./routes/payment');

app.use('/', index);
app.use('/m', mindex);
app.use('/download', download);
app.use('/unipay/pay', payment);

var config = require('./routes/proxy/config');
var proxy = require('./routes/proxy/proxy');
var comkey = require('./routes/proxy/comkey');
var log = require('./routes/proxy/log');
var audition = require('./routes/proxy/audition');

app.use('/config', config);
app.use('/proxy/v3', proxy, comkey, log, audition);
alipayconfig.alipay.route(app);
wxpayconfig.wxpay.route(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

