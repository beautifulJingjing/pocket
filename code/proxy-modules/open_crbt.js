/**
 * Created by XUER on 2016-3-6.
 * 开彩铃
 * 只用于普通、短信回复方式开通，验证码方式通过LoginCrbt方法
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
    business.openCrbt({
        req: req,
        callback: function () {
            if (config.crbt.open.toString() == '2') {
                res.send({
                    s: 14
                });
            }
            else {
                business.isCrbtOpening({
                    req: req,
                    callback: function (isOpening) {
                        if (isOpening) {
                            res.send({
                                s: 31,
                                msg: '彩铃功能开通中，请耐心等待！'
                            });
                        }
                        else {
                            var result = {
                                s: 1
                            };
                            //彩铃+DIY合并开通
                            if (query.single == '1' || config.ringset.serve.toString() != '2' || config.order.pop.pop.toString() != 2) {
                                res.send(result);
                            }
                            else {
                                business.isOrder({
                                    req: req,
                                    callback: function (isOrder) {
                                        if (isOrder) {
                                            result.order = {
                                                s: 1
                                            }
                                            res.send(result);
                                        }
                                        else if (CONST.UNICOM_PHONE_REGEX.test(current.user().phone) || config.order.open.toString() != '1') {
                                            business.openOrder({
                                                req: req,
                                                callback: function () {
                                                    result.order = {
                                                        s: 20
                                                    };
                                                    result.data = current.user();
                                                    res.send(result);
                                                },
                                                error: function (err) {
                                                    result.order = {
                                                        s: -21,
                                                        msg: err.message
                                                    }
                                                    res.send(result);
                                                }
                                            });
                                        }
                                        else {
                                            result.order = {
                                                s: -24,
                                                msg: '不支持的会员开通方式！'
                                            };
                                            res.send(result);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
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