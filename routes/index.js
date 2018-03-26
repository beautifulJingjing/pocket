/**
 * Created by LXP on 2016/3/21.
 */
"use strict";

var express = require('express');
var router = express.Router();

//根目录去到下载页
router.all(/^(\/)$/i, function (req, res, next) {
    res.redirect('/m/00000550471.html');
});


module.exports = router;