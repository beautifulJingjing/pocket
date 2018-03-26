/**
 * 日志
 */
"use strict";

var signature = require('express-session/node_modules/cookie-signature');
var cookie = require('express-session/node_modules/cookie');
var express = require('express');
var router = express.Router();

var trace = require('../../code/trace');
var configer = require('../../code/configer');
var current = require('../../code/current');

router.all('/log.aspx', function(req, res, next) {
    //爬虫过滤
    if(/Googlebot/i.test(req.headers['user-agent']))
        return;

    req.current = new current.create(req);
    var option = {
        req: req
    };

    var send = '';
    switch (req.query.type || req.body.type) {
        case 'visit':
            trace.visit(option);
            if(req.query.outsid) {
                var signed = 's:' + signature.sign(req.sessionID, '000');
                var data = cookie.serialize('sessionid', signed);
                send = data;
            }
            break;
        case 'event':
            trace.event(option);
            //统计访问密度
            if (/doDown|doSetRing|doSetRings|doFreeGet|doOpenServe/i.test(req.query.name || req.body.name)) {
                configer.setDense(req.current.spinfocode());
                send = req.app.locals.density[req.current.spinfocode()];
            }
            break;
        case 'error':
            trace.error(option);
            break;
        case'Interface':
            trace.interface(option);
            break;
        default:
            trace.other(option);
            break;
    }
    res.send(send);
});

module.exports = router;

