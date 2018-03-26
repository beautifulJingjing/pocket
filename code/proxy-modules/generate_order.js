"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(option) {
    var req = option.req,
        res = req.res;
    var params = req.method == 'POST' ? req.body : req.query;
    delete params.cmd;
    option.params = params;

    interfaces.generate_order({
        req: req,
        data: params,
        success: function (r) {
            res.send({
                s: 1,
                orderid: r.orderid
            });
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.message
            });
        }
    });
}