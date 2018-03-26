/**
 * Created by majun on 2017/2/23.
 * 彩铃设置
 */
"use strict";
var interfaces = require('../interface-modules');
var business = require('../business-modules');
var proxy = require('./base_proxy');
var request;
//手机号
function phone(val){
    if(arguments.length>0) request.session.mobileInput = val;
    else return request.session.mobileInput;
}
//验证码
function code(val){
    var timestamp=new Date().getTime();
    if(arguments.length >0){
        request.session.codeInput = val;
        if(val)
            request.session.codeTimeout = timestamp+360000;//有效期6分钟
        else
            request.session.codeTimeout = val;
    }else{
        if(request.session.codeTimeout-timestamp<0){
            //超过有效期，重置验证码，需要重新获取
            clear();
        }
        return request.session.codeInput;
    }
}
//清除验证码
function clear(){
    phone(null);
    code(null);
}
function has(){
//有无发送验证码
    return phone() && code();
}
exports = module.exports = function (option) {
    var req = request = option.req,
        query = req.method == 'POST' ? req.body : req.query,
        current = req.current,
        res = req.res;
    var rid, flag = '2111';
    if (typeof query.rid == 'string') rid = query.rid.replace(/\s/g, '');
    var vcode='';
    if(query.vcode)vcode = query.vcode;
    else vcode = code();
    if (/[^\d,]/g.test(rid)) {
        res.send({
            s: 0,
            msg: '无效的铃声ID！'
        });
        return;
    }
    var result = {};
    if(current.isLogin()){
        if (CONST.UNICOM_PHONE_REGEX.test(current.user().phone)) {
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
                            data: req.current.user()
                        };
                        business.isCrbt({
                            req: req,
                            data: {
                                phone: query.phone
                            },
                            callback: function (crbt) {
                                if (crbt) {
                                    extend(result, crbt);
                                    interfaces.set_crbt({
                                        req: req,
                                        data: {
                                            ringid: rid
                                        },
                                        callback: function () {
                                            result.crbt = {s: 1};
                                            res.send(result);
                                        },
                                        error: function (err) {
                                            result.crbt = {
                                                s: 0,
                                                msg: err.message
                                            };
                                            res.send(result);
                                        }
                                    });
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
                                            result.crbt = {
                                                s: 0,
                                                msg: err.message
                                            };
                                            res.send(result);
                                        }
                                    });
                                }
                            }
                        });
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
                        msg: '网络超时，请重试！'
                    };
                    res.send(result);
                }
            });
        }
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
