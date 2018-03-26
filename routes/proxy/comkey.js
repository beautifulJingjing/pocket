/**
 * 号码透传
 */
"use strict";

var express = require('express');
var router = express.Router();

var proxy = require('../../code/proxy-modules/index');
var current = require('../../code/current');
var configer = require('../../code/configer');

router.all('/comkey.aspx', function(req, res, next) {
    req.current = new current.create(req);
    configer.get(req.current.spinfocode(), function (config) {
        req.config = config;
        var option = {
            req: req
        };
        proxy.comkey(option);
    });
});

module.exports = router;