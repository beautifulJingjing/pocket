/**
 * Created by majun on 2016/8/26.
 * start：起始读取记录，默认从0开始;
 * records：读取记录数，-1(默认)时为读取所有记录;
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
    interfaces.get_searchhot({
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
