"use strict";
var util = require('util');
var express = require('express');
var router = express.Router();
var configer = require('../../code/configer.js')
router.all('/:spinfocode.js', function(req, res, next) {
    configer.get(req.params.spinfocode, function (config) {
        res.send(
            util.format('app.spinfocode = "%s"; $.extend(app.pushinfo, %s);',
                config.id,
                JSON.stringify(config)
            )
        );
    });
});
router.all('/:spinfocode.json', function(req, res, next) {
    configer.get(req.params.spinfocode, function (config) {
        res.send(
            JSON.stringify(config)
        );
    });
});
module.exports = router;