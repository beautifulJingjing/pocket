/**
 * Created by XUER on 2016-3-6.
 * 开会员
 * 只用于普通、短信回复方式开通，验证码方式通过LoginOrder方法
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        config = req.config,
        current = req.current,
        query = req.method == 'POST' ? req.body : req.query,
        res = req.res;

    if (!current.isLogin()){ //未登录直接返回
        res.send({
            s: -10,
            msg: '无登录状态！'
        });
        return;
    }
    business.openOrder({
        req: req,
        callback: function () {
            if (config.order.open.toString() == '2') {
                res.send({
                    s: 15
                });
            }
            else {
                var result = {
                    s: 1,
                    data: current.user()
                };
                //彩铃+DIY合并开通
                if (query.single == '1' || config.ringset.serve.toString() != 1 || config.crbt.pop.pop.toString() != '2') {
                    res.send(result);
                }
                else {
                    business.isCrbt({
                        req: req,
                        callback: function (isCrbt) {
                            if (isCrbt) {
                                result.crbt = {s: 1};
                                res.send(result);
                            }
                            else if (CONST.UNICOM_PHONE_REGEX.test(current.user().phone) || config.crbt.open != 1) {
                                business.openCrbt({
                                    req: req,
                                    callback: function () {
                                        business.isCrbtOpening({
                                            req: req,
                                            callback: function (isOpening) {
                                                if (isOpening)
                                                    result.crbt = {
                                                        s: 31,
                                                        msg: '彩铃功能开通中，请耐心等待！'
                                                    };
                                                else
                                                    result.crbt = {
                                                        s: 30
                                                    }
                                                res.send(result);
                                            }
                                        });
                                    },
                                    error: function (err) {
                                        result.crbt = {
                                            s: -31,
                                            msg: err.message
                                        };
                                        res.send(result);
                                    }
                                });
                            }
                            else {
                                result.crbt = {
                                    s: -34,
                                    msg: '不支持的彩铃开通方式！'
                                }
                                res.send(result);
                            }
                        }
                    });
                }
            }
        },
        error: function (err) {
            res.send({
                s: 0,
                msg: err.message
            });
        }
    });
}