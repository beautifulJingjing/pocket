/**
 * Created by 9sky on 2016/8/16.
 *  铃音搜索
 *  key：关键字
 *  type：搜索范围，多选用“,”分隔，2-电信，3-移动，4-联通，6-个推；
 *  start：起始读取记录，默认从0开始;
 *  records：读取记录数，-1(默认)时为读取所有记录;
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var params = extend({}, req.query || req.body);
    delete params.cmd;
    if (!params.hasOwnProperty('type')) params.type = 3;
    if (!params.hasOwnProperty('start')) params.start = 0;
    if (!params.hasOwnProperty('records')) params.records = 10;
    options.params = params;
    interfaces.get_search_nocache({
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
