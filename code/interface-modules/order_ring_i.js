/**
 * Created by shengaozhou on 2016/3/1.
 *  订购彩铃（每首计费）
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     ringid:铃声id
 *     uid（可缺省）:用户ID，缺省时uphone不能为空
 *     uphone（可缺省）:手机号码，uid缺省或未绑定号码时使用
 *   },
 *   success(true): 成功完成时触发
 *   error(Error): 接口调用或返回失败时触时，返回错误信息
 * }
 */
"use strict";
var helper = require('../helper');
var trace = require('../trace');
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
    request = option.req;
    var data = option.data || {};
    data.service = 'order_ring';

    helper.call({
        req: option.req,
        data: data,
        success: function (rec) {
            rec = JSON.parse(rec);
            //10051重复订购
            if ((rec.code == 1) || (rec.code == 10051)) {
                if (option.success)
                    option.success(true);

                trace.interface({
                    req: option.req,
                    name: 'order_ring',
                    params: data
                });
            }
            else {
                //返回999019验证码错误
                clear();//清除验证码

                var err = new Error(rec.msg);
                err.code = rec.code;

                if(option.error) option.error(err);
                else console.error(err);

                trace.error({
                    req: option.req,
                    name: 'order_ring',
                    params: data,
                    msg: err
                });
            }
        },
        error: option.error
    });
};
