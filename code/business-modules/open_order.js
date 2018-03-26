/**
 * Created by LXP on 2016/3/2.
 * 订购DIY
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     userphone（可缺省）：手机号，只有该运营商支持开通包月时绑定手机号功能，且该用户未绑定手机时，该参数才起效
 *     key（可缺省）：验证码，-1-请求下发验证码
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */
"use strict";
var interfaces = require('../interface-modules');
var login = require('./login');

function openOrder(option) {
    var req = option.req,
        current = req.current;

    var data = option.data || {};
    if (typeof data.userphone == 'string') data.userphone = data.userphone.trim();
    if (typeof data.key == 'string') data.key = data.key.trim();


    try{
        if (CONST.UNICOM_PHONE_REGEX.test(data.userphone)) {
            if (current.isLogin()) {
                var u = current.user();
                data.uid = u.id;
                data.userphone = u.phone;
                //console.log(">>>>>>>>>>>>>>>>>>"+data);
                interfaces.open_order({
                    req: req,
                    data: data,
                    success: function (r) {
                        if (r.hasOwnProperty('orderstate')) {
                            u.orderstate = r.orderstate;
                            u.orderendtime = r.orderendtime;
                        }
                        else {
                            u.orderstate = 0; //订购成功，一般为免费期状态
                            u.orderendtime = -1;
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
                });
            }
            else {
                throw new Error('未登录错误')
            }
        }
        else {
            if (!(data.userphone || current.isLogin()))
                throw  new Error('网络连接超时，请稍后再试。您也可以拨打客服专线4007200733咨询开通');
            if (data.userphone) {data.uid = ''}
            else {
                var u = current.user();
                data.uid = u.id;
                data.userphone = u.phone;
            }
            //电信号码，根据弹窗设置彩铃、DIY同时开
            if (CONST.TELCOM_PHONE_REGEX.test(data.userphone)) {
                    data.isopencrbt = 1;
            }
            //移动号码开会员类型=7
            if (CONST.MOBILE_PHONE_REGEX.test(data.userphone)) {
                     data.ordertype = 7;
            }

            //短信验证方式,失败原结果返回
            interfaces.open_order({
                req: req,
                data: data,
                success: function (r) {
                    //不是验证码下发成功
                    if (r.result != 2002) {
                        //订购验证成功：未登录或号码变更，做登录操作
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
                            var u = current.user();
                            if (r.hasOwnProperty('orderstate')) {
                                u.orderstate = r.orderstate;
                                u.orderendtime = r.orderendtime;
                            }
                            else {
                                u.orderstate = 0; //订购成功，一般为免费期状态
                                u.orderendtime = -1;
                            }
                            //彩铃同时开通时，记录彩铃开通，清理彩铃状态
                            if (data.isopencrbt == 1) {
                                current.isOpenCrbtWaiting(true);
                                current.crbtState(null);
                            }
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
            });
        }
    }catch (err) {
        if (option.error) option.error(err);
        else {
            if (option.callback) option.callback(false);
            console.error(err);
        }
    }

}

module.exports = openOrder;