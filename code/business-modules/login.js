/**
 * Created by XUER on 2016-3-1.
 * 注册登录
 * option={
 *   req: 客户端请求对象,
 *   data: {
 *     type：登录类型：1-设备标识码登录，2-手机号登录，3-用户名/密码，4-新浪微博登录，5-QQ，6-微信
 *     userinfo：登录信息
 *     autoregister（可缺省）：当用户不存在时，是否自动注册：0-不注册，1-注册（默认）
 *     ischeckorder（可缺省）：是否与运营商同步号码状态：0-否（默认），1-是
 *     unikey：号码透传状态，缺省=0
 *   },
 *   callback(boolean): 结果回调方法,
 *   error(Error):有错误触发，缺省时触发callback
 */

"use strict";

var interfaces = require('../interface-modules');
var trace = require('../trace');

function login(option) {
    var req = option.req;
    var current = req.current;
    var data = option.data || {};
    if (!data.hasOwnProperty('autoregister'))
        data.autoregister = 1;
    //日志
    if (data.hasOwnProperty('unikey')) current.comkeyStatus(data.unikey);
    else current.comkeyStatus(0);
    // trace.event({
    //     req: req,
    //     name: 'doLogin',
    //     params: data
    // });
    //登录
    interfaces.get_user({
        req: req,
        data: data,
        success: function (r) {
            var user = {
                id: r.uid,
                phone: r.mobile,
                weixinid: r.weixin,
                orderstate: r.orderstate,
                orderendtime: r.orderendtime,
                setcrbtnum: r.setcrbtnum
                //get orderstatestr() {
                //    switch (this.orderstate) {
                //        case 0://免费期
                //        case 1://预订购
                //        case 2://订购中，自动续费
                //            return "会员";
                //        case 3://订购中，有截止日期
                //            return "月底到期";
                //    }
                //    return "非会员";
                //}
            };
            current.user(user);//用户信息写session
            current.crbtState(null);//清理彩铃状态session
            if (user.phone) {
                if (parseInt(user.orderstate) === 4) {
                    //开通会员失败时对会员状态置预订购
                    if (current.isOpenOrderFail()&&CONST.UNICOM_PHONE_REGEX.test(user.phone)) user.orderstate = 1;
                    if (current.isOpenCrbtWaiting()&&CONST.TELCOM_PHONE_REGEX.test(user.phone)) user.orderstate = 1;
                }
                else current.isOpenOrderFail(false);//是会员，清理开通失败cookie标识
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

module.exports = login;