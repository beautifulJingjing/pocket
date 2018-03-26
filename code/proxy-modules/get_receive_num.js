/**
 * Created by majun on 2016/8/3.
 * 获取领取礼包的人数
 */

"use strict";

var interfaces = require('../interface-modules');
exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var params = extend({}, req.query || req.body);
    delete params.cmd;
    options.params = params;
    interfaces.get_receive_num({
        req: req,
        data: params,
        success: function (data) {
            res.send({
                s: 1,
                data: data
            });
        },
        error: function () {
            res.send({
                s: 0
            });
        }
    });
};
