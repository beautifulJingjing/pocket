/**
 * Created by LXP on 2016/3/3.
 * 短信验证
 */
"use strict";

var interfaces = require('../interface-modules');
var trace = require('../trace');
var request;

//手机号
function phone(val){
    if(arguments.length>0) request.session.mobileInput = val;
    else return request.session.mobileInput;
}

//验证码
function code(val){
    if(arguments.length >0) request.session.codeInput = val;
    else return request.session.codeInput;
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

/**
 * 获取短信验证码,部分用途无返回
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone:手机号
 *     type(可缺省):用途，0(默认)-绑定手机;1-订购;2-退订;3-预付费;4-集团炫铃;5-母亲节活动
 *   },
 *   callback(boolean): 结果回调方法
 *   error(Error):有错误触发，缺省时触发callback
 */
exports.get = function(option) {
    var req = request = option.req;
    var data = option.data;
    if (typeof data.phone == 'string') data.phone = data.phone.trim();
    if (isNaN(data.type)) delete data.type;
    try {
        if (!data.phone)
            throw new Error('参数错误');

        //1分钟内不重复发送短信
        var lastSendTime = req.session['SEND_VCODE_' + data.phone];
        if (lastSendTime) {
            lastSendTime = new Date(lastSendTime);
            if (lastSendTime.setMinutes(lastSendTime.getMinutes() + 1) > new Date()) {
                if (option.callback) {
                    option.callback(true);
                    return;
                }
            }
        }

        interfaces.get_checkcode({
            req: req,
            data: {
                mobile: data.phone,
                type: data.type ? data.type : ''
            },
            success: function (r) {
                req.session['SEND_VCODE_' + data.phone] = new Date();
                phone(data.phone);
                code(r);
                //验证码日志输出
                console.info(data.phone + ' is check code ' + r);

                if (option.callback)
                    option.callback(true);
            },
            error: function (err) {
                if (option.error) option.error(err);
                else {
                    if (option.callback) option.callback(false);
                    console.error(err);
                }
            }
        });
    }
    catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
}

/**
 * 验证码校验
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     phone:手机号
 *     checkcode:验证码
 *   },
 *   callback(boolean): 结果回调方法
 *   error(Error):有错误触发，缺省时触发callback
 */

exports.check = function(option) {
    var req = request = option.req;
    var data = option.data;
    if (typeof data.phone == 'string') data.phone = data.phone.trim();
    if (typeof data.checkcode == 'string') data.checkcode = data.checkcode.trim();
    try {
        if (!data.phone || !data.checkcode)
            throw new Error('请输入手机号和验证码！');
        else if (!has())
            throw new Error('请点击获取验证码，然后输入您收到的短信验证码！');
        else if (phone() != data.phone || code() != data.checkcode)
            throw new Error('验证码错误，请查看您收到的短信，验证码为6位数字！');
        else {
            clear();
            if (option.callback)
                option.callback(true);
        }
    }
    catch (err) {
        trace.error({
            req: option.req,
            name: 'codeTypeError',
            params: data,
            msg: err
        });
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
}
