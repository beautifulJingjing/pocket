/**
 * Created by shengaozhou on 2016/2/26.
 *  获奖列表
 *  lid：活动id;
 *  phone：手机号码，无手机号码时返回整个活动的中奖列表，有手机号码时返回该号码的抽奖记录;
 *  start：起始读取记录，从0开始，缺省=1;
 *  records：读取记录数，设为-1时为读取所有记录，缺省=-1;
 *   count：返回值，符合记录总数
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var params = extend({}, req.query || req.body);
    delete params.cmd;
    if (!params.hasOwnProperty('start')) params.start = 0;
    if (!params.hasOwnProperty('records')) params.records = 20;
    options.params = params;
    interfaces.get_lottery_log({
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
