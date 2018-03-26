/**
 * Created by LXP on 2016/3/21.
 */
"use strict";

var express = require('express');
var router = express.Router();

router.all(/^\/(index.html?)?$/i, function (req, res, next) {
    if (/Mobile/gi.test(req.headers["user-agent"])) res.render('download/m/index');
    else res.render('download/w/index');
});

module.exports = router;
