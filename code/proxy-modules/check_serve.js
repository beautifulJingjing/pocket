/**
 * Created by XUER on 2016-3-6.
 * 检查会员、彩铃业务状态
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        config = req.config,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    var data = {};
    if (typeof query.phone == 'string') {
        query.phone = query.phone.trim();
        if (CONST.PHONE_REGEX.test(query.phone)) {
            data.phone = query.phone;
        }
        else {
            res.send({
                s: 0,
                msg: '参数错误！'
            });
        }
    }

    if (config.ringset.serve.toString() == '2') {
        business.isCrbt({
            req: req,
            data: data,
            callback: function (isCrbt) {
                if (isCrbt) {
                    business.isOrder({
                        req: req,
                        data: data,
                        callback: function (isOrder) {
                            res.send({
                                s: isOrder ? 1 : -20
                            });
                        }
                    });
                }
                else
                    res.send({
                        s: -30
                    });
            }
        });
    }
    else {
        business.isOrder({
            req: req,
            data: data,
            callback: function (isOrder) {
                if (isOrder) {
                    business.isCrbt({
                        req: req,
                        data: data,
                        callback: function (isCrbt) {
                            res.send({
                                s: isCrbt ? 1 : -30
                            });
                        }
                    });
                }
                else
                    res.send({
                        s: -20
                    });
            }
        });
    }
}