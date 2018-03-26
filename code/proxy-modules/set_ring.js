/**
 * Created by XUER on 2016-3-6.
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
    //if (query.hasOwnProperty('flag')) flag = query.flag.toString().trim();
    var result = {};
    var openOrder = function () {
    };
    if(current.isLogin()){
        if (CONST._MOBILE_PHONE_REGEX.test(current.user().phone)) {
            if (query.confirm === '1') { //客户端信息提示已确认
                //business.orderRing({
                //    req: req,
                //    data: {
                //        key:vcode,
                //        ringid: rid,
                //        isdefault:0,
                //        issms: 0
                //    },
                //    callback: function () {
                //        //如果是移动号码，保存验证码到session
                //        clear();
                //        phone(current.user().phone);
                //        code(vcode);
                //        result.s = 1;
                //        res.send(result);
                //    },
                //    error: function (err) {
                //        result.s = 0;
                //        result.msg = err.message;
                //        res.send(result);
                //    }
                //});
            }else {
                if(current.user().token){
                    //查询铃声资费和过期时间
                    interfaces.get_ring_info({
                        req: req,
                        data: {
                            ringid: rid
                        },
                        success: function (data) {
                            result.s = -32;
                            result.phone = current.user().phone;
                            if(parseInt(data.price / 100) === 0){
                                result.msg = '是否确认设置该首彩铃？\r\n资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享' + parseInt(data.price / 100) + '元/首</i>）';
                            }else{
                                result.msg = '是否确认设置该首彩铃？\r\n资费：' + parseInt(data.price / 100) + '元/首';
                            }
                            res.send(result);
                        },
                        error: function (err) {
                            result.s = 0;
                            result.msg = '设置彩铃未找到！';
                            res.send(result);
                        }
                    });
                }else{
                    result.s = -99;//重新获取验证码
                    result.title = '获取验证码';
                    res.send(result);
                }
            }
        }
        else if(CONST.UNICOM_PHONE_REGEX.test(current.user().phone)){
            business.login({
                req: req,
                data: {
                    userinfo: current.user().phone,
                    type: 2
                },
                callback: function () {
                    if(current.user().orderstate!=4) {  //会员
                        result = {
                            data: current.user()
                        };
                        business.isCrbt({
                            req: req,
                            data: {
                                phone: current.user().phone
                            },
                            callback: function (isCrbt) {
                                if (isCrbt) {
                                    //result = {s: 1};
                                    //extend(result, crbt);
                                    if(query.confirm === '1') { //客户端信息提示已确认
                                        interfaces.set_crbt({
                                            req: req,
                                            data: {
                                                ringid: rid
                                            },
                                            callback: function () {
                                                result = {s: 1};
                                                res.send(result);
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
                                    else{
                                        //查询铃声资费和过期时间
                                        interfaces.get_ring_info({
                                            req: req,
                                            data: {
                                                ringid: rid
                                            },
                                            success: function (data) {
                                                result.s = -32;
                                                result.phone = current.user().phone;
                                                if(parseInt(data.price / 100) === 0){
                                                    result.msg = '是否确认设置该首彩铃？\r\n资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享' + parseInt(data.price / 100) + '元/首</i>）';
                                                }else{
                                                    result.msg = '是否确认设置该首彩铃？\r\n资费：' + parseInt(data.price / 100) + '元/首';
                                                }
                                                res.send(result);
                                            },
                                            error: function (err) {
                                                result.s = 0;
                                                result.msg = '设置彩铃未找到！';
                                                res.send(result);
                                            }
                                        });
                                    }
                                }
                                else {
                                    business.isCrbtOpening({
                                        req: req,
                                        data: {
                                            phone: query.phone
                                        },
                                        callback: function (isOpening) {
                                            if (isOpening) {
                                                result = {
                                                    s: 31,
                                                    msg: '彩铃功能开通中，请耐心等待！'
                                                };
                                                res.send(result);
                                            }
                                            else {
                                                business.openCrbt({
                                                    req: req,
                                                    data: {
                                                        userphone: current.user().phone
                                                    },
                                                    callback: function () {
                                                        business.isCrbtOpening({
                                                            req: req,
                                                            data: {
                                                                phone: query.phone
                                                            },
                                                            callback: function (isCrbtOpening) {
                                                                if (isCrbtOpening) {
                                                                    result = {
                                                                        s: 31,
                                                                        msg: '彩铃功能开通中，请耐心等待！'
                                                                    };
                                                                    res.send(result);
                                                                }
                                                                else {
                                                                    result = {s: 1};
                                                                    res.send(result);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    error: function (err) {
                                                        result = {
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
                        });
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
            proxy.loginCheck({
                req: req,
                yes: function () {
                    var result = {};
                    proxy.openOrderCheck({
                        req: req,
                        yes: function () {
                            proxy.openCrbtCheck({
                                req: req,
                                yes: function(){
                                    if (order) extend(result, order);
                                    if (crbt) extend(result, crbt);
                                    if (query.confirm === '1') { //客户端信息提示已确认
                                        interfaces.set_crbt({
                                            req: req,
                                            data: {
                                                ringid: rid
                                            },
                                            callback: function () {
                                                result.s = 1;
                                                res.send(result);
                                            },
                                            error: function (err) {
                                                result.s = 0;
                                                result.msg = err.message;
                                                res.send(result);
                                            }
                                        });
                                    }
                                    else {
                                        //查询铃声资费和过期时间
                                        interfaces.get_ring_info({
                                            req: req,
                                            data: {
                                                ringid: rid
                                            },
                                            success: function (data) {
                                                result.s = -32;
                                                result.phone = current.user().phone;
                                                if(parseInt(data.price / 100) === 0){
                                                    result.msg = '是否确认设置该首彩铃？\r\n资费是：<span class="bz-span">2.0元<em></em></span>（<i>VIP专享' + parseInt(data.price / 100) + '元/首</i>）';
                                                }else{
                                                    result.msg = '是否确认设置该首彩铃？\r\n资费：：' + parseInt(data.price / 100) + '元/首';
                                                }
                                                res.send(result);
                                            },
                                            error: function (err) {
                                                result.s = 0;
                                                result.msg = '设置彩铃未找到！';
                                                res.send(result);
                                            }
                                        });
                                    }
                                },
                                no: function(r){
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