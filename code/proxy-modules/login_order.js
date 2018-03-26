/**
 * Created by LXP on 2016/3/4.
 * 登录并开通会员
 */
"use strict";

var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        current = req.current,
        res = req.res;

    if (typeof query.phone == 'string') query.phone = query.phone.trim();
    if (!CONST.PHONE_REGEX.test(query.phone)) {
        res.send({
            s: 0,
            msg: '请输入一个有效的手机号！'
        });
        return;
    }
    if (typeof query.checkcode == 'string') query.checkcode = query.checkcode.trim();
    if(!query.checkcode){
        res.send({
            s:0,
            msg:'请输入验证码！'
        });
        return;
    }

    var result = {};
    //验证登录后的开彩铃
    var openCrbt = function () {
            business.isCrbt({
                req: req,
                callback: function (isCrbt) {
                    if (isCrbt) {
                        result.crbt = {
                            s: 1
                        };
                        res.send(result);
                    }
                    else{
                        business.isCrbtOpening({
                            req: req,
                            callback:function(isOpening){
                                if(isOpening){
                                    result.crbt = {
                                        s: 31,
                                        msg: '彩铃功能开通中，请耐心等待！'
                                    };
                                    res.send(result);
                                }
                                else if (CONST.UNICOM_PHONE_REGEX.test(current.user().phone)) { //DIY+彩铃同步正常开通只支持联通号
                                    business.openCrbt({
                                        req: req,
                                        callback: function () {
                                            business.isCrbtOpening({
                                                req: req,
                                                callback: function (isCrbtOpening) {
                                                    if (isCrbtOpening)
                                                        result.crbt = {
                                                            s: 31,
                                                            msg: '彩铃功能开通中，请耐心等待！'
                                                        };
                                                    else
                                                        result.crbt = {
                                                            s: 30
                                                        };
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
                                    };
                                    res.send(result);
                                }
                            }
                        })
                    }
                }
            });

    };

    //验证码开通
    if (!CONST.UNICOM_PHONE_REGEX.test(query.phone)) {

        //正常开通
        business.checkCode.check({
            req: req,
            data: {
                phone: query.phone,
                checkcode: query.checkcode
            },
            callback: function () {
                business.login({
                    req: req,
                    data: {
                        userinfo: query.phone,
                        type: 2
                    },
                    callback: function (r) {
                        //登录成功
                        result = {
                            s: 1,
                            data: current.user()
                        };
                        business.isOrder({
                            req: req,
                            callback: function (isOrder) {
                                //DIY已开通
                                if (isOrder) {
                                    result.order = {s: 1};
                                    openCrbt();
                                }
                                else {
                                    business.openOrder({
                                        req: req,
                                        callback: function () { //开通成功
                                            result.order = {s: 20};
                                            openCrbt();
                                        },
                                        error: function (err) { //开通失败
                                            result.order = {
                                                s: -21,
                                                msg: err.message
                                            };
                                            res.send(result);
                                        }
                                    });
                                }
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
            },
            error: function (err) {
                res.send({
                    s: -40,
                    msg: err.message
                });
            }
        });
    }
}