  /**
 * Created by XUER on 2016-3-6.
 * 登录并开通彩铃
 */
"use strict";

var business = require('../business-modules');
  var interfaces = require('../interface-modules');
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
        if(request.session.codeTimeout-timestamp>0)
            return request.session.codeInput;
        else{//超过有效期，重置验证码，需要重新获取
            clear();
      }
    }
}

//清除验证码
function clear(){
  phone(null);
  code(null);
}

//有无发送验证码
function has(){
  return phone() && code();
}

exports = module.exports = function(option) {
    var req = request = option.req,
        current = req.current,
        query = req.method == 'POST' ? req.body : req.query,
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
    if (!query.checkcode) {
        res.send({
            s: 0,
            msg: '请输入验证码！'
        });
        return;
    }

    var result = {};
    //验证登录后的开DIY
    var openOrder = function () {
            business.isOrder({
                req: req,
                data: {
                    phone: query.phone
                },
                callback: function (isOrder) {
                    var v_code = '';
                    if(CONST.MOBILE_PHONE_REGEX.test(current.user().phone)) v_code = query.checkcode;
                    if (isOrder) {
                        result.order = {s: 1};
                        res.send(result);
                    }
                    else if (CONST.MOBILE_PHONE_REGEX.test(current.user().phone)||CONST.UNICOM_PHONE_REGEX.test(current.user().phone)) {
                        business.openOrder({
                            req: req,
                            data: {
                                userphone: query.phone,
                                key: v_code
                            },
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
                                };
                                res.send(result);
                            }
                        });
                    }
                    else {
                        result.order = {
                            s: -24,
                            msg: '不支持的会员开通方式！'
                        }
                        res.send(result);
                    }
                }
            });

    };

    //if(!query.confirm&&CONST.MOBILE_PHONE_REGEX.test(query.phone)&&'00000290251'==current.spinfocode()){//此渠道下的移动号码做订购二次确认
    //    phone(query.phone);
    //    code(query.checkcode);
    //    result = {
    //        s: -100
    //    };
    //    res.send(result);
    //}
    //else
    if(CONST.MOBILE_PHONE_REGEX.test(query.phone)){//移动用户做本地验证码校验
        business.checkCode.check({
            req: req,
            data: {
                phone: query.phone,
                checkcode: query.checkcode
            },
            callback: function () {
                var user = {
                    id: '1',
                    phone: query.phone,
                    weixinid: '',
                    orderstate: 4,
                    smsconfirm: 0,
                    orderendtime: '',
                    setcrbtnum: '',
                    ordernum: 0,
                    token:'',
                    ringstate:0,
                    ringinfo:{}
                };
                current.user(user);//用户信息写session

                result = {
                    s: -80,
                    msg: '验证通过',
                    data:user
                };
                res.send(result);
            },
            error: function (err) {
                result = {
                    s: -40,
                    msg: err.message
                };
                res.send(result);
            }
        });
    }
    else if (CONST.TELCOM_PHONE_REGEX.test(query.phone)) {
        var openCrbt = function (isOrder) {
            /*business.isCrbt({
                req: req,
                data: {
                    phone: query.phone
                },
                callback: function () {*/
                    business.openCrbt({
                        req: req,
                        data: {
                            userphone: query.phone,
                            key: query.checkcode
                        },
                        callback: function (isCrbt) {

                            //如果是移动号码，保存验证码到session
                            if(CONST.MOBILE_PHONE_REGEX.test(query.phone)) {
                                clear();
                                phone(query.phone);
                                code(query.checkcode);
                            }
                            result = {
                                s: 1,
                                data: current.user()
                            };
                            if (isCrbt) {
                                result.crbt = {s: 1};
                                if(CONST.MOBILE_PHONE_REGEX.test(query.phone)) {//移动用户进行开会员，电信用户开彩铃同时开会员
                                    openOrder();
                                }else if(CONST.TELCOM_PHONE_REGEX.test(query.phone)){
                                    result.order = {s:20};
                                    if (isOrder){
                                        result.order = {s: 1};
                                    }
                                    res.send(result);
                                }else{
                                    openOrder();
                                }
                            }
                            else {
                                result = {
                                    s: 0,
                                    msg: err.message
                                };
                                clear();
                                res.send(result);
                            }
                        },
                        error: function (err) {
                            clear();
                            result = {
                                s: 0,
                                msg: err.message
                            };
                            res.send(result);
                        }
                    });
                /*}
            });*/
        };
        if(CONST.TELCOM_PHONE_REGEX.test(query.phone)){
            interfaces.get_orderstate({
                req: req,
                data: {
                    phone: query.phone,
                    type: 0
                },
                success:function (rec) {
                    if(rec.orderstate!=4)
                    {openCrbt(true)}
                    else {openCrbt()}

                }

        })
    }else{
            openCrbt();
        }

    }
   else {
        //联通用户本地校验验证码，开通
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
                    callback: function () {
                        result = {
                            s: 1,
                            data: current.user()
                        };
                        var openCrbt = function () {
                            business.isCrbt({
                                req: req,
                                data: {
                                    phone: query.phone
                                },
                                callback: function (isCrbt) {
                                    if (isCrbt) {
                                        result.crbt = {s: 1};
                                        openOrder();
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
                                                                        //openOrder();
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
                            });
                        };

                            openCrbt();

                    },
                    error: function (err) {
                        result = {
                            s: 0,
                            msg: err.message
                        };
                        res.send(result);
                    }
                });
            },
            error: function (err) {
                result = {
                    s: -40,
                    msg: err.message
                };
                res.send(result);
            }
        });
    }
};