/**
 * Created by tsg34 on 2016/7/11.
 */
"use strict";

var interfaces = require('../interface-modules')
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

//有无发送验证码
function has(){
    return phone() && code();
}



exports = module.exports = function(option) {
    var req = request = option.req,
        res = req.res;
    var current = req.current;
    var query = req.method == 'POST' ? req.body : req.query;
    delete query.cmd;
    query.uid = current.user().id;
    query.caller = -2;

    if(CONST.MOBILE_PHONE_REGEX.test(current.user().phone))
    {    if(query.sms){
        interfaces.delete_user_ring({
            req: req,
            data: query,
            success: function (data) {
                res.send({
                    s: 1

                });
            },
            error: function (err) {
                res.send({
                    s: 0,
                    msg: err.message
                });
            }
        });
    }
        else{
        if(code()) {
            query.sms = code();
            interfaces.delete_user_ring({
                req: req,
                data: query,
                success: function (data) {
                    res.send({
                        s: 1

                    });
                },
                error: function (err) {
                    res.send({
                        s: 0,
                        msg: err.message
                    });
                }
            });
        }
            else{
            res.send({
                s: -98,
                msg:'请获取验证码'
            });
        }
    }
    }
    else{
        interfaces.delete_user_ring({
            req: req,
            data: query,
            success: function (data) {
                res.send({
                    s: 1

                });
            },
            error: function (err) {
                res.send({
                    s: 0,
                    msg: err.message
                });
            }
        });
    }
}
