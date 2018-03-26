/**
 * Created by tsg34 on 2016/7/15.
 */

"use strict";

var business = require('../business-modules');
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
    var req = request = option.req;
    var res = req.res;
    var query = extend({}, req.method == 'POST' ? req.body : req.query);
    try {
        if (typeof query.phone == 'string') query.phone = query.phone.trim();
        if (!query.phone) throw new Error('请输入您的手机号码。');

            business.checkCode.get({
                req: req,
                data: {
                    phone: query.phone,
                    type: 2
                },
                callback: function (result) {
                    res.send({s: 1});
                },
                error: function (err) {
                    res.send({
                        s: 0,
                        msg:err.message
                    })
                }
            });
    }
    catch (e) {
        res.send({
            s: 0,
            msg: e.message
        });
    }
}