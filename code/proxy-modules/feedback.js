/**
 * Created by shengaozhou on 2016/2/24.
 *  意见反馈
 *  content：反馈内容
 *  usercode：用户标识
 *  ver：应用版本号
 */
"use strict";

var interfaces = require('../interface-modules');

exports = module.exports = function(options) {
    var req = options.req,
        res = req.res;
    var params = req.method == 'POST' ? req.body : req.query;
    delete params.cmd;
    options.params = params;

    interfaces.feedback({
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
