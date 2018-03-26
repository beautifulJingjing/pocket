/**
 * Created by XUER on 2016-3-6.
 */
"use strict";

var business = require('../business-modules');

exports.loginCheck = function(option) {
    var req = option.req,
        current = req.current,
        res = req.res;

    if (current.isLogin()) {
        if (option.yes)
            option.yes();
    }
    else {
        if (option.no) {
            if(!current.user()){
                option.no({
                    s: -10,
                    msg: '尚未登录！'
                });
            }else{
                option.no({
                    s: -11,
                    msg: '已登录，未开通会员',
                    data:current.user()
                });
            }
        }
    }
};

exports.openOrderCheck = function(option) {
    var req = option.req,
        config = req.config,
        current = req.current,
        res = req.res;

    var data = {};
    //短信回复方式需要到服务端检查开通状态
    if(config.order.open.toString() == '2')
        data = {
        uid: current.user().id
    };
    business.isOrder({
        req: req,
        data: data,
        callback: function (isOrder) {
            if (config.order.open.toString() == '0') { //不开通处理
                if (isOrder) {
                    if (option.yes) option.yes();
                }
                else {
                    //需要弹窗提示
                    if (option.no)
                        option.no({
                            s: -20,
                            phone: current.user().phone,
                            data: current.user(),
                            msg: '尚未开通会员服务！'
                        });
                }
            }
            else if (isOrder) { //已开通
                if (option.yes) option.yes();
            }
            else { //未开通
                if (config.order.pop.pop.toString() == '0') { //不弹窗，直接开通
                    business.openOrder({
                        req: req,
                        callback: function () {
                            if (config.order.open.toString() == '2') {
                                if (option.no)
                                    option.no({
                                        s: 15//开通短信已下发
                                    });
                            }
                            else {
                                if (option.yes)
                                    option.yes({
                                        order: {s: 1},
                                        data: current.user()
                                    });
                            }
                        },
                        error: function (err) { //开会员失败
                            if (option.no)
                                option.no({
                                    s: -21,
                                    msg: err.message
                                });
                        }
                    });
                }
                else {
                    //需要弹窗提示
                    if (option.no)
                        option.no({
                            s: -20,
                            phone: current.user().phone,
                            data: current.user(),
                            msg: '尚未开通会员服务！'
                        });
                }
            }
        }
    });
};

exports.openCrbtCheck = function(option) {
    var req = option.req,
        config = req.config,
        current = req.current,
        res = req.res,
        query = req.method == 'POST' ? req.body : req.query

    business.isCrbt({
        req: req,
        data: {
            iscache: true,
            phone: query.phone
        },
        callback: function (isCrbt) {
            if (isCrbt) { //已开通
                if (option.yes)
                    option.yes();
            }
            else { //未开通
                business.isCrbtOpening({
                    req: req,
                    callback: function (isOpening) {
                        if (isOpening) {
                            if (option.no)
                                option.no({
                                    s: 31,
                                    msg: '彩铃功能开通中，请耐心等待！'
                                });
                        }
                        else {
                            business.isOrder({
                                req: req,
                                data: {
                                    phone: current.user().phone
                                },
                                callback: function (isOrder) {
                                    if (isOrder) {
                                        if (option.no)
                                            option.no({
                                                s: 31,
                                                msg: '彩铃功能开通中，24小时内完成！'
                                            });
                                    }
                                    else {
                                        if (option.no)
                                            option.no({
                                                s: 31,
                                                msg: '彩铃开通失败，请重新点击设铃开通 '
                                            });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

