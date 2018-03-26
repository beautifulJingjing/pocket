/**
 * Created by majun on 2017/2/24.
 * 检查彩铃状态，若不是就开通
 */
"use strict";
var interfaces = require('../interface-modules');
var business = require('../business-modules');

exports = module.exports = function(option) {
    var req = option.req,
        current = req.current,
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
            return;
        }
    }
    else if (!current.isLogin()){ //未登录直接返回
        res.send({
            s: -10,
            msg: '无登录状态！'
        });
        return;
    }
    var result = {};
    if(current.isLogin()){
        business.login({
            req: req,
            data: {
                userinfo: query.phone,
                type: 2
            },
            callback: function () {
                if(current.user().orderstate!=4) {  //会员,此处是从活动页点击领取并支付成功后返回页面
                    result = {
                        s: 1,
                        data: req.current.user()
                    };
                    res.send(result);
                    /*business.isCrbt({
                        req: req,
                        data: {
                            phone: query.phone
                        },
                        callback: function (crbt) {
                            if (crbt) {
                                extend(result, crbt);
                                result.crbt = {s: 1};
                                res.send(result);
                            }
                            else {
                                business.isCrbtOpening({
                                    req: req,
                                    data: {
                                        phone: query.phone
                                    },
                                    callback: function (isOpening) {
                                        if (isOpening) {
                                            result.crbt = {
                                                s: 31,
                                                msg: '彩铃功能开通中，请耐心等待！'
                                            };
                                            res.send(result);
                                        }
                                        else {
                                            business.openCrbt({
                                                req: req,
                                                data: {
                                                    userphone: query.phone
                                                },
                                                callback: function () {
                                                    business.isCrbtOpening({
                                                        req: req,
                                                        data: {
                                                            phone: query.phone
                                                        },
                                                        callback: function (isCrbtOpening) {
                                                            if (isCrbtOpening) {
                                                                result.crbt = {
                                                                    s: 31,
                                                                    msg: '彩铃功能开通中，请耐心等待！'
                                                                };
                                                                res.send(result);
                                                            }
                                                            else {
                                                                result.crbt = {s: 1};
                                                                res.send(result);
                                                            }
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
                                    },
                                    error: function (err) {
                                        result = {
                                            s: 0,
                                            msg: err.message
                                        };
                                        res.send(result);
                                    }
                                });
                            }
                        }
                    });*/
                }
                else {//非会员
                    result = {
                        s: -1003,
                        data: req.current.user()
                    };
                    res.send(result);
                }
            },
            error: function (err) {
                result = {
                    s: -1002,
                    msg: err.message
                };
                res.send(result);
            }
        });
    }
    else{
        if(!current.user()){
            res.send({
                s: -10,
                msg: '尚未登录！'
            });
        }else{
            res.send({
                s: -11,
                msg: '已登录，未开通会员',
                data:current.user()
            });
        }
    }

}
