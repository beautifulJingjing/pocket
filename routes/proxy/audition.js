/**
 * 播放地址
 */
"use strict";

var express = require('express');
var router = express.Router();

var interfaces = require('../../code/interface-modules/index');
var current = require('../../code/current');

router.all('/audition.aspx', function(req, res, next) {
    req.current = new current.create(req);
    var query = req.query;
    if (isNaN(query.rid))
        res.send('');
    else {
        var rid = query.rid, type = 1, source = 1, only = 1;
        if (!isNaN(query.type)) type = query.type;
        if (!isNaN(query.source)) source = query.source;

        interfaces.get_ring_urls({
            req: req,
            data: {
                ringid: rid,
                source: source,
                type: type,
                only: only
            },
            success: function (r) {
                var url = '';
                if (r) {
                    for (var i in r) {
                        if (r[i].type.toString() == '1') {
                            url = r[i].url;
                            break;
                        }
                    }
                }
                if(url) res.redirect(url);
                else res.send(url);
            },
            error: function (err) {
                res.send('');
            }
        });
    }
});

module.exports = router;