/**
 * Created by XUER on 2016-3-6.
 * 会员、彩铃服务设置
 */
"use strict";

var business = require('../business-modules');
var proxy = require('./base_proxy');
var request;

exports = module.exports = function(option) {
    var req = request = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        current = req.current,
        res = req.res;

    /*proxy.loginCheck({  //先开会员，再开彩铃
        req: req,
        yes: function () {
            proxy.openOrderCheck({
                req: req,
                yes: function (order) {
                    proxy.openCrbtCheck({
                        req: req,
                        yes: function (crbt) {
                            var r = {
                                s: 1
                            };
                            if (order) extend(r, order);
                            if (crbt) extend(r, crbt);
                            res.send(r);
                        },
                        no: function (r) {
                            if (order) extend(r, order);
                            res.send(r);
                        }
                    })
                },
                no: function (r) {
                    res.send(r);
                }
            });
        },
        no: function (r) {
            res.send(r);
        }
    });

    proxy.loginCheck({  //先开彩铃再开会员
        req: req,
        yes: function () {
            proxy.openCrbtCheck({
                req: req,
                yes: function (crbt) {
                    proxy.openOrderCheck({
                        req: req,
                        yes: function (order) {
                            var r = {
                                s: 1
                            };
                            if (crbt) extend(r, crbt);
                            if (order) extend(r, order);
                            res.send(r);
                        },
                        no: function (r) {
                            if (crbt) extend(r, crbt);
                            res.send(r);
                        }
                    })
                },
                no: function (r) {
                    res.send(r);
                }
            });
        },
        no: function (r) {
            res.send(r);
        }
    });

    proxy.loginCheck({  //会员优先
        req: req,
        yes: function () {
            proxy.openOrderCheck({
                req: req,
                yes: function (order) {
                    var r = {
                        s: 1
                    };
                    if (order) extend(r, order);
                    res.send(r);
                },
                no: function (r) {
                    res.send(r);
                }
            });
        },
        no: function (r) {
            res.send(r);
        }
    });

     */
    var result = {};
    if(current.isLogin()){
        if(CONST.UNICOM_PHONE_REGEX.test(current.user().phone)){
            business.login({
                req: req,
                data: {
                    userinfo: current.user().phone,
                    type: 2
                },
                callback: function () {
                    if(current.user().orderstate!=4) {  //会员
                        result = {
                            s: 1,
                            phone: current.user().phone,
                            data: current.user()
                        };
                        res.send(result);
                    }
                    else {//非会员
                        result = {
                            s: -20,
                            phone: current.user().phone,
                            data: current.user()
                        };
                        res.send(result);
                    }
                },
                error: function (err) {
                    result = {
                        s: -1002,
                        msg: '网络超时，请重试！'
                    };
                    res.send(result);
                }
            });
        }
        else {
            proxy.loginCheck({  //会员优先
                req: req,
                yes: function () {
                    proxy.openOrderCheck({
                        req: req,
                        yes: function (order) {
                            var r = {
                                s: 1
                            };
                            if (order) extend(r, order);
                            res.send(r);
                        },
                        no: function (r) {
                            res.send(r);
                        }
                    });
                },
                no: function (r) {
                    res.send(r);
                }
            });
        }
    }
    else {
        if (!current.user()) {
            res.send({
                s: -10,
                msg: '尚未登录！'
            });
        } else {
            res.send({
                s: -11,
                msg: '已登录，未开通会员',
                data: current.user()
            });
        }
    }
}