/**
 * Created by LXP on 2016/3/3.
 * 开通运营商彩铃功能
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     userphone（可缺省）:手机号，只在短信开通方式时有效，为空时使用当前登录用户绑定号码;
 *     key（可缺省）:运营商短信验证，需要验证码时-1:发送验证码;
 *     patype（可缺省）:开通方式，0-由号码本身决定，4-短信2次确认，5-联通0元彩铃
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var interfaces = require('../interface-modules');
var login = require('./login');
var trace = require('../trace');

function openCrbt(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data || {};
    if (typeof data.userphone == 'string') data.userphone = data.userphone.trim();
    if (typeof data.key == 'string') data.key = data.key.trim();
    if (typeof data.patype == 'string') data.patype = data.patype.trim();
    try{
        if (CONST.UNICOM_PHONE_REGEX.test(data.userphone)) {
            if (current.isLogin()) {
                var u = current.user();
                data.uid = u.id;
                data.userphone = u.phone;
                //开通失败入队列
                data.inqueue = 1;
                //data.withdiy = 1;
                data.withdiy = 0;

                interfaces.open_crbt({
                    req: req,
                    data: data,
                    success: function (r) {
                        trace.interface({
                            req: option.req,
                            name: 'open_ringset_order',
                            params: data
                        });

                        current.crbtState(null);
                        if (!current.isLogin() || current.user().phone != data.userphone) {
                            login({
                                req: req,
                                data: {type: 2, userinfo: data.userphone},
                                callback: function () {
                                    current.isOpenCrbtWaiting(true);

                                    if (option.callback)
                                        option.callback(true);
                                },
                                error: option.error //同模块调用返回值类型相同, 返回处理方法相同
                            })
                            return;
                        }
                        else {
                            current.isOpenCrbtWaiting(true);
                        };

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
            else {
                throw new Error('未登录错误')
            }
        }
        else {

            if(!(data.userphone || current.isLogin()) || !data.key)
                throw  new Error('参数错误');

            if (data.userphone) delete data.uid;
            else {
                var u = current.user();
                data.uid = u.id;
                data.userphone = u.phone;
            }
            //电信号码，根据弹窗设置彩铃、DIY同时开
            if (CONST.TELCOM_PHONE_REGEX.test(data.userphone)) {

                data.withdiy = 1;
            }
            if (CONST.MOBILE_PHONE_REGEX.test(data.userphone)) {

                data.withdiy = 0;
            }

            //短信验证方式,失败原结果返回
            interfaces.open_crbt({
                req: req,
                data: data,
                success: function (r) {
                    // if (data.withdiy==1&&data.key!=-1) {
                    //     trace.interface({
                    //         req: option.req,
                    //         name: 'open_ringset_order',
                    //         params: data
                    //     });
                    // }
                    if(parseInt(r) == 1){
                        login({
                            req: req,
                            data: {type: 2, userinfo: data.userphone},
                            callback: function () {
                                if (option.callback)
                                    option.callback(true);
                            },
                            error: option.error //同模块调用返回值类型相同, 返回处理方法相同
                        });
                        return;
                    }else if (parseInt(r) == 1001) {
                        current.crbtState(null); //清理彩铃状态缓存
                        current.isOpenCrbtWaiting(true);
                        //成功：未登录或号码变更，做登录操作
                        if (!current.isLogin() || current.user().phone != data.userphone) {
                            login({
                                req: req,
                                data: {type: 2, userinfo: data.userphone},
                                callback: function () {
                                    if (option.callback)
                                        option.callback(true);
                                },
                                error: option.error //同模块调用返回值类型相同, 返回处理方法相同
                            });
                            return;
                        }
                        else {
                            current.isOpenCrbtWaiting(true);
                        }

                    }
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
            })
        }
    }catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }
}

module.exports = openCrbt;