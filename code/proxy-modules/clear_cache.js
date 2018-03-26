/**
 * Created by LXP on 2016/3/8.
 */
"use strict";

var cache = require('../cache');

exports = module.exports = function(option) {
    var req = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    cache.del(query.key, function (err, data) {
        if (err)
            res.send('clear cache fail:' + JSON.stringify(err));
        else
            res.send('clear cache ok:' + data);
    });
}

