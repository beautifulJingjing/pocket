/**
 * Created by XUER on 2016-3-6.
 * 退订会员
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        current = req.current,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    if (CONST.MOBILE_PHONE_REGEX.test(query.phone)) {
        business.checkCode.check({
            req: req,
            data: {
                phone: query.phone,
                checkcode: query.checkcode
            },
            callback: function () {
                var result = {
                    s: -81,
                    msg: '用户退订验证通过'
                };
                res.send(result);
            },
            error: function (err) {
                var result = {
                    s: -40,
                    msg: err.message
                };
                res.send(result);
            }
        });
    }
    else {
        business.checkCode.check({
            req: req, data: {
                phone: query.phone,
                checkcode: query.checkcode
            },
            callback: function () {
                business.unsubscriptOrder({
                    req: req,
                    data: {
                        phone: query.phone,
                        sms: query.checkcode
                    },
                    success: function (msg) {
                        var result = {
                            s: 1,
                            data: current.user(),
                            msg: msg
                        };
                        if (!result.data) delete result.data;
                        res.send(result);
                    },
                    error: function (err) {
                        res.send({
                            s: 0,
                            msg: err.message
                        });
                    }
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
}