/**
 * Created by shengaozhou on 2016/2/24.
 *  热门搜索铃音
 *  records：读取记录数，-1(默认)时为读取所有记录;
 *  count：返回值，符合记录总数
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var param = extend({}, req.query || req.body);
    delete parsam.cmd;
    if (!params.hasOwnProperty('start')) params.start = 0;
    if (!params.hasOwnProperty('records')) params.records = 10;
    options.params = param;
    interfaces.get_searchkey({
        req: req,
        data: params,
        success: function (data) {
            res.send({
                s: 1,
                data: data
            });
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.msg
            });
        }
    });
};
